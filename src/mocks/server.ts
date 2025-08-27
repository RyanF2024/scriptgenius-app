import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { faker } from '@faker-js/faker';

// Mock data generators
const generateUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
  role: faker.helpers.arrayElement(['user', 'admin']),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
});

// Mock handlers
const handlers = [
  // Mock auth endpoints
  rest.post('/api/auth/signin', (req, res, ctx) => {
    return res(
      ctx.delay(150),
      ctx.json({
        user: generateUser(),
        token: faker.string.uuid(),
      })
    );
  }),

  rest.post('/api/auth/signup', (req, res, ctx) => {
    return res(
      ctx.delay(200),
      ctx.json({
        user: generateUser(req.body as any),
        token: faker.string.uuid(),
      })
    );
  }),

  rest.get('/api/auth/session', (req, res, ctx) => {
    return res(
      ctx.delay(100),
      ctx.json({
        user: generateUser(),
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      })
    );
  }),

  // Mock user endpoints
  rest.get('/api/users', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const limit = Number(req.url.searchParams.get('limit')) || 10;
    const search = req.url.searchParams.get('search');
    
    const users = Array.from({ length: limit }, (_, i) => 
      generateUser({ id: `user-${(page - 1) * limit + i + 1}` })
    );

    if (search) {
      const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
      
      return res(
        ctx.delay(200),
        ctx.json({
          data: filteredUsers,
          total: filteredUsers.length,
          page,
          limit,
          totalPages: Math.ceil(filteredUsers.length / limit),
        })
      );
    }

    return res(
      ctx.delay(200),
      ctx.json({
        data: users,
        total: 100,
        page,
        limit,
        totalPages: 10,
      })
    );
  }),

  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.delay(100),
      ctx.json(generateUser({ id }))
    );
  }),

  rest.put('/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.delay(200),
      ctx.json({
        ...generateUser(req.body as any),
        id: req.params.id,
      })
    );
  }),

  rest.delete('/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.delay(150),
      ctx.json({ success: true })
    );
  }),

  // Mock file upload
  rest.post('/api/upload', async (req, res, ctx) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'No file provided' })
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'File is too large' })
      );
    }

    return res(
      ctx.delay(500),
      ctx.json({
        url: `https://example.com/uploads/${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
      })
    );
  }),

  // Mock any other API requests
  rest.all('*', (req) => {
    console.error(`Unhandled request: ${req.method} ${req.url}`);
    return req.passthrough();
  }),
];

export const server = setupServer(...handlers);

// Helper functions for tests
export const mockFailedRequest = (method: string, url: string, status: number, error: any) => {
  server.use(
    rest[method.toLowerCase() as keyof typeof rest](url, (req, res, ctx) => {
      return res(
        ctx.status(status),
        ctx.json({ error })
      );
    })
  );
};

export const mockNetworkError = (method: string, url: string) => {
  server.use(
    rest[method.toLowerCase() as keyof typeof rest](url, (req) => {
      return req.networkError('Failed to connect');
    })
  );
};

export const mockDelayedResponse = (method: string, url: string, delay: number, response: any) => {
  server.use(
    rest[method.toLowerCase() as keyof typeof rest](url, (req, res, ctx) => {
      return res(
        ctx.delay(delay),
        ctx.json(response)
      );
    })
  );
};
