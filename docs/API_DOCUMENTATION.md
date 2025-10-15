# JobSphere Resume Builder API Documentation

## Overview

The JobSphere Resume Builder API provides comprehensive endpoints for resume management, AI-powered analysis, and user authentication. This documentation covers all available endpoints, request/response formats, and integration examples.

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.jobsphere.com/api
```

## Authentication

All API endpoints (except authentication routes) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- General API: 100 requests per 15 minutes
- AI Analysis: 10 requests per 15 minutes
- Authentication: 5 requests per 15 minutes

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "errorCode": "VALIDATION_ERROR",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

### Resume Management

#### GET /resumes
Retrieve all resumes for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (lastModified, title, atsScore, analysisScore)
- `sortOrder` (optional): Sort order (asc, desc)
- `search` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "resumes": [
      {
        "id": "resume_id",
        "title": "Software Engineer Resume",
        "atsScore": 85,
        "analysisScore": 88,
        "lastModified": "2024-01-15T10:30:00.000Z",
        "lastAnalyzed": "2024-01-14T15:20:00.000Z",
        "templateId": "modern",
        "status": "active",
        "views": 24,
        "downloads": 5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalResumes": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /resumes/:resumeId
Retrieve a specific resume by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "resume": {
      "id": "resume_id",
      "title": "Software Engineer Resume",
      "personalInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1-555-0123",
        "location": "New York, NY",
        "linkedin": "https://linkedin.com/in/johndoe",
        "portfolio": "https://johndoe.dev"
      },
      "experience": [...],
      "education": [...],
      "skills": [...],
      "projects": [...],
      "achievements": [...],
      "templateId": "modern",
      "atsScore": 85,
      "aiAnalysis": {...}
    }
  }
}
```

#### POST /resumes
Create a new resume.

**Request Body:**
```json
{
  "title": "My New Resume",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123",
    "location": "New York, NY",
    "linkedin": "https://linkedin.com/in/johndoe",
    "portfolio": "https://johndoe.dev"
  },
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "startDate": "2022-01-01",
      "endDate": "2023-12-31",
      "current": false,
      "description": "Developed web applications using React and Node.js",
      "achievements": [
        "Improved performance by 30%",
        "Led team of 3 developers"
      ]
    }
  ],
  "education": [...],
  "skills": ["JavaScript", "React", "Node.js"],
  "projects": [...],
  "achievements": [...],
  "templateId": "modern"
}
```

#### PUT /resumes/:resumeId
Update an existing resume.

#### DELETE /resumes/:resumeId
Delete a resume (soft delete).

#### POST /resumes/:resumeId/duplicate
Create a duplicate of an existing resume.

### AI Analysis

#### POST /resumes/analyze
Analyze resume content using AI.

**Request Body:**
```json
{
  "personalInfo": {...},
  "experience": [...],
  "education": [...],
  "skills": [...],
  "projects": [...],
  "achievements": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 85,
    "sectionAnalysis": {
      "personalInfo": {
        "completeness": 90,
        "suggestions": ["Add LinkedIn profile"],
        "score": 90
      },
      "experience": {
        "completeness": 80,
        "suggestions": ["Add more quantifiable achievements"],
        "score": 80
      },
      "education": {...},
      "skills": {...},
      "projects": {...}
    },
    "grammarSuggestions": [
      "Review for consistency in tense usage"
    ],
    "keywordSuggestions": [
      "Add industry-specific keywords"
    ],
    "atsOptimization": [
      "Use standard section headings"
    ],
    "actionableFeedback": [
      {
        "priority": "high",
        "category": "content",
        "suggestion": "Add quantifiable achievements",
        "impact": "Helps recruiters understand your impact"
      }
    ],
    "strengths": [
      "Clear contact information provided"
    ],
    "weaknesses": [
      "Limited quantifiable achievements"
    ],
    "industryAlignment": "Resume shows good potential...",
    "nextSteps": [
      "Add specific metrics to experience descriptions"
    ],
    "metadata": {
      "analyzedAt": "2024-01-15T10:30:00.000Z",
      "processingTime": 2500,
      "aiModel": "gemini-1.5-flash",
      "version": "1.0"
    }
  },
  "cached": false,
  "message": "Resume analysis completed successfully"
}
```

### Resume Operations

#### POST /resumes/:resumeId/optimize
Optimize resume content using AI suggestions.

#### GET /resumes/:resumeId/ats-score
Calculate ATS compatibility score.

#### POST /resumes/:resumeId/match-job
Match resume against job description.

#### POST /resumes/:resumeId/generate-pdf
Generate PDF version of resume.

#### GET /resumes/:resumeId/download
Download resume as PDF.

### Analytics

#### GET /resumes/analytics
Get resume analytics for the user.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalResumes": 5,
    "averageATSScore": 82,
    "highestATSScore": 94,
    "templateUsage": {
      "modern": 3,
      "classic": 2
    },
    "completenessDistribution": {
      "low": 1,
      "medium": 2,
      "high": 2
    },
    "recentActivity": [...]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication required or failed |
| `AUTHORIZATION_ERROR` | Access denied |
| `NOT_FOUND_ERROR` | Resource not found |
| `RATE_LIMIT_ERROR` | Rate limit exceeded |
| `EXTERNAL_SERVICE_ERROR` | External service (AI, Redis) error |

## SDK Examples

### JavaScript/Node.js

```javascript
const JobSphereAPI = require('@jobsphere/api-client');

const client = new JobSphereAPI({
  baseURL: 'http://localhost:5000/api',
  token: 'your-jwt-token'
});

// Get all resumes
const resumes = await client.resumes.list();

// Analyze resume
const analysis = await client.resumes.analyze(resumeData);

// Create resume
const newResume = await client.resumes.create({
  title: 'My Resume',
  personalInfo: {...},
  // ... other fields
});
```

### Python

```python
import jobsphere

client = jobsphere.Client(
    base_url='http://localhost:5000/api',
    token='your-jwt-token'
)

# Get all resumes
resumes = client.resumes.list()

# Analyze resume
analysis = client.resumes.analyze(resume_data)

# Create resume
new_resume = client.resumes.create({
    'title': 'My Resume',
    'personalInfo': {...},
    # ... other fields
})
```

## Webhooks

The API supports webhooks for real-time notifications:

### Events

- `resume.created` - New resume created
- `resume.updated` - Resume updated
- `resume.analyzed` - AI analysis completed
- `resume.downloaded` - Resume downloaded

### Webhook Payload

```json
{
  "event": "resume.analyzed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "resumeId": "resume_id",
    "userId": "user_id",
    "analysisScore": 85,
    "previousScore": 78
  }
}
```

## Performance Considerations

- **Caching**: AI analysis results are cached for 2 hours
- **Rate Limiting**: Implement exponential backoff for rate-limited requests
- **Pagination**: Use pagination for large result sets
- **Compression**: API responses are gzip compressed
- **CDN**: Static assets served via CDN

## Security

- **HTTPS**: All production traffic uses HTTPS
- **JWT**: Tokens expire after 24 hours
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Prevents abuse and DoS attacks
- **CORS**: Configured for allowed origins only

## Support

For API support, please contact:
- Email: api-support@jobsphere.com
- Documentation: https://docs.jobsphere.com
- Status Page: https://status.jobsphere.com