import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Sword, Shield, Sparkles, Skull, TrendingUp } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldReward: number;
  cryptoReward: number;
}

interface CombatPanelProps {
  playerStats: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
    magic: number;
  };
  onCombatEnd: (rewards: {
    exp: number;
    gold: number;
    crypto: number;
    damage: number;
  }) => void;
}

export function CombatPanel({ playerStats, onCombatEnd }: CombatPanelProps) {
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerHp, setPlayerHp] = useState(playerStats.hp);
  const [playerMp, setPlayerMp] = useState(playerStats.mp);

  const enemies: Enemy[] = [
    {
      name: "Shadow Goblin",
      hp: 45,
      maxHp: 45,
      attack: 12,
      defense: 5,
      expReward: 25,
      goldReward: 15,
      cryptoReward: 0.0002,
    },
    {
      name: "Crystal Slime",
      hp: 35,
      maxHp: 35,
      attack: 8,
      defense: 3,
      expReward: 20,
      goldReward: 12,
      cryptoReward: 0.0001,
    },
    {
      name: "Dark Knight",
      hp: 80,
      maxHp: 80,
      attack: 18,
      defense: 12,
      expReward: 50,
      goldReward: 35,
      cryptoReward: 0.0005,
    },
    {
      name: "Fire Elemental",
      hp: 60,
      maxHp: 60,
      attack: 20,
      defense: 4,
      expReward: 40,
      goldReward: 25,
      cryptoReward: 0.0003,
    },
  ];

  const startBattle = () => {
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    setEnemy({ ...randomEnemy });
    setCombatLog([`A wild ${randomEnemy.name} appears!`]);
    setPlayerHp(playerStats.hp);
    setPlayerMp(playerStats.mp);
    setIsPlayerTurn(true);
  };

  const addLog = (message: string) => {
    setCombatLog((prev) => [...prev, message]);
  };

  const playerAttack = () => {
    if (!enemy || !isPlayerTurn) return;

    const damage = Math.max(
      1,
      playerStats.attack - enemy.defense + Math.floor(Math.random() * 10)
    );
    const newEnemyHp = Math.max(0, enemy.hp - damage);

    addLog(`You attack for ${damage} damage!`);
    setEnemy({ ...enemy, hp: newEnemyHp });

    if (newEnemyHp <= 0) {
      addLog(`Victory! ${enemy.name} defeated!`);
      addLog(
        `Gained ${enemy.expReward} EXP, ${enemy.goldReward} Gold, ${enemy.cryptoReward.toFixed(4)} Crystal Coins!`
      );
      setTimeout(() => {
        onCombatEnd({
          exp: enemy.expReward,
          gold: enemy.goldReward,
          crypto: enemy.cryptoReward,
          damage: playerStats.maxHp - playerHp,
        });
        setEnemy(null);
        setCombatLog([]);
      }, 2000);
    } else {
      setIsPlayerTurn(false);
      setTimeout(enemyAttack, 1000);
    }
  };

  const playerMagic = () => {
    if (!enemy || !isPlayerTurn || playerMp < 10) return;

    const damage = Math.max(
      1,
      playerStats.magic * 2 - enemy.defense + Math.floor(Math.random() * 15)
    );
    const newEnemyHp = Math.max(0, enemy.hp - damage);

    addLog(`You cast Fireball for ${damage} damage!`);
    setEnemy({ ...enemy, hp: newEnemyHp });
    setPlayerMp(playerMp - 10);

    if (newEnemyHp <= 0) {
      addLog(`Victory! ${enemy.name} defeated!`);
      addLog(
        `Gained ${enemy.expReward} EXP, ${enemy.goldReward} Gold, ${enemy.cryptoReward.toFixed(4)} Crystal Coins!`
      );
      setTimeout(() => {
        onCombatEnd({
          exp: enemy.expReward,
          gold: enemy.goldReward,
          crypto: enemy.cryptoReward,
          damage: playerStats.maxHp - playerHp,
        });
        setEnemy(null);
        setCombatLog([]);
      }, 2000);
    } else {
      setIsPlayerTurn(false);
      setTimeout(enemyAttack, 1000);
    }
  };

  const enemyAttack = () => {
    if (!enemy) return;

    const damage = Math.max(
      1,
      enemy.attack - playerStats.defense + Math.floor(Math.random() * 8)
    );
    const newPlayerHp = Math.max(0, playerHp - damage);

    addLog(`${enemy.name} attacks for ${damage} damage!`);
    setPlayerHp(newPlayerHp);

    if (newPlayerHp <= 0) {
      addLog("You have been defeated...");
      setTimeout(() => {
        onCombatEnd({ exp: 0, gold: 0, crypto: 0, damage: damage });
        setEnemy(null);
        setCombatLog([]);
      }, 2000);
    } else {
      setIsPlayerTurn(true);
    }
  };

  const playerDefend = () => {
    if (!enemy || !isPlayerTurn) return;

    addLog("You brace for impact!");
    setIsPlayerTurn(false);
    
    setTimeout(() => {
      const damage = Math.max(
        1,
        Math.floor((enemy.attack - playerStats.defense * 1.5 + Math.floor(Math.random() * 8)) / 2)
      );
      const newPlayerHp = Math.max(0, playerHp - damage);
      addLog(`${enemy.name} attacks for ${damage} damage! (Reduced by defense)`);
      setPlayerHp(newPlayerHp);

      if (newPlayerHp <= 0) {
        addLog("You have been defeated...");
        setTimeout(() => {
          onCombatEnd({ exp: 0, gold: 0, crypto: 0, damage: damage });
          setEnemy(null);
          setCombatLog([]);
        }, 2000);
      } else {
        setIsPlayerTurn(true);
      }
    }, 1000);
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-red-600/30">
      <h2 className="text-red-400 flex items-center gap-2 mb-4">
        <Sword className="w-5 h-5" />
        Combat Arena
      </h2>

      {!enemy ? (
        <div className="space-y-4">
          <p className="text-slate-300 text-center py-8">
            The realm awaits your courage, brave adventurer.
          </p>
          <Button
            onClick={startBattle}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Skull className="w-4 h-4 mr-2" />
            Begin Battle
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Enemy Status */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-red-600/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400">{enemy.name}</span>
              <span className="text-slate-300 text-sm">
                Lv. {Math.floor(enemy.maxHp / 20) + 1}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">HP</span>
                <span className="text-slate-300">
                  {enemy.hp} / {enemy.maxHp}
                </span>
              </div>
              <Progress
                value={(enemy.hp / enemy.maxHp) * 100}
                className="h-2 bg-slate-700"
              />
            </div>
          </div>

          {/* Player Status in Combat */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-blue-600/30">
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">Your HP</span>
                  <span className="text-slate-300">
                    {playerHp} / {playerStats.maxHp}
                  </span>
                </div>
                <Progress
                  value={(playerHp / playerStats.maxHp) * 100}
                  className="h-2 bg-slate-700"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-400">Your MP</span>
                  <span className="text-slate-300">
                    {playerMp} / {playerStats.maxMp}
                  </span>
                </div>
                <Progress
                  value={(playerMp / playerStats.maxMp) * 100}
                  className="h-2 bg-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Combat Log */}
          <ScrollArea className="h-32 rounded-md border border-slate-700 p-3 bg-black/30">
            {combatLog.map((log, index) => (
              <p key={index} className="text-sm text-slate-300 mb-1">
                {log}
              </p>
            ))}
          </ScrollArea>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={playerAttack}
              disabled={!isPlayerTurn}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <Sword className="w-4 h-4 mr-1" />
              Attack
            </Button>
            <Button
              onClick={playerMagic}
              disabled={!isPlayerTurn || playerMp < 10}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Magic
            </Button>
            <Button
              onClick={playerDefend}
              disabled={!isPlayerTurn}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Shield className="w-4 h-4 mr-1" />
              Defend
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
