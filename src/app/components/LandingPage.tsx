import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Swords, Shield, Coins, TrendingUp, Users, Zap } from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-950" />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-6 mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Swords className="w-12 h-12 md:w-16 md:h-16 text-amber-400" />
              <h1 className="text-4xl md:text-6xl bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Crystal Realms
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
              Embark on an epic text-based adventure and earn real crypto rewards
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                onClick={onRegister}
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-lg px-8"
              >
                Start Your Journey
              </Button>
              <Button
                onClick={onLogin}
                size="lg"
                variant="outline"
                className="border-amber-600/50 text-amber-400 hover:bg-amber-600/10 text-lg px-8"
              >
                Login
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-amber-600/30 hover:border-amber-600/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-600/20 rounded-lg">
                  <Swords className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl text-amber-400">Epic Combat</h3>
              </div>
              <p className="text-slate-400">
                Engage in turn-based battles against fearsome monsters. Use strategy to defeat powerful enemies and claim victory.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-purple-600/30 hover:border-purple-600/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl text-purple-400">Quests & Loot</h3>
              </div>
              <p className="text-slate-400">
                Complete challenging quests to earn powerful equipment. Discover rare and legendary items to enhance your character.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-emerald-600/30 hover:border-emerald-600/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-600/20 rounded-lg">
                  <Coins className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl text-emerald-400">Crypto Rewards</h3>
              </div>
              <p className="text-slate-400">
                Earn Crystal Coins as you play! Every battle won and quest completed rewards you with real cryptocurrency.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl text-center mb-12 bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-2xl">
              1
            </div>
            <h3 className="text-lg mb-2 text-amber-400">Create Account</h3>
            <p className="text-slate-400 text-sm">Sign up and create your character</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-2xl">
              2
            </div>
            <h3 className="text-lg mb-2 text-purple-400">Fight & Explore</h3>
            <p className="text-slate-400 text-sm">Battle monsters and complete quests</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-full flex items-center justify-center text-2xl">
              3
            </div>
            <h3 className="text-lg mb-2 text-cyan-400">Level Up</h3>
            <p className="text-slate-400 text-sm">Grow stronger with each victory</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-2xl">
              4
            </div>
            <h3 className="text-lg mb-2 text-emerald-400">Earn Crypto</h3>
            <p className="text-slate-400 text-sm">Collect and withdraw your rewards</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-amber-900/20 via-purple-900/20 to-cyan-900/20 border-y border-slate-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-amber-400" />
                <div className="text-3xl text-amber-400">1,247</div>
              </div>
              <div className="text-slate-400 text-sm">Active Players</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Swords className="w-5 h-5 text-purple-400" />
                <div className="text-3xl text-purple-400">45.2K</div>
              </div>
              <div className="text-slate-400 text-sm">Battles Won</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <div className="text-3xl text-cyan-400">12.8K</div>
              </div>
              <div className="text-slate-400 text-sm">Quests Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div className="text-3xl text-emerald-400">2.45</div>
              </div>
              <div className="text-slate-400 text-sm">Crypto Distributed</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="p-8 md:p-12 bg-gradient-to-br from-amber-900/20 to-purple-900/20 border-amber-600/30 text-center">
          <h2 className="text-3xl md:text-4xl mb-4 bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
            Ready to Begin Your Adventure?
          </h2>
          <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of players earning crypto while playing the most exciting text-based MMORPG.
          </p>
          <Button
            onClick={onRegister}
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700 text-lg px-8"
          >
            Create Free Account
          </Button>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2025 Crystal Realms. Play responsibly.</p>
          <p className="mt-2">This is a demonstration app with mock crypto integration.</p>
        </div>
      </div>
    </div>
  );
}
