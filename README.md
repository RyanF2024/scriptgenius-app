# ScriptGenius

A high-performance web application for script generation and management, built with Next.js, TypeScript, and optimized for the best user experience. The application provides AI-powered script analysis, multi-format support, and comprehensive reporting tools.

## 🚀 Key Features

- **AI-Powered Analysis**
  - Multiple AI providers (OpenAI, Anthropic, Google AI)
  - Custom analysis personas (executive, writer, coach)
  - Adjustable tone settings

- **Security & Authentication**
  - Multi-factor authentication (TOTP, backup codes)
  - Secure session management
  - Role-based access control
  - Secure file uploads with validation

- **Comprehensive Reporting**
  - PDF report generation
  - Multiple analysis perspectives
  - Exportable results

- **User Experience**
  - Responsive design
  - Intuitive interface
  - Real-time feedback
  - Profile management with image optimization

## 🛠 Technical Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **State Management**: React Query, Context API
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 🚀 Performance Features

- ⚡ **Optimized Image Loading**
  - Automatic format optimization (WebP/AVIF)
  - Lazy loading and blur-up placeholders
  - Responsive image handling

- 🎯 **Efficient Data Fetching**
  - Request deduplication
  - Smart caching strategies
  - Optimized API calls

- ✨ **Smooth UI/UX**
  - Optimized form handling
  - Instant feedback and loading states
  - Reduced layout shifts

- 🛠 **Developer Experience**
  - Type-safe codebase
  - Performance monitoring
  - Comprehensive documentation

## 📊 Performance Metrics

| Metric | Target | Status |
|--------|--------|--------|
| LCP    | < 2.5s | ✅     |
| FID    | < 100ms| ✅     |
| CLS    | < 0.1  | ✅     |
| TTI    | < 3.5s | ✅     |

## 📚 Documentation

For comprehensive documentation, please visit our [Documentation Hub](https://github.com/RyanF2024/scriptgenius-app/tree/main/docs).

### Quick Links

- [Master Checklist](./MASTER_CHECKLIST.md) - Single source of truth for all project requirements and features
- [Changelog](./CHANGELOG.md) - Track all notable changes to the project
- [Authentication](./docs/AUTHENTICATION.md) - Authentication and security implementation
- [MFA Implementation](./docs/MFA_IMPLEMENTATION.md) - Multi-Factor Authentication details
- [Performance Optimizations](./docs/PERFORMANCE_OPTIMIZATIONS.md) - Performance best practices
- [Profile Management](./docs/PROFILE_MANAGEMENT.md) - User profiles and avatar management
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Database structure and RLS policies

## 🏗 Project Structure

```
scriptgenius/
├── src/
│   ├── app/                 # Next.js 13+ app directory
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── forms/          # Form components and validation
│   │   └── features/       # Feature-specific components
│   ├── lib/                # Utility functions and configurations
│   │   ├── ai/            # AI service implementations
│   │   ├── api/           # API client and services
│   │   └── utils/         # Helper functions
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # Global styles and themes
│   └── tests/              # Test files
├── public/                 # Static assets
└── supabase/              # Database migrations and configurations
```

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚀 Features

- **AI-Powered Analysis** - Get instant script coverage, character breakdowns, and market analysis using multiple AI providers (OpenAI, Anthropic, Google AI)
- **Multi-Format Support** - Upload scripts in various formats including PDF, Fountain, and FDX
- **Comprehensive Reports** - Generate detailed PDF reports with different analysis perspectives
- **Team Collaboration** - Share and collaborate on scripts with your team (coming soon)
- **Subscription Plans** - Flexible pricing with free and premium tiers
- **Secure & Private** - Enterprise-grade security for your intellectual property

## 🛠️ Tech Stack

### Core
- **Frontend**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Shadcn/ui
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **File Storage**: Supabase Storage
- **Payments**: Stripe Integration

### AI & Analysis
- **AI Providers**: OpenAI, Anthropic, Google AI
- **Document Processing**: PDF.js, Fountain.js
- **Report Generation**: React-PDF

### Development Tools
- **State Management**: React Context + SWR
- **Form Handling**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)
- AI Provider API Keys (OpenAI, Anthropic, or Google AI)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RyanF2024/scriptgenius-app
   cd scriptgenius
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required credentials (Supabase, Stripe, AI providers)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🔧 Environment Variables

Create a `.env.local` file in the root directory. See `.env.example` for all required variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Providers
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_KEY=your-google-ai-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Other
NODE_ENV=development
```

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run type-check` - Check TypeScript types
- `npm run analyze` - Run bundle analysis

### Database Migrations

To apply database migrations:

```bash
npx supabase migration up
```

### Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

### Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. For production deployment, consider using:
   - Vercel (recommended for Next.js)
   - Docker + any cloud provider

## 🏗️ Project Structure

```
src/
├── app/                    # App router pages and API routes
├── components/             # Reusable UI components
├── lib/                    # Utility functions and configurations
│   ├── ai/                 # AI service implementations
│   ├── api/                # API client and services
│   └── utils/              # Helper functions
├── types/                  # TypeScript type definitions
└── styles/                 # Global styles and themes
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Stripe Documentation](https://stripe.com/docs)

## 📞 Support

For support, please open an issue or contact support@scriptgenius.app
