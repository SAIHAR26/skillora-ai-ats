# Recruiter Module Documentation

## 1. Overview

The Recruiter Module enables recruiters to manage hiring activities efficiently using AI-powered recruitment tools. Recruiters can create company profiles, post jobs, manage applications, analyze candidates through ATS scoring, schedule interviews, communicate with candidates, and track recruitment analytics.

---

## 2. Recruiter Registration

### Purpose

Allows recruiters to create an account and access recruitment services.

### Registration Fields

* Name
* Age
* Phone Number
* Personal Email
* Company Email
* Company Name
* Company Address
* Company Website
* Industry Type
* Company Size
* Role in Company
* Years of Experience
* LinkedIn Profile
* Company ID
* Password
* Terms & Conditions Acceptance

### Workflow

1. Recruiter submits registration form.
2. System stores recruiter details.
3. Admin reviews recruiter information.
4. Recruiter account remains pending until verification.
5. Approved recruiters can access the platform.

---

## 3. Recruiter Verification

### Purpose

Ensures only genuine companies can post jobs.

### Verification Process

1. Admin reviews recruiter profile.
2. Admin validates company information.
3. Admin approves or rejects registration.
4. Recruiter receives status notification.

### Status Types

* Pending
* Verified
* Rejected

### Rule

Recruiters can log in only after admin approval.

---

## 4. Recruiter Dashboard

### Dashboard Overview

The dashboard serves as the central hiring management system.

### Dashboard Cards

* Total Active Jobs
* Total Applications
* Shortlisted Candidates
* Interviews Scheduled
* Hired Candidates
* AI Recommendations Count

### Quick Actions

* Post New Job
* Search Candidates
* Schedule Interview
* View Applications

---

## 5. Recruiter Profile Management

### Features

Recruiters can update:

* Company Details
* Contact Information
* Company Website
* Company Address
* Industry Type
* Company Size
* LinkedIn Profile
* Role in Company
* Password Settings
* Notification Preferences
* Account Settings

---

## 6. Job Management

### Create Job

Recruiters can create jobs using:

* Job Title
* Job Description
* Required Skills
* Experience Required
* Salary Range
* Location
* Job Type (Remote / Hybrid / On-Site)
* Application Deadline

### Job Operations

* Create Jobs
* Edit Jobs
* View Jobs
* Pause Hiring
* Close Jobs
* Delete Jobs

---

## 7. Application Management

### Application Statistics

Each job displays:

* Total Applications
* AI Shortlisted Candidates
* Interviewed Candidates
* Hired Candidates

### Recruiter Actions

* View Applications
* Filter Candidates
* Sort by AI Score
* Download Resumes
* Reject Candidates
* Shortlist Candidates

---

## 8. AI Candidate Ranking

### Purpose

The AI engine evaluates candidates automatically.

### Evaluation Factors

* Skills Match
* Resume Keywords
* Experience
* Education
* Certifications
* Projects

### Features

* Automatic Ranking
* Ranking Explanation
* Skill Gap Analysis
* AI Recommendations
* Candidate Comparison

### Example Ranking

1. Candidate A – AI Score 95
2. Candidate B – AI Score 91
3. Candidate C – AI Score 88

---

## 9. Automatic Candidate Selection Logic

### Process

After the application deadline:

1. AI evaluates all applicants.
2. ATS scores are generated.
3. Candidates are ranked.
4. Top candidates are shortlisted.

### Example

Job Openings: 3

Applications Received: 30

AI Shortlist:

Top 6 candidates (2x hiring requirement)

### Benefits

* Backup candidates available.
* Faster recruitment process.
* Reduced manual screening.

---

## 10. Candidate Search

### Search Filters

Recruiters can search candidates using:

* Skills
* Experience
* Location
* Education
* ATS Score

### Example Search

Python + Machine Learning + Hyderabad + ATS Score > 80%

---

## 11. Interview Slot Management

### Features

Recruiters can publish interview slots.

### Configuration

* Interview Start Date
* Interview End Date
* Available Time Range
* Number of Slots

### Example

Date Range: July 10 – July 15

Time Range: 10:00 AM – 5:00 PM

### Result

Shortlisted candidates receive interview notifications.

---

## 12. Candidate Slot Booking Workflow

### Process

1. AI shortlists candidates.
2. Notification is sent.
3. Candidate views available slots.
4. Candidate selects preferred slot.
5. System updates availability automatically.
6. Duplicate bookings are prevented.

---

## 13. Interview Management

### Features

* Schedule Interviews
* Reschedule Interviews
* Cancel Interviews
* Send Meeting Links
* Track Interview Status

### Interview Status

* Pending
* Scheduled
* Completed
* Selected
* Rejected

---

## 14. Analytics Dashboard

### Analytics Metrics

* Applications per Job
* Hiring Rate
* Top Skills
* Candidate Sources
* Interview Success Rate
* Shortlisting Statistics
* Recruitment Trends

### Benefits

Provides data-driven hiring decisions through charts and reports.

---

## 15. Messaging and Communication

### Recruiter Communication Features

* Chat with Candidates
* Send Updates
* Interview Notifications
* Selection Notifications
* Rejection Notifications
* Application Status Updates

---

## 16. Contact Admin

### Features

Recruiters can:

* Raise Complaints
* Report Issues
* Request Verification Updates
* Ask Platform Questions
* Submit Support Tickets

### Tracking

Recruiters can monitor ticket status until resolution.

---

## 17. API Endpoints

### Authentication APIs

* POST /api/recruiter/register
* POST /api/recruiter/login
* POST /api/recruiter/logout

### Profile APIs

* GET /api/recruiter/profile
* PUT /api/recruiter/profile

### Job APIs

* POST /api/jobs
* GET /api/jobs
* PUT /api/jobs/:id
* DELETE /api/jobs/:id

### Application APIs

* GET /api/applications
* GET /api/applications/:id
* PUT /api/applications/status

### Interview APIs

* POST /api/interviews
* PUT /api/interviews/:id
* DELETE /api/interviews/:id

---

## 18. Security Features

* JWT Authentication
* Role-Based Access Control
* Protected Recruiter Routes
* Admin Verification Requirement
* Secure Password Hashing
* Resume Access Authorization

---

## 19. Recruiter Workflow

Recruiter Registration
↓
Admin Verification
↓
Recruiter Login
↓
Create Job
↓
Candidates Apply
↓
AI Resume Analysis
↓
ATS Score Generation
↓
AI Candidate Ranking
↓
Recruiter Reviews Rankings
↓
Open Interview Slots
↓
Candidates Book Slots
↓
Conduct Interviews
↓
Select Candidates
↓
Generate Reports & Analytics
