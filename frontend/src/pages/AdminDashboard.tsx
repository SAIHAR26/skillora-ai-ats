import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Shield,
  Trash2,
  UserCheck,
  Eye,
  Ban,
  Mail,
  Send,
  Calendar,
  CheckSquare,
  Menu,
} from "lucide-react";
import {
  adminStats,
  mockRecruiters,
  mockCandidates,
  mockJobs,
  mockInterviews,
  mockComplaints,
  mockAnalytics,
  mockApplications,
  mockNotifications,
} from "../data/mockData";
import type { Recruiter, Candidate, Complaint, Notification } from "../data/mockData";
import { apiRequest, fetchPlatformSnapshot, fetchSystemSettings, saveSystemSettings } from "../services/platformApi";

function Sidebar({ activeTab, setActiveTab, collapsed }: { activeTab: string; setActiveTab: (t: string) => void; collapsed: boolean }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "users", label: "User Management", icon: <Users size={18} /> },
    { key: "verification", label: "Recruiter Verification", icon: <Shield size={18} /> },
    { key: "jobs", label: "Opportunities", icon: <Briefcase size={18} /> },
    { key: "analytics", label: "Analytics & Reports", icon: <BarChart3 size={18} /> },
    { key: "interviews", label: "Interview Management", icon: <Calendar size={18} /> },
    { key: "feedback", label: "Feedback & Support", icon: <MessageSquare size={18} /> },
    { key: "notifications", label: "Notification Center", icon: <Bell size={18} /> },
    { key: "settings", label: "System Settings", icon: <Settings size={18} /> },
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === link.key ? "active" : ""}`}
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

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
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
    </div>
  );
}

// Dashboard Home
function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Dashboard Overview</h1>
          <p className="text-sm mt-1" style={{ color: "#6c6c6c" }}>Welcome back, Admin. Here is what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Candidates" value={adminStats.totalCandidates} icon={<Users size={20} />} color="#0071e3" />
        <StatCard title="Total Recruiters" value={adminStats.totalRecruiters} icon={<Briefcase size={20} />} color="#f5a623" />
        <StatCard title="Verified Recruiters" value={adminStats.verifiedRecruiters || 0} icon={<UserCheck size={20} />} color="#3dc75a" />
        <StatCard title="Pending Recruiters" value={adminStats.pendingRecruiters || 0} icon={<AlertTriangle size={20} />} color="#f5a623" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Jobs" value={adminStats.activeJobs || 0} icon={<FileText size={20} />} color="#3dc75a" />
        <StatCard title="Closed Jobs" value={adminStats.closedJobs || 0} icon={<CheckSquare size={20} />} color="#e74c3c" />
        <StatCard title="Applications" value={adminStats.totalApplications} icon={<CheckCircle size={20} />} color="#0071e3" />
        <StatCard title="Interviews Scheduled" value={adminStats.interviewsScheduled} icon={<Calendar size={20} />} color="#9b59b6" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="System Notifications" value={adminStats.systemNotifications || 0} icon={<Bell size={20} />} color="#0071e3" />
        <StatCard title="Reports & Tickets" value={adminStats.reportsAndTickets || 0} icon={<MessageSquare size={20} />} color="#f5a623" />
        <StatCard title="Hired Candidates" value={adminStats.hiredCandidates} icon={<UserCheck size={20} />} color="#3dc75a" />
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "#0a0a0c" }}>Recent Applications</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Candidate</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Job</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Company</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>ATS Score</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockApplications.slice(0, 5).map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f4f4f4" }}>
                  <td className="py-3 px-2 font-medium" style={{ color: "#0a0a0c" }}>{app.candidateName}</td>
                  <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{app.jobTitle}</td>
                  <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{app.company}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#e8f0fe", color: "#0071e3" }}>
                      {app.atsScore}%
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`status-badge status-${app.status}`}>{app.status.replace("_", " ")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// User Management
function UserManagement() {
  const [activeSubTab, setActiveSubTab] = useState<"recruiters" | "candidates">("recruiters");
  const [search, setSearch] = useState("");
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    setRecruiters([...mockRecruiters]);
    setCandidates([...mockCandidates]);
  }, [mockRecruiters.length, mockCandidates.length]);

  const filteredRecruiters = recruiters.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.companyName.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteRecruiter = async (id: string) => {
    try {
      await apiRequest(`/recruiters/${id}`, { method: "DELETE" });
    } catch {
      // Keep local workflow responsive if the backend is unreachable.
    }
    setRecruiters(recruiters.filter((r) => r.id !== id));
  };

  const handleSuspendCandidate = async (id: string) => {
    try {
      await apiRequest(`/candidates/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "suspended" }),
      });
    } catch {
      // Keep local workflow responsive if the backend is unreachable.
    }
    setCandidates(candidates.map((c) => (c.id === id ? { ...c, status: "suspended" } : c)));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>User Management</h1>

      <div className="flex gap-4">
        <button onClick={() => setActiveSubTab("recruiters")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: activeSubTab === "recruiters" ? "#0a0a0c" : "white", color: activeSubTab === "recruiters" ? "#f2f0e6" : "#6c6c6c", border: activeSubTab === "recruiters" ? "none" : "1px solid #e5e5e5" }}>
          Recruiters ({recruiters.length})
        </button>
        <button onClick={() => setActiveSubTab("candidates")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: activeSubTab === "candidates" ? "#0a0a0c" : "white", color: activeSubTab === "candidates" ? "#f2f0e6" : "#6c6c6c", border: activeSubTab === "candidates" ? "none" : "1px solid #e5e5e5" }}>
          Candidates ({candidates.length})
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6c6c6c" }} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${activeSubTab}...`}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
          style={{ background: "white", border: "1px solid #e5e5e5" }} />
      </div>

      {activeSubTab === "recruiters" ? (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Name</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Company</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Role</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Status</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecruiters.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f4f4f4" }}>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <img src={rec.avatar} alt={rec.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-medium" style={{ color: "#0a0a0c" }}>{rec.name}</p>
                        <p className="text-xs" style={{ color: "#6c6c6c" }}>{rec.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{rec.companyName}</td>
                  <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{rec.role}</td>
                  <td className="py-3 px-2">
                    <span className={`status-badge ${rec.status === "approved" ? "status-selected" : rec.status === "pending" ? "status-pending" : "status-rejected"}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "#0071e3" }}><Eye size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "#f5a623" }}><AlertTriangle size={14} /></button>
                      <button onClick={() => handleDeleteRecruiter(rec.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "#e74c3c" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Name</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Education</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>ATS Score</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Status</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f4f4f4" }}>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <img src={cand.avatar} alt={cand.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-medium" style={{ color: "#0a0a0c" }}>{cand.name}</p>
                        <p className="text-xs" style={{ color: "#6c6c6c" }}>{cand.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{cand.college} ({cand.degree})</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#e8f0fe", color: "#0071e3" }}>
                      {cand.atsScore}%
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`status-badge ${cand.status === "active" ? "status-selected" : "status-rejected"}`}>{cand.status}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "#0071e3" }}><Eye size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "#f5a623" }}><AlertTriangle size={14} /></button>
                      <button onClick={() => handleSuspendCandidate(cand.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "#e74c3c" }}><Ban size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Recruiter Verification
function RecruiterVerification() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [recruiterActionError, setRecruiterActionError] = useState("");

  useEffect(() => {
    setRecruiters([...mockRecruiters].filter((r) => r.status === "pending"));
  }, [mockRecruiters.length]);

  const updateRecruiterStatus = async (id: string, status: string) => {
    try {
      await apiRequest(`/recruiters/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      setRecruiterActionError(error instanceof Error ? error.message : "Unable to update recruiter status");
    }
    setRecruiters((current) => current.filter((r) => r.id !== id));
  };

  const handleApprove = (id: string) => updateRecruiterStatus(id, "approved");
  const handleReject = (id: string) => updateRecruiterStatus(id, "rejected");
  const handleRequestInfo = async (id: string) => {
    try {
      await apiRequest(`/recruiters/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ verificationStatus: "pending", status: "pending" }),
      });
      setRecruiters((current) => current.filter((r) => r.id !== id));
    } catch (error) {
      setRecruiterActionError(error instanceof Error ? error.message : "Unable to request more information");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Recruiter Verification</h1>
      <p className="text-sm" style={{ color: "#6c6c6c" }}>Review and approve recruiter registrations.</p>

      {recruiters.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "#3dc75a" }} />
          <p className="text-lg font-medium" style={{ color: "#0a0a0c" }}>All caught up!</p>
          <p className="text-sm" style={{ color: "#6c6c6c" }}>No pending recruiter verifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recruiters.map((rec) => (
            <div key={rec.id} className="dashboard-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src={rec.avatar} alt={rec.name} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>{rec.name}</h3>
                    <p className="text-sm" style={{ color: "#6c6c6c" }}>{rec.role} at {rec.companyName}</p>
                    <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>{rec.companyEmail} | {rec.phone}</p>
                  </div>
                </div>
                <span className="status-badge status-pending">Pending</span>
              </div>
              <div className="mt-4 pt-4 grid md:grid-cols-3 gap-4 text-sm" style={{ borderTop: "1px solid #e5e5e5" }}>
                <div>
                  <p className="text-xs mb-1" style={{ color: "#6c6c6c" }}>Company</p>
                  <p className="font-medium" style={{ color: "#0a0a0c" }}>{rec.companyName}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "#6c6c6c" }}>Industry</p>
                  <p className="font-medium" style={{ color: "#0a0a0c" }}>{rec.industry}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "#6c6c6c" }}>Company Size</p>
                  <p className="font-medium" style={{ color: "#0a0a0c" }}>{rec.companySize}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "#6c6c6c" }}>Website</p>
                  <p className="font-medium" style={{ color: "#0071e3" }}>{rec.companyWebsite}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "#6c6c6c" }}>Experience</p>
                  <p className="font-medium" style={{ color: "#0a0a0c" }}>{rec.experience}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "#6c6c6c" }}>Address</p>
                  <p className="font-medium" style={{ color: "#0a0a0c" }}>{rec.companyAddress}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => handleApprove(rec.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ background: "#d4edda", color: "#155724" }}>
                  <CheckCircle size={16} /> Approve
                </button>
                <button onClick={() => handleRequestInfo(rec.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ background: "#fff3cd", color: "#856404" }}>
                  <AlertTriangle size={16} /> Request Info
                </button>
                <button onClick={() => handleReject(rec.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ background: "#f8d7da", color: "#721c24" }}>
                  <XCircle size={16} /> Reject
                </button>
              </div>
              {recruiterActionError && (
                <p className="text-sm mt-3" style={{ color: "#e74c3c" }}>{recruiterActionError}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Opportunities Management
function OpportunitiesManagement() {
  const [jobs, setJobs] = useState(mockJobs);
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", company: "", location: "", type: "Remote", salary: "", description: "", skills: "", experience: "", deadline: "" });
  const [savingJob, setSavingJob] = useState(false);
  const [jobError, setJobError] = useState("");

  useEffect(() => {
    setJobs([...mockJobs]);
  }, [mockJobs.length]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJob(true);
    setJobError("");

    const payload = {
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      type: newJob.type,
      salary: newJob.salary,
      description: newJob.description,
      skillsRequired: newJob.skills.split(",").map((s) => s.trim()).filter(Boolean),
      experienceLevel: newJob.experience,
      deadline: newJob.deadline,
      published: true,
      status: "active",
      active: true,
    };

    try {
      const response = await apiRequest<{ job: typeof jobs[number] }>("/platform/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setJobs([...jobs, response.job]);
    } catch (error) {
      setJobError(error instanceof Error ? error.message : "Could not create job");
      const fallbackJob = {
        id: `job-${jobs.length + 1}`,
        ...newJob,
        skills: newJob.skills.split(",").map((s) => s.trim()),
        status: "active" as const,
        applications: 0,
        shortlisted: 0,
        interviewed: 0,
        hired: 0,
        postedDate: new Date().toISOString().split("T")[0],
      };
      setJobs([...jobs, fallbackJob]);
    } finally {
      setSavingJob(false);
      setShowForm(false);
      setNewJob({ title: "", company: "", location: "", type: "Remote", salary: "", description: "", skills: "", experience: "", deadline: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Opportunities</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
          {showForm ? "Cancel" : "+ Add Opportunity"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateJob} className="dashboard-card space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: "#0a0a0c" }}>Create New Opportunity</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Job Title *</label>
              <input value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                placeholder="e.g. Frontend Developer" required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Company *</label>
              <input value={newJob.company} onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                placeholder="e.g. TechCorp" required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Location</label>
              <input value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Type</label>
              <select value={newJob.type} onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }}>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Salary Range</label>
              <input value={newJob.salary} onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                placeholder="e.g. $120k - $160k"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Description</label>
            <textarea value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              placeholder="Job description..." rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Required Skills (comma-separated)</label>
              <input value={newJob.skills} onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                placeholder="React, TypeScript, Node.js"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Experience</label>
              <input value={newJob.experience} onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                placeholder="2-4 years"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Deadline</label>
              <input type="date" value={newJob.deadline} onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            </div>
          </div>
          <button type="submit"
            disabled={savingJob}
            className="px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
            {savingJob ? "Creating..." : "Create Opportunity"}
          </button>
          {jobError && <p className="text-sm text-red-600">{jobError}</p>}
        </form>
      )}

      <div className="dashboard-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Job Title</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Company</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Type</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Applications</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f4f4f4" }}>
                <td className="py-3 px-2 font-medium" style={{ color: "#0a0a0c" }}>{job.title}</td>
                <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{job.company}</td>
                <td className="py-3 px-2">
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#e8f0fe", color: "#0071e3" }}>{job.type}</span>
                </td>
                <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{job.applications}</td>
                <td className="py-3 px-2">
                  <span className={`status-badge status-${job.status}`}>{job.status}</span>
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
function AnalyticsReports() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Analytics & Reports</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Applications per Month</h3>
          <div className="flex items-end gap-2 h-48">
            {mockAnalytics.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-[40px] rounded-t-lg transition-all hover:opacity-80" style={{ height: `${d.applications * 0.6}px`, background: "#0071e3" }} />
                </div>
                <span className="text-xs" style={{ color: "#6c6c6c" }}>{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Hiring Success Rate</h3>
          <div className="space-y-4">
            {mockAnalytics.map((d) => (
              <div key={d.month}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "#0a0a0c" }}>{d.month}</span>
                  <span style={{ color: "#6c6c6c" }}>{d.hires} hires / {d.interviews} interviews</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: "#f4f4f4" }}>
                  <div className="h-2 rounded-full" style={{ width: `${(d.hires / d.interviews) * 100}%`, background: "#3dc75a" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Monthly Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Month</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Applications</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Interviews</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Hires</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Rejections</th>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {mockAnalytics.map((d) => (
                <tr key={d.month} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f4f4f4" }}>
                  <td className="py-3 px-2 font-medium" style={{ color: "#0a0a0c" }}>{d.month}</td>
                  <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{d.applications}</td>
                  <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{d.interviews}</td>
                  <td className="py-3 px-2 font-medium" style={{ color: "#3dc75a" }}>{d.hires}</td>
                  <td className="py-3 px-2" style={{ color: "#e74c3c" }}>{d.rejections}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#e8f0fe", color: "#0071e3" }}>
                      {((d.hires / d.interviews) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          { label: "Pending", count: mockInterviews.filter((i) => i.status === "pending").length, color: "#f5a623" },
          { label: "Scheduled", count: mockInterviews.filter((i) => i.status === "scheduled").length, color: "#0071e3" },
          { label: "Completed", count: mockInterviews.filter((i) => i.status === "completed").length, color: "#3dc75a" },
          { label: "Total", count: mockInterviews.length, color: "#0a0a0c" },
        ].map((s) => (
          <div key={s.label} className="dashboard-card text-center">
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Candidate</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Job</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Date</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Time</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Status</th>
              <th className="text-left py-3 px-2 font-medium" style={{ color: "#6c6c6c" }}>Meeting</th>
            </tr>
          </thead>
          <tbody>
            {mockInterviews.map((int) => (
              <tr key={int.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f4f4f4" }}>
                <td className="py-3 px-2 font-medium" style={{ color: "#0a0a0c" }}>{int.candidateName}</td>
                <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{int.jobTitle}</td>
                <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{int.date}</td>
                <td className="py-3 px-2" style={{ color: "#6c6c6c" }}>{int.time}</td>
                <td className="py-3 px-2">
                  <span className={`status-badge status-${int.status}`}>{int.status}</span>
                </td>
                <td className="py-3 px-2">
                  {int.meetingLink ? (
                    <a href={int.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: "#0071e3" }}>Join</a>
                  ) : (
                    <span className="text-xs" style={{ color: "#6c6c6c" }}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Feedback & Support
function FeedbackSupport() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    setComplaints([...mockComplaints]);
  }, [mockComplaints.length]);

  const handleResolve = async (id: string) => {
    try {
      await apiRequest(`/complaints/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "resolved" }),
      });
    } catch {
      // Keep local workflow responsive if the backend is unreachable.
    }
    setComplaints(complaints.map((c) => (c.id === id ? { ...c, status: "resolved" } : c)));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Feedback & Support</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Open Tickets</h3>
          <p className="text-3xl font-bold" style={{ color: "#f5a623" }}>{complaints.filter((c) => c.status === "open").length}</p>
        </div>
        <div className="dashboard-card">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#0a0a0c" }}>Resolved</h3>
          <p className="text-3xl font-bold" style={{ color: "#3dc75a" }}>{complaints.filter((c) => c.status === "resolved").length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {complaints.map((comp) => (
          <div key={comp.id} className="dashboard-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>{comp.subject}</h3>
                  <span className={`status-badge ${comp.status === "open" ? "status-pending" : "status-selected"}`}>{comp.status}</span>
                </div>
                <p className="text-xs mb-2" style={{ color: "#6c6c6c" }}>From: {comp.userName} ({comp.userRole}) | {comp.createdAt}</p>
                <p className="text-sm" style={{ color: "#0a0a0c" }}>{comp.description}</p>
              </div>
            </div>
            {comp.status === "open" && (
              <div className="mt-4 flex gap-3">
                <button onClick={() => handleResolve(comp.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80" style={{ background: "#d4edda", color: "#155724" }}>
                  <CheckSquare size={16} /> Mark Resolved
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Notification Center
function NotificationCenter() {
  type AdminNotification = Notification & { recipients: string };

  const [notifs, setNotifs] = useState<AdminNotification[]>([]);
  const [newNotif, setNewNotif] = useState({ title: "", message: "", recipients: "all" });

  useEffect(() => {
    const next = mockNotifications.map((notification) => ({
      ...notification,
      recipients: "all",
      read: notification.read ?? false,
    }));
    if (next.length > 0) {
      setNotifs(next);
    }
  }, [mockNotifications.length]);

  

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const notification = { id: `${notifs.length + 1}`, userId: newNotif.recipients, ...newNotif, type: "announcement", timestamp: new Date().toISOString(), read: false };
    try {
      await apiRequest("/platform/notifications", {
        method: "POST",
        body: JSON.stringify(notification),
      });
    } catch {
      // Keep announcement visible locally if the backend is unavailable.
    }
    setNotifs([notification, ...notifs]);
    setNewNotif({ title: "", message: "", recipients: "all" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>Notification Center</h1>

      <form onSubmit={handleSend} className="dashboard-card space-y-4">
        <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Send Announcement</h3>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Title</label>
          <input value={newNotif.title} onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
            placeholder="Announcement title" required
            className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Message</label>
          <textarea value={newNotif.message} onChange={(e) => setNewNotif({ ...newNotif, message: e.target.value })}
            placeholder="Your message..." rows={3} required
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
        </div>
        <div className="flex gap-3">
          <select value={newNotif.recipients} onChange={(e) => setNewNotif({ ...newNotif, recipients: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }}>
            <option value="all">All Users</option>
            <option value="recruiters">Recruiters Only</option>
            <option value="candidates">Candidates Only</option>
          </select>
          <button type="submit"
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
            <Send size={16} /> Send
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {notifs.map((n) => (
          <div key={n.id} className="dashboard-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#e8f0fe" }}>
              <Mail size={18} style={{ color: "#0071e3" }} />
            </div>
            <div>
              <h4 className="text-sm font-semibold" style={{ color: "#0a0a0c" }}>{n.title}</h4>
              <p className="text-xs mt-1" style={{ color: "#6c6c6c" }}>{n.message}</p>
              <p className="text-xs mt-1" style={{ color: "#0071e3" }}>To: {n.recipients}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// System Settings
function SystemSettings() {
  const [adminName, setAdminName] = useState("Skillora Admin");
  const [adminEmail, setAdminEmail] = useState("admin@skillora.com");
  const [autoApproveRecruiters, setAutoApproveRecruiters] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSystemSettings()
      .then((settings) => {
        if (cancelled) return;
        if (settings.adminName) setAdminName(String(settings.adminName));
        if (settings.adminEmail) setAdminEmail(String(settings.adminEmail));
        if (settings.autoApproveRecruiters !== undefined) setAutoApproveRecruiters(Boolean(settings.autoApproveRecruiters));
        if (settings.emailNotifications !== undefined) setEmailNotifications(Boolean(settings.emailNotifications));
        if (settings.maintenanceMode !== undefined) setMaintenanceMode(Boolean(settings.maintenanceMode));
      })
      .catch((error) => {
        if (!cancelled) setSettingsError(error instanceof Error ? error.message : "Could not load settings");
      })
      .finally(() => {
        if (!cancelled) setLoadingSettings(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsError("");
    setSettingsSaved(false);

    try {
      const payload = {
        adminName,
        adminEmail,
        autoApproveRecruiters,
        emailNotifications,
        maintenanceMode,
      };
      await saveSystemSettings(payload);
      setSettingsSaved(true);
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "Unable to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#0a0a0c" }}>System Settings</h1>

      <div className="dashboard-card space-y-6">
        <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Profile Settings</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Admin Name</label>
            <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6c6c6c" }}>Admin Email</label>
            <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <button disabled={loadingSettings || savingSettings} onClick={handleSaveSettings} className="px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80" style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
          {savingSettings ? "Saving settings..." : "Save Changes"}
        </button>
        {settingsError && <p className="text-sm" style={{ color: "#e74c3c" }}>{settingsError}</p>}
        {settingsSaved && <p className="text-sm" style={{ color: "#3dc75a" }}>Settings saved successfully.</p>}
      </div>

      <div className="dashboard-card space-y-6">
        <h3 className="text-base font-semibold" style={{ color: "#0a0a0c" }}>Platform Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "#0a0a0c" }}>Auto-approve recruiters</p>
              <p className="text-xs" style={{ color: "#6c6c6c" }}>Automatically approve new recruiter registrations</p>
            </div>
            <button onClick={() => setAutoApproveRecruiters((value) => !value)} className="w-12 h-6 rounded-full relative transition-all" style={{ background: autoApproveRecruiters ? "#0071e3" : "#e5e5e5" }}>
              <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${autoApproveRecruiters ? "right-0.5" : "left-0.5"}`} style={{ background: "white" }} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "#0a0a0c" }}>Email notifications</p>
              <p className="text-xs" style={{ color: "#6c6c6c" }}>Send email alerts for new applications</p>
            </div>
            <button onClick={() => setEmailNotifications((value) => !value)} className="w-12 h-6 rounded-full relative transition-all" style={{ background: emailNotifications ? "#0071e3" : "#e5e5e5" }}>
              <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${emailNotifications ? "right-0.5" : "left-0.5"}`} style={{ background: "white" }} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "#0a0a0c" }}>Maintenance mode</p>
              <p className="text-xs" style={{ color: "#6c6c6c" }}>Put the platform in maintenance mode</p>
            </div>
            <button onClick={() => setMaintenanceMode((value) => !value)} className="w-12 h-6 rounded-full relative transition-all" style={{ background: maintenanceMode ? "#0071e3" : "#e5e5e5" }}>
              <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${maintenanceMode ? "right-0.5" : "left-0.5"}`} style={{ background: "white" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Admin Dashboard
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPlatformSnapshot()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setDataReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardHome />;
      case "users": return <UserManagement />;
      case "verification": return <RecruiterVerification />;
      case "jobs": return <OpportunitiesManagement />;
      case "analytics": return <AnalyticsReports />;
      case "interviews": return <InterviewManagement />;
      case "feedback": return <FeedbackSupport />;
      case "notifications": return <NotificationCenter />;
      case "settings": return <SystemSettings />;
      default: return <DashboardHome />;
    }
  };

  if (!dataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f4f4f4" }}>
        <p className="text-sm font-medium" style={{ color: "#0a0a0c" }}>Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#f4f4f4" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 h-16 sticky top-0 z-30" style={{ background: "white", borderBottom: "1px solid #e5e5e5" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
              <Menu size={20} style={{ color: "#0a0a0c" }} />
            </button>
            <h2 className="text-sm font-medium hidden lg:block" style={{ color: "#6c6c6c" }}>Admin Panel</h2>
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#0a0a0c", color: "#d4af37" }}>
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
