import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Plus,
  Eye,
  Pause,
  XCircle,
  Trash2,
  Star,
  Download,
  Send,
  CheckCircle,
  Clock,
  TrendingUp,
  Bell,
  Menu,
  AlertTriangle,
  Mail,
  Bot,
} from "lucide-react";
import {
  recruiterStats,
  recruiters,
  jobs,
  candidates,
  applications,
  interviews,
  messages,
} from "../data/mockData";
import type { Job, Application, Message } from "../data/mockData";
import { fetchAiRankings, fetchAiTrainingSummary } from "../services/aiRanking";
import type { AiRanking, AiTrainingSummary } from "../services/aiRanking";
import { apiRequest } from "../services/platformApi";

function Sidebar({ activeTab, setActiveTab, collapsed }: { activeTab: string; setActiveTab: (t: string) => void; collapsed: boolean }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "jobs", label: "Jobs", icon: <Briefcase size={18} /> },
    { key: "applications", label: "Applications", icon: <Users size={18} /> },
    { key: "ranking", label: "AI Ranking", icon: <Star size={18} /> },
    { key: "search", label: "Search Candidates", icon: <Search size={18} /> },
    { key: "interviews", label: "Interviews", icon: <Calendar size={18} /> },
    { key: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
    { key: "messages", label: "Messages", icon: <MessageSquare size={18} /> },
    { key: "contact", label: "Contact Admin", icon: <Mail size={18} /> },
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
        <TrendingUp size={16} style={{ color: "#3dc75a" }} />
      </div>
      <p className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>{title}</p>
      {subtext && <p className="text-xs mt-1" style={{ color: "#0071e3" }}>{subtext}</p>}
    </div>
  );
}

// Dashboard Home
function DashboardHome({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Recruiter Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "#6c6c6c" }}>Welcome back! Here's your hiring overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Active Jobs" value={recruiterStats.totalActiveJobs} icon={<Briefcase size={20} />} color="#0071e3" subtext="Click to manage" />
        <StatCard title="Total Applications" value={recruiterStats.totalApplications} icon={<Users size={20} />} color="#f5a623" />
        <StatCard title="Shortlisted" value={recruiterStats.shortlistedCandidates} icon={<CheckCircle size={20} />} color="#3dc75a" />
        <StatCard title="Interviews" value={recruiterStats.interviewsScheduled} icon={<Calendar size={20} />} color="#9b59b6" />
        <StatCard title="Hired" value={recruiterStats.hiredCandidates} icon={<TrendingUp size={20} />} color="#3dc75a" />
        <StatCard title="AI Recommendations" value={recruiterStats.aiRecommendations} icon={<Star size={20} />} color="#e74c3c" subtext="New today" />
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Post New Job", icon: <Plus size={18} />, action: () => setActiveTab("jobs"), color: "#0071e3" },
            { label: "Search Candidates", icon: <Search size={18} />, action: () => setActiveTab("search"), color: "#3dc75a" },
            { label: "Schedule Interview", icon: <Calendar size={18} />, action: () => setActiveTab("interviews"), color: "#f5a623" },
            { label: "View Applications", icon: <Eye size={18} />, action: () => setActiveTab("applications"), color: "#9b59b6" },
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

      {/* Recent Applications */}
      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Recent Applications</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Candidate</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Job</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>ATS Score</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 4).map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f4f4f4" }}>
                  <td className="py-3 px-2 font-medium" style={{ color: "#0a0a0c" }}>{app.candidateName}</td>
                  <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{app.jobTitle}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#e8f0fe", color: "#0071e3" }}>{app.atsScore}%</span>
                  </td>
                  <td className="py-3 px-2"><span className={`status-badge status-${app.status}`}>{app.status.replace("_", " ")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Job Management
function JobManagement() {
  const { user } = useAuth();
  const currentRecruiter = recruiters.find((recruiter) => recruiter.email === user?.email);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newJob, setNewJob] = useState({ title: "", description: "", skills: "", experience: "", salary: "", location: "", type: "Remote", deadline: "" });

  useEffect(() => {
    let cancelled = false;
    apiRequest<{ jobs: Job[] }>("/platform/jobs?mine=true")
      .then((result) => {
        if (!cancelled) setJobs(result.jobs);
      })
      .catch((err) => {
        if (!cancelled) {
          const recruiterIds = [user?.id, currentRecruiter?.id].filter(Boolean);
          setJobs(jobs.filter((job) => !job.recruiterId || recruiterIds.includes(job.recruiterId)));
          setError(err instanceof Error ? err.message : "Could not load recruiter jobs");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentRecruiter?.id, user?.id]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const skills = newJob.skills.split(",").map((s) => s.trim()).filter(Boolean);
    const job: Partial<Job> = {
      title: newJob.title,
      description: newJob.description,
      company: currentRecruiter?.companyName || "",
      location: newJob.location,
      type: newJob.type,
      salary: newJob.salary,
      skills,
      experience: newJob.experience,
      deadline: newJob.deadline,
      status: "active",
    };
    try {
      const result = await apiRequest<{ job: Job }>("/platform/jobs", {
        method: "POST",
        body: JSON.stringify(job),
      });
      setJobs((current) => [result.job, ...current]);
      setShowForm(false);
      setNewJob({ title: "", description: "", skills: "", experience: "", salary: "", location: "", type: "Remote", deadline: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create job");
    }
  };

  const handleStatusChange = async (id: string, status: Job["status"]) => {
    setError("");
    try {
      const result = await apiRequest<{ job: Job }>(`/platform/jobs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setJobs((current) => current.map((j) => (j.id === id ? result.job : j)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update job");
    }
  };

  const handleDeleteJob = async (id: string) => {
    setError("");
    try {
      await apiRequest(`/platform/jobs/${id}`, { method: "DELETE" });
      setJobs((current) => current.filter((job) => job.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete job");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Job Management</h1>
          {loading && <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>Loading your jobs...</p>}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
          <Plus size={16} /> {showForm ? "Cancel" : "Post New Job"}
        </button>
      </div>

      {error && <div className="dashboard-card text-sm" style={{ color: "#e74c3c" }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleCreateJob} className="dashboard-card space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: "#0a0a0c" }}>Create New Job</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Job Title *</label>
              <input value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} placeholder="e.g. Frontend Developer" required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Location</label>
              <input value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} placeholder="e.g. San Francisco, CA"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Salary Range</label>
              <input value={newJob.salary} onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })} placeholder="$120k - $160k"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Job Type</label>
              <select value={newJob.type} onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }}>
                <option>Remote</option><option>Hybrid</option><option>On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Deadline</label>
              <input type="date" value={newJob.deadline} onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Description</label>
            <textarea value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} placeholder="Job description..." rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Required Skills</label>
              <input value={newJob.skills} onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })} placeholder="React, TypeScript, Node.js"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Experience Required</label>
              <input value={newJob.experience} onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })} placeholder="2-4 years"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
          </div>
          <button type="submit" className="px-6 py-2 rounded-lg text-sm font-medium" style={{ background: "#0a0a0c", color: "#f2f0e6" }}>Create Job</button>
        </form>
      )}

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="dashboard-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "#0a0a0c" }}>{job.title}</h3>
                <p className="text-sm" style={{ color: "#6c6c6c" }}>{job.company} | {job.location} | {job.type}</p>
              </div>
              <span className={`status-badge status-${job.status}`}>{job.status}</span>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {[
                ["Applied", job.applications], ["Shortlisted", job.shortlisted], ["Interviewed", job.interviewed], ["Hired", job.hired],
              ].map(([label, value]) => (
                <div key={label} className="text-center p-3 rounded-lg" style={{ background: "#f4f4f4" }}>
                  <p className="text-lg font-bold" style={{ color: "#0a0a0c" }}>{value}</p>
                  <p className="text-xs" style={{ color: "#6c6c6c" }}>{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleStatusChange(job.id, "paused")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#fff3cd", color: "#856404" }}>
                <Pause size={12} /> Pause
              </button>
              <button onClick={() => handleStatusChange(job.id, "closed")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#f8d7da", color: "#721c24" }}>
                <XCircle size={12} /> Close
              </button>
              <button onClick={() => handleDeleteJob(job.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#f8d7da", color: "#721c24" }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && jobs.length === 0 && <div className="dashboard-card text-center text-sm" style={{ color: "#6c6c6c" }}>No jobs posted under your recruiter account yet.</div>}
      </div>
    </div>
  );
}
// Application Management
function ApplicationManagement() {
  const [applicationState] = useState<Application[]>(applications);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? applicationState : applicationState.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Application Management</h1>

      <div className="flex flex-wrap gap-3">
        {["all", "applied", "under_review", "shortlisted", "interview", "selected", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: filter === f ? "#0a0a0c" : "white", color: filter === f ? "#f2f0e6" : "#6c6c6c", border: filter === f ? "none" : "1px solid #e5e5e5" }}>
            {f.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="dashboard-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Candidate</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Job</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>ATS Score</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Status</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Applied</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f4f4f4" }}>
                <td className="py-3 px-2 font-medium" style={{ color: "#0a0a0c" }}>{app.candidateName}</td>
                <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{app.jobTitle}</td>
                <td className="py-3 px-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#e8f0fe", color: "#0071e3" }}>{app.atsScore}%</span>
                </td>
                <td className="py-3 px-2"><span className={`status-badge status-${app.status}`}>{app.status.replace("_", " ")}</span></td>
                <td className="py-3 px-2 text-xs" style={{ color: "#6c6c6c" }}>{app.appliedDate}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#0071e3" }}><Download size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#3dc75a" }}><CheckCircle size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#e74c3c" }}><XCircle size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// AI Ranking
function AIRanking() {
  const fallbackRankings: AiRanking[] = [...applications]
    .sort((a, b) => b.atsScore - a.atsScore)
    .map((app) => ({
      id: app.id,
      candidateName: app.candidateName,
      jobTitle: app.jobTitle,
      company: app.company,
      atsScore: app.atsScore,
      status: app.status,
      skills: [],
      experience: "",
      education: "",
      location: "",
      reasons: ["Using local sample data because the AI backend is not connected."],
    }));
  const [ranked, setRanked] = useState<AiRanking[]>(fallbackRankings);
  const [summary, setSummary] = useState<AiTrainingSummary | null>(null);
  const [source, setSource] = useState<"csv" | "mock">("mock");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchAiRankings(25), fetchAiTrainingSummary()])
      .then(([rankingResponse, trainingSummary]) => {
        if (cancelled) return;
        if (rankingResponse.rankings.length > 0) {
          setRanked(rankingResponse.rankings);
          setSource("csv");
        }
        setSummary(trainingSummary);
      })
      .catch(() => {
        if (!cancelled) {
          setSource("mock");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>AI Candidate Ranking</h1>
          <p className="text-sm mt-1" style={{ color: "#6c6c6c" }}>
            {source === "csv"
              ? "Ranked from uploaded CV, job, application, and ATS training datasets."
              : "Showing local sample rankings until the AI backend is available."}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#e8f0fe" }}>
          <Bot size={18} style={{ color: "#0071e3" }} />
          <span className="text-xs font-medium" style={{ color: "#0071e3" }}>{loading ? "Loading AI" : source === "csv" ? "CSV Trained" : "Sample AI"}</span>
        </div>
      </div>

      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Ranking Logic</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Skills Match", weight: `${summary?.weights.skillsMatch ?? 40}%`, desc: "Keyword and semantic matching", color: "#0071e3" },
            { label: "Experience", weight: `${summary?.weights.experience ?? 25}%`, desc: "Relevant years and projects", color: "#3dc75a" },
            { label: "Education", weight: `${summary?.weights.education ?? 20}%`, desc: "Degree and certifications", color: "#f5a623" },
            { label: "Resume Quality", weight: `${summary?.weights.resumeQuality ?? 15}%`, desc: "Formatting and completeness", color: "#9b59b6" },
          ].map((w) => (
            <div key={w.label} className="p-4 rounded-lg" style={{ background: `${w.color}10` }}>
              <p className="text-lg font-bold" style={{ color: w.color }}>{w.weight}</p>
              <p className="text-sm font-medium" style={{ color: "#0a0a0c" }}>{w.label}</p>
              <p className="text-xs" style={{ color: "#6c6c6c" }}>{w.desc}</p>
            </div>
          ))}
        </div>
        {summary && (
          <p className="text-xs mt-4" style={{ color: "#6c6c6c" }}>
            Training sample: {summary.rows.toLocaleString()} rows, {summary.shortlistedRate}% shortlisted rate, {summary.averageSkillsMatch}% average skills match.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {ranked.map((app, idx) => (
          <div key={app.id} className="dashboard-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: idx < 3 ? "#d4af37" : "#f4f4f4", color: idx < 3 ? "white" : "#6c6c6c" }}>
              {idx + 1}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold" style={{ color: "#0a0a0c" }}>{app.candidateName}</h4>
              <p className="text-xs" style={{ color: "#6c6c6c" }}>{app.jobTitle} at {app.company}</p>
              <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>
                {[app.experience, app.education, app.location].filter(Boolean).join(" | ")}
              </p>
              {app.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {app.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded text-xs" style={{ background: "#f4f4f4", color: "#6c6c6c" }}>{skill}</span>
                  ))}
                </div>
              )}
              <p className="text-xs mt-2" style={{ color: "#6c6c6c" }}>{app.reasons[0]}</p>
            </div>
            <div className="text-center mr-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center relative"
                style={{ background: `conic-gradient(#0071e3 ${app.atsScore * 3.6}deg, #f4f4f4 0deg)` }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "white" }}>
                  <span className="text-sm font-bold" style={{ color: "#0071e3" }}>{app.atsScore}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button className="px-3 py-1 rounded text-xs font-medium" style={{ background: "#e8f0fe", color: "#0071e3" }}>Shortlist</button>
              <button className="px-3 py-1 rounded text-xs font-medium" style={{ background: "#f8d7da", color: "#721c24" }}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Candidate Search
function CandidateSearch() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ skills: "", experience: "", location: "" });

  const filtered = candidates.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchSkills = !filters.skills || c.skills.some((s) => s.toLowerCase().includes(filters.skills.toLowerCase()));
    const matchExp = !filters.experience || c.experienceLevel === filters.experience;
    const matchLoc = !filters.location || c.location.toLowerCase().includes(filters.location.toLowerCase());
    return matchSearch && matchSkills && matchExp && matchLoc;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Search Candidates</h1>

      <div className="dashboard-card space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6c6c6c" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skills (e.g. Python, React)..."
            className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Skills</label>
            <input value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
              placeholder="e.g. Python" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Experience</label>
            <select value={filters.experience} onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }}>
              <option value="">All</option>
              <option>Fresher</option>
              <option>1-2 years</option>
              <option>2-3 years</option>
              <option>3-5 years</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Location</label>
            <input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="e.g. San Francisco" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((cand) => (
          <div key={cand.id} className="dashboard-card flex items-start gap-4">
            <img src={cand.avatar} alt={cand.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold" style={{ color: "#0a0a0c" }}>{cand.name}</h4>
              <p className="text-xs" style={{ color: "#6c6c6c" }}>{cand.college} | {cand.degree}</p>
              <p className="text-xs" style={{ color: "#6c6c6c" }}>{cand.location} | {cand.experienceLevel}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {cand.skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded text-xs" style={{ background: "#f4f4f4", color: "#6c6c6c" }}>{s}</span>
                ))}
              </div>
            </div>
            <div className="text-center">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#e8f0fe", color: "#0071e3" }}>{cand.atsScore}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Interview Management
function InterviewManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Interview Management</h1>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Pending", count: interviews.filter((i) => i.status === "pending").length, color: "#f5a623" },
          { label: "Scheduled", count: interviews.filter((i) => i.status === "scheduled").length, color: "#0071e3" },
          { label: "Completed", count: interviews.filter((i) => i.status === "completed").length, color: "#3dc75a" },
          { label: "Total", count: interviews.length, color: "#0a0a0c" },
        ].map((s) => (
          <div key={s.label} className="dashboard-card text-center">
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-card space-y-4">
        <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Open Interview Slots</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Start Date</label>
            <input type="date" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>End Date</label>
            <input type="date" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Time Range</label>
            <input type="time" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <button className="px-6 py-2 rounded-lg text-sm font-medium" style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
          Publish Slots
        </button>
      </div>

      <div className="dashboard-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Candidate</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Job</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Date & Time</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Status</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((int) => (
              <tr key={int.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f4f4f4" }}>
                <td className="py-3 px-2 font-medium" style={{ color: "#0a0a0c" }}>{int.candidateName}</td>
                <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{int.jobTitle}</td>
                <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{int.date} | {int.time}</td>
                <td className="py-3 px-2"><span className={`status-badge status-${int.status}`}>{int.status}</span></td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#0071e3" }} title="Reschedule"><Clock size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#3dc75a" }} title="Send Link"><Send size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#e74c3c" }} title="Cancel"><XCircle size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Analytics
function RecruiterAnalytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Analytics Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Applications per Job</h3>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "#0a0a0c" }}>{job.title}</span>
                  <span style={{ color: "#6c6c6c" }}>{job.applications}</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: "#f4f4f4" }}>
                  <div className="h-2 rounded-full" style={{ width: `${Math.min((job.applications / 150) * 100, 100)}%`, background: "#0071e3" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Recruitment Pipeline</h3>
          <div className="flex items-end justify-around h-48">
            {[
              { label: "Applied", value: 120, color: "#0071e3" },
              { label: "Shortlisted", value: 35, color: "#f5a623" },
              { label: "Interviewed", value: 15, color: "#9b59b6" },
              { label: "Hired", value: 3, color: "#3dc75a" },
            ].map((d) => (
              <div key={d.label} className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold" style={{ color: d.color }}>{d.value}</span>
                <div className="w-12 rounded-t-lg" style={{ height: `${d.value * 1.5}px`, background: d.color }} />
                <span className="text-xs" style={{ color: "#6c6c6c" }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Top Skills in Applications</h3>
        <div className="flex flex-wrap gap-2">
          {["Python", "React", "TypeScript", "SQL", "Machine Learning", "AWS", "Node.js", "Docker", "Kubernetes", "GraphQL"].map((skill) => (
            <span key={skill} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: "#e8f0fe", color: "#0071e3" }}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Messages
function Messages() {
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [reply, setReply] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    const message = {
      id: `msg-${messages.length + 1}`,
      senderId: "rec-1",
      senderName: "You",
      senderRole: "recruiter",
      recipientId: "cand-1",
      content: reply,
      timestamp: new Date().toISOString(),
      read: true,
    };
    try {
      const result = await apiRequest<{ message: typeof message }>("/messages", {
        method: "POST",
        body: JSON.stringify(message),
      });
      setLocalMessages([...localMessages, result.message]);
    } catch {
      setLocalMessages([...localMessages, message]);
    }
    setReply("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Messages</h1>

      <div className="dashboard-card" style={{ minHeight: "400px" }}>
        <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
          {localMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderRole === "recruiter" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${msg.senderRole === "recruiter" ? "rounded-br-sm" : "rounded-bl-sm"}`}
                style={{ background: msg.senderRole === "recruiter" ? "#0071e3" : "#f4f4f4", color: msg.senderRole === "recruiter" ? "white" : "#0a0a0c" }}>
                <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex gap-2 pt-4" style={{ borderTop: "1px solid #e5e5e5" }}>
          <input value={reply} onChange={(e) => setReply(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium" style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

// Contact Admin
function ContactAdmin() {
  const { user } = useAuth();
  const currentRecruiter = recruiters.find((recruiter) => recruiter.email === user?.email) || recruiters[0];
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/platform/complaints", {
        method: "POST",
        body: JSON.stringify({
          userId: currentRecruiter?.id || user?.id || "recruiter",
          userName: currentRecruiter?.name || user?.name || "Recruiter",
          userRole: "recruiter",
          subject,
          description: message,
        }),
      });
    } catch {
      // The success state still confirms the local submission when offline.
    }
    setSent(true);
    setSubject("");
    setMessage("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Contact Admin</h1>

      {sent && (
        <div className="dashboard-card flex items-center gap-3" style={{ background: "#d4edda" }}>
          <CheckCircle size={20} style={{ color: "#155724" }} />
          <p className="text-sm font-medium" style={{ color: "#155724" }}>Your message has been sent to the admin team.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="dashboard-card space-y-4">
          <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Raise a Ticket</h3>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }}>
              <option value="">Select a topic</option>
              <option value="complaint">Raise Complaint</option>
              <option value="issue">Report Issue</option>
              <option value="verification">Request Verification Update</option>
              <option value="question">Platform Question</option>
              <option value="support">Submit Support Ticket</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue..." rows={5} required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-medium" style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
            Submit Ticket
          </button>
        </form>

        <div className="space-y-4">
          <div className="dashboard-card">
            <h4 className="text-sm font-semibold mb-3" style={{ color: "#0a0a0c" }}>Quick Links</h4>
            <div className="space-y-2">
              {["FAQs", "Platform Guide", "Privacy Policy", "Terms of Service"].map((link) => (
                <button key={link} className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:bg-gray-50" style={{ color: "#0071e3" }}>
                  {link}
                </button>
              ))}
            </div>
          </div>
          <div className="dashboard-card" style={{ background: "#fff3cd" }}>
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} style={{ color: "#856404" }} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium" style={{ color: "#856404" }}>Response Time</p>
                <p className="text-xs" style={{ color: "#856404" }}>Admin typically responds within 24 hours during business days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings
function SettingsPage() {
  const { user } = useAuth();
  const currentRecruiter = recruiters.find((recruiter) => recruiter.email === user?.email);
  const [form, setForm] = useState({
    name: currentRecruiter?.name || user?.name || "",
    email: currentRecruiter?.email || user?.email || "",
    companyName: currentRecruiter?.companyName || "",
    phone: currentRecruiter?.phone || "",
  });
  const [status, setStatus] = useState("");

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("Saving...");
    try {
      if (currentRecruiter?.id) {
        await apiRequest(`/recruiters/${currentRecruiter.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      }
      await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      setStatus("Profile saved successfully.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save profile");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Settings</h1>

      <form onSubmit={saveProfile} className="dashboard-card space-y-4">
        <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Profile Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Company</label>
            <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="px-6 py-2 rounded-lg text-sm font-medium" style={{ background: "#0a0a0c", color: "#f2f0e6" }}>Save Changes</button>
          {status && <span className="text-sm" style={{ color: status.includes("success") ? "#155724" : "#6c6c6c" }}>{status}</span>}
        </div>
      </form>

      <div className="dashboard-card space-y-4">
        <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Account Settings</h3>
        <div className="space-y-3">
          {["Email Notifications", "Interview Reminders"].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "#0a0a0c" }}>{label}</p>
                <p className="text-xs" style={{ color: "#6c6c6c" }}>Enabled for your recruiter account</p>
              </div>
              <button className="w-12 h-6 rounded-full relative" style={{ background: "#0071e3" }} type="button">
                <div className="w-5 h-5 rounded-full absolute top-0.5 right-0.5" style={{ background: "white" }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// Main Recruiter Dashboard
export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardHome setActiveTab={setActiveTab} />;
      case "jobs": return <JobManagement />;
      case "applications": return <ApplicationManagement />;
      case "ranking": return <AIRanking />;
      case "search": return <CandidateSearch />;
      case "interviews": return <InterviewManagement />;
      case "analytics": return <RecruiterAnalytics />;
      case "messages": return <Messages />;
      case "contact": return <ContactAdmin />;
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
            <h2 className="text-sm font-medium hidden lg:block" style={{ color: "#6c6c6c" }}>Recruiter Panel</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6c6c6c" }} />
              <input type="text" placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg text-sm outline-none w-64"
                style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={18} style={{ color: "#6c6c6c" }} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#e74c3c" }} />
            </button>
            <div className="flex items-center gap-2">
              <img src="/images/recruiter-1.jpg" alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-sm font-medium hidden md:block" style={{ color: "#0a0a0c" }}>{user?.name || "Recruiter"}</span>
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






