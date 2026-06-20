import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { loginUser } from "../services/platformApi";
import { Eye, EyeOff, ArrowLeft, Building2, User, Shield } from "lucide-react";

type LoginRole = "admin" | "recruiter" | "candidate";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<LoginRole>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const result = await loginUser({ email, password, role });
      login(result.user.role, result.token, result.user);
      if (result.user.role === "admin") navigate("/admin");
      else if (result.user.role === "recruiter") navigate("/recruiter");
      else navigate("/candidate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const roles: { key: LoginRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: "candidate", label: "Candidate", icon: <User size={20} />, desc: "Find your dream job" },
    { key: "recruiter", label: "Recruiter", icon: <Building2 size={20} />, desc: "Hire top talent" },
    { key: "admin", label: "Admin", icon: <Shield size={20} />, desc: "Manage the platform" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#f2f0e6" }}>
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "#0a0a0c" }}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="dot-layer layer-1" />
          <div className="dot-layer layer-2" />
        </div>
        <div className="relative z-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm mb-12 transition-opacity hover:opacity-70"
            style={{ color: "#c3c0b4" }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
          <h1
            className="font-serif-display text-5xl xl:text-6xl font-bold mb-6"
            style={{ color: "#f2f0e6" }}
          >
            Welcome
            <br />
            back.
          </h1>
          <p className="text-lg max-w-sm" style={{ color: "#c3c0b4" }}>
            Sign in to access your personalized dashboard and continue your
            recruitment journey.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-xs" style={{ color: "#6c6c6c" }}>
            &copy; 2026 Skillora. AI-Powered Recruitment.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm mb-6 transition-opacity hover:opacity-70"
              style={{ color: "#6c6c6c" }}
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>
            <h1
              className="font-serif-display text-3xl font-bold"
              style={{ color: "#0a0a0c" }}
            >
              Welcome back.
            </h1>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "#0a0a0c" }}>
            Sign In
          </h2>
          <p className="text-sm mb-8" style={{ color: "#6c6c6c" }}>
            Choose your role and enter your credentials
          </p>

          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {roles.map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200"
                style={{
                  background: role === r.key ? "#0a0a0c" : "white",
                  color: role === r.key ? "#f2f0e6" : "#6c6c6c",
                  border:
                    role === r.key
                      ? "2px solid #0a0a0c"
                      : "2px solid #e5e5e5",
                  boxShadow:
                    role === r.key
                      ? "rgba(0,0,0,0.15) 0px 4px 12px"
                      : "none",
                }}
              >
                {r.icon}
                <span className="text-xs font-medium">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#0a0a0c" }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
                style={{
                  background: "white",
                  border: "1px solid #e5e5e5",
                  color: "#0a0a0c",
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#0a0a0c" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 pr-12"
                  style={{
                    background: "white",
                    border: "1px solid #e5e5e5",
                    color: "#0a0a0c",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#6c6c6c" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#e74c3c" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold rounded-xl transition-all hover:opacity-90"
              style={{ background: "#0a0a0c", color: "#f2f0e6" }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="text-center text-sm" style={{ color: "#6c6c6c" }}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-semibold underline"
                style={{ color: "#0a0a0c" }}
              >
                Sign Up
              </button>
            </p>

            <div
              className="mt-6 p-4 rounded-xl text-xs"
              style={{ background: "#f4f4f4", color: "#6c6c6c" }}
            >
              <p className="font-semibold mb-2" style={{ color: "#0a0a0c" }}>
                Seeded account examples:
              </p>
              <p>admin@skillora.com / AdminPass123!</p>
              <p>jane.smith@gmail.com / CandidatePass123!</p>
              <p>recruiter@company.com / SecurePassword123!</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
