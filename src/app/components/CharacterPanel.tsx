import { Progress } from "./ui/progress";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Coins, Sparkles, Shield, Sword, Heart, Zap } from "lucide-react";

interface CharacterPanelProps {
  character: {
    name: string;
    level: number;
    class: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    exp: number;
    expToNext: number;
    attack: number;
    defense: number;
    magic: number;
    gold: number;
    crypto: number;
  };
}

export function CharacterPanel({ character }: CharacterPanelProps) {
  const hpPercent = (character.hp / character.maxHp) * 100;
  const mpPercent = (character.mp / character.maxMp) * 100;
  const expPercent = (character.exp / character.expToNext) * 100;

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-amber-600/30">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {character.name}
            </h2>
            <p className="text-slate-400 text-sm">
              {character.class} • Level {character.level}
            </p>
          </div>
          <Badge className="bg-amber-600 hover:bg-amber-700">
            Lv. {character.level}
          </Badge>
        </div>

        {/* HP Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-red-400">
              <Heart className="w-4 h-4" />
              HP
            </span>
            <span className="text-slate-300">
              {character.hp} / {character.maxHp}
            </span>
          </div>
          <Progress value={hpPercent} className="h-2 bg-slate-700" />
        </div>

        {/* MP Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-blue-400">
              <Zap className="w-4 h-4" />
              MP
            </span>
            <span className="text-slate-300">
              {character.mp} / {character.maxMp}
            </span>
          </div>
          <Progress value={mpPercent} className="h-2 bg-slate-700" />
        </div>

        {/* EXP Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-400">EXP</span>
            <span className="text-slate-300">
              {character.exp} / {character.expToNext}
            </span>
          </div>
          <Progress value={expPercent} className="h-2 bg-slate-700" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-red-400">
              <Sword className="w-4 h-4" />
            </div>
            <div className="text-lg text-slate-200">{character.attack}</div>
            <div className="text-xs text-slate-400">ATK</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-lg text-slate-200">{character.defense}</div>
            <div className="text-xs text-slate-400">DEF</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-lg text-slate-200">{character.magic}</div>
            <div className="text-xs text-slate-400">MAG</div>
          </div>
        </div>

        {/* Currency */}
        <div className="pt-2 border-t border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-amber-400">
              <Coins className="w-4 h-4" />
              Gold
            </span>
            <span className="text-slate-200">{character.gold.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              Crystal Coins
            </span>
            <span className="text-slate-200">{character.crypto.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
