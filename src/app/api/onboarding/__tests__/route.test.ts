import { NextRequest, NextResponse } from 'next/server';
import { GET, POST, DELETE } from '../route';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Mock the Supabase client and auth helpers
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(),
  cookies: jest.fn(),
}));

// Mock Next.js request and response objects
const createMockRequest = (method: string, body?: any) => {
  return {
    method,
    json: async () => body || {},
  } as unknown as NextRequest;
};

describe('Onboarding API', () => {
  let mockSupabase: any;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock Supabase client
    mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: 'test-user-id' } } },
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      upsert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      delete: jest.fn().mockResolvedValue({ data: {}, error: null }),
    };
    
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
    (cookies as unknown as jest.Mock).mockReturnValue({});
  });

  describe('GET /api/onboarding', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } });
      
      const response = await GET();
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return onboarding data if it exists', async () => {
      const mockData = { onboarding_data: { step: 'profile' } };
      mockSupabase.single.mockResolvedValueOnce({ data: mockData, error: null });
      
      const response = await GET();
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toEqual(mockData.onboarding_data);
    });

    it('should return null if no onboarding data exists', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      
      const response = await GET();
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeNull();
    });
  });

  describe('POST /api/onboarding', () => {
    it('should save onboarding data', async () => {
      const onboardingData = { step: 'profile', name: 'Test User' };
      const request = createMockRequest('POST', onboardingData);
      
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_onboarding');
      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        {
          user_id: 'test-user-id',
          onboarding_data: onboardingData,
          updated_at: expect.any(String),
        },
        { onConflict: 'user_id' }
      );
    });

    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } });
      const request = createMockRequest('POST', {});
      
      const response = await POST(request);
      
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/onboarding', () => {
    it('should delete onboarding data', async () => {
      const response = await DELETE();
      
      expect(response.status).toBe(200);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_onboarding');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
    });

    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } });
      
      const response = await DELETE();
      
      expect(response.status).toBe(401);
    });
  });
});
