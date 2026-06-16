import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminDashboard from "./pages/AdminDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import { fetchPlatformSnapshot } from "./services/platformApi";
import type { AuthUser } from "./services/platformApi";

export type UserRole = "admin" | "recruiter" | "candidate" | null;

interface AuthContextType {
  role: UserRole;
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (role: UserRole, token?: string, user?: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  role: null,
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: UserRole;
}) {
  const { role, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role !== allowedRole) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup/:role" element={<SignupPage />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/*"
        element={
          <ProtectedRoute allowedRole="recruiter">
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/*"
        element={
          <ProtectedRoute allowedRole="candidate">
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  const [dataReady, setDataReady] = useState(false);
  const [dataError, setDataError] = useState("");
  const [role, setRole] = useState<UserRole>(() => {
    const stored = localStorage.getItem("skillora_role");
    return (stored as UserRole) || null;
  });
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("skillora_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("skillora_logged_in") === "true";
  });

  useEffect(() => {
    localStorage.setItem("skillora_role", role || "");
    localStorage.setItem("skillora_logged_in", String(isLoggedIn));
    if (user) localStorage.setItem("skillora_user", JSON.stringify(user));
    else localStorage.removeItem("skillora_user");
  }, [role, isLoggedIn, user]);

  useEffect(() => {
    let cancelled = false;
    fetchPlatformSnapshot()
      .then(() => {
        if (!cancelled) setDataReady(true);
      })
      .catch((error) => {
        if (!cancelled) {
          setDataError(error instanceof Error ? error.message : "Could not load platform data");
          setDataReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = (newRole: UserRole, token?: string, nextUser?: AuthUser) => {
    setRole(newRole);
    setIsLoggedIn(true);
    if (token) localStorage.setItem("skillora_token", token);
    if (nextUser) setUser(nextUser);
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("skillora_role");
    localStorage.removeItem("skillora_logged_in");
    localStorage.removeItem("skillora_token");
    localStorage.removeItem("skillora_user");
  };

  if (!dataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f2f0e6", color: "#0a0a0c" }}>
        <p className="text-sm font-medium">Loading Skillora data...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ role, isLoggedIn, user, login, logout }}>
      {dataError && (
        <div className="fixed bottom-3 right-3 z-50 rounded-lg px-4 py-2 text-xs shadow" style={{ background: "#fff3cd", color: "#856404" }}>
          Backend data unavailable: {dataError}
        </div>
      )}
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
