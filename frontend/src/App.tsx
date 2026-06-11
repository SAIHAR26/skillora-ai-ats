import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminDashboard from "./pages/AdminDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";

export type UserRole = "admin" | "recruiter" | "candidate" | null;

interface AuthContextType {
  role: UserRole;
  isLoggedIn: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  role: null,
  isLoggedIn: false,
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
  const [role, setRole] = useState<UserRole>(() => {
    const stored = localStorage.getItem("skillora_role");
    return (stored as UserRole) || null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("skillora_logged_in") === "true";
  });

  useEffect(() => {
    localStorage.setItem("skillora_role", role || "");
    localStorage.setItem("skillora_logged_in", String(isLoggedIn));
  }, [role, isLoggedIn]);

  const login = (newRole: UserRole) => {
    setRole(newRole);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setRole(null);
    setIsLoggedIn(false);
    localStorage.removeItem("skillora_role");
    localStorage.removeItem("skillora_logged_in");
  };

  return (
    <AuthContext.Provider value={{ role, isLoggedIn, login, logout }}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
