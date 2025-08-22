# ScriptGenius AI Integration

This document provides an overview of the AI integration in ScriptGenius, including setup instructions, API usage, and implementation details.

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

## Features

1. **Multi-Provider AI Support**
   - OpenAI (GPT-4, GPT-3.5)
   - Anthropic (Claude)
   - Google (Gemini)

2. **Script Analysis Types**
   - Script Coverage
   - Structure Analysis
   - Character Analysis
   - Dialogue Analysis
   - Market Analysis

3. **File Processing**
   - PDF, FDX, Fountain, and plain text support
   - Automatic chunking for large scripts
   - Metadata extraction

4. **User Management**
   - Credit-based system
   - Usage tracking
   - Analysis history

## Setup

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

## API Endpoints

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

## Frontend Components

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

## Database Schema

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

## Rate Limiting

Rate limiting is implemented using Upstash Redis with the following limits:
- 5 requests per minute per user for analysis endpoints
- 10 requests per minute per user for file uploads

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Testing

Run the test suite with:

```bash
npm test
```

## Deployment

1. Set up environment variables in your deployment environment
2. Run database migrations
3. Build and deploy the application

```bash
npm run build
npm start
```
