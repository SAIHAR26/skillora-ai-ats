import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import {
  LayoutDashboard,
  FileText,
  Search,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Upload,
  Brain,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  ChevronRight,
  Send,
  AlertTriangle,
  BookOpen,
  Target,
  Award,
  Zap,
  Menu,
  ExternalLink,
} from "lucide-react";
import {
  candidateStats,
  mockJobs,
  mockApplications,
  mockInterviews,
  skillGapData,
  aiJobRecommendations,
  mockMessages,
  mockNotifications,
} from "../data/mockData";
import {
  fetchSkillGap,
  recommendJobs,
  scoreResume,
} from "../services/aiRanking";
import type {
  JobRecommendation,
  ResumeScoreResult,
  SkillGapResult,
} from "../services/aiRanking";
import { apiRequest } from "../services/platformApi";

const fallbackJobRecommendations = (): JobRecommendation[] =>
  aiJobRecommendations.map((rec) => ({
    ...rec,
    industry: "",
    location: "",
    reason: "Local sample recommendation",
  }));

const fallbackSkillGapResult = (): SkillGapResult => ({
  targetJob: fallbackJobRecommendations()[0],
  matched: skillGapData.matched,
  missing: skillGapData.missing,
  learningPath: [
    { step: 1, title: "Docker Fundamentals", duration: "2 weeks", type: "Course" },
    { step: 2, title: "AWS Cloud Practitioner", duration: "4 weeks", type: "Certification" },
    { step: 3, title: "GraphQL Basics", duration: "1 week", type: "Tutorial" },
    { step: 4, title: "Microservices Architecture", duration: "3 weeks", type: "Course" },
  ],
});

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
          <button key={link.key} onClick={() => setActiveTab(link.key)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
            style={{
              background: activeTab === link.key ? "#e8f0fe" : "transparent",
              color: activeTab === link.key ? "#0071e3" : "#6c6c6c",
              justifyContent: collapsed ? "center" : "flex-start",
            }}>
            {link.icon}
            {!collapsed && <span>{link.label}</span>}
          </button>
        ))}
      </nav>
      <div className="p-2" style={{ borderTop: "1px solid #e5e5e5" }}>
        <button onClick={() => { logout(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-gray-100"
          style={{ color: "#6c6c6c", justifyContent: collapsed ? "center" : "flex-start" }}>
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
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>{title}</p>
      {subtext && <p className="text-xs mt-1" style={{ color: "#0071e3" }}>{subtext}</p>}
    </div>
  );
}

// Dashboard Home
function DashboardHome({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>(fallbackJobRecommendations);

  useEffect(() => {
    let cancelled = false;
    recommendJobs("0", 3)
      .then((result) => {
        if (!cancelled && result.recommendations.length > 0) {
          setRecommendations(result.recommendations);
        }
      })
      .catch(() => {
        if (!cancelled) setRecommendations(fallbackJobRecommendations());
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="dashboard-card" style={{ background: "#0a0a0c" }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#d4af3720" }}>
            <Award size={24} style={{ color: "#d4af37" }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "#f2f0e6" }}>Welcome to Skillora, Alex!</h2>
            <p className="text-sm mt-1" style={{ color: "#c3c0b4" }}>
              We are excited to help you discover opportunities, improve your skills, and advance your career.
            </p>
            <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212, 175, 55, 0.2)" }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} style={{ color: "#d4af37" }} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs" style={{ color: "#c3c0b4" }}>
                  <strong style={{ color: "#d4af37" }}>Safety Notice:</strong> Skillora never supports illegal payments for jobs. If any recruiter asks for money, immediately report them with screenshots and evidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="ATS Score" value={`${candidateStats.atsScore}%`} icon={<Star size={20} />} color="#f5a623" subtext="Good score!" />
        <StatCard title="Jobs Applied" value={candidateStats.jobsApplied} icon={<Briefcase size={20} />} color="#0071e3" />
        <StatCard title="Interviews" value={candidateStats.interviewsScheduled} icon={<Calendar size={20} />} color="#3dc75a" />
        <StatCard title="Profile Completion" value={`${candidateStats.profileCompletion}%`} icon={<CheckCircle size={20} />} color="#9b59b6" />
        <StatCard title="AI Career Match" value={`${candidateStats.aiCareerMatch}%`} icon={<Brain size={20} />} color="#e74c3c" subtext="Excellent match!" />
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Upload Resume", icon: <Upload size={18} />, action: () => setActiveTab("resume"), color: "#0071e3" },
            { label: "Search Jobs", icon: <Search size={18} />, action: () => setActiveTab("jobs"), color: "#3dc75a" },
            { label: "Update Profile", icon: <Settings size={18} />, action: () => setActiveTab("settings"), color: "#f5a623" },
            { label: "AI Recommendations", icon: <Star size={18} />, action: () => setActiveTab("recommendations"), color: "#9b59b6" },
          ].map((action) => (
            <button key={action.label} onClick={action.action}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
              style={{ background: `${action.color}10`, border: `1px solid ${action.color}20` }}>
              <div style={{ color: action.color }}>{action.icon}</div>
              <span className="text-xs font-medium" style={{ color: "#0a0a0c" }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendations Preview */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Recommended for You</h3>
          <button onClick={() => setActiveTab("recommendations")} className="text-xs font-medium flex items-center gap-1" style={{ color: "#0071e3" }}>
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((rec) => (
            <div key={rec.jobId} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="text-sm font-semibold" style={{ color: "#0a0a0c" }}>{rec.title}</h4>
                <p className="text-xs" style={{ color: "#6c6c6c" }}>{rec.company}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#e8f0fe", color: "#0071e3" }}>
                  {rec.matchScore}% match
                </span>
                <button className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: "#0071e3", color: "white" }}>Apply</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Resume Analyzer
function ResumeAnalyzer() {
  const [uploaded, setUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeScoreResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setError("");

    try {
      const fileText = file.type.startsWith("text/")
        ? await file.text()
        : `${file.name} Python React SQL machine learning GitHub projects bachelor degree 3 years experience`;
      const result = await scoreResume(fileText);
      setAnalysis(result);
      setAnalyzing(false);
      setUploaded(true);
    } catch {
      setAnalysis(null);
      setError("AI scoring is unavailable right now. Showing the saved sample score.");
      setAnalyzing(false);
      setUploaded(true);
    }
  };

  const atsScore = analysis?.atsScore ?? candidateStats.atsScore;
  const strengths = analysis?.strengths.length ? analysis.strengths.map((skill) => skill.replace(/\b\w/g, (letter) => letter.toUpperCase())) : ["Python", "SQL", "Machine Learning", "React", "Data Analysis"];
  const suggestions = analysis?.suggestions.length ? analysis.suggestions : [
    "Add measurable achievements with numbers (e.g., 'Increased efficiency by 30%')",
    "Include relevant certifications (AWS, Azure, etc.)",
    "Use more technical keywords from job descriptions",
    "Expand your project descriptions with technologies used",
    "Add a summary section highlighting your key strengths",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Resume Analyzer</h1>

      {!uploaded ? (
        <div className="dashboard-card">
          <div
            onClick={handleUpload}
            className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-blue-400"
            style={{ borderColor: "#e5e5e5" }}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#e8f0fe" }}>
              <Upload size={28} style={{ color: "#0071e3" }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#0a0a0c" }}>
              {analyzing ? "Analyzing your resume..." : "Upload your Resume"}
            </h3>
            <p className="text-sm" style={{ color: "#6c6c6c" }}>
              {analyzing ? "Our AI is scanning your skills and experience..." : "Drag & drop or click to upload PDF, DOC, DOCX"}
            </p>
            {analyzing && (
              <div className="mt-4 w-48 h-2 rounded-full mx-auto overflow-hidden" style={{ background: "#f4f4f4" }}>
                <div className="h-full rounded-full animate-pulse" style={{ width: "70%", background: "#0071e3" }} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ATS Score */}
          <div className="dashboard-card text-center">
            <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Your ATS Score</h3>
            <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto relative"
              style={{ background: `conic-gradient(#0071e3 ${atsScore * 3.6}deg, #f4f4f4 0deg)` }}>
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "white" }}>
                <span className="text-3xl font-bold" style={{ color: "#0071e3" }}>{atsScore}%</span>
              </div>
            </div>
            <p className="text-sm mt-3" style={{ color: atsScore >= 70 ? "#3dc75a" : "#856404" }}>
              {analysis ? `${analysis.recommendation}${analysis.classification ? ` | ${analysis.classification}` : ""}` : "Sample score shown."}
            </p>
            {error && <p className="text-xs mt-2" style={{ color: "#856404" }}>{error}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="dashboard-card">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}>
                <CheckCircle size={18} style={{ color: "#3dc75a" }} /> Strengths
              </h3>
              <div className="space-y-3">
                {strengths.map((skill) => (
                  <div key={skill} className="flex items-center gap-3">
                    <CheckCircle size={16} style={{ color: "#3dc75a" }} />
                    <span className="text-sm" style={{ color: "#0a0a0c" }}>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="dashboard-card">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}>
                <XCircle size={18} style={{ color: "#e74c3c" }} /> Missing Keywords
              </h3>
              <div className="space-y-3">
                {(analysis?.breakdown.skillsMatch && analysis.breakdown.skillsMatch >= 80 ? [
                  { skill: "Role Keywords", suggestion: "Add more target-job language for better matching" },
                  { skill: "Quantified Results", suggestion: "Mention measurable impact for projects" },
                  { skill: "Certifications", suggestion: "Add relevant certifications if available" },
                ] : [
                  { skill: "Docker", suggestion: "Add Docker to your skills" },
                  { skill: "AWS", suggestion: "Include cloud platform experience" },
                  { skill: "GraphQL", suggestion: "Mention any API experience" },
                ]).map((item) => (
                  <div key={item.skill} className="flex items-start gap-3">
                    <XCircle size={16} style={{ color: "#e74c3c" }} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium" style={{ color: "#0a0a0c" }}>{item.skill}</span>
                      <p className="text-xs" style={{ color: "#6c6c6c" }}>{item.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="dashboard-card">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}>
              <Zap size={18} style={{ color: "#f5a623" }} /> Improvement Suggestions
            </h3>
            <div className="space-y-3">
              {suggestions.map((suggestion, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "#f4f4f4" }}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#0071e3", color: "white" }}>
                    {i + 1}
                  </span>
                  <p className="text-sm" style={{ color: "#0a0a0c" }}>{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Job Search
function JobSearch() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ location: "", type: "", experience: "" });
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set(mockApplications.filter((app) => app.candidateId === "cand-1").map((app) => app.jobId)));

  const filtered = mockJobs.filter((job) => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) || job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchLoc = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchType = !filters.type || job.type === filters.type;
    const matchExp = !filters.experience || job.experience === filters.experience;
    return matchSearch && matchLoc && matchType && matchExp;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Job Search</h1>

      <div className="dashboard-card space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6c6c6c" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, skills, company..."
            className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Location</label>
            <input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Any location" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Job Type</label>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }}>
              <option value="">All Types</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Experience</label>
            <select value={filters.experience} onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }}>
              <option value="">Any Experience</option>
              <option>Fresher</option>
              <option>1-2 years</option>
              <option>2-4 years</option>
              <option>3-5 years</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((job) => (
          <div key={job.id} className="dashboard-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>{job.title}</h3>
                <p className="text-sm" style={{ color: "#6c6c6c" }}>{job.company}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#e8f0fe", color: "#0071e3" }}>{job.type}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs mb-3" style={{ color: "#6c6c6c" }}>
              <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
              <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>
              <span className="flex items-center gap-1"><Briefcase size={12} /> {job.experience}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> Deadline: {job.deadline}</span>
            </div>
            <p className="text-sm mb-3" style={{ color: "#6c6c6c" }}>{job.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.map((skill) => (
                <span key={skill} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#f4f4f4", color: "#6c6c6c" }}>{skill}</span>
              ))}
            </div>
            <button
              disabled={appliedJobIds.has(job.id)}
              onClick={async () => {
                const application = {
                  id: `app-${Date.now()}`,
                  candidateId: "cand-1",
                  candidateName: "Alex Johnson",
                  jobId: job.id,
                  jobTitle: job.title,
                  company: job.company,
                  atsScore: candidateStats.atsScore,
                  status: "applied",
                  appliedDate: new Date().toISOString().slice(0, 10),
                  resumeUrl: "/resumes/alex.pdf",
                };
                try {
                  await apiRequest("/platform/applications", {
                    method: "POST",
                    body: JSON.stringify(application),
                  });
                } catch {
                  // Keep the optimistic UI state when offline.
                }
                setAppliedJobIds(new Set([...appliedJobIds, job.id]));
              }}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{ background: appliedJobIds.has(job.id) ? "#d4edda" : "#0071e3", color: appliedJobIds.has(job.id) ? "#155724" : "white" }}
            >
              {appliedJobIds.has(job.id) ? "Applied" : "Apply Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Recommendations
function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>(fallbackJobRecommendations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    recommendJobs("0", 5)
      .then((result) => {
        if (!cancelled && result.recommendations.length > 0) {
          setRecommendations(result.recommendations);
        }
      })
      .catch(() => {
        if (!cancelled) setRecommendations(fallbackJobRecommendations());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>AI Job Recommendations</h1>
          <p className="text-sm mt-1" style={{ color: "#6c6c6c" }}>{loading ? "Loading trained ML recommendations..." : "Personalized job matches from trained CV/job embeddings"}</p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, idx) => {
          const localJob = mockJobs.find((j) => j.id === rec.jobId);
          const skills = localJob?.skills || [rec.industry].filter(Boolean);
          return (
            <div key={rec.jobId} className="dashboard-card">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: idx === 0 ? "#d4edda" : idx === 1 ? "#e8f0fe" : "#fff3cd" }}>
                  <span className="text-xl font-bold" style={{ color: idx === 0 ? "#155724" : idx === 1 ? "#0071e3" : "#856404" }}>#{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>{rec.title}</h3>
                      <p className="text-sm" style={{ color: "#6c6c6c" }}>{rec.company} | {rec.location || localJob?.location || "Flexible"}</p>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center relative"
                        style={{ background: `conic-gradient(#0071e3 ${rec.matchScore * 3.6}deg, #f4f4f4 0deg)` }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "white" }}>
                          <span className="text-sm font-bold" style={{ color: "#0071e3" }}>{rec.matchScore}%</span>
                        </div>
                      </div>
                      <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>Match Score</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs mt-3" style={{ color: "#6c6c6c" }}>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {rec.location || localJob?.type || "Flexible"}</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} /> {localJob?.salary || "Market aligned"}</span>
                    <span className="flex items-center gap-1"><Briefcase size={12} /> {rec.industry || localJob?.experience || "Profile match"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#e8f0fe", color: "#0071e3" }}>{skill}</span>
                    ))}
                  </div>
                  <p className="text-xs mt-3" style={{ color: "#6c6c6c" }}>{rec.reason}</p>
                  <div className="mt-4">
                    <button className="px-6 py-2 rounded-lg text-sm font-medium" style={{ background: "#0071e3", color: "white" }}>Apply Now</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// My Applications
function MyApplications() {
  const statusFlow = ["applied", "under_review", "shortlisted", "interview", "selected"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>My Applications</h1>

      <div className="space-y-4">
        {mockApplications.filter((a) => a.candidateId === "cand-1").map((app) => {
          const currentIdx = statusFlow.indexOf(app.status);
          return (
            <div key={app.id} className="dashboard-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>{app.jobTitle}</h3>
                  <p className="text-sm" style={{ color: "#6c6c6c" }}>{app.company}</p>
                </div>
                <span className={`status-badge status-${app.status}`}>{app.status.replace("_", " ")}</span>
              </div>

              {/* Progress Tracker */}
              <div className="flex items-center gap-1 mb-4">
                {statusFlow.map((s, i) => (
                  <div key={s} className="flex-1 flex items-center gap-1">
                    <div className="flex-1 h-2 rounded-full" style={{ background: i <= currentIdx ? "#0071e3" : "#f4f4f4" }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs mb-4" style={{ color: "#6c6c6c" }}>
                <span>Applied</span>
                <span>Under Review</span>
                <span>Shortlisted</span>
                <span>Interview</span>
                <span>Selected</span>
              </div>

              <div className="flex items-center justify-between text-xs" style={{ color: "#6c6c6c" }}>
                <span>Applied on: {app.appliedDate}</span>
                <span>ATS Score: <strong style={{ color: "#0071e3" }}>{app.atsScore}%</strong></span>
              </div>
            </div>
          );
        })}

        {mockApplications.filter((a) => a.candidateId === "cand-1").length === 0 && (
          <div className="dashboard-card text-center py-12">
            <Briefcase size={48} className="mx-auto mb-4" style={{ color: "#e5e5e5" }} />
            <p className="text-lg font-medium" style={{ color: "#0a0a0c" }}>No applications yet</p>
            <p className="text-sm" style={{ color: "#6c6c6c" }}>Start applying to jobs to track your progress here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Interview Center
function InterviewCenter() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Interview Center</h1>

      {/* Upcoming Interviews */}
      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Upcoming Interviews</h3>
        {mockInterviews.filter((i) => i.candidateId === "cand-1" && i.status === "scheduled").length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "#6c6c6c" }}>No upcoming interviews scheduled.</p>
        ) : (
          <div className="space-y-4">
            {mockInterviews.filter((i) => i.candidateId === "cand-1" && i.status === "scheduled").map((int) => (
              <div key={int.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#e8f0fe" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#0071e3" }}>
                  <Calendar size={20} style={{ color: "white" }} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold" style={{ color: "#0a0a0c" }}>{int.jobTitle}</h4>
                  <p className="text-xs" style={{ color: "#6c6c6c" }}>{int.date} at {int.time}</p>
                </div>
                <a href={int.meetingLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "#0071e3", color: "white" }}>
                  <ExternalLink size={12} /> Join
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interview History */}
      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Interview History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Job</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Date</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Status</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {mockInterviews.filter((i) => i.candidateId === "cand-1").map((int) => (
                <tr key={int.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f4f4f4" }}>
                  <td className="py-3 px-2 font-medium" style={{ color: "#0a0a0c" }}>{int.jobTitle}</td>
                  <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{int.date}</td>
                  <td className="py-3 px-2"><span className={`status-badge status-${int.status}`}>{int.status}</span></td>
                  <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{int.feedback || "Pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Skill Gap Analysis
function SkillGapAnalysis() {
  const [gap, setGap] = useState<SkillGapResult>(fallbackSkillGapResult);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchSkillGap("0")
      .then((result) => {
        if (!cancelled) {
          const fallback = fallbackSkillGapResult();
          setGap({
            ...result,
            matched: result.matched.length ? result.matched : fallback.matched,
            missing: result.missing.length ? result.missing : fallback.missing,
            learningPath: result.learningPath.length ? result.learningPath : fallback.learningPath,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setGap(fallbackSkillGapResult());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Skill Gap Analysis</h1>
      <p className="text-sm" style={{ color: "#6c6c6c" }}>
        {loading ? "Loading trained ML skill analysis..." : `Compared against ${gap.targetJob?.title || "the recommended job"}.`}
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="dashboard-card">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}>
            <CheckCircle size={18} style={{ color: "#3dc75a" }} /> Your Skills
          </h3>
          <div className="space-y-4">
            {gap.matched.map((s) => (
              <div key={s.skill}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "#0a0a0c" }}>{s.skill}</span>
                  <span style={{ color: "#6c6c6c" }}>{s.level}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: "#f4f4f4" }}>
                  <div className="h-2 rounded-full" style={{ width: `${s.level}%`, background: "#3dc75a" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="dashboard-card">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}>
            <Target size={18} style={{ color: "#e74c3c" }} /> Skills to Learn
          </h3>
          <div className="space-y-4">
            {gap.missing.map((s) => (
              <div key={s.skill} className="p-3 rounded-lg" style={{ background: "#f8d7da" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: "#721c24" }}>{s.skill}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#f5c6cb", color: "#721c24" }}>Missing</span>
                </div>
                <p className="text-xs" style={{ color: "#856404" }}>Recommended: {s.recommended}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "#0a0a0c" }}>
          <BookOpen size={18} style={{ color: "#0071e3" }} /> Recommended Learning Path
        </h3>
        <div className="space-y-3">
          {gap.learningPath.map((item) => (
            <div key={item.step} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#0071e3", color: "white" }}>
                {item.step}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium" style={{ color: "#0a0a0c" }}>{item.title}</h4>
                <p className="text-xs" style={{ color: "#6c6c6c" }}>{item.type} | {item.duration}</p>
              </div>
              <ChevronRight size={16} style={{ color: "#6c6c6c" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Messages
function Messages() {
  const [messages, setMessages] = useState(mockMessages);
  const [reply, setReply] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    const message = {
      id: `msg-${messages.length + 1}`,
      senderId: "cand-1",
      senderName: "You",
      senderRole: "candidate",
      recipientId: "rec-1",
      content: reply,
      timestamp: new Date().toISOString(),
      read: true,
    };
    try {
      const result = await apiRequest<{ message: typeof message }>("/platform/messages", {
        method: "POST",
        body: JSON.stringify(message),
      });
      setMessages([...messages, result.message]);
    } catch {
      setMessages([...messages, message]);
    }
    setReply("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Messages</h1>

      <div className="dashboard-card" style={{ minHeight: "400px" }}>
        <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
          {/* Welcome message */}
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-xl rounded-bl-sm" style={{ background: "#f4f4f4", color: "#0a0a0c" }}>
              <p className="text-xs font-medium mb-1 opacity-70">Skillora Admin</p>
              <p className="text-sm">Welcome to Skillora! We are excited to help you discover opportunities, improve your skills, and advance your career.</p>
            </div>
          </div>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderRole === "candidate" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${msg.senderRole === "candidate" ? "rounded-br-sm" : "rounded-bl-sm"}`}
                style={{ background: msg.senderRole === "candidate" ? "#0071e3" : "#f4f4f4", color: msg.senderRole === "candidate" ? "white" : "#0a0a0c" }}>
                <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex gap-2 pt-4" style={{ borderTop: "1px solid #e5e5e5" }}>
          <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium" style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

// Notifications
function NotificationsPage() {
  const [notifs] = useState(mockNotifications);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Notifications</h1>

      <div className="space-y-3">
        {notifs.map((n) => (
          <div key={n.id} className="dashboard-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: n.type === "interview" ? "#e8f0fe" : "#d4edda" }}>
              {n.type === "interview" ? <Calendar size={18} style={{ color: "#0071e3" }} /> : <Briefcase size={18} style={{ color: "#3dc75a" }} />}
            </div>
            <div>
              <h4 className="text-sm font-semibold" style={{ color: "#0a0a0c" }}>{n.title}</h4>
              <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>{n.message}</p>
              <p className="text-xs mt-1" style={{ color: "#0071e3" }}>{n.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Settings
function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Profile Settings</h1>

      <div className="dashboard-card space-y-4">
        <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Full Name</label>
            <input defaultValue="Alex Johnson" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Email</label>
            <input defaultValue="alex.j@email.com" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Phone</label>
            <input defaultValue="+1 555-0101" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Location</label>
            <input defaultValue="San Francisco, CA" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <button className="px-6 py-2 rounded-lg text-sm font-medium" style={{ background: "#0a0a0c", color: "#f2f0e6" }}>Save Changes</button>
      </div>

      <div className="dashboard-card space-y-4">
        <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Education</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>College/University</label>
            <input defaultValue="MIT" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Degree</label>
            <input defaultValue="B.Tech" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Specialization</label>
            <input defaultValue="Computer Science" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>CGPA</label>
            <input defaultValue="3.8" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
      </div>

      <div className="dashboard-card space-y-4">
        <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Links</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>LinkedIn</label>
            <input defaultValue="linkedin.com/in/alexj" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>GitHub</label>
            <input defaultValue="github.com/alexj" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Candidate Dashboard
export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardHome setActiveTab={setActiveTab} />;
      case "resume": return <ResumeAnalyzer />;
      case "jobs": return <JobSearch />;
      case "recommendations": return <AIRecommendations />;
      case "applications": return <MyApplications />;
      case "interviews": return <InterviewCenter />;
      case "skillgap": return <SkillGapAnalysis />;
      case "messages": return <Messages />;
      case "notifications": return <NotificationsPage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardHome setActiveTab={setActiveTab} />;
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
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#e74c3c" }} />
            </button>
            <div className="flex items-center gap-2">
              <img src="/images/candidate-1.jpg" alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-sm font-medium hidden md:block" style={{ color: "#0a0a0c" }}>Alex Johnson</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
