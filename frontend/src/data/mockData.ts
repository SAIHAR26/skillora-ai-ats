// Mock Data for Skillora Platform

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
  status: "active" | "paused" | "closed";
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
  status: "pending" | "approved" | "rejected";
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

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Frontend Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    type: "Remote",
    salary: "$120k - $160k",
    description: "We are looking for a skilled Frontend Developer proficient in React, TypeScript, and modern CSS frameworks.",
    skills: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
    experience: "2-4 years",
    deadline: "2026-07-15",
    status: "active",
    applications: 120,
    shortlisted: 35,
    interviewed: 15,
    hired: 3,
    postedDate: "2026-05-01",
  },
  {
    id: "job-2",
    title: "Data Scientist",
    company: "DataFlow Inc",
    location: "New York, NY",
    type: "Hybrid",
    salary: "$130k - $180k",
    description: "Seeking an experienced Data Scientist with expertise in machine learning, Python, and statistical modeling.",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
    experience: "3-5 years",
    deadline: "2026-07-20",
    status: "active",
    applications: 85,
    shortlisted: 22,
    interviewed: 10,
    hired: 2,
    postedDate: "2026-05-10",
  },
  {
    id: "job-3",
    title: "Backend Engineer",
    company: "CloudScale",
    location: "Austin, TX",
    type: "On-site",
    salary: "$110k - $150k",
    description: "Join our backend team to build scalable microservices using Go and Kubernetes.",
    skills: ["Go", "Kubernetes", "PostgreSQL", "gRPC"],
    experience: "2-4 years",
    deadline: "2026-07-25",
    status: "active",
    applications: 64,
    shortlisted: 18,
    interviewed: 8,
    hired: 2,
    postedDate: "2026-05-15",
  },
  {
    id: "job-4",
    title: "Product Designer",
    company: "DesignHub",
    location: "Seattle, WA",
    type: "Remote",
    salary: "$100k - $140k",
    description: "Looking for a creative Product Designer with strong UX/UI skills and Figma expertise.",
    skills: ["Figma", "UI/UX", "Prototyping", "User Research"],
    experience: "2-3 years",
    deadline: "2026-07-30",
    status: "active",
    applications: 95,
    shortlisted: 28,
    interviewed: 12,
    hired: 1,
    postedDate: "2026-05-20",
  },
  {
    id: "job-5",
    title: "DevOps Engineer",
    company: "InfraWorks",
    location: "Chicago, IL",
    type: "Hybrid",
    salary: "$125k - $165k",
    description: "Seeking a DevOps Engineer experienced with AWS, Terraform, and CI/CD pipelines.",
    skills: ["AWS", "Terraform", "Docker", "Jenkins"],
    experience: "3-5 years",
    deadline: "2026-08-01",
    status: "active",
    applications: 42,
    shortlisted: 12,
    interviewed: 5,
    hired: 1,
    postedDate: "2026-05-25",
  },
  {
    id: "job-6",
    title: "Mobile Developer",
    company: "AppNova",
    location: "Boston, MA",
    type: "Remote",
    salary: "$115k - $155k",
    description: "Build cross-platform mobile apps using React Native and Flutter.",
    skills: ["React Native", "Flutter", "iOS", "Android"],
    experience: "2-4 years",
    deadline: "2026-08-05",
    status: "active",
    applications: 78,
    shortlisted: 20,
    interviewed: 9,
    hired: 2,
    postedDate: "2026-06-01",
  },
];

// Mock Candidates
export const mockCandidates: Candidate[] = [
  {
    id: "cand-1",
    name: "Alex Johnson",
    email: "alex.j@email.com",
    phone: "+1 555-0101",
    avatar: "/images/candidate-1.jpg",
    college: "MIT",
    degree: "B.Tech",
    specialization: "Computer Science",
    graduationYear: "2024",
    cgpa: 3.8,
    skills: ["Python", "React", "SQL", "Machine Learning"],
    experienceLevel: "Fresher",
    atsScore: 87,
    location: "San Francisco, CA",
    preferredLocation: "Remote",
    workPreference: "Full-time",
    linkedin: "linkedin.com/in/alexj",
    github: "github.com/alexj",
    resumeUrl: "/resumes/alex.pdf",
    appliedJobs: ["job-1", "job-2"],
    interviews: [],
    status: "active",
  },
  {
    id: "cand-2",
    name: "Sarah Chen",
    email: "sarah.c@email.com",
    phone: "+1 555-0102",
    avatar: "/images/candidate-2.jpg",
    college: "Stanford University",
    degree: "M.S.",
    specialization: "Data Science",
    graduationYear: "2023",
    cgpa: 3.9,
    skills: ["Python", "TensorFlow", "SQL", "AWS"],
    experienceLevel: "1-2 years",
    atsScore: 95,
    location: "New York, NY",
    preferredLocation: "Hybrid",
    workPreference: "Full-time",
    linkedin: "linkedin.com/in/sarahc",
    github: "github.com/sarahc",
    resumeUrl: "/resumes/sarah.pdf",
    appliedJobs: ["job-2", "job-4"],
    interviews: [],
    status: "active",
  },
  {
    id: "cand-3",
    name: "Rahul Sharma",
    email: "rahul.s@email.com",
    phone: "+1 555-0103",
    avatar: "/images/candidate-1.jpg",
    college: "IIT Bombay",
    degree: "B.Tech",
    specialization: "Computer Science",
    graduationYear: "2024",
    cgpa: 3.7,
    skills: ["Java", "Spring Boot", "React", "MongoDB"],
    experienceLevel: "Fresher",
    atsScore: 91,
    location: "Austin, TX",
    preferredLocation: "On-site",
    workPreference: "Full-time",
    linkedin: "linkedin.com/in/rahuls",
    github: "github.com/rahuls",
    resumeUrl: "/resumes/rahul.pdf",
    appliedJobs: ["job-1", "job-3"],
    interviews: [],
    status: "active",
  },
  {
    id: "cand-4",
    name: "Priya Patel",
    email: "priya.p@email.com",
    phone: "+1 555-0104",
    avatar: "/images/candidate-2.jpg",
    college: "Georgia Tech",
    degree: "B.S.",
    specialization: "Software Engineering",
    graduationYear: "2023",
    cgpa: 3.6,
    skills: ["JavaScript", "React", "Node.js", "GraphQL"],
    experienceLevel: "1-2 years",
    atsScore: 88,
    location: "Seattle, WA",
    preferredLocation: "Remote",
    workPreference: "Full-time",
    linkedin: "linkedin.com/in/priyap",
    github: "github.com/priyap",
    resumeUrl: "/resumes/priya.pdf",
    appliedJobs: ["job-1", "job-4"],
    interviews: [],
    status: "active",
  },
  {
    id: "cand-5",
    name: "Michael Brown",
    email: "michael.b@email.com",
    phone: "+1 555-0105",
    avatar: "/images/candidate-1.jpg",
    college: "UC Berkeley",
    degree: "M.S.",
    specialization: "AI/ML",
    graduationYear: "2022",
    cgpa: 3.9,
    skills: ["Python", "PyTorch", "NLP", "Computer Vision"],
    experienceLevel: "2-3 years",
    atsScore: 93,
    location: "San Francisco, CA",
    preferredLocation: "Remote",
    workPreference: "Full-time",
    linkedin: "linkedin.com/in/michaelb",
    github: "github.com/michaelb",
    resumeUrl: "/resumes/michael.pdf",
    appliedJobs: ["job-2", "job-5"],
    interviews: [],
    status: "active",
  },
];

// Mock Recruiters
export const mockRecruiters: Recruiter[] = [
  {
    id: "rec-1",
    name: "Jennifer Walsh",
    email: "jennifer@techcorp.com",
    companyEmail: "hr@techcorp.com",
    phone: "+1 555-0201",
    avatar: "/images/recruiter-1.jpg",
    companyName: "TechCorp",
    companyAddress: "123 Market St, San Francisco, CA",
    companyWebsite: "techcorp.com",
    industry: "Technology",
    companySize: "500-1000",
    role: "HR Manager",
    experience: "8 years",
    linkedin: "linkedin.com/in/jenniferw",
    status: "approved",
    jobsPosted: 12,
    totalApplications: 450,
    hiredCount: 28,
  },
  {
    id: "rec-2",
    name: "Robert Hayes",
    email: "robert@dataflow.com",
    companyEmail: "hr@dataflow.com",
    phone: "+1 555-0202",
    avatar: "/images/recruiter-2.jpg",
    companyName: "DataFlow Inc",
    companyAddress: "456 Broadway, New York, NY",
    companyWebsite: "dataflow.io",
    industry: "Data Analytics",
    companySize: "200-500",
    role: "Talent Acquisition Lead",
    experience: "12 years",
    linkedin: "linkedin.com/in/roberth",
    status: "approved",
    jobsPosted: 8,
    totalApplications: 320,
    hiredCount: 19,
  },
  {
    id: "rec-3",
    name: "Emily Davis",
    email: "emily@cloudscale.com",
    companyEmail: "hr@cloudscale.com",
    phone: "+1 555-0203",
    avatar: "/images/recruiter-1.jpg",
    companyName: "CloudScale",
    companyAddress: "789 Congress Ave, Austin, TX",
    companyWebsite: "cloudscale.dev",
    industry: "Cloud Computing",
    companySize: "100-200",
    role: "Senior Recruiter",
    experience: "6 years",
    linkedin: "linkedin.com/in/emilyd",
    status: "pending",
    jobsPosted: 0,
    totalApplications: 0,
    hiredCount: 0,
  },
];

// Mock Interviews
export const mockInterviews: Interview[] = [
  {
    id: "int-1",
    candidateId: "cand-1",
    candidateName: "Alex Johnson",
    recruiterId: "rec-1",
    jobId: "job-1",
    jobTitle: "Frontend Developer",
    date: "2026-06-15",
    time: "10:00 AM",
    status: "scheduled",
    meetingLink: "https://meet.skillora.com/int-1",
    feedback: "",
  },
  {
    id: "int-2",
    candidateId: "cand-2",
    candidateName: "Sarah Chen",
    recruiterId: "rec-2",
    jobId: "job-2",
    jobTitle: "Data Scientist",
    date: "2026-06-16",
    time: "2:00 PM",
    status: "scheduled",
    meetingLink: "https://meet.skillora.com/int-2",
    feedback: "",
  },
  {
    id: "int-3",
    candidateId: "cand-3",
    candidateName: "Rahul Sharma",
    recruiterId: "rec-1",
    jobId: "job-1",
    jobTitle: "Frontend Developer",
    date: "2026-06-17",
    time: "11:00 AM",
    status: "pending",
    meetingLink: "",
    feedback: "",
  },
];

// Mock Applications
export const mockApplications: Application[] = [
  {
    id: "app-1",
    candidateId: "cand-1",
    candidateName: "Alex Johnson",
    jobId: "job-1",
    jobTitle: "Frontend Developer",
    company: "TechCorp",
    atsScore: 87,
    status: "shortlisted",
    appliedDate: "2026-06-01",
    resumeUrl: "/resumes/alex.pdf",
  },
  {
    id: "app-2",
    candidateId: "cand-2",
    candidateName: "Sarah Chen",
    jobId: "job-2",
    jobTitle: "Data Scientist",
    company: "DataFlow Inc",
    atsScore: 95,
    status: "interview",
    appliedDate: "2026-06-02",
    resumeUrl: "/resumes/sarah.pdf",
  },
  {
    id: "app-3",
    candidateId: "cand-3",
    candidateName: "Rahul Sharma",
    jobId: "job-1",
    jobTitle: "Frontend Developer",
    company: "TechCorp",
    atsScore: 91,
    status: "shortlisted",
    appliedDate: "2026-06-03",
    resumeUrl: "/resumes/rahul.pdf",
  },
  {
    id: "app-4",
    candidateId: "cand-4",
    candidateName: "Priya Patel",
    jobId: "job-4",
    jobTitle: "Product Designer",
    company: "DesignHub",
    atsScore: 88,
    status: "applied",
    appliedDate: "2026-06-04",
    resumeUrl: "/resumes/priya.pdf",
  },
  {
    id: "app-5",
    candidateId: "cand-5",
    candidateName: "Michael Brown",
    jobId: "job-2",
    jobTitle: "Data Scientist",
    company: "DataFlow Inc",
    atsScore: 93,
    status: "shortlisted",
    appliedDate: "2026-06-05",
    resumeUrl: "/resumes/michael.pdf",
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: "msg-1",
    senderId: "rec-1",
    senderName: "Jennifer Walsh",
    senderRole: "recruiter",
    recipientId: "cand-1",
    content: "Hi Alex, we'd like to schedule an interview for the Frontend Developer position. Please check available slots.",
    timestamp: "2026-06-10T10:00:00",
    read: false,
  },
  {
    id: "msg-2",
    senderId: "cand-1",
    senderName: "Alex Johnson",
    senderRole: "candidate",
    recipientId: "rec-1",
    content: "Thank you! I've booked a slot for June 15th at 10 AM.",
    timestamp: "2026-06-10T11:30:00",
    read: true,
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "cand-1",
    type: "interview",
    title: "Interview Scheduled",
    message: "Your interview for Frontend Developer at TechCorp is scheduled for June 15th.",
    timestamp: "2026-06-10T09:00:00",
    read: false,
  },
  {
    id: "notif-2",
    userId: "cand-1",
    type: "job_match",
    title: "New Job Match",
    message: "A new Backend Engineer position matches your skills with 85% compatibility.",
    timestamp: "2026-06-09T14:00:00",
    read: false,
  },
];

// Mock Complaints
export const mockComplaints: Complaint[] = [
  {
    id: "comp-1",
    userId: "cand-1",
    userName: "Alex Johnson",
    userRole: "candidate",
    subject: "Unable to upload resume",
    description: "The resume upload feature is not working. I keep getting an error message.",
    status: "open",
    createdAt: "2026-06-08",
  },
  {
    id: "comp-2",
    userId: "rec-1",
    userName: "Jennifer Walsh",
    userRole: "recruiter",
    subject: "Job posting approval delay",
    description: "My job posting has been pending for 3 days. Please review.",
    status: "resolved",
    createdAt: "2026-06-05",
  },
];

// Mock Analytics
export const mockAnalytics: AnalyticsData[] = [
  { month: "Jan", applications: 120, interviews: 45, hires: 12, rejections: 63 },
  { month: "Feb", applications: 150, interviews: 60, hires: 18, rejections: 72 },
  { month: "Mar", applications: 180, interviews: 72, hires: 22, rejections: 86 },
  { month: "Apr", applications: 200, interviews: 80, hires: 25, rejections: 95 },
  { month: "May", applications: 220, interviews: 88, hires: 28, rejections: 104 },
  { month: "Jun", applications: 250, interviews: 100, hires: 32, rejections: 118 },
];

// Top Recruiters for Home Page
export const topRecruiters = [
  { id: "rec-1", name: "Jennifer Walsh", company: "TechCorp", role: "HR Manager", hires: 28, avatar: "/images/recruiter-1.jpg" },
  { id: "rec-2", name: "Robert Hayes", company: "DataFlow Inc", role: "Talent Lead", hires: 19, avatar: "/images/recruiter-2.jpg" },
  { id: "rec-3", name: "Emily Davis", company: "CloudScale", role: "Senior Recruiter", hires: 15, avatar: "/images/recruiter-1.jpg" },
];

// Top Candidates for Home Page
export const topCandidates = [
  { id: "cand-2", name: "Sarah Chen", role: "Data Scientist", atsScore: 95, skills: ["Python", "ML", "SQL"], avatar: "/images/candidate-2.jpg" },
  { id: "cand-5", name: "Michael Brown", role: "AI Engineer", atsScore: 93, skills: ["Python", "PyTorch", "NLP"], avatar: "/images/candidate-1.jpg" },
  { id: "cand-3", name: "Rahul Sharma", role: "Full Stack Dev", atsScore: 91, skills: ["Java", "React", "MongoDB"], avatar: "/images/candidate-1.jpg" },
  { id: "cand-1", name: "Alex Johnson", role: "Frontend Dev", atsScore: 87, skills: ["Python", "React", "SQL"], avatar: "/images/candidate-1.jpg" },
];

// Admin Dashboard Stats
export const adminStats = {
  totalCandidates: 1248,
  totalRecruiters: 86,
  totalJobs: 342,
  totalApplications: 5280,
  interviewsScheduled: 156,
  hiredCandidates: 89,
  rejectedCandidates: 420,
};

// Recruiter Dashboard Stats
export const recruiterStats = {
  totalActiveJobs: 5,
  totalApplications: 120,
  shortlistedCandidates: 35,
  interviewsScheduled: 8,
  hiredCandidates: 3,
  aiRecommendations: 12,
};

// Candidate Dashboard Stats
export const candidateStats = {
  atsScore: 87,
  jobsApplied: 4,
  interviewsScheduled: 1,
  profileCompletion: 85,
  aiCareerMatch: 92,
};

// Skill Gap Analysis for candidates
export const skillGapData = {
  matched: [
    { skill: "Python", level: 90 },
    { skill: "SQL", level: 85 },
    { skill: "React", level: 75 },
  ],
  missing: [
    { skill: "Docker", level: 0, recommended: "Docker Fundamentals" },
    { skill: "AWS", level: 0, recommended: "AWS Cloud Practitioner" },
    { skill: "GraphQL", level: 0, recommended: "GraphQL Basics" },
  ],
};

// AI Recommendations for candidates
export const aiJobRecommendations = [
  { jobId: "job-1", title: "Frontend Developer", company: "TechCorp", matchScore: 95 },
  { jobId: "job-2", title: "Data Scientist", company: "DataFlow Inc", matchScore: 91 },
  { jobId: "job-6", title: "Mobile Developer", company: "AppNova", matchScore: 89 },
];
