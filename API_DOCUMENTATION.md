# JobSphere API Documentation

## Overview
JobSphere is a comprehensive job preparation platform that helps users create resumes, prepare for interviews, develop skills, and manage their job search process.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in:
- Cookie: `token`
- Header: `Authorization: Bearer <token>`

## API Endpoints

### 🔐 Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/send-otp` | Send OTP to email | No |
| POST | `/verify-email` | Verify email with OTP | No |
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/verify-otp` | Verify OTP for password reset | No |
| POST | `/reset-password` | Reset password | No |
| POST | `/refresh-token` | Refresh access token | No |
| POST | `/promote-admin` | Promote user to admin | Yes (Admin) |

### 📄 Resume Management (`/resume`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new resume | Yes |
| GET | `/` | Get user's resumes | Yes |
| GET | `/:id` | Get specific resume | Yes |
| PUT | `/:id` | Update resume | Yes |
| DELETE | `/:id` | Delete resume | Yes |
| GET | `/templates/list` | Get resume templates | No |
| POST | `/:id/apply-template` | Apply template to resume | Yes |
| POST | `/:id/generate-pdf` | Generate PDF | Yes |
| POST | `/:id/optimize` | AI optimize resume | Yes |
| POST | `/:id/ats-score` | Calculate ATS score | Yes |
| POST | `/:id/match-job` | Match with job description | Yes |
| GET | `/:id/analytics` | Get resume analytics | Yes |

### 🎤 Interview Preparation (`/interview`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/sessions` | Create interview session | Yes |
| GET | `/sessions` | Get user's sessions | Yes |
| GET | `/sessions/:id` | Get specific session | Yes |
| PUT | `/sessions/:id` | Update session | Yes |
| POST | `/generate-questions` | Generate AI questions | Yes |
| GET | `/questions/categories` | Get question categories | No |
| GET | `/questions/by-role/:role` | Get role-specific questions | No |
| POST | `/practice` | Record practice attempt | Yes |
| GET | `/practice/history` | Get practice history | Yes |
| GET | `/practice/stats` | Get practice statistics | Yes |
| POST | `/evaluate-answer` | AI evaluate answer | Yes |
| GET | `/suggested-answers/:questionId` | Get suggested answers | Yes |
| POST | `/sessions/:id/score` | Calculate interview score | Yes |
| GET | `/sessions/:id/feedback` | Get interview feedback | Yes |
| GET | `/companies/:company/questions` | Get company questions | No |
| GET | `/companies/:company/tips` | Get company tips | No |

### 📚 Learning Paths (`/learning`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/paths` | Get all learning paths | No |
| GET | `/paths/company/:company` | Get company-specific paths | No |
| GET | `/paths/:id` | Get specific learning path | No |
| POST | `/enroll/:pathId` | Enroll in learning path | Yes |
| GET | `/my-paths` | Get user's enrolled paths | Yes |
| PUT | `/progress/:pathId` | Update learning progress | Yes |
| GET | `/progress/:pathId` | Get learning progress | Yes |
| GET | `/skills` | Get all skills | No |
| GET | `/skills/:skillId/resources` | Get skill resources | No |
| POST | `/skills/:skillId/complete` | Mark skill completed | Yes |
| POST | `/assess-skills` | Assess user skills | Yes |
| GET | `/skill-gaps/:targetRole` | Identify skill gaps | Yes |
| GET | `/recommendations` | Get learning recommendations | Yes |
| POST | `/custom-path` | Create custom path | Yes |
| GET | `/analytics` | Get learning analytics | Yes |
| GET | `/leaderboard` | Get learning leaderboard | Yes |

### 💼 Job Management (`/job`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/analyze` | Analyze job description | Yes |
| POST | `/match-resume` | Match resume to job | Yes |
| POST | `/ats-check` | Check ATS compatibility | Yes |
| GET | `/ats-keywords/:industry` | Get ATS keywords | No |
| POST | `/applications` | Track job application | Yes |
| GET | `/applications` | Get job applications | Yes |
| PUT | `/applications/:id` | Update application status | Yes |
| DELETE | `/applications/:id` | Delete application | Yes |
| GET | `/recommendations` | Get job recommendations | Yes |
| POST | `/save-job` | Save job for later | Yes |
| GET | `/saved-jobs` | Get saved jobs | Yes |
| GET | `/salary/:role/:location` | Get salary insights | No |
| GET | `/companies/:company/info` | Get company info | No |
| GET | `/companies/:company/reviews` | Get company reviews | No |
| GET | `/analytics/applications` | Get application analytics | Yes |
| GET | `/analytics/success-rate` | Get success rate analytics | Yes |

### 🌐 Portfolio Management (`/portfolio`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create portfolio | Yes |
| GET | `/` | Get user's portfolios | Yes |
| GET | `/:id` | Get public portfolio | No |
| PUT | `/:id` | Update portfolio | Yes |
| DELETE | `/:id` | Delete portfolio | Yes |
| POST | `/generate-from-resume/:resumeId` | Generate from resume | Yes |
| GET | `/templates/list` | Get portfolio templates | No |
| POST | `/:id/apply-template` | Apply template | Yes |
| PUT | `/:id/theme` | Update theme | Yes |
| POST | `/:id/sections` | Add section | Yes |
| PUT | `/:id/sections/:sectionId` | Update section | Yes |
| DELETE | `/:id/sections/:sectionId` | Delete section | Yes |
| POST | `/:id/publish` | Publish portfolio | Yes |
| POST | `/:id/unpublish` | Unpublish portfolio | Yes |
| GET | `/:id/share-link` | Get share link | Yes |
| GET | `/:id/analytics` | Get portfolio analytics | Yes |
| POST | `/:id/track-view` | Track portfolio view | No |

### 📝 Cover Letter (`/cover-letter`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create cover letter | Yes |
| GET | `/` | Get user's cover letters | Yes |
| GET | `/:id` | Get specific cover letter | Yes |
| PUT | `/:id` | Update cover letter | Yes |
| DELETE | `/:id` | Delete cover letter | Yes |
| POST | `/generate` | Generate with AI | Yes |
| POST | `/generate-from-job` | Generate from job posting | Yes |
| GET | `/templates/list` | Get templates | No |
| POST | `/:id/apply-template` | Apply template | Yes |
| POST | `/:id/optimize` | AI optimize | Yes |
| POST | `/:id/tone-adjustment` | Adjust tone | Yes |
| POST | `/:id/suggestions` | Get suggestions | Yes |
| POST | `/keywords-check` | Check keywords | Yes |
| POST | `/:id/generate-pdf` | Generate PDF | Yes |
| GET | `/:id/versions` | Get versions | Yes |
| POST | `/:id/save-version` | Save version | Yes |
| POST | `/:id/restore-version/:versionId` | Restore version | Yes |

### 📊 Dashboard (`/dashboard`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/overview` | Get dashboard overview | Yes |
| GET | `/resume-stats` | Get resume statistics | Yes |
| GET | `/job-matches` | Get job matches | Yes |
| GET | `/learning-progress` | Get learning progress | Yes |
| GET | `/interview-readiness` | Get interview readiness | Yes |
| GET | `/achievements` | Get achievements | Yes |
| POST | `/achievements/claim/:achievementId` | Claim achievement | Yes |
| GET | `/activity-feed` | Get activity feed | Yes |
| POST | `/goals` | Set career goals | Yes |
| GET | `/goals` | Get career goals | Yes |
| PUT | `/goals/:goalId` | Update career goal | Yes |
| GET | `/goals/progress` | Get goal progress | Yes |
| GET | `/quick-actions` | Get quick actions | Yes |
| GET | `/notifications` | Get notifications | Yes |
| PUT | `/notifications/:id/read` | Mark notification read | Yes |
| DELETE | `/notifications/:id` | Delete notification | Yes |

### 👤 User Management (`/user`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/profile/avatar` | Upload avatar | Yes |
| GET | `/preferences` | Get preferences | Yes |
| PUT | `/preferences` | Update preferences | Yes |
| POST | `/skills` | Add user skills | Yes |
| GET | `/skills` | Get user skills | Yes |
| PUT | `/skills/:skillId` | Update skill proficiency | Yes |
| DELETE | `/skills/:skillId` | Remove skill | Yes |
| POST | `/experience` | Add work experience | Yes |
| GET | `/experience` | Get work experience | Yes |
| PUT | `/experience/:expId` | Update experience | Yes |
| DELETE | `/experience/:expId` | Delete experience | Yes |
| POST | `/education` | Add education | Yes |
| GET | `/education` | Get education | Yes |
| PUT | `/education/:eduId` | Update education | Yes |
| DELETE | `/education/:eduId` | Delete education | Yes |
| PUT | `/change-password` | Change password | Yes |
| DELETE | `/account` | Delete account | Yes |
| POST | `/export-data` | Export user data | Yes |

### 📈 Analytics (`/analytics`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/overview` | Get user analytics | Yes |
| GET | `/user/resume-performance` | Get resume performance | Yes |
| GET | `/user/interview-performance` | Get interview performance | Yes |
| GET | `/user/learning-analytics` | Get learning analytics | Yes |
| GET | `/user/job-search-analytics` | Get job search analytics | Yes |
| GET | `/admin/platform-overview` | Get platform analytics | Yes (Admin) |
| GET | `/admin/user-engagement` | Get engagement metrics | Yes (Admin) |
| GET | `/admin/feature-usage` | Get feature usage | Yes (Admin) |
| GET | `/admin/conversion-metrics` | Get conversion metrics | Yes (Admin) |
| POST | `/reports/generate` | Generate report | Yes |
| GET | `/reports/:reportId` | Get report | Yes |
| GET | `/reports` | Get user reports | Yes |

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Additional Features to Consider

### 🚀 Suggested Enhancements
1. **Real-time Notifications** - WebSocket integration for live updates
2. **Video Interview Practice** - Record and analyze video responses
3. **AI Chatbot** - Career guidance and Q&A assistance
4. **Social Features** - Connect with other job seekers, mentorship
5. **Mobile App API** - Endpoints optimized for mobile applications
6. **Integration APIs** - Connect with LinkedIn, Indeed, Glassdoor
7. **Blockchain Certificates** - Verify skills and achievements
8. **Advanced Analytics** - Machine learning insights and predictions
9. **Multi-language Support** - Internationalization endpoints
10. **Premium Features** - Subscription management and premium content

### 🔧 Technical Improvements
1. **Rate Limiting** - Implement API rate limiting
2. **Caching** - Redis caching for frequently accessed data
3. **File Upload** - Secure file upload for documents and images
4. **Email Templates** - Rich HTML email templates
5. **PDF Generation** - Advanced PDF customization options
6. **Search & Filtering** - Elasticsearch integration
7. **Backup & Recovery** - Automated data backup systems
8. **Monitoring** - API monitoring and logging
9. **Testing** - Comprehensive API testing suite
10. **Documentation** - Interactive API documentation with Swagger

This API provides a solid foundation for your JobSphere platform with room for future enhancements and scalability.