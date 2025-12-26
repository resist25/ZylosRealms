import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { UserDashboard } from "./components/UserDashboard";
import { AdminPanel } from "./components/AdminPanel";
import { toast } from "sonner";
import * as api from "./services/api";

type Page = "landing" | "login" | "register" | "game" | "admin";

interface User {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await api.getSession(token);
          setCurrentUser(response.user);
          setAuthToken(token);
          
          // Route based on role
          if (response.user.role === "admin") {
            setCurrentPage("admin");
          } else {
            setCurrentPage("game");
          }
        } catch (error) {
          // Invalid session, clear it
          localStorage.removeItem("authToken");
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  // Authentication handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        username: response.user.username,
        role: response.user.role,
      };
      
      setCurrentUser(user);
      setAuthToken(response.token);
      localStorage.setItem("authToken", response.token);
      
      // Route based on role
      if (response.user.role === "admin") {
        setCurrentPage("admin");
        toast.success(`Welcome back, Admin!`);
      } else {
        setCurrentPage("game");
        toast.success(`Welcome back, ${response.user.username}!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    username: string,
    characterClass: string
  ) => {
    try {
      const response = await api.register({
        email,
        password,
        username,
        characterClass,
      });

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        username: response.user.username,
        role: response.user.role,
      };

      setCurrentUser(user);
      setAuthToken(response.token);
      localStorage.setItem("authToken", response.token);
      setCurrentPage("game");
      toast.success(`Welcome to Crystal Realms, ${username}!`);
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await api.logout(authToken);
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem("authToken");
    setCurrentPage("landing");
    toast.success("Logged out successfully");
  };

  // Page navigation
  const goToLogin = () => setCurrentPage("login");
  const goToRegister = () => setCurrentPage("register");
  const goToLanding = () => setCurrentPage("landing");

  // Show loading while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Crystal Realms...</p>
        </div>
      </div>
    );
  }

  // Render current page
  if (currentPage === "landing") {
    return <LandingPage onLogin={goToLogin} onRegister={goToRegister} />;
  }

  if (currentPage === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBack={goToLanding}
        onRegisterClick={goToRegister}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onBack={goToLanding}
        onLoginClick={goToLogin}
      />
    );
  }

  if (currentPage === "admin" && currentUser && authToken) {
    return <AdminPanel user={currentUser} authToken={authToken} onLogout={handleLogout} />;
  }

  if (currentPage === "game" && currentUser && authToken) {
    return <UserDashboard user={currentUser} authToken={authToken} onLogout={handleLogout} />;
  }

  // Fallback
  return <LandingPage onLogin={goToLogin} onRegister={goToRegister} />;
}