// Data containers hydrated from MongoDB through /api/platform/snapshot.
// Keep these defaults empty so the UI never displays bundled demo records when the backend has no data.

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  skills: string[];
  experience: string;
  deadline: string;
  status: "active" | "paused" | "closed" | "open" | "archived";
  applications: number;
  shortlisted: number;
  interviewed: number;
  hired: number;
  postedDate: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  college: string;
  degree: string;
  specialization: string;
  graduationYear: string;
  cgpa: number;
  skills: string[];
  experienceLevel: string;
  atsScore: number;
  location: string;
  preferredLocation: string;
  workPreference: string;
  linkedin: string;
  github: string;
  resumeUrl: string;
  appliedJobs: string[];
  interviews: Interview[];
  status: "active" | "suspended";
}

export interface Recruiter {
  id: string;
  name: string;
  email: string;
  companyEmail: string;
  phone: string;
  avatar: string;
  companyName: string;
  companyAddress: string;
  companyWebsite: string;
  industry: string;
  companySize: string;
  role: string;
  experience: string;
  linkedin: string;
  status: "pending" | "approved" | "rejected" | "active";
  jobsPosted: number;
  totalApplications: number;
  hiredCount: number;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  recruiterId: string;
  jobId: string;
  jobTitle: string;
  date: string;
  time: string;
  status: "pending" | "scheduled" | "completed" | "selected" | "rejected";
  meetingLink: string;
  feedback: string;
}

export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  company: string;
  atsScore: number;
  status: "applied" | "under_review" | "shortlisted" | "interview" | "selected" | "rejected";
  appliedDate: string;
  resumeUrl: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  subject: string;
  description: string;
  status: "open" | "resolved";
  createdAt: string;
}

export interface AnalyticsData {
  month: string;
  applications: number;
  interviews: number;
  hires: number;
  rejections: number;
}

export const mockJobs: Job[] = [];
export const mockCandidates: Candidate[] = [];
export const mockRecruiters: Recruiter[] = [];
export const mockInterviews: Interview[] = [];
export const mockApplications: Application[] = [];
export const mockMessages: Message[] = [];
export const mockNotifications: Notification[] = [];
export const mockComplaints: Complaint[] = [];
export const mockAnalytics: AnalyticsData[] = [];

export const topRecruiters: { id: string; name: string; company: string; role: string; hires: number; avatar: string }[] = [];
export const topCandidates: { id: string; name: string; role: string; atsScore: number; skills: string[]; avatar: string }[] = [];

export const adminStats = {
  totalCandidates: 0,
  totalRecruiters: 0,
  totalJobs: 0,
  totalApplications: 0,
  interviewsScheduled: 0,
  hiredCandidates: 0,
  rejectedCandidates: 0,
};

export const recruiterStats = {
  totalActiveJobs: 0,
  totalApplications: 0,
  shortlistedCandidates: 0,
  interviewsScheduled: 0,
  hiredCandidates: 0,
  aiRecommendations: 0,
};

export const candidateStats = {
  atsScore: 0,
  jobsApplied: 0,
  interviewsScheduled: 0,
  profileCompletion: 0,
  aiCareerMatch: 0,
};

export const skillGapData = {
  matched: [] as { skill: string; level: number }[],
  missing: [] as { skill: string; level: number; recommended: string }[],
};

export const aiJobRecommendations: { jobId: string; title: string; company: string; matchScore: number }[] = [];

export interface PlatformSnapshot {
  adminStats: typeof adminStats;
  analytics: AnalyticsData[];
  applications: Application[];
  candidates: Candidate[];
  candidateStats: typeof candidateStats;
  complaints: Complaint[];
  interviews: Interview[];
  jobs: Job[];
  messages: Message[];
  notifications: Notification[];
  recruiters: Recruiter[];
  recruiterStats: typeof recruiterStats;
  topCandidates: typeof topCandidates;
  topRecruiters: typeof topRecruiters;
}

function replaceArray<T>(target: T[], source?: T[]) {
  target.splice(0, target.length, ...(source || []));
}

export function applyPlatformSnapshot(snapshot: PlatformSnapshot) {
  replaceArray(mockJobs, snapshot.jobs);
  replaceArray(mockCandidates, snapshot.candidates);
  replaceArray(mockRecruiters, snapshot.recruiters);
  replaceArray(mockInterviews, snapshot.interviews);
  replaceArray(mockApplications, snapshot.applications);
  replaceArray(mockMessages, snapshot.messages);
  replaceArray(mockNotifications, snapshot.notifications);
  replaceArray(mockComplaints, snapshot.complaints);
  replaceArray(mockAnalytics, snapshot.analytics);
  replaceArray(topRecruiters, snapshot.topRecruiters);
  replaceArray(topCandidates, snapshot.topCandidates);
  Object.assign(adminStats, snapshot.adminStats);
  Object.assign(recruiterStats, snapshot.recruiterStats);
  Object.assign(candidateStats, snapshot.candidateStats);
}