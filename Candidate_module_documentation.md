# Candidate Module Documentation

## Overview

The Candidate Module is a core component of the AI-Powered Applicant Tracking System (ATS). It enables candidates to create professional profiles, upload resumes, receive AI-powered resume analysis, discover relevant job opportunities, apply for positions, track application status, and manage interviews.

---

# Candidate Workflow

```text
Register
↓
Create Profile
↓
Upload Resume
↓
ATS Analysis
↓
Job Recommendations
↓
Apply
↓
Interview
↓
Selection
```

## Workflow Description

### 1. Register
Candidates create an account using:
- Full Name
- Email Address
- Password
- Mobile Number

### 2. Create Profile
Candidates complete their professional profile by providing:
- Personal Information
- Education Details
- Skills
- Work Experience
- Projects
- Certifications

### 3. Upload Resume
Candidates upload resumes in supported formats:
- PDF
- DOC
- DOCX

### 4. ATS Analysis
The system analyzes the resume and generates:
- ATS Score
- Resume Strength Analysis
- Missing Skills Report
- Improvement Suggestions

### 5. Job Recommendations
AI recommends jobs based on:
- Skills
- Experience
- Education
- Resume Keywords
- Preferred Locations

### 6. Apply for Jobs
Candidates can apply directly to recommended or searched jobs.

### 7. Interview Process
Candidates receive interview invitations, schedules, and meeting details.

### 8. Selection
Application status is updated as:
- Selected
- Rejected
- On Hold

---

# Candidate Pages

## 1. Login Page

### Features
- Email Login
- Password Authentication
- Forgot Password
- Remember Me Option

---

## 2. Signup Page

### Features
- Candidate Registration
- Email Verification
- Password Validation

---

## 3. Dashboard Page

### Purpose
Acts as the central hub for candidate activities.

### Features
- Profile Completion Status
- ATS Score Overview
- Recommended Jobs
- Recent Applications
- Upcoming Interviews
- Notifications

---

## 4. Profile Page

### Purpose
Stores and manages candidate information.

### Sections

#### Personal Details
- Full Name
- Email
- Mobile Number
- Address
- LinkedIn Profile
- Portfolio Website

#### Education
- Degree
- Institution
- University
- CGPA/Percentage
- Graduation Year

#### Skills
- Technical Skills
- Soft Skills

#### Experience
- Company Name
- Job Role
- Duration
- Responsibilities

#### Projects
- Project Name
- Description
- Technologies Used
- GitHub Link

#### Certifications
- Certification Name
- Issuing Organization
- Completion Date

---

## 5. Resume Analyzer Page

### Purpose
Provides AI-powered resume evaluation.

### Features
- Resume Upload
- ATS Score Generation
- Keyword Analysis
- Resume Feedback
- Downloadable Report

---

## 6. Job Search Page

### Purpose
Allows candidates to search and filter job opportunities.

### Search Filters
- Job Title
- Location
- Experience Level
- Salary Range
- Skills
- Remote Opportunities

### Sorting Options
- Newest Jobs
- Highest Salary
- Best Match

---

## 7. Applications Page

### Purpose
Tracks all job applications.

### Features
- Applied Jobs List
- Application Date
- Application Status
- Recruiter Feedback
- Interview Updates

### Application Status Flow

```text
Applied
↓
Under Review
↓
Shortlisted
↓
Interview Scheduled
↓
Selected / Rejected
```

---

## 8. Interview Center Page

### Purpose
Manages interview activities.

### Features
- Scheduled Interviews
- Interview Details
- Meeting Links
- Instructions
- Feedback

---

## 9. Messages Page

### Purpose
Facilitates communication between candidates and recruiters.

### Features
- Recruiter Messages
- Application Discussions
- Clarification Requests
- System Messages

---

## 10. Notifications Page

### Purpose
Displays real-time alerts and updates.

### Features
- Job Alerts
- Application Updates
- Interview Notifications
- AI Recommendations

---

# Resume Analyzer Module

## Objective
Evaluate resumes using Applicant Tracking System (ATS) logic and provide actionable feedback.

---

## ATS Score

### Score Range
```text
0 - 100
```

### Evaluation Criteria

| Criteria | Weight |
|-----------|---------|
| Skills Match | 30% |
| Experience | 20% |
| Education | 15% |
| Keywords | 20% |
| Formatting | 10% |
| Certifications | 5% |

---

## Strength Analysis

Examples:
- Strong technical skills
- Relevant work experience
- Industry-recognized certifications
- Well-defined projects

---

## Missing Skills Detection

### Example

**Required Skills**
```text
React
Node.js
MongoDB
AWS
```

**Candidate Skills**
```text
React
Node.js
MongoDB
```

**Missing Skills**
```text
AWS
```

---

## Resume Suggestions

The system may suggest:
- Adding measurable achievements
- Including missing keywords
- Improving the professional summary
- Adding certifications
- Enhancing project descriptions

---

# AI Job Recommendation System

## Objective
Recommend jobs that best match candidate qualifications and preferences.

---

## Recommendation Factors

### Skills Match
Compares candidate skills with job requirements.

### Experience Match
Evaluates experience compatibility.

Example:
```text
Candidate Experience: 3 Years
Required Experience: 2-4 Years
```

### Education Match
Compares educational qualifications.

Examples:
- B.Tech
- MCA
- MBA

### Location Preference
Considers preferred locations.

Examples:
- Hyderabad
- Bangalore
- Remote

### Industry Preference
Considers interest areas such as:
- Software Development
- Data Science
- AI/ML
- Cyber Security
- Cloud Computing

---

## Match Score Generation

### Formula

```text
Match Score =
(Skills × 40%)
+
(Experience × 25%)
+
(Education × 15%)
+
(Location × 10%)
+
(Certifications × 10%)
```

### Example Output

```text
92% Match
85% Match
78% Match
```

---

# Skill Gap Analysis Module

## Objective
Identify missing skills and guide candidates toward improvement.

---

## Required Skills

Collected from:
- Job Descriptions
- Industry Standards
- Recruiter Requirements

Example:
```text
React
Node.js
MongoDB
Docker
AWS
```

---

## Current Skills

Collected from:
- Resume
- Profile
- Certifications
- Projects

Example:
```text
React
Node.js
MongoDB
```

---

## Gap Identification

Missing Skills:
```text
Docker
AWS
```

---

## Learning Path Suggestions

### Recommended Courses
- React Advanced
- Docker Fundamentals
- AWS Cloud Practitioner

### Recommended Certifications
- AWS Certified Cloud Practitioner
- Azure Fundamentals
- Google Cloud Associate

### Recommended Projects
- E-Commerce Platform
- Applicant Tracking System
- Real-Time Chat Application
- AI Resume Screening Tool

---

# Notification System

## Objective
Provide real-time updates about candidate activities and opportunities.

---

## Account Notifications

- Registration Successful
- Email Verified
- Profile Completion Reminder

---

## Resume Notifications

- Resume Uploaded Successfully
- Resume Analysis Completed
- ATS Score Updated

---

## Job Notifications

- New Matching Job Found
- Recommended Jobs Available
- Application Deadline Reminder

---

## Application Notifications

- Application Submitted
- Application Viewed
- Under Review
- Shortlisted
- Rejected
- Selected

---

## Interview Notifications

- Interview Scheduled
- Interview Rescheduled
- Interview Reminder
- Interview Feedback Available

---

## Messaging Notifications

- New Recruiter Message
- Recruiter Reply Received

---

## AI Notifications

- Skill Gap Identified
- Learning Path Generated
- Resume Improvement Suggestions
- Certification Recommendations

---

# Database Collections

```text
Users
Candidates
Profiles
Resumes
ATSReports
JobRecommendations
Applications
Interviews
Messages
Notifications
SkillGapAnalysis
LearningPaths
```

---

# Key Features

- Candidate Registration & Authentication
- Profile Management
- Resume Upload & Storage
- AI-Powered ATS Analysis
- Job Recommendation Engine
- Skill Gap Analysis
- Job Applications
- Interview Management
- Recruiter Messaging
- Real-Time Notifications
- Application Tracking
- Personalized Learning Paths

---

# Conclusion

The Candidate Module serves as a complete career management platform for job seekers. It helps candidates build professional profiles, optimize resumes, discover relevant job opportunities, track applications, improve skills through AI-driven recommendations, and manage the hiring journey from application to selection.

This module integrates with the Recruiter Module, ATS Engine, AI Recommendation System, Notification Service, and Interview Management System to provide a seamless recruitment experience.
