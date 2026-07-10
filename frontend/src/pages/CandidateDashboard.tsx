import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  CheckCircle,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Send,
  Settings,
  Plus,
  Star,
  Target,
  Upload,
  XCircle,
  Zap,
} from "lucide-react";
import { recommendJobs } from "../services/aiRanking";
import type { JobRecommendation, ResumeScoreResult, SkillGapResult } from "../services/aiRanking";
import { apiRequest, uploadResume } from "../services/platformApi";

type Candidate = {
  _id?: string;
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  currentLocation?: string;
  location?: string;
  college?: string;
  degree?: string;
  specialization?: string;
  graduationYear?: string | number;
  cgpa?: number;
  linkedin?: string;
  github?: string;
  avatar?: string;
  skills?: string[];
  preferredJobTypes?: string[];
  experienceLevel?: string;
  experienceYears?: number;
  resumeUrl?: string;
  atsScore?: number;
};

type Job = {
  _id?: string;
  id?: string;
  title: string;
  company?: string;
  location?: string;
  skillsRequired?: string[];
  skills?: string[];
  employmentType?: string;
  type?: string;
  experienceLevel?: string;
  experience?: string;
  salary?: string;
  salaryRange?: { min?: number; max?: number };
  applicationDeadline?: string;
};

type Application = {
  _id?: string;
  id?: string;
  candidateId?: string | Candidate;
  jobId?: string | Job;
  jobTitle?: string;
  company?: string;
  status?: string;
  appliedAt?: string;
  appliedDate?: string;
  atsScore?: number;
  score?: number;
};

type Interview = {
  _id?: string;
  id?: string;
  candidateId?: string;
  jobTitle?: string;
  date?: string;
  time?: string;
  scheduledAt?: string;
  status?: string;
  feedback?: string;
  meetingLink?: string;
  recruiterId?: string;
};

type Notification = {
  _id?: string;
  id?: string;
  type?: string;
  title: string;
  message: string;
  status?: string;
  timestamp?: string;
  createdAt?: string;
};

type Message = {
  _id?: string;
  id?: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  recipientId: string;
  content: string;
  timestamp?: string;
  read?: boolean;
};

type Recipient = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  company?: string;
  companyName?: string;
  avatar?: string;
};

const candidateKey = (candidate?: Candidate | null) => candidate?._id || candidate?.id || "";
const recipientKey = (recipient?: Recipient | null) => recipient?._id || recipient?.id || "";
const jobKey = (job?: Job | null) => job?._id || job?.id || "";
const jobSkills = (job: Job) => job.skillsRequired?.length ? job.skillsRequired : job.skills || [];
const statusLabel = (value?: string) => (value || "applied").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString() : "Not scheduled";
const profileFields = ["name", "email", "phone", "location", "college", "degree", "skills", "avatar", "resumeUrl"] as const;

function Sidebar({ activeTab, setActiveTab, collapsed }: { activeTab: string; setActiveTab: (t: string) => void; collapsed: boolean }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "resume", label: "Resume Analyzer", icon: <FileText size={18} /> },
    { key: "jobs", label: "Job Search", icon: <Search size={18} /> },
    { key: "recommendations", label: "AI Recommendations", icon: <Star size={18} /> },
    { key: "applications", label: "My Applications", icon: <Briefcase size={18} /> },
    { key: "interviews", label: "Interview Center", icon: <Calendar size={18} /> },
    { key: "skillgap", label: "Skill Gap Analysis", icon: <Target size={18} /> },
    { key: "messages", label: "Messages", icon: <MessageSquare size={18} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { key: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="h-screen sticky top-0 flex flex-col" style={{ width: collapsed ? 60 : 220, background: "white", borderRight: "1px solid #e5e5e5" }}>
      <div className="flex items-center gap-3 px-4 h-16" style={{ borderBottom: "1px solid #e5e5e5" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#0a0a0c" }}>
          <span className="text-xs font-bold" style={{ color: "#d4af37" }}>S</span>
        </div>
        {!collapsed && <span className="font-serif-display text-base font-bold" style={{ color: "#0a0a0c" }}>SKILLORA</span>}
      </div>
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map((link) => (
          <button key={link.key} onClick={() => setActiveTab(link.key)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all" style={{ background: activeTab === link.key ? "#e8f0fe" : "transparent", color: activeTab === link.key ? "#0071e3" : "#6c6c6c", justifyContent: collapsed ? "center" : "flex-start" }}>
            {link.icon}
            {!collapsed && <span>{link.label}</span>}
          </button>
        ))}
      </nav>
      <div className="p-2" style={{ borderTop: "1px solid #e5e5e5" }}>
        <button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-gray-100" style={{ color: "#6c6c6c", justifyContent: collapsed ? "center" : "flex-start" }}>
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

function StatCard({ title, value, icon, color, subtext }: { title: string; value: string | number; icon: React.ReactNode; color: string; subtext?: string }) {
  return (
    <div className="dashboard-card p-5">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}15`, color }}>{icon}</div>
      <p className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>{title}</p>
      {subtext && <p className="text-xs mt-1" style={{ color: "#0071e3" }}>{subtext}</p>}
    </div>
  );
}

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  return (
    <div className="dashboard-card text-center py-12">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#f4f4f4", color: "#9ca3af" }}>{icon}</div>
      <p className="text-base font-medium" style={{ color: "#0a0a0c" }}>{title}</p>
      <p className="text-sm mt-1" style={{ color: "#6c6c6c" }}>{message}</p>
    </div>
  );
}

function DashboardHome({ candidate, applications, interviews, notifications, setActiveTab }: { candidate: Candidate | null; applications: Application[]; interviews: Interview[]; notifications: Notification[]; setActiveTab: (t: string) => void }) {
  const displayName = candidate?.name || "Candidate";
  const completion = Math.round((profileFields.filter((field) => {
    const value = candidate?.[field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length / profileFields.length) * 100);
  const scheduledInterviews = interviews.filter((item) => item.status === "scheduled").length;
  const unreadNotifications = notifications.filter((item) => item.status !== "read").length;

  return (
    <div className="space-y-6">
      <div className="dashboard-card" style={{ background: "#0a0a0c" }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#d4af3720" }}>
            <Award size={24} style={{ color: "#d4af37" }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "#f2f0e6" }}>Welcome to Skillora, {displayName}!</h2>
            <p className="text-sm mt-1" style={{ color: "#c3c0b4" }}>Your dashboard is connected to your MongoDB candidate profile.</p>
            <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212, 175, 55, 0.2)" }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} style={{ color: "#d4af37" }} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs" style={{ color: "#c3c0b4" }}><strong style={{ color: "#d4af37" }}>Safety Notice:</strong> Skillora never supports illegal payments for jobs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="ATS Score" value={`${candidate?.atsScore || 0}%`} icon={<Star size={20} />} color="#f5a623" />
        <StatCard title="Jobs Applied" value={applications.length} icon={<Briefcase size={20} />} color="#0071e3" />
        <StatCard title="Interviews" value={scheduledInterviews} icon={<Calendar size={20} />} color="#3dc75a" />
        <StatCard title="Profile Completion" value={`${completion}%`} icon={<CheckCircle size={20} />} color="#9b59b6" />
        <StatCard title="Unread Notifications" value={unreadNotifications} icon={<Bell size={20} />} color="#e74c3c" />
      </div>
      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Upload Resume", icon: <Upload size={18} />, action: () => setActiveTab("resume"), color: "#0071e3" },
            { label: "Search Jobs", icon: <Search size={18} />, action: () => setActiveTab("jobs"), color: "#3dc75a" },
            { label: "Update Profile", icon: <Settings size={18} />, action: () => setActiveTab("settings"), color: "#f5a623" },
            { label: "AI Recommendations", icon: <Star size={18} />, action: () => setActiveTab("recommendations"), color: "#9b59b6" },
          ].map((action) => (
            <button key={action.label} onClick={action.action} className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105" style={{ background: `${action.color}10`, border: `1px solid ${action.color}20` }}>
              <div style={{ color: action.color }}>{action.icon}</div>
              <span className="text-xs font-medium" style={{ color: "#0a0a0c" }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResumeAnalyzer({ candidate, refresh }: { candidate: Candidate | null; refresh: () => Promise<void> }) {
  const [uploaded, setUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeScoreResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !candidateKey(candidate)) return;
    setAnalyzing(true);
    setError("");
    try {
      const allowedExtensions = [".txt", ".pdf", ".docx"];
      const extension = file.name ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
      if (!allowedExtensions.includes(extension)) {
        throw new Error("Only .txt, .pdf, and .docx resume files are supported.");
      }

      const formData = new FormData();
      formData.append("resume", file);
      const result = await uploadResume(candidateKey(candidate), formData);
      setAnalysis(result.resume.analysis || null);
      setUploaded(true);
      await refresh();
    } catch (caught) {
      setAnalysis(null);
      setError(caught instanceof Error ? caught.message : "Resume analysis failed.");
    } finally {
      setAnalyzing(false);
      event.target.value = "";
    }
  };

  const atsScore = analysis?.atsScore ?? candidate?.atsScore ?? 0;
  const detectedSkills = analysis?.skills || candidate?.skills || [];
  const strengths = analysis?.strengths || [];
  const weaknesses = analysis?.weaknesses || [];
  const suggestions = analysis?.suggestions || [];
  const atsBreakdown = analysis?.atsBreakdown || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Resume Analyzer</h1>
      <div className="dashboard-card">
        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-blue-400" style={{ borderColor: "#e5e5e5" }}>
          <input ref={fileInputRef} type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={handleFileChange} />
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#e8f0fe" }}>
            <Upload size={28} style={{ color: "#0071e3" }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "#0a0a0c" }}>{analyzing ? "Analyzing your resume..." : "Upload your resume file"}</h3>
          <p className="text-sm" style={{ color: "#6c6c6c" }}>ATS scoring uses the trained ML endpoint and stores the result in MongoDB.</p>
        </div>
        {error && <p className="text-sm mt-3" style={{ color: "#b91c1c" }}>{error}</p>}
      </div>
      {(uploaded || atsScore > 0) && (
        <>
          <div className="dashboard-card text-center">
            <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Your ATS Score</h3>
            <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto" style={{ background: `conic-gradient(#0071e3 ${atsScore * 3.6}deg, #f4f4f4 0deg)` }}>
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "white" }}>
                <span className="text-3xl font-bold" style={{ color: "#0071e3" }}>{atsScore}%</span>
              </div>
            </div>
            <p className="text-sm mt-3" style={{ color: atsScore >= 70 ? "#3dc75a" : "#856404" }}>{analysis?.recommendation || "Latest saved ATS score from MongoDB."}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="dashboard-card">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}><CheckCircle size={18} style={{ color: "#3dc75a" }} /> Extracted Skills</h3>
              {detectedSkills.length ? detectedSkills.map((skill) => <p key={skill} className="text-sm mb-2" style={{ color: "#0a0a0c" }}>{skill}</p>) : <p className="text-sm" style={{ color: "#6c6c6c" }}>No skills extracted yet.</p>}
            </div>
            <div className="dashboard-card">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}><Zap size={18} style={{ color: "#f5a623" }} /> Recommendations</h3>
              {suggestions.length ? suggestions.map((item) => <p key={item} className="text-sm mb-2" style={{ color: "#0a0a0c" }}>{item}</p>) : <p className="text-sm" style={{ color: "#6c6c6c" }}>Upload a resume to generate recommendations.</p>}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(atsBreakdown).filter(([, value]) => typeof value === "number").map(([key, value]) => (
              <StatCard key={key} title={statusLabel(key)} value={`${value}%`} icon={<Target size={20} />} color="#0071e3" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="dashboard-card">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}><CheckCircle size={18} style={{ color: "#3dc75a" }} /> Strengths</h3>
              {strengths.length ? strengths.map((item) => <p key={item} className="text-sm mb-2" style={{ color: "#0a0a0c" }}>{item}</p>) : <p className="text-sm" style={{ color: "#6c6c6c" }}>No strengths detected yet.</p>}
            </div>
            <div className="dashboard-card">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}><XCircle size={18} style={{ color: "#e74c3c" }} /> Weaknesses</h3>
              {weaknesses.length ? weaknesses.map((item) => <p key={item} className="text-sm mb-2" style={{ color: "#0a0a0c" }}>{item}</p>) : <p className="text-sm" style={{ color: "#6c6c6c" }}>No major weaknesses detected.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function JobSearch({ candidate, applications, refresh }: { candidate: Candidate | null; applications: Application[]; refresh: () => Promise<void> }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({ location: "", type: "", experience: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const appliedJobIds = useMemo(() => new Set(applications.map((app) => typeof app.jobId === "object" ? jobKey(app.jobId) : app.jobId).filter(Boolean) as string[]), [applications]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.location) params.set("location", filters.location);
    if (filters.type) params.set("jobType", filters.type);
    if (filters.experience) params.set("experienceLevel", filters.experience);
    setLoading(true);
    setError("");
    apiRequest<Job[]>(`/jobs?${params.toString()}`)
      .then(setJobs)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load jobs."))
      .finally(() => setLoading(false));
  }, [debouncedSearch, filters]);

  const apply = async (job: Job) => {
    if (!candidateKey(candidate)) return setError("Candidate profile is required before applying.");
    try {
      await apiRequest("/applications", {
        method: "POST",
        body: JSON.stringify({ jobId: jobKey(job), candidateId: candidateKey(candidate), score: candidate?.atsScore || 0 }),
      });
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit application.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Job Search</h1>
      <div className="dashboard-card">
        <div className="grid md:grid-cols-4 gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, company, skill" className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          <input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="Location" className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          <input value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} placeholder="Job type" className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          <input value={filters.experience} onChange={(e) => setFilters({ ...filters, experience: e.target.value })} placeholder="Experience" className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
        </div>
        {error && <p className="text-sm mt-3" style={{ color: "#b91c1c" }}>{error}</p>}
      </div>
      {loading ? <p className="text-sm" style={{ color: "#6c6c6c" }}>Loading jobs...</p> : jobs.length === 0 ? <EmptyState icon={<Search size={24} />} title="No matching jobs" message="MongoDB returned no jobs for the current filters." /> : (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const id = jobKey(job);
            const applied = appliedJobIds.has(id);
            return (
              <div key={id} className="dashboard-card">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>{job.title}</h3>
                    <p className="text-sm mt-1" style={{ color: "#6c6c6c" }}>{job.company || "Company not listed"} | {job.location || "Location not listed"}</p>
                    <div className="flex flex-wrap gap-2 mt-3">{jobSkills(job).map((skill) => <span key={skill} className="px-2 py-1 rounded-full text-xs" style={{ background: "#e8f0fe", color: "#0071e3" }}>{skill}</span>)}</div>
                  </div>
                  <button disabled={applied} onClick={() => apply(job)} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60" style={{ background: applied ? "#9ca3af" : "#0071e3", color: "white" }}>{applied ? "Applied" : "Apply"}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AIRecommendations({ candidate }: { candidate: Candidate | null }) {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const candidateId = candidateKey(candidate);
    if (!candidateId) {
      setRecommendations([]);
      return;
    }
    setError("");
    recommendJobs(candidateId, 10)
      .then((result) => setRecommendations(result.recommendations || []))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load recommendations."));
  }, [candidate]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>AI Job Recommendations</h1>
      {error && <p className="text-sm" style={{ color: "#b91c1c" }}>{error}</p>}
      {recommendations.length === 0 ? <EmptyState icon={<Brain size={24} />} title="No recommendations" message="The ML service returned no MongoDB job recommendations." /> : recommendations.map((rec) => (
        <div key={rec.jobId} className="dashboard-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>{rec.title}</h3>
              <p className="text-sm mt-1" style={{ color: "#6c6c6c" }}>{rec.company} | {rec.location}</p>
              <p className="text-sm mt-3" style={{ color: "#0a0a0c" }}>{rec.reason}</p>
              {(rec.matchedSkills?.length || rec.missingSkills?.length) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(rec.matchedSkills || []).slice(0, 5).map((skill) => <span key={`matched-${rec.jobId}-${skill}`} className="px-2 py-1 rounded-full text-xs" style={{ background: "#e8f7ee", color: "#166534" }}>{skill}</span>)}
                  {(rec.missingSkills || []).slice(0, 5).map((skill) => <span key={`missing-${rec.jobId}-${skill}`} className="px-2 py-1 rounded-full text-xs" style={{ background: "#fff3cd", color: "#8a5a00" }}>{skill}</span>)}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: "#e8f0fe", color: "#0071e3" }}>{rec.matchScore}%</span>
              {rec.modelScore !== undefined && <p className="text-xs mt-2" style={{ color: "#6c6c6c" }}>Model {rec.modelScore}%</p>}
              {rec.profileScore !== undefined && <p className="text-xs" style={{ color: "#6c6c6c" }}>Profile {rec.profileScore}%</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MyApplications({ applications }: { applications: Application[] }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>My Applications</h1>
      {applications.length === 0 ? <EmptyState icon={<Briefcase size={24} />} title="No applications yet" message="Applications will appear after MongoDB stores them." /> : applications.map((app) => {
        const job = typeof app.jobId === "object" ? app.jobId : null;
        return (
          <div key={app._id || app.id} className="dashboard-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>{app.jobTitle || job?.title || "Job"}</h3>
                <p className="text-sm mt-1" style={{ color: "#6c6c6c" }}>{app.company || job?.company || "Company not listed"}</p>
                <p className="text-xs mt-2" style={{ color: "#6c6c6c" }}>Applied: {app.appliedDate || formatDate(app.appliedAt)}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#e8f0fe", color: "#0071e3" }}>{statusLabel(app.status)}</span>
                <p className="text-xs mt-2" style={{ color: "#6c6c6c" }}>ATS {app.atsScore || app.score || 0}%</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InterviewCenter({ interviews }: { interviews: Interview[] }) {
  const upcoming = interviews.filter((item) => item.status === "scheduled");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Interview Center</h1>
      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Upcoming Interviews</h3>
        {upcoming.length === 0 ? <p className="text-sm text-center py-8" style={{ color: "#6c6c6c" }}>No upcoming interviews scheduled.</p> : upcoming.map((item) => (
          <div key={item._id || item.id} className="flex items-center gap-4 p-4 rounded-xl mb-3" style={{ background: "#e8f0fe" }}>
            <Calendar size={20} style={{ color: "#0071e3" }} />
            <div className="flex-1">
              <h4 className="text-sm font-semibold" style={{ color: "#0a0a0c" }}>{item.jobTitle || "Interview"}</h4>
              <p className="text-xs" style={{ color: "#6c6c6c" }}>{item.date || formatDate(item.scheduledAt)} {item.time || ""}</p>
            </div>
            {item.meetingLink && <a href={item.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "#0071e3", color: "white" }}><ExternalLink size={12} /> Join</a>}
          </div>
        ))}
      </div>
      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Interview History</h3>
        {interviews.length === 0 ? <p className="text-sm" style={{ color: "#6c6c6c" }}>No interviews found in MongoDB.</p> : interviews.map((item) => (
          <div key={item._id || item.id} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid #f4f4f4" }}>
            <span className="text-sm font-medium" style={{ color: "#0a0a0c" }}>{item.jobTitle || "Interview"}</span>
            <span className="text-xs" style={{ color: "#6c6c6c" }}>{statusLabel(item.status)} | {item.feedback || "Feedback pending"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillGapAnalysis({ candidate }: { candidate: Candidate | null }) {
  const [gap, setGap] = useState<SkillGapResult | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const candidateId = candidateKey(candidate);
    if (!candidateId) {
      setGap(null);
      return;
    }
    setError("");
    apiRequest<SkillGapResult>(`/candidates/${encodeURIComponent(candidateId)}/skill-gap`)
      .then(setGap)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load skill gap analysis."));
  }, [candidate]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Skill Gap Analysis</h1>
      {error && <p className="text-sm" style={{ color: "#b91c1c" }}>{error}</p>}
      {!gap ? <EmptyState icon={<Target size={24} />} title="No skill gap data" message="The ML service did not return skill gap analysis." /> : (
        <>
          <p className="text-sm" style={{ color: "#6c6c6c" }}>Compared against {gap.targetJob?.title || "recommended job"}.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="dashboard-card">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}><CheckCircle size={18} style={{ color: "#3dc75a" }} /> Existing Skills</h3>
              {gap.matched.map((skill) => <p key={skill.skill} className="text-sm mb-2" style={{ color: "#0a0a0c" }}>{skill.skill} - {skill.level}%</p>)}
            </div>
            <div className="dashboard-card">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}><XCircle size={18} style={{ color: "#e74c3c" }} /> Missing Skills</h3>
              {gap.missing.map((skill) => <p key={skill.skill} className="text-sm mb-2" style={{ color: "#0a0a0c" }}>{skill.skill}: {skill.recommended}</p>)}
            </div>
          </div>
          <div className="dashboard-card">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}><BookOpen size={18} style={{ color: "#0071e3" }} /> Improvement Suggestions</h3>
            {gap.learningPath.map((item) => <p key={item.step} className="text-sm mb-2" style={{ color: "#0a0a0c" }}>{item.step}. {item.title} ({item.duration})</p>)}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="dashboard-card">
              <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Resume Improvements</h3>
              {(gap.resumeImprovements || []).map((item) => <p key={item} className="text-sm mb-2" style={{ color: "#0a0a0c" }}>{item}</p>)}
            </div>
            <div className="dashboard-card">
              <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Interview Prep</h3>
              {(gap.interviewPreparationTips || []).map((item) => <p key={item} className="text-sm mb-2" style={{ color: "#0a0a0c" }}>{item}</p>)}
            </div>
            <div className="dashboard-card">
              <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Certifications</h3>
              {(gap.suggestedCertifications || []).map((item) => <p key={item} className="text-sm mb-2" style={{ color: "#0a0a0c" }}>{item}</p>)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Messages({ candidate }: { candidate: Candidate | null }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [recipientType, setRecipientType] = useState<"recruiter" | "admin">("recruiter");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [showChooser, setShowChooser] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const currentUserId = user?.id || "";

  useEffect(() => {
    if (!showChooser) return;
    const params = new URLSearchParams({ role: recipientType });
    if (search.trim()) params.set("search", search.trim());
    apiRequest<{ users: Recipient[] }>(`/messages/users?${params.toString()}`)
      .then((result) => setRecipients(result.users))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load recipients."));
  }, [recipientType, search, showChooser]);

  const startChat = async (recipient: Recipient) => {
    const id = recipientKey(recipient);
    if (!id) return;
    setSelectedRecipient(recipient);
    setShowChooser(false);
    setError("");
    try {
      const history = await apiRequest<{ messages: Message[] }>(`/messages/conversations/${id}`);
      setMessages(history.messages);
      await apiRequest(`/messages/conversations/${id}/read`, { method: "PATCH" });
    } catch (caught) {
      setMessages([]);
      setError(caught instanceof Error ? caught.message : "Unable to load conversation.");
    }
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const recipientId = recipientKey(selectedRecipient);
    if (!reply.trim() || !recipientId || !currentUserId) return;
    try {
      const result = await apiRequest<{ message: Message }>("/messages", {
        method: "POST",
        body: JSON.stringify({
          senderId: currentUserId,
          senderName: user?.name || candidate?.name || "Candidate",
          senderRole: user?.role || "candidate",
          recipientId,
          content: reply,
          read: false,
        }),
      });
      setMessages((items) => [...items, result.message]);
      setReply("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send message.");
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Messages</h1>
        <button onClick={() => setShowChooser(true)} className="h-11 w-11 rounded-full flex items-center justify-center shadow-sm" style={{ background: "#0a0a0c", color: "#f2f0e6" }} title="Start conversation">
          <Plus size={20} />
        </button>
      </div>
      {showChooser && (
        <div className="dashboard-card space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["recruiter", "admin"] as const).map((role) => (
              <button key={role} onClick={() => setRecipientType(role)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: recipientType === role ? "#0a0a0c" : "#f4f4f4", color: recipientType === role ? "#f2f0e6" : "#0a0a0c" }}>{role === "recruiter" ? "Recruiters" : "Admin"}</button>
            ))}
          </div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          <div className="grid md:grid-cols-2 gap-3">
            {recipients.map((recipient) => (
              <div key={recipientKey(recipient)} className="p-4 rounded-lg flex items-center gap-3" style={{ border: "1px solid #e5e5e5", background: "white" }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "#e8f0fe", color: "#0071e3" }}>
                  {recipient.avatar ? <img src={recipient.avatar} alt={recipient.name || "Recipient"} className="w-full h-full object-cover" /> : (recipient.name || recipient.email || "U").slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#0a0a0c" }}>{recipient.name || recipient.email}</p>
                  <p className="text-xs truncate" style={{ color: "#6c6c6c" }}>{recipient.companyName || recipient.company || recipient.role}</p>
                </div>
                <button onClick={() => startChat(recipient)} className="px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "#0071e3", color: "white" }}>Start Chat</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="dashboard-card" style={{ minHeight: 400 }}>
        {selectedRecipient && <p className="text-sm font-medium mb-4" style={{ color: "#0a0a0c" }}>Chat with {selectedRecipient.name || selectedRecipient.email}</p>}
        <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
          {messages.length === 0 ? <p className="text-sm text-center py-8" style={{ color: "#6c6c6c" }}>No conversation selected from MongoDB yet.</p> : messages.map((msg) => {
            const mine = msg.senderId === currentUserId;
            return (
              <div key={msg._id || msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-xl" style={{ background: mine ? "#0071e3" : "#f4f4f4", color: mine ? "white" : "#0a0a0c" }}>
                  <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            );
          })}
        </div>
        {error && <p className="text-sm mb-3" style={{ color: "#b91c1c" }}>{error}</p>}
        <form onSubmit={handleSend} className="flex gap-2 pt-4" style={{ borderTop: "1px solid #e5e5e5" }}>
          <input value={reply} onChange={(e) => setReply(e.target.value)} disabled={!selectedRecipient} placeholder={selectedRecipient ? "Type your message" : "Choose a recipient first"} className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none disabled:opacity-60" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          <button type="submit" disabled={!selectedRecipient} className="px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60" style={{ background: "#0a0a0c", color: "#f2f0e6" }}><Send size={16} /></button>
        </form>
      </div>
    </div>
  );
}

function NotificationsPage({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Notifications</h1>
      {notifications.length === 0 ? <EmptyState icon={<Bell size={24} />} title="No notifications" message="MongoDB has no notifications for this candidate." /> : notifications.map((item) => (
        <div key={item._id || item.id} className="dashboard-card flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.type === "interview_invite" ? "#e8f0fe" : "#d4edda" }}>
            {item.type === "interview_invite" ? <Calendar size={18} style={{ color: "#0071e3" }} /> : <Briefcase size={18} style={{ color: "#3dc75a" }} />}
          </div>
          <div>
            <h4 className="text-sm font-semibold" style={{ color: "#0a0a0c" }}>{item.title}</h4>
            <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>{item.message}</p>
            <p className="text-xs mt-1" style={{ color: "#0071e3" }}>{item.timestamp || formatDate(item.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsPage({ candidate, refresh }: { candidate: Candidate | null; refresh: () => Promise<void> }) {
  const [form, setForm] = useState<Candidate>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => setForm(candidate || {}), [candidate]);

  const update = (field: keyof Candidate, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const save = async () => {
    if (!candidateKey(candidate)) return;
    setMessage("");
    setError("");
    try {
      await apiRequest(`/candidates/${candidateKey(candidate)}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          skills: typeof form.skills === "string" ? String(form.skills).split(",").map((item) => item.trim()).filter(Boolean) : form.skills,
        }),
      });
      setMessage("Profile saved to MongoDB.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save profile.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Profile Settings</h1>
      <div className="dashboard-card space-y-4">
        <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            ["name", "Full Name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["location", "Location"],
            ["college", "College/University"],
            ["degree", "Degree"],
            ["specialization", "Specialization"],
            ["avatar", "Profile Photo URL"],
            ["linkedin", "LinkedIn"],
            ["github", "GitHub"],
            ["experienceLevel", "Experience Level"],
          ].map(([field, label]) => (
            <label key={field} className="block text-xs font-medium" style={{ color: "#6c6c6c" }}>
              {label}
              <input value={String(form[field as keyof Candidate] || "")} onChange={(e) => update(field as keyof Candidate, e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5", color: "#0a0a0c" }} />
            </label>
          ))}
          <label className="block text-xs font-medium md:col-span-2" style={{ color: "#6c6c6c" }}>
            Skills
            <input value={(form.skills || []).join(", ")} onChange={(e) => setForm((current) => ({ ...current, skills: e.target.value.split(",").map((item) => item.trim()) }))} className="mt-1 w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5", color: "#0a0a0c" }} />
          </label>
        </div>
        {message && <p className="text-sm" style={{ color: "#15803d" }}>{message}</p>}
        {error && <p className="text-sm" style={{ color: "#b91c1c" }}>{error}</p>}
        <button onClick={save} className="px-6 py-2 rounded-lg text-sm font-medium" style={{ background: "#0a0a0c", color: "#f2f0e6" }}>Save Changes</button>
      </div>
    </div>
  );
}

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadError, setLoadError] = useState("");

  const refresh = useCallback(async () => {
    setLoadError("");
    try {
      const current = await apiRequest<Candidate>("/candidates/me/profile");
      setCandidate(current);
      const id = candidateKey(current);
      if (!id) {
        setApplications([]);
        setInterviews([]);
        setNotifications([]);
        return;
      }

      const userId = current.userId || user?.id || id;
      const [apps, ints, notifs] = await Promise.all([
        apiRequest<Application[]>(`/applications?candidateId=${encodeURIComponent(id)}`),
        apiRequest<Interview[]>(`/interviews?candidateId=${encodeURIComponent(id)}`),
        apiRequest<Notification[]>(`/notifications?userId=${encodeURIComponent(userId)}`),
      ]);
      setApplications(apps);
      setInterviews(ints);
      setNotifications(notifs);
    } catch (caught) {
      setLoadError(caught instanceof Error ? caught.message : "Unable to load candidate dashboard data.");
    }
  }, [user]);

  useEffect(() => {
    if (user?.id || user?.email) {
      void refresh();
    }
  }, [refresh, user?.id, user?.email]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome candidate={candidate} applications={applications} interviews={interviews} notifications={notifications} setActiveTab={setActiveTab} />;
      case "resume":
        return <ResumeAnalyzer candidate={candidate} refresh={refresh} />;
      case "jobs":
        return <JobSearch candidate={candidate} applications={applications} refresh={refresh} />;
      case "recommendations":
        return <AIRecommendations candidate={candidate} />;
      case "applications":
        return <MyApplications applications={applications} />;
      case "interviews":
        return <InterviewCenter interviews={interviews} />;
      case "skillgap":
        return <SkillGapAnalysis candidate={candidate} />;
      case "messages":
        return <Messages candidate={candidate} />;
      case "notifications":
        return <NotificationsPage notifications={notifications} />;
      case "settings":
        return <SettingsPage candidate={candidate} refresh={refresh} />;
      default:
        return <DashboardHome candidate={candidate} applications={applications} interviews={interviews} notifications={notifications} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f4f4f4" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="flex items-center justify-between px-6 h-16 sticky top-0 z-30" style={{ background: "white", borderBottom: "1px solid #e5e5e5" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
              <Menu size={20} style={{ color: "#0a0a0c" }} />
            </button>
            <h2 className="text-sm font-medium hidden lg:block" style={{ color: "#6c6c6c" }}>Candidate Panel</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab("notifications")} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={18} style={{ color: "#6c6c6c" }} />
              {notifications.some((item) => item.status !== "read") && <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#e74c3c" }} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#0a0a0c", color: "#d4af37" }}>{(candidate?.name || user?.name || "C").slice(0, 1)}</div>
              <span className="text-sm font-medium hidden md:block" style={{ color: "#0a0a0c" }}>{candidate?.name || user?.name || "Candidate"}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {loadError && <div className="dashboard-card mb-6 text-sm" style={{ color: "#b91c1c" }}>{loadError}</div>}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}


