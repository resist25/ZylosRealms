import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { UserDashboard } from "./components/UserDashboard";
import { AdminPanel } from "./components/AdminPanel";
import { toast } from "sonner";

type Page = "landing" | "login" | "register" | "game" | "admin";

interface User {
  email: string;
  username: string;
  role: "user" | "admin";
}

// Mock user database (in production, this would be handled by backend API)
const MOCK_USERS = {
  "demo@crystalrealms.com": {
    password: "demo123",
    username: "DragonSlayer",
    role: "user" as const,
  },
  "admin@crystalrealms.com": {
    password: "admin123",
    username: "AdminLord",
    role: "admin" as const,
  },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Authentication handlers
  const handleLogin = (email: string, password: string) => {
    /*
     * Backend Integration Point:
     * Replace this mock authentication with API call:
     * 
     * const response = await fetch('/api/auth/login', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ email, password })
     * });
     * const { user, token } = await response.json();
     * localStorage.setItem('authToken', token);
     */

    const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
    
    if (mockUser && mockUser.password === password) {
      const user: User = {
        email,
        username: mockUser.username,
        role: mockUser.role,
      };
      
      setCurrentUser(user);
      
      // Route based on role
      if (mockUser.role === "admin") {
        setCurrentPage("admin");
        toast.success(`Welcome back, Admin!`);
      } else {
        setCurrentPage("game");
        toast.success(`Welcome back, ${mockUser.username}!`);
      }
    } else {
      toast.error("Invalid email or password");
    }
  };

  const handleRegister = (
    email: string,
    password: string,
    username: string,
    characterClass: string
  ) => {
    /*
     * Backend Integration Point:
     * Replace with API call:
     * 
     * const response = await fetch('/api/auth/register', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ email, password, username, characterClass })
     * });
     * const { user, token } = await response.json();
     * localStorage.setItem('authToken', token);
     */

    // Mock registration
    const user: User = {
      email,
      username,
      role: "user",
    };

    setCurrentUser(user);
    setCurrentPage("game");
    toast.success(`Welcome to Crystal Realms, ${username}!`);
  };

  const handleLogout = () => {
    /*
     * Backend Integration Point:
     * Add logout API call if needed:
     * 
     * await fetch('/api/auth/logout', {
     *   method: 'POST',
     *   headers: { 'Authorization': `Bearer ${token}` }
     * });
     * localStorage.removeItem('authToken');
     */

    setCurrentUser(null);
    setCurrentPage("landing");
    toast.success("Logged out successfully");
  };

  // Page navigation
  const goToLogin = () => setCurrentPage("login");
  const goToRegister = () => setCurrentPage("register");
  const goToLanding = () => setCurrentPage("landing");

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

  if (currentPage === "admin" && currentUser) {
    return <AdminPanel user={currentUser} onLogout={handleLogout} />;
  }

  if (currentPage === "game" && currentUser) {
    return <UserDashboard user={currentUser} onLogout={handleLogout} />;
  }

  // Fallback
  return <LandingPage onLogin={goToLogin} onRegister={goToRegister} />;
}
