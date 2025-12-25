import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Swords } from "lucide-react";

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onBack: () => void;
  onRegisterClick: () => void;
}

export function LoginPage({ onLogin, onBack, onRegisterClick }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 bg-gradient-to-br from-slate-900 to-slate-800 border-amber-600/30">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Swords className="w-10 h-10 text-amber-400" />
          <h1 className="text-3xl bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="hero@crystalrealms.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-800 border-slate-700"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-800 border-slate-700"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            Login
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-slate-400 text-sm">
            Don't have an account?{" "}
            <button
              onClick={onRegisterClick}
              className="text-amber-400 hover:text-amber-300 underline"
            >
              Register here
            </button>
          </p>
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-slate-400 text-sm"
          >
            ← Back to home
          </button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-3 bg-blue-900/20 rounded border border-blue-600/30">
          <p className="text-xs text-blue-400 mb-2">Demo Credentials:</p>
          <p className="text-xs text-slate-400">Email: demo@crystalrealms.com</p>
          <p className="text-xs text-slate-400">Password: demo123</p>
          <p className="text-xs text-slate-400 mt-2">Admin: admin@crystalrealms.com / admin123</p>
        </div>
      </Card>
    </div>
  );
}
