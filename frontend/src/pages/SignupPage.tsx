import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../App";
import { registerUser } from "../services/platformApi";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Building2,
  User,
  Check,
  ChevronRight,
} from "lucide-react";

type SignupRole = "candidate" | "recruiter";

export default function SignupPage() {
  const navigate = useNavigate();
  const { role: urlRole } = useParams<{ role?: string }>();
  const { login } = useAuth();
  const [role, setRole] = useState<SignupRole>(
    urlRole === "recruiter" ? "recruiter" : "candidate"
  );
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Candidate form state
  const [candForm, setCandForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    college: "",
    degree: "",
    specialization: "",
    graduationYear: "",
    cgpa: "",
    skills: "",
    experienceLevel: "",
    linkedin: "",
    github: "",
    currentLocation: "",
    preferredLocation: "",
    workPreference: "Full-time",
  });

  // Recruiter form state
  const [recForm, setRecForm] = useState({
    name: "",
    age: "",
    phone: "",
    personalEmail: "",
    companyEmail: "",
    companyName: "",
    companyAddress: "",
    companyWebsite: "",
    industry: "",
    companySize: "",
    role: "",
    experience: "",
    linkedin: "",
    companyId: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCandidateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCandForm({ ...candForm, [e.target.name]: e.target.value });
  };

  const handleRecruiterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setRecForm({ ...recForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (role === "recruiter" && !acceptedTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      const payload = role === "candidate"
        ? { ...candForm, role }
        : { ...recForm, role, email: recForm.personalEmail, companyRole: recForm.role };
      const result = await registerUser(payload);
      login(result.user.role, result.token, result.user);
      if (result.user.role === "recruiter") navigate("/recruiter");
      else navigate("/candidate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const roles: {
    key: SignupRole;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      key: "candidate",
      label: "Candidate",
      icon: <User size={20} />,
      desc: "Find your dream job",
    },
    {
      key: "recruiter",
      label: "Recruiter",
      icon: <Building2 size={20} />,
      desc: "Hire top talent",
    },
  ];

  const renderCandidateForm = () => {
    if (step === 1) {
      return (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>
                Full Name *
              </label>
              <input name="fullName" value={candForm.fullName} onChange={handleCandidateChange}
                placeholder="John Doe" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
                style={{ background: "white", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>
                Email *
              </label>
              <input name="email" type="email" value={candForm.email} onChange={handleCandidateChange}
                placeholder="john@email.com" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
                style={{ background: "white", border: "1px solid #e5e5e5" }} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>
                Phone Number *
              </label>
              <input name="phone" value={candForm.phone} onChange={handleCandidateChange}
                placeholder="+1 555-0100" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
                style={{ background: "white", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>
                Password *
              </label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} value={candForm.password}
                  onChange={handleCandidateChange} placeholder="Min 8 characters"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 pr-12"
                  style={{ background: "white", border: "1px solid #e5e5e5" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#6c6c6c" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => setStep(2)}
            className="w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
            Next Step <ChevronRight size={16} />
          </button>
        </>
      );
    }

    return (
      <>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>College/University</label>
            <input name="college" value={candForm.college} onChange={handleCandidateChange}
              placeholder="Stanford University" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Degree</label>
            <input name="degree" value={candForm.degree} onChange={handleCandidateChange}
              placeholder="B.Tech / M.S." className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Specialization</label>
            <input name="specialization" value={candForm.specialization} onChange={handleCandidateChange}
              placeholder="Computer Science" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Graduation Year</label>
            <input name="graduationYear" value={candForm.graduationYear} onChange={handleCandidateChange}
              placeholder="2024" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>CGPA</label>
            <input name="cgpa" value={candForm.cgpa} onChange={handleCandidateChange}
              placeholder="3.8" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Skills (comma-separated)</label>
          <input name="skills" value={candForm.skills} onChange={handleCandidateChange}
            placeholder="Python, React, SQL, Machine Learning" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
            style={{ background: "white", border: "1px solid #e5e5e5" }} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Experience Level</label>
            <select name="experienceLevel" value={candForm.experienceLevel} onChange={handleCandidateChange}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }}>
              <option value="">Select</option>
              <option value="Fresher">Fresher</option>
              <option value="1-2 years">1-2 years</option>
              <option value="2-3 years">2-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Work Preference</label>
            <select name="workPreference" value={candForm.workPreference} onChange={handleCandidateChange}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Current Location</label>
            <input name="currentLocation" value={candForm.currentLocation} onChange={handleCandidateChange}
              placeholder="San Francisco, CA" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Preferred Location</label>
            <input name="preferredLocation" value={candForm.preferredLocation} onChange={handleCandidateChange}
              placeholder="Remote / NYC" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>LinkedIn Profile</label>
            <input name="linkedin" value={candForm.linkedin} onChange={handleCandidateChange}
              placeholder="linkedin.com/in/johndoe" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>GitHub Profile</label>
            <input name="github" value={candForm.github} onChange={handleCandidateChange}
              placeholder="github.com/johndoe" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setStep(1)}
            className="flex-1 py-3 text-sm font-semibold rounded-xl transition-all hover:opacity-90"
            style={{ border: "1px solid #e5e5e5", color: "#0a0a0c" }}>
            Back
          </button>
          <button type="submit"
            disabled={loading}
            className="flex-1 py-3 text-sm font-semibold rounded-xl transition-all hover:opacity-90"
            style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </>
    );
  };

  const renderRecruiterForm = () => {
    if (step === 1) {
      return (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Full Name *</label>
              <input name="name" value={recForm.name} onChange={handleRecruiterChange}
                placeholder="Jane Smith" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
                style={{ background: "white", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Age</label>
              <input name="age" value={recForm.age} onChange={handleRecruiterChange}
                placeholder="35" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
                style={{ background: "white", border: "1px solid #e5e5e5" }} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Phone Number *</label>
              <input name="phone" value={recForm.phone} onChange={handleRecruiterChange}
                placeholder="+1 555-0200" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
                style={{ background: "white", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Password *</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} value={recForm.password}
                  onChange={handleRecruiterChange} placeholder="Min 8 characters"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 pr-12"
                  style={{ background: "white", border: "1px solid #e5e5e5" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#6c6c6c" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Personal Email *</label>
              <input name="personalEmail" type="email" value={recForm.personalEmail} onChange={handleRecruiterChange}
                placeholder="jane@email.com" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
                style={{ background: "white", border: "1px solid #e5e5e5" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Company Email *</label>
              <input name="companyEmail" type="email" value={recForm.companyEmail} onChange={handleRecruiterChange}
                placeholder="jane@company.com" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
                style={{ background: "white", border: "1px solid #e5e5e5" }} />
            </div>
          </div>
          <button type="button" onClick={() => setStep(2)}
            className="w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
            Next Step <ChevronRight size={16} />
          </button>
        </>
      );
    }

    return (
      <>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Company Name *</label>
            <input name="companyName" value={recForm.companyName} onChange={handleRecruiterChange}
              placeholder="TechCorp Inc" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Company Website</label>
            <input name="companyWebsite" value={recForm.companyWebsite} onChange={handleRecruiterChange}
              placeholder="techcorp.com" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Company Address</label>
          <input name="companyAddress" value={recForm.companyAddress} onChange={handleRecruiterChange}
            placeholder="123 Market St, San Francisco, CA" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
            style={{ background: "white", border: "1px solid #e5e5e5" }} />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Industry Type</label>
            <select name="industry" value={recForm.industry} onChange={handleRecruiterChange}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }}>
              <option value="">Select</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Company Size</label>
            <select name="companySize" value={recForm.companySize} onChange={handleRecruiterChange}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }}>
              <option value="">Select</option>
              <option value="1-50">1-50</option>
              <option value="50-100">50-100</option>
              <option value="100-200">100-200</option>
              <option value="200-500">200-500</option>
              <option value="500-1000">500-1000</option>
              <option value="1000+">1000+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Your Role</label>
            <input name="role" value={recForm.role} onChange={handleRecruiterChange}
              placeholder="HR Manager" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Years of Experience</label>
            <input name="experience" value={recForm.experience} onChange={handleRecruiterChange}
              placeholder="8 years" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>LinkedIn Profile</label>
            <input name="linkedin" value={recForm.linkedin} onChange={handleRecruiterChange}
              placeholder="linkedin.com/in/janesmith" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#0a0a0c" }}>Company ID</label>
            <input name="companyId" value={recForm.companyId} onChange={handleRecruiterChange}
              placeholder="TCI-2024-001" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: "white", border: "1px solid #e5e5e5" }} />
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: "#f4f4f4" }}>
          <button type="button" onClick={() => setAcceptedTerms(!acceptedTerms)}
            className="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              borderColor: acceptedTerms ? "#0a0a0c" : "#d0d0d0",
              background: acceptedTerms ? "#0a0a0c" : "transparent",
            }}>
            {acceptedTerms && <Check size={12} style={{ color: "#f2f0e6" }} />}
          </button>
          <p className="text-xs" style={{ color: "#6c6c6c" }}>
            I accept the Terms and Conditions and confirm that all provided
            information is accurate. I understand my account will be reviewed by
            the Skillora team before approval.
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setStep(1)}
            className="flex-1 py-3 text-sm font-semibold rounded-xl transition-all hover:opacity-90"
            style={{ border: "1px solid #e5e5e5", color: "#0a0a0c" }}>
            Back
          </button>
          <button type="submit"
            disabled={loading}
            className="flex-1 py-3 text-sm font-semibold rounded-xl transition-all hover:opacity-90"
            style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
            {loading ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f2f0e6" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: "#0a0a0c" }}>
        <div className="absolute inset-0 opacity-30">
          <div className="dot-layer layer-1" />
          <div className="dot-layer layer-2" />
        </div>
        <div className="relative z-10">
          <button onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm mb-12 transition-opacity hover:opacity-70" style={{ color: "#c3c0b4" }}>
            <ArrowLeft size={16} />
            Back to Home
          </button>
          <h1 className="font-serif-display text-5xl xl:text-6xl font-bold mb-6" style={{ color: "#f2f0e6" }}>
            Join
            <br />
            Skillora.
          </h1>
          <p className="text-lg max-w-sm" style={{ color: "#c3c0b4" }}>
            Create your account and start your journey with AI-powered recruitment.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-xs" style={{ color: "#6c6c6c" }}>&copy; 2026 Skillora. AI-Powered Recruitment.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="lg:hidden mb-8">
            <button onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm mb-6 transition-opacity hover:opacity-70" style={{ color: "#6c6c6c" }}>
              <ArrowLeft size={16} />
              Back to Home
            </button>
            <h1 className="font-serif-display text-3xl font-bold" style={{ color: "#0a0a0c" }}>
              Join Skillora.
            </h1>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "#0a0a0c" }}>Sign Up</h2>
          <p className="text-sm mb-6" style={{ color: "#6c6c6c" }}>
            Choose your role and fill in your details
          </p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map((r) => (
              <button key={r.key} onClick={() => { setRole(r.key); setStep(1); }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200"
                style={{
                  background: role === r.key ? "#0a0a0c" : "white",
                  color: role === r.key ? "#f2f0e6" : "#6c6c6c",
                  border: role === r.key ? "2px solid #0a0a0c" : "2px solid #e5e5e5",
                  boxShadow: role === r.key ? "rgba(0,0,0,0.15) 0px 4px 12px" : "none",
                }}>
                {r.icon}
                <span className="text-xs font-medium">{r.label}</span>
              </button>
            ))}
          </div>

          {/* Step indicator for multi-step forms */}
          {(role === "candidate" || role === "recruiter") && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 1 ? "" : ""}`}
                  style={{ background: step >= 1 ? "#0a0a0c" : "#e5e5e5", color: step >= 1 ? "#f2f0e6" : "#6c6c6c" }}>
                  1
                </div>
                <span className="text-xs font-medium" style={{ color: step >= 1 ? "#0a0a0c" : "#6c6c6c" }}>
                  {role === "candidate" ? "Basic Info" : "Personal Details"}
                </span>
              </div>
              <div className="flex-1 h-px" style={{ background: step >= 2 ? "#0a0a0c" : "#e5e5e5" }} />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: step >= 2 ? "#0a0a0c" : "#e5e5e5", color: step >= 2 ? "#f2f0e6" : "#6c6c6c" }}>
                  2
                </div>
                <span className="text-xs font-medium" style={{ color: step >= 2 ? "#0a0a0c" : "#6c6c6c" }}>
                  {role === "candidate" ? "Education & Skills" : "Company Details"}
                </span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm mb-4 p-3 rounded-lg" style={{ background: "#f8d7da", color: "#721c24" }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === "candidate" && renderCandidateForm()}
            {role === "recruiter" && renderRecruiterForm()}
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "#6c6c6c" }}>
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="font-semibold underline" style={{ color: "#0a0a0c" }}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
