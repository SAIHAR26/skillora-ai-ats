# Backend Architecture and API Design

## Project Overview
This document defines the backend architecture for the AI-Powered Applicant Tracking System (ATS). It covers database collections, schema fields, relationships, API endpoints, and authentication flows. The goal is to provide a complete backend reference for the team so frontend and AI modules can integrate cleanly.

---

## 1. Database Design

### 1.1 Collections
The backend uses MongoDB with the following primary collections:

- `users`
- `recruiters`
- `candidates`
- `jobs`
- `applications`
- `resumes`
- `aiResults`
- `notifications`
- `interviews`
- `complaints`
- `opportunities`


### 1.2 Collection Definitions

#### `users`
Purpose: store authentication and account-level data for all platform users, including recruiters, candidates, and admins.

Fields:
- `name` (String) — full name of the user
- `email` (String) — unique login email
- `passwordHash` (String) — encrypted password
- `role` (String) — `admin` | `recruiter` | `candidate`
- `status` (String) — `pending` | `active` | `blocked`
- `createdAt` (Date)
- `updatedAt` (Date)
- `lastLoginAt` (Date)
- `profileCompleted` (Boolean)
- `verificationDocuments` (Array of Objects) — optional recruiter documents

Example:
{
  name: "Riya Sharma",
  email: "riya@example.com",
  passwordHash: "$2b$12$...",
  role: "recruiter",
  status: "active",
  profileCompleted: true,
  createdAt: ISODate("2026-06-10T10:00:00Z"),
  updatedAt: ISODate("2026-06-10T10:05:00Z")
}

---

#### `recruiters`
Purpose: store recruiter-specific company profile data, publishable job settings, and verification status.

Fields:
- `userId` (ObjectId) — reference to `users._id`
- `companyName` (String)
- `companyWebsite` (String)
- `companyLogoUrl` (String)
- `industry` (String)
- `location` (String)
- `phone` (String)
- `description` (String)
- `verified` (Boolean)
- `verificationStatus` (String) — `pending` | `approved` | `rejected`
- `createdAt` (Date)
- `updatedAt` (Date)

Example:
{
  userId: ObjectId("..."),
  companyName: "Skillora Tech",
  companyWebsite: "https://skillora.ai",
  industry: "Human Resources",
  location: "Bengaluru, India",
  verified: true,
  verificationStatus: "approved",
  createdAt: ISODate("2026-06-10T10:10:00Z")
}

---

#### `candidates`
Purpose: store candidate profile and job seeker details separate from authentication.

Fields:
- `userId` (ObjectId) — reference to `users._id`
- `headline` (String)
- `summary` (String)
- `location` (String)
- `experienceYears` (Number)
- `skills` (Array of Strings)
- `education` (Array of Objects)
  - `institution`, `degree`, `field`, `startDate`, `endDate`
- `workExperience` (Array of Objects)
  - `company`, `title`, `startDate`, `endDate`, `description`
- `projects` (Array of Objects)
- `certifications` (Array of Objects)
- `preferredJobTypes` (Array of Strings)
- `preferredLocations` (Array of Strings)
- `resumeIds` (Array of ObjectIds) — references to `resumes`
- `createdAt` (Date)
- `updatedAt` (Date)

Example:
{
  userId: ObjectId("..."),
  headline: "Full-stack Developer with 5 years experience",
  summary: "Building scalable SaaS products using React and Node.js",
  skills: ["JavaScript", "React", "Node.js", "MongoDB"],
  experienceYears: 5,
  resumeIds: [ObjectId("...")],
  createdAt: ISODate("2026-06-10T11:00:00Z")
}

---

#### `jobs`
Purpose: store job postings and all recruiter-defined vacancy details.

Fields:
- `recruiterId` (ObjectId) — reference to `recruiters._id`
- `title` (String)
- `description` (String)
- `skillsRequired` (Array of Strings)
- `experienceLevel` (String) — `entry`, `mid`, `senior`
- `salaryRange` (Object)
  - `min` (Number)
  - `max` (Number)
- `location` (String)
- `employmentType` (String) — `full-time`, `part-time`, `contract`, `remote`
- `applicationDeadline` (Date)
- `published` (Boolean)
- `status` (String) — `open`, `closed`, `archived`
- `totalApplicants` (Number)
- `active` (Boolean)
- `createdAt` (Date)
- `updatedAt` (Date)

Example:
{
  recruiterId: ObjectId("..."),
  title: "AI Product Engineer",
  description: "Design and build resume ranking models...",
  skillsRequired: ["Python", "NLP", "Machine Learning"],
  salaryRange: { min: 900000, max: 1500000 },
  location: "Remote",
  employmentType: "full-time",
  status: "open",
  published: true,
  totalApplicants: 12,
  createdAt: ISODate("2026-06-10T12:00:00Z")
}

---

#### `applications`
Purpose: track each candidate’s application to a specific job.

Fields:
- `jobId` (ObjectId) — reference to `jobs._id`
- `candidateId` (ObjectId) — reference to `candidates._id`
- `resumeId` (ObjectId) — reference to `resumes._id`
- `status` (String) — `applied`, `under_review`, `interview_scheduled`, `selected`, `rejected`
- `appliedAt` (Date)
- `updatedAt` (Date)
- `score` (Number) — AI match score or ranking value
- `aiResultId` (ObjectId) — reference to `aiResults._id`
- `remarks` (String)

Example:
{
  jobId: ObjectId("..."),
  candidateId: ObjectId("..."),
  resumeId: ObjectId("..."),
  status: "under_review",
  score: 82,
  appliedAt: ISODate("2026-06-10T13:00:00Z")
}

---

#### `resumes`
Purpose: store resume metadata, cloud storage references, and extracted text for AI analysis.

Fields:
- `candidateId` (ObjectId) — reference to `candidates._id`
- `originalFileName` (String)
- `s3Url` (String)
- `contentType` (String)
- `fileSize` (Number)
- `uploadedAt` (Date)
- `extractedText` (String)
- `parsedSkills` (Array of Strings)
- `textTokens` (Array of Strings) — optional tokenized text
- `processed` (Boolean)

Example:
{
  candidateId: ObjectId("..."),
  originalFileName: "Riya_Resume.pdf",
  s3Url: "https://s3.amazonaws.com/skillora/resumes/....pdf",
  contentType: "application/pdf",
  fileSize: 345678,
  uploadedAt: ISODate("2026-06-10T13:05:00Z"),
  processed: true,
  extractedText: "Summary: Experienced Software Engineer..."
}

---

#### `aiResults`
Purpose: store computed AI analysis outputs for resumes and job comparisons.

Fields:
- `applicationId` (ObjectId) — reference to `applications._id`
- `jobId` (ObjectId) — reference to `jobs._id`
- `candidateId` (ObjectId) — reference to `candidates._id`
- `resumeId` (ObjectId) — reference to `resumes._id`
- `matchScore` (Number)
- `skillMatch` (Array of Strings)
- `missingSkills` (Array of Strings)
- `recommendations` (Array of Strings)
- `analysisDate` (Date)
- `similarityBreakdown` (Object)
  - `tfidfScore`, `cosineScore`, `semanticScore`
- `rawOutput` (Object) — optional debug or trace

Example:
{
  applicationId: ObjectId("..."),
  matchScore: 88,
  skillMatch: ["Python", "NLP", "TensorFlow"],
  missingSkills: ["AWS", "Docker"],
  recommendations: ["Add cloud experience", "Highlight NLP project details"]
}

---

#### `notifications`
Purpose: track system notifications and email triggers for users.

Fields:
- `userId` (ObjectId) — reference to `users._id`
- `type` (String) — `welcome`, `application_received`, `status_update`, `interview_invite`, `offer`, `rejection`
- `title` (String)
- `message` (String)
- `status` (String) — `unread`, `read`
- `createdAt` (Date)
- `sentAt` (Date)
- `metadata` (Object)

Example:
{
  userId: ObjectId("..."),
  type: "status_update",
  title: "Interview Scheduled",
  message: "Your application for AI Product Engineer has been moved to interview stage.",
  status: "unread",
  createdAt: ISODate("2026-06-10T14:00:00Z")
}

---

#### `interviews`
Purpose: manage interview events, schedules, and candidate recruiter coordination.

Fields:
- `applicationId` (ObjectId) — reference to `applications._id`
- `jobId` (ObjectId) — reference to `jobs._id`
- `candidateId` (ObjectId) — reference to `candidates._id`
- `recruiterId` (ObjectId) — reference to `recruiters._id`
- `scheduledAt` (Date)
- `durationMinutes` (Number)
- `mode` (String) — `online`, `offline`, `phone`
- `location` (String)
- `status` (String) — `scheduled`, `completed`, `cancelled`
- `feedback` (String)
- `createdAt` (Date)
- `updatedAt` (Date)

Example:
{
  applicationId: ObjectId("..."),
  scheduledAt: ISODate("2026-06-15T09:30:00Z"),
  durationMinutes: 60,
  mode: "online",
  status: "scheduled"
}

---

#### `complaints`
Purpose: collect and manage platform issue reports from recruiters, candidates, and admins.

Fields:
- `userId` (ObjectId) — reference to `users._id`
- `subject` (String)
- `message` (String)
- `category` (String) — `technical`, `recruiter`, `candidate`, `payment`, `other`
- `status` (String) — `open`, `in_progress`, `resolved`
- `assignedTo` (ObjectId) — optional admin userId
- `createdAt` (Date)
- `updatedAt` (Date)

Example:
{
  userId: ObjectId("..."),
  subject: "Resume upload failing",
  message: "My PDF file is not uploading when I apply.",
  category: "technical",
  status: "open",
  createdAt: ISODate("2026-06-10T14:30:00Z")
}

---

#### `opportunities`
Purpose: store value-add posts such as hackathons, internships, competitions, and upskilling events.

Fields:
- `title` (String)
- `description` (String)
- `type` (String) — `hackathon`, `quiz`, `competition`, `internship`, `job`
- `category` (String)
- `startDate` (Date)
- `endDate` (Date)
- `applyUrl` (String)
- `createdBy` (ObjectId) — user or admin
- `status` (String) — `active`, `inactive`
- `createdAt` (Date)

Example:
{
  title: "AI Resume Hackathon",
  type: "hackathon",
  description: "Build AI features for resume matching.",
  startDate: ISODate("2026-07-01T00:00:00Z"),
  endDate: ISODate("2026-07-10T23:59:59Z"),
  status: "active"
}

---

## 2. Relationship Design

### Core relationships
- `users` → `recruiters` / `candidates`
- `recruiters` → `jobs`
- `candidates` → `applications`
- `jobs` → `applications`
- `applications` → `resumes`
- `applications` → `aiResults`
- `applications` → `interviews`
- `users` → `notifications`

### Relationship summary
- A single `user` account can become a recruiter or candidate.
- A `recruiter` owns multiple `jobs`.
- A `candidate` can submit multiple `applications`.
- Each `application` is tied to one `job` and one `candidate`.
- A `resume` is uploaded by a candidate and may be used for multiple applications.
- `aiResults` capture matching details for a single application.
- `interviews` are scheduled against an application.

### Example flow
Candidate `user` signs up and creates a `candidate` profile. They upload a `resume` and apply to a `job`. The system stores an `application`, computes `aiResults` for the resume-job match, sends `notifications`, and may schedule an `interview`.

---

## 3. API Planning

### Authentication and User management
- `POST /api/auth/signup`
  - Register user with name, email, password, role
- `POST /api/auth/login`
  - Authenticate and return JWT
- `POST /api/auth/logout`
  - Invalidate token or clear client session
- `GET /api/auth/me`
  - Return authenticated user profile
- `PUT /api/auth/profile`
  - Update account data
- `POST /api/auth/verify-recruiter`
  - Upload recruiter verification documents

### Users
- `GET /api/users/:id`
  - Retrieve user metadata
- `GET /api/users`
  - Admin-only list of users
- `PUT /api/users/:id/status`
  - Admin update user status

### Recruiters
- `GET /api/recruiters/:id`
  - Recruiter profile details
- `PUT /api/recruiters/:id`
  - Update recruiter/company profile
- `GET /api/recruiters/:id/jobs`
  - List jobs created by recruiter
- `GET /api/recruiters/:id/applications`
  - List applications for recruiter jobs

### Candidates
- `GET /api/candidates/:id`
  - Candidate profile
- `PUT /api/candidates/:id`
  - Update candidate profile
- `POST /api/candidates/:id/resumes`
  - Upload resume
- `GET /api/candidates/:id/resumes`
  - List candidate resumes
- `GET /api/candidates/:id/applications`
  - Candidate application history

### Jobs
- `GET /api/jobs`
  - List all published jobs with filters and search
- `GET /api/jobs/:id`
  - Job detail
- `POST /api/jobs`
  - Create new job posting
- `PUT /api/jobs/:id`
  - Update job posting
- `DELETE /api/jobs/:id`
  - Delete or archive job posting
- `PATCH /api/jobs/:id/status`
  - Change job open/closed state
- `GET /api/jobs/:id/applications`
  - Applications for a specific job

### Applications
- `POST /api/applications`
  - Apply to a job using candidate, job, resume data
- `GET /api/applications/:id`
  - Application details
- `GET /api/applications`
  - List applications (filtered by candidate or recruiter)
- `PUT /api/applications/:id/status`
  - Update application status
- `PUT /api/applications/:id/remarks`
  - Add recruiter notes
- `DELETE /api/applications/:id`
  - Withdraw or delete application

### Resumes
- `GET /api/resumes/:id`
  - Resume metadata and secure download URL
- `DELETE /api/resumes/:id`
  - Remove a resume
- `GET /api/resumes/candidate/:candidateId`
  - List resumes for candidate

### AI Results
- `GET /api/ai-results/:applicationId`
  - Retrieve AI matching details
- `GET /api/jobs/:jobId/ai-results`
  - List AI ranking results for a job
- `POST /api/ai-results/compute`
  - Trigger analysis manually if needed

### Notifications
- `GET /api/notifications`
  - User notifications
- `PUT /api/notifications/:id/read`
  - Mark notification as read
- `POST /api/notifications/send`
  - Admin or system send notification

### Interviews
- `POST /api/interviews`
  - Schedule interview for application
- `GET /api/interviews/:id`
  - Interview details
- `GET /api/interviews`
  - List interviews filtered by candidate, recruiter, or job
- `PUT /api/interviews/:id`
  - Update interview details
- `PATCH /api/interviews/:id/status`
  - Mark as completed/cancelled

### Complaints
- `POST /api/complaints`
  - Submit complaint
- `GET /api/complaints`
  - List complaints for admin
- `PUT /api/complaints/:id/status`
  - Update complaint status

### Opportunities
- `GET /api/opportunities`
  - List value-add opportunities
- `POST /api/opportunities`
  - Create opportunity
- `PUT /api/opportunities/:id`
  - Edit opportunity
- `DELETE /api/opportunities/:id`
  - Remove opportunity

---

## 4. Authentication Flow

### Signup
1. Candidate or recruiter fills `name`, `email`, `password`, and `role`.
2. Backend validates data and checks for duplicate email.
3. Password is hashed using bcrypt.
4. Create record in `users` collection with `status: pending` for recruiters or `active` for candidates.
5. If role is `recruiter`, create corresponding `recruiters` record with `verified: false` and `verificationStatus: pending`.
6. Return success response.

### Login
1. User submits `email` and `password`.
2. Backend verifies the user exists and status is `active`.
3. Compare supplied password with stored `passwordHash`.
4. Generate JWT token containing `userId`, `role`, and `issuedAt`.
5. Return token and basic profile data.

### JWT
- JWT is issued on login and stored on the client.
- Token payload includes: `userId`, `email`, `role`, `exp`.
- Each protected route uses middleware to verify token validity.
- Middleware loads user from `users` and rejects if `status` is not `active`.
- Role-based middleware restricts access for recruiter, candidate, or admin endpoints.

### Recruiter Verification
1. Recruiter submits verification documents via `POST /api/auth/verify-recruiter`.
2. Backend stores upload references in `users.verificationDocuments` or `recruiters` fields.
3. Admin reviews and updates `recruiters.verificationStatus` to `approved` or `rejected`.
4. When approved, user `status` changes to `active` and recruiter can publish jobs.
5. When rejected, recruiter remains blocked until corrected.

---

## 5. Recommended Indexes

- `users.email` — unique index
- `jobs.recruiterId`
- `jobs.status`
- `jobs.published`
- `applications.jobId`
- `applications.candidateId`
- `applications.status`
- `resumes.candidateId`
- `aiResults.jobId`
- `notifications.userId`
- `interviews.applicationId`

Indexes will support fast retrieval for job listings, applications, candidate dashboards, and recruiter dashboards.

---

## 6. Example Backend Workflows

### Job creation workflow
1. Recruiter calls `POST /api/jobs`.
2. Backend validates recruiter identity and recruiter verification.
3. Create `jobs` record with `published: false` or `published: true`.
4. Recruiter can later update using `PUT /api/jobs/:id` or publish it.

### Application workflow
1. Candidate selects job and uploads resume via `POST /api/candidates/:id/resumes`.
2. Candidate applies using `POST /api/applications` with `jobId`, `candidateId`, and `resumeId`.
3. Backend creates `applications` record.
4. The AI pipeline reads `applications`, `jobs`, and `resumes`.
5. It creates `aiResults` and updates `applications.score`.
6. System sends notification and email.

### AI resume ranking workflow
1. Resume is uploaded and text is extracted.
2. Resume text is cleaned, tokenized, and converted into TF-IDF vectors.
3. Job description text is processed similarly.
4. Compute cosine similarity and semantic similarity.
5. Store match output in `aiResults`.
6. Recruiter dashboard queries `applications` sorted by `score`.

---

## 7. Notes and Assumptions

- The backend is designed to support both recruiter and candidate dashboards.
- AI results are stored separately from application state for flexibility.
- Resume files are stored in AWS S3 and referenced by `s3Url`.
- The data model supports future features such as reporting, complaint tracking, and opportunities without schema changes.

---

## 8. Deliverable Summary

This document provides the complete backend structure for:
- MongoDB collection design
- Field definitions and sample documents
- Relationships between entities
- REST API endpoint planning
- Authentication and recruiter verification flow
- Recommended indexing strategy

It is intended as the definitive reference for Member 2 work on database and API design for the AI-powered ATS.
