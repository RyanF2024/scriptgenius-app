# ScriptGenius AI Integration

This document provides a comprehensive guide to the AI integration in ScriptGenius, including setup instructions, API usage, implementation details, and best practices for extending the AI capabilities.

> **Last Updated**: 2025-08-30

## Table of Contents
- [Features](#features)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Database Schema](#database-schema)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)

## 🌟 Features

### 1. Multi-Provider AI Support
- **OpenAI**
  - GPT-4
  - GPT-3.5 Turbo
  - Custom fine-tuned models

- **Anthropic**
  - Claude 2
  - Claude Instant
  - Custom instructions support

- **Google AI**
  - Gemini Pro
  - Text and multimodal capabilities
  - Safety settings configuration

### 2. Advanced Script Analysis
- **Comprehensive Analysis**
  - Script coverage reports
  - Structure analysis (3-act, 5-act, etc.)
  - Character development insights
  - Dialogue quality assessment
  - Market viability scoring

- **Custom Analysis Personas**
  - Executive Producer
  - Story Editor
  - Writing Coach
  - Genre Specialist

- **Tone Settings**
  - Optimistic
  - Balanced
  - Critical
  - Custom tone presets

3. **File Processing**
   - PDF, FDX, Fountain, and plain text support
   - Automatic chunking for large scripts
   - Metadata extraction

4. **User Management**
   - Credit-based system
   - Usage tracking
   - Analysis history

## 🛠 Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- API keys for AI providers
- Supabase project (for authentication and database)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Copy `.env.example` to `.env.local` and update with your API keys:
   ```env
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Anthropic
   ANTHROPIC_API_KEY=your_anthropic_api_key
   
   # Google AI
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Configuration
Configure AI providers in `src/lib/ai/providers/`:
- `openai.ts` - OpenAI configuration
- `anthropic.ts` - Anthropic configuration
- `google.ts` - Google AI configuration

1. **Environment Variables**
   Add these to your `.env.local` file:
   ```env
   # AI Providers
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   GOOGLE_AI_KEY=your_google_ai_key
   
   # Rate Limiting (Upstash Redis)
   KAFKA_REST_URL=your_upstash_redis_rest_url
   KAFKA_REST_TOKEN=your_upstash_redis_token
   ```

2. **Database**
   Run the SQL migration in `supabase/migrations/20240201000000_create_analysis_tables.sql` to set up the required tables and functions.

## 🌐 API Endpoints

### Analysis Endpoints
- `POST /api/analyze` - Submit script for analysis
  - Parameters:
    - `script`: File or text content
    - `analysisType`: Type of analysis to perform
    - `provider`: AI provider to use
    - `persona`: Analysis perspective
    - `tone`: Desired tone of feedback

### Example Request
```typescript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    script: scriptContent,
    analysisType: 'coverage',
    provider: 'openai',
    persona: 'executive',
    tone: 'balanced'
  })
});
```

### Response Format
```typescript
{
  success: boolean;
  data: {
    analysis: string;
    metrics: {
      score: number;
      strengths: string[];
      areasForImprovement: string[];
    };
    metadata: {
      provider: string;
      model: string;
      timestamp: string;
      processingTime: number;
    };
  };
  error?: string;
}
```

### 1. Upload Script

**POST** `/api/upload`

Upload a script file for analysis.

**Request:**
```http
POST /api/upload
Content-Type: multipart/form-data

file: <script_file>
```

**Response:**
```json
{
  "id": "script-uuid",
  "title": "Script Title",
  "content": "Script content...",
  "wordCount": 1234,
  "fileType": "application/pdf",
  "fileSize": 10240,
  "createdAt": "2024-02-01T12:00:00Z"
}
```

### 2. Analyze Script

**POST** `/api/analyze`

Run analysis on an uploaded script.

**Request:**
```http
POST /api/analyze
Content-Type: application/json

{
  "scriptId": "script-uuid",
  "reportType": "coverage",
  "persona": "hollywood"
}
```

**Response:**
```json
{
  "id": "analysis-uuid",
  "status": "in_progress",
  "estimatedTime": 30
}
```

### 3. Get Analysis

**GET** `/api/analysis?scriptId=script-uuid`

Get analysis results for a script.

**Response:**
```json
{
  "id": "script-uuid",
  "title": "Script Title",
  "analyses": {
    "coverage": {
      "id": "analysis-uuid",
      "status": "completed",
      "content": "Analysis content...",
      "creditsUsed": 1,
      "createdAt": "2024-02-01T12:00:00Z",
      "updatedAt": "2024-02-01T12:00:30Z"
    }
  }
}
```

## 🎨 Frontend Components

### Core Components

#### 1. AnalysisForm (`src/components/forms/AnalysisForm.tsx`)
- Handles script submission
- Manages form state and validation
- Provides UI for analysis options

#### 2. AnalysisResults (`src/components/analysis/Results.tsx`)
- Displays analysis results
- Renders different result types
- Provides export functionality

#### 3. ProviderSelector (`src/components/ai/ProviderSelector.tsx`)
- Allows switching between AI providers
- Shows provider capabilities and limits
- Handles provider-specific options

### Hooks

#### useScriptAnalysis (`src/hooks/useScriptAnalysis.ts`)
```typescript
const {
  analyzeScript,
  results,
  isLoading,
  error,
  reset
} = useScriptAnalysis({
  onSuccess: (data) => {
    // Handle successful analysis
  },
  onError: (error) => {
    // Handle errors
  }
});
```

### Context
#### AIContext (`src/contexts/AIContext.tsx`)
- Manages AI provider state
- Handles API key management
- Provides utility functions for AI operations

### AnalysisViewer

The main component for displaying and managing script analyses.

**Props:**
- `scriptId`: ID of the script to analyze
- `initialAnalysis`: Pre-fetched analysis data (optional)

**Usage:**
```tsx
<AnalysisViewer 
  scriptId="script-uuid" 
  initialAnalysis={prefetchedAnalysis} 
/>
```

## 💾 Database Schema

### Tables

#### 1. `analyses`
```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `ai_providers`
```sql
CREATE TABLE ai_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  rate_limit_per_minute INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. `analysis_requests`
```sql
CREATE TABLE analysis_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id TEXT REFERENCES ai_providers(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  parameters JSONB NOT NULL,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tables

1. **scripts**
   - `id`: UUID (primary key)
   - `user_id`: UUID (foreign key to auth.users)
   - `title`: Text
   - `file_path`: Text
   - `file_type`: Text
   - `file_size`: BigInt
   - `content`: Text
   - `word_count`: Integer
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

2. **analyses**
   - `id`: UUID (primary key)
   - `script_id`: UUID (foreign key to scripts)
   - `user_id`: UUID (foreign key to auth.users)
   - `type`: Text (analysis type)
   - `status`: Enum (pending/in_progress/completed/failed)
   - `content`: Text
   - `metadata`: JSONB
   - `credits_used`: Integer
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

3. **credit_transactions**
   - `id`: UUID (primary key)
   - `user_id`: UUID (foreign key to auth.users)
   - `amount`: Integer
   - `description`: Text
   - `created_at`: Timestamp

## ⚖️ Rate Limiting

### Implementation
Rate limiting is implemented at both the API route level and provider level:

1. **API Level**
   - 60 requests per minute per user
   - 1000 requests per day per user
   - 10 concurrent requests per user

2. **Provider Level**
   - OpenAI: 60 RPM (requests per minute)
   - Anthropic: 40 RPM
   - Google AI: 30 RPM

### Configuration
Rate limits can be configured in `src/lib/rate-limiting.ts`:

```typescript
export const RATE_LIMITS = {
  // Per-user limits
  user: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
  },
  
  // Provider-specific limits
  providers: {
    openai: {
      windowMs: 60 * 1000,
      max: 60,
    },
    anthropic: {
      windowMs: 60 * 1000,
      max: 40,
    },
    google: {
      windowMs: 60 * 1000,
      max: 30,
    }
  }
};
```

### Error Handling
When rate limits are exceeded, the API will return a `429 Too Many Requests` response with a `Retry-After` header indicating when the client can retry.

Rate limiting is implemented using Upstash Redis with the following limits:
- 5 requests per minute per user for analysis endpoints
- 10 requests per minute per user for file uploads

## 🚨 Error Handling

### Error Types
1. **Provider Errors**
   - API key issues
   - Rate limiting
   - Model availability

2. **Input Validation**
   - Invalid script format
   - Missing required fields
   - Unsupported analysis types

3. **Processing Errors**
   - Timeouts
   - Network issues
   - Content policy violations

### Error Response Format
```typescript
{
  success: false,
  error: {
    code: string; // Error code (e.g., 'RATE_LIMIT_EXCEEDED')
    message: string; // Human-readable error message
    details?: any; // Additional error details
    retryAfter?: number; // Seconds to wait before retrying
  }
}
```

### Retry Logic
The client implements exponential backoff for failed requests:
- Initial delay: 1 second
- Max retries: 3
- Backoff factor: 2x

### Monitoring
All errors are logged to:
- Console in development
- Sentry for production monitoring
- Database for analytics

All API endpoints return appropriate HTTP status codes and error messages in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## 🧪 Testing

### Test Structure
```
tests/
├── unit/
│   ├── ai/
│   │   ├── providers/
│   │   └── services/
│   └── components/
└── integration/
    ├── api/
    └── workflows/
```

### Running Tests
```bash
# Run all tests
npm test

# Run unit tests only
npm test:unit

# Run integration tests
npm test:integration

# Run tests with coverage
npm run test:coverage
```

### Test Utilities
- **Mock Providers**: `src/__mocks__/ai/providers/`
- **Test Data**: `tests/fixtures/`
- **Test Utils**: `tests/utils/`

Run the test suite with:

```bash
npm test
```

## 🚀 Deployment

### Environment Variables
Required environment variables for production:
```env
# Required
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-url.com

# AI Providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_ai_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app-url.com
```

### Deployment Steps
1. Build the application:
   ```bash
   npm run build
   ```

2. Run database migrations:
   ```bash
   npx supabase migration up
   ```

3. Deploy to your hosting provider (Vercel recommended):
   ```bash
   vercel --prod
   ```

### Monitoring
- **Performance**: Vercel Analytics
- **Errors**: Sentry
- **Logs**: Vercel Log Drains
- **Uptime**: StatusCake or similar

### CI/CD
GitHub Actions workflow (`.github/workflows/deploy.yml`) handles:
- Linting and type checking
- Unit and integration tests
- Build verification
- Automatic deployments to staging/production

1. Set up environment variables in your deployment environment
2. Run database migrations
3. Build and deploy the application

```bash
npm run build
npm start
```
