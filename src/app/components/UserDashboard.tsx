import { useState, useEffect } from "react";
import { CharacterPanel } from "./CharacterPanel";
import { CombatPanel } from "./CombatPanel";
import { QuestPanel } from "./QuestPanel";
import { InventoryPanel } from "./InventoryPanel";
import { ExplorationPanel } from "./ExplorationPanel";
import { CryptoWallet } from "./CryptoWallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";
import { toast, Toaster } from "sonner";

interface UserDashboardProps {
  user: {
    email: string;
    username: string;
    role: string;
  };
  onLogout: () => void;
}

export function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [character, setCharacter] = useState({
    name: user.username,
    level: 1,
    class: "Warrior",
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    exp: 0,
    expToNext: 100,
    attack: 15,
    defense: 10,
    magic: 8,
    gold: 100,
    crypto: 0,
  });

  const [quests, setQuests] = useState([
    {
      id: 1,
      title: "First Blood",
      description: "Defeat 3 enemies in combat",
      type: "combat" as const,
      progress: 0,
      required: 3,
      expReward: 50,
      goldReward: 30,
      cryptoReward: 0.001,
      completed: false,
    },
    {
      id: 2,
      title: "Explorer's Journey",
      description: "Visit all available locations",
      type: "exploration" as const,
      progress: 1,
      required: 3,
      expReward: 75,
      goldReward: 50,
      cryptoReward: 0.0015,
      completed: false,
    },
  ]);

  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: "Iron Sword",
      type: "weapon" as const,
      rarity: "common" as const,
      equipped: true,
      stats: { attack: 5 },
    },
    {
      id: 2,
      name: "Leather Armor",
      type: "armor" as const,
      rarity: "common" as const,
      equipped: true,
      stats: { defense: 5, hp: 20 },
    },
  ]);

  const [locations, setLocations] = useState([
    {
      id: 1,
      name: "Crystal Plains",
      description: "A vast grassland shimmering with magical crystals",
      level: 1,
      unlocked: true,
    },
    {
      id: 2,
      name: "Shadowfen Marsh",
      description: "Dark swamps inhabited by dangerous creatures",
      level: 5,
      unlocked: true,
    },
    {
      id: 3,
      name: "Emberstone Volcano",
      description: "A fiery mountain filled with fire elementals",
      level: 10,
      unlocked: true,
    },
  ]);

  const [currentLocation, setCurrentLocation] = useState(1);
  const [transactions, setTransactions] = useState<any[]>([]);

  const handleCombatEnd = (rewards: any) => {
    if (rewards.exp > 0) {
      let newExp = character.exp + rewards.exp;
      let newLevel = character.level;
      let newExpToNext = character.expToNext;

      while (newExp >= newExpToNext) {
        newExp -= newExpToNext;
        newLevel += 1;
        newExpToNext = Math.floor(newExpToNext * 1.5);
        toast.success(`Level Up! You are now level ${newLevel}!`);
      }

      setCharacter((prev) => ({
        ...prev,
        exp: newExp,
        level: newLevel,
        expToNext: newExpToNext,
        gold: prev.gold + rewards.gold,
        crypto: prev.crypto + rewards.crypto,
        hp: Math.min(prev.hp, prev.maxHp),
      }));

      setTransactions((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: "combat",
          amount: rewards.crypto,
          description: "Combat Victory",
          timestamp: new Date(),
        },
      ]);

      setQuests((prevQuests) =>
        prevQuests.map((quest) => {
          if (quest.id === 1 && quest.progress < quest.required) {
            const newProgress = quest.progress + 1;
            return {
              ...quest,
              progress: newProgress,
              completed: newProgress >= quest.required,
            };
          }
          return quest;
        })
      );
    } else {
      setCharacter((prev) => ({
        ...prev,
        hp: Math.floor(prev.maxHp * 0.5),
        mp: Math.floor(prev.maxMp * 0.5),
      }));
      toast.error("Defeated in combat!");
    }
  };

  const handleQuestClaim = (questId: number) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || !quest.completed) return;

    let newExp = character.exp + quest.expReward;
    let newLevel = character.level;
    let newExpToNext = character.expToNext;

    while (newExp >= newExpToNext) {
      newExp -= newExpToNext;
      newLevel += 1;
      newExpToNext = Math.floor(newExpToNext * 1.5);
      toast.success(`Level Up! You are now level ${newLevel}!`);
    }

    setCharacter((prev) => ({
      ...prev,
      exp: newExp,
      level: newLevel,
      expToNext: newExpToNext,
      gold: prev.gold + quest.goldReward,
      crypto: prev.crypto + quest.cryptoReward,
    }));

    setQuests((prevQuests) =>
      prevQuests.map((q) =>
        q.id === questId ? { ...q, progress: q.required + 1 } : q
      )
    );

    setTransactions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: "quest",
        amount: quest.cryptoReward,
        description: quest.title,
        timestamp: new Date(),
      },
    ]);

    toast.success(`Quest completed: ${quest.title}`);
  };

  const handleEquip = (itemId: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedInventory = prev.map((i) =>
            i.type === item.type && i.id !== itemId ? { ...i, equipped: false } : i
          );
          return { ...item, equipped: true };
        }
        return item;
      })
    );
    toast.success("Item equipped!");
  };

  const handleUnequip = (itemId: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, equipped: false } : item
      )
    );
    toast.success("Item unequipped!");
  };

  const handleTravel = (locationId: number) => {
    const location = locations.find((l) => l.id === locationId);
    if (!location) return;

    setCurrentLocation(locationId);
    toast.success(`Traveled to ${location.name}`);

    setCharacter((prev) => ({
      ...prev,
      hp: prev.maxHp,
      mp: prev.maxMp,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Toaster position="top-center" theme="dark" />

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Crystal Realms
            </h1>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-red-600/50 text-red-400 hover:bg-red-600/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Character */}
          <div className="space-y-6">
            <CharacterPanel character={character} />
            <CryptoWallet balance={character.crypto} transactions={transactions} />
          </div>

          {/* Middle Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="combat" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-900">
                <TabsTrigger value="combat">⚔️ Combat</TabsTrigger>
                <TabsTrigger value="quests">📜 Quests</TabsTrigger>
                <TabsTrigger value="inventory">🎒 Inventory</TabsTrigger>
                <TabsTrigger value="map">🗺️ Map</TabsTrigger>
              </TabsList>

              <TabsContent value="combat" className="mt-4">
                <CombatPanel
                  playerStats={{
                    hp: character.hp,
                    maxHp: character.maxHp,
                    mp: character.mp,
                    maxMp: character.maxMp,
                    attack: character.attack,
                    defense: character.defense,
                    magic: character.magic,
                  }}
                  onCombatEnd={handleCombatEnd}
                />
              </TabsContent>

              <TabsContent value="quests" className="mt-4">
                <QuestPanel quests={quests} onClaimReward={handleQuestClaim} />
              </TabsContent>

              <TabsContent value="inventory" className="mt-4">
                <InventoryPanel
                  inventory={inventory}
                  onEquip={handleEquip}
                  onUnequip={handleUnequip}
                />
              </TabsContent>

              <TabsContent value="map" className="mt-4">
                <ExplorationPanel
                  currentLocation={currentLocation}
                  locations={locations}
                  onTravel={handleTravel}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
