import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Swords } from "lucide-react";

interface RegisterPageProps {
  onRegister: (email: string, password: string, username: string, characterClass: string) => void;
  onBack: () => void;
  onLoginClick: () => void;
}

export function RegisterPage({ onRegister, onBack, onLoginClick }: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [characterClass, setCharacterClass] = useState("warrior");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    onRegister(email, password, username, characterClass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-8 bg-gradient-to-br from-slate-900 to-slate-800 border-purple-600/30">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Swords className="w-10 h-10 text-purple-400" />
          <h1 className="text-3xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Create Hero
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">
              Character Name
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="DragonSlayer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-slate-800 border-slate-700"
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-slate-300">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-slate-800 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class" className="text-slate-300">
              Character Class
            </Label>
            <Select value={characterClass} onValueChange={setCharacterClass}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="warrior">⚔️ Warrior - High HP & Defense</SelectItem>
                <SelectItem value="mage">🔮 Mage - Powerful Magic & MP</SelectItem>
                <SelectItem value="rogue">🗡️ Rogue - Balanced & Fast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-slate-400 text-sm">
            Already have an account?{" "}
            <button
              onClick={onLoginClick}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Login here
            </button>
          </p>
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-slate-400 text-sm"
          >
            ← Back to home
          </button>
        </div>

        <div className="mt-6 p-3 bg-blue-900/20 rounded border border-blue-600/30">
          <p className="text-xs text-blue-400">
            Note: This is a demo app. Data is stored locally and not persisted.
          </p>
        </div>
      </Card>
    </div>
  );
}
