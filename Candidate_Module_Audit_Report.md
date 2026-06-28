# Skillora Candidate Module Audit Report

Date: 2026-06-21

## 1. Existing Issues Found

- Candidate dashboard depended on local mock arrays for jobs, applications, interviews, notifications, messages, stats, skill gaps, and recommendations.
- Resume Analyzer generated fake resume text for non-text uploads and displayed sample ATS scores/recommendations when AI failed.
- Job search filtered only in-memory data and did not query MongoDB by title, company, skills, location, job type, and experience.
- Update Profile form was not persisted to MongoDB.
- Apply Job flow did not refresh dashboard state or create candidate notifications.
- Notifications schema did not support the candidate notification event types required by resume, application, interview, profile, jobs, and messages.
- Resume records could not store ATS score, analysis payload, or recommendations.

## 2. Root Cause Analysis

- The frontend candidate module was still wired to `mockData.ts` instead of authenticated API calls.
- Backend routes existed for most resources, but several did not expose the exact candidate workflow needed by the UI.
- MongoDB schemas were missing fields for persisted AI resume analysis.
- The notification enum was too narrow for candidate lifecycle events.
- Browser-side resume handling was pretending to extract content from PDF/DOC/DOCX files.

## 3. Files Modified

- `frontend/src/pages/CandidateDashboard.tsx`
- `backend/controllers/candidateController.js`
- `backend/controllers/jobController.js`
- `backend/controllers/applicationController.js`
- `backend/models/Resume.js`
- `backend/models/Notification.js`
- `backend/routes/candidateRoutes.js`

## 4. APIs Fixed

- Added authenticated current candidate endpoint: `GET /api/candidates/me/profile`
- Extended `GET /api/jobs` filters for search, company, skills, location, job type, and experience.
- Updated `POST /api/candidates/:id/resumes` to persist ATS score, extracted skills, recommendations, and analysis.
- Updated `POST /api/applications` to resolve real candidate/job documents, prevent duplicates, store denormalized job/candidate fields, and create notifications.
- Updated application status changes to notify candidates.

## 5. MongoDB Collections Fixed

- `resumes`: added `atsScore`, `analysis`, and `recommendations`.
- `notifications`: added candidate event types for profile, resume, jobs, applications, interviews, and messages.
- `applications`: creation now stores real candidate/job references and dashboard-friendly fields.
- `jobs`: query support now covers real search/filter use cases.
- `candidates`: ATS score and extracted skills are updated after resume analysis.

## 6. ML Models Fixed

- Candidate UI now calls the trained AI scoring/recommendation/skill-gap endpoints instead of rendering sample fallbacks.
- ATS scores returned by the ML endpoint are persisted to MongoDB through the resume endpoint.
- Remaining limitation: PDF/DOC/DOCX text extraction is not implemented in the backend. The UI now rejects those formats instead of fabricating resume text.

## 7. Features Connected

- Candidate dashboard cards now use MongoDB candidate, applications, interviews, and notifications.
- Resume Analyzer now uses real text input, trained AI scoring, and MongoDB persistence.
- Job Search now calls the backend with debounced filters.
- Apply Job now creates real MongoDB applications and updates notifications.
- My Applications now shows MongoDB application records.
- Interview Center now shows MongoDB interviews.
- Notifications now shows MongoDB notifications.
- Profile Settings now persists candidate updates.

## 8. Features Rebuilt

- Rebuilt `CandidateDashboard.tsx` around API-backed state and honest empty/error states.
- Removed candidate mock data imports and all candidate page sample/fake fallback result rendering.
- Reworked resume upload behavior to avoid fake extraction.

## 9. Features Added

- Current-candidate API lookup by authenticated user.
- Resume ATS result persistence.
- Candidate notification event support.
- Application submission notification.
- Application status update notification.
- Debounced real job search.

## 10. Remaining Issues

- Real file storage and server-side PDF/DOC/DOCX parsing still need to be added.
- Messaging currently supports MongoDB message creation, but not full conversation listing, role-based user picker, attachments, unread aggregation, or sockets.
- AI recommendation and skill-gap quality depends on the existing Python model implementation and its data source.
- End-to-end MongoDB/API testing requires a running database with real seeded users/jobs.

## 11. Security Improvements

- Candidate APIs continue to require authentication.
- Candidate UI no longer ships sample data into candidate workflows.
- Application creation now resolves real job and candidate documents before writing.
- Duplicate application checks cover real MongoDB IDs and legacy string IDs.

## 12. Performance Improvements

- Job search is debounced at 350 ms.
- Candidate dashboard loads candidate-dependent resources in parallel.
- Backend job filtering reduces client-side filtering work.

## 13. Database Improvements

- Resume analysis fields are now first-class persisted data.
- Notifications support the full candidate lifecycle.
- Application records now include applied date, ATS score, job title, company, and candidate name for reliable dashboard rendering.

## 14. Testing Results

- `node --check backend/controllers/candidateController.js`: passed.
- `node --check backend/controllers/applicationController.js`: passed.
- `node --check backend/controllers/jobController.js`: passed.
- `node --check backend/models/Notification.js`: passed.
- `npx.cmd tsc -b` in `frontend`: passed.
- `npx.cmd vite build` in `frontend`: passed.

## 15. Final Candidate Module Status

The Candidate Module is no longer mock-driven in the candidate dashboard and now uses authenticated API calls, MongoDB-backed records, persisted ML resume scoring, real job search, real applications, real interviews, real notifications, and persisted profile updates. It is materially closer to production-ready, with the main remaining production gaps being file storage/PDF extraction, full realtime messaging, and live database-backed end-to-end verification.
