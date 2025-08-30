# ScriptIQ API Documentation

> Last Updated: 2025-08-30

## Table of Contents
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Scripts](#scripts)
  - [Analysis](#analysis)
  - [Reports](#reports)
  - [User Management](#user-management)
- [Webhooks](#webhooks)
- [Error Handling](#error-handling)

## Authentication

All API requests require authentication using a Bearer token:

```http
Authorization: Bearer YOUR_API_KEY
```

### Obtaining an API Key
1. Log in to your ScriptIQ account
2. Navigate to Account Settings > API Keys
3. Generate a new API key

## Rate Limiting

- **Rate Limit**: 60 requests per minute per API key
- **Response Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when the limit resets (UTC timestamp)

## Endpoints

### Base URL
```
https://api.scriptiq.app/v1
```

### Scripts

#### Upload Script
```http
POST /scripts
Content-Type: multipart/form-data
```

**Parameters:**
- `file` (required): Script file (PDF, FDX, or Fountain)
- `title` (optional): Script title
- `description` (optional): Script description

**Response:**
```json
{
  "id": "script_123",
  "title": "My Awesome Script",
  "status": "processing",
  "created_at": "2025-08-30T10:00:00Z"
}
```

#### Get Script
```http
GET /scripts/:id
```

**Response:**
```json
{
  "id": "script_123",
  "title": "My Awesome Script",
  "status": "processed",
  "metadata": {
    "pages": 120,
    "scenes": 45,
    "characters": 12
  },
  "created_at": "2025-08-30T10:00:00Z"
}
```

### Analysis

#### Request Analysis
```http
POST /analysis
Content-Type: application/json
```

**Request Body:**
```json
{
  "script_id": "script_123",
  "analysis_type": "coverage",
  "provider": "openai",
  "persona": "executive",
  "tone": "balanced"
}
```

**Response:**
```json
{
  "analysis_id": "analysis_456",
  "status": "queued",
  "estimated_wait_time": 30
}
```

#### Get Analysis Results
```http
GET /analysis/:id
```

**Response:**
```json
{
  "id": "analysis_456",
  "script_id": "script_123",
  "status": "completed",
  "results": {
    "score": 85,
    "strengths": ["Strong character development", "Engaging dialogue"],
    "areas_for_improvement": ["Pacing in Act 2", "Character arcs"]
  },
  "created_at": "2025-08-30T10:05:00Z"
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "invalid_request",
    "message": "Invalid request parameters",
    "details": {
      "field": "script_id",
      "issue": "required field is missing"
    }
  }
}
```

### Common Error Codes
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing API key
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Webhooks

### Events
- `analysis.completed`: Triggered when analysis is complete
- `script.processed`: Triggered when script processing is complete

### Example Webhook Payload
```json
{
  "event": "analysis.completed",
  "data": {
    "analysis_id": "analysis_456",
    "script_id": "script_123",
    "status": "completed",
    "timestamp": "2025-08-30T10:10:00Z"
  }
}
```

## SDKs

### JavaScript/TypeScript
```bash
npm install @scriptiq/sdk
```

```typescript
import { ScriptIQ } from '@scriptiq/sdk';

const client = new ScriptIQ({
  apiKey: 'your_api_key',
  environment: 'production' // or 'sandbox'
});

// Upload and analyze script
const analysis = await client.scripts.analyze({
  file: scriptFile,
  analysisType: 'coverage',
  persona: 'executive'
});
```

## Support

For API support, contact [support@scriptiq.app](mailto:support@scriptiq.app)
