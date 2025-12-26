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
import * as api from "../services/api";

interface UserDashboardProps {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  authToken: string;
  onLogout: () => void;
}

export function UserDashboard({ user, authToken, onLogout }: UserDashboardProps) {
  const [character, setCharacter] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [locations] = useState([
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

  // Load all game data on mount
  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      setIsLoading(true);
      const [charData, questsData, inventoryData, transactionsData] = await Promise.all([
        api.getCharacter(authToken),
        api.getQuests(authToken),
        api.getInventory(authToken),
        api.getTransactions(authToken),
      ]);

      setCharacter(charData);
      setQuests(questsData);
      setInventory(inventoryData);
      setTransactions(transactionsData);
      setCurrentLocation(charData.currentLocation || 1);
    } catch (error: any) {
      console.error("Failed to load game data:", error);
      toast.error("Failed to load game data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCombatEnd = async (rewards: any) => {
    if (rewards.exp > 0) {
      try {
        const result = await api.processCombatResult(authToken, {
          victory: true,
          rewards,
          damage: 0,
        });

        setCharacter(result.character);
        
        if (result.leveledUp) {
          toast.success(`Level Up! You are now level ${result.character.level}!`);
        }

        // Reload quests and transactions
        const [updatedQuests, updatedTransactions] = await Promise.all([
          api.getQuests(authToken),
          api.getTransactions(authToken),
        ]);
        setQuests(updatedQuests);
        setTransactions(updatedTransactions);
      } catch (error: any) {
        console.error("Combat processing failed:", error);
        toast.error("Failed to save combat results");
      }
    } else {
      // Handle defeat
      try {
        await api.processCombatResult(authToken, {
          victory: false,
          rewards: { exp: 0, gold: 0, crypto: 0 },
          damage: 0,
        });
        
        const updatedChar = await api.getCharacter(authToken);
        setCharacter(updatedChar);
        toast.error("Defeated in combat!");
      } catch (error: any) {
        console.error("Combat processing failed:", error);
      }
    }
  };

  const handleQuestClaim = async (questId: string) => {
    try {
      const result = await api.claimQuestReward(authToken, questId);
      
      setCharacter(result.character);
      
      if (result.rewards.leveledUp) {
        toast.success(`Level Up! You are now level ${result.character.level}!`);
      }

      // Reload quests and transactions
      const [updatedQuests, updatedTransactions] = await Promise.all([
        api.getQuests(authToken),
        api.getTransactions(authToken),
      ]);
      setQuests(updatedQuests);
      setTransactions(updatedTransactions);

      toast.success(`Quest completed!`);
    } catch (error: any) {
      console.error("Failed to claim quest:", error);
      toast.error(error.message || "Failed to claim quest reward");
    }
  };

  const handleEquip = async (itemId: string) => {
    try {
      await api.toggleItemEquip(authToken, itemId, true);
      const updatedInventory = await api.getInventory(authToken);
      setInventory(updatedInventory);
      toast.success("Item equipped!");
    } catch (error: any) {
      console.error("Failed to equip item:", error);
      toast.error("Failed to equip item");
    }
  };

  const handleUnequip = async (itemId: string) => {
    try {
      await api.toggleItemEquip(authToken, itemId, false);
      const updatedInventory = await api.getInventory(authToken);
      setInventory(updatedInventory);
      toast.success("Item unequipped!");
    } catch (error: any) {
      console.error("Failed to unequip item:", error);
      toast.error("Failed to unequip item");
    }
  };

  const handleTravel = async (locationId: number) => {
    const location = locations.find((l) => l.id === locationId);
    if (!location) return;

    try {
      const result = await api.travel(authToken, locationId);
      setCharacter(result.character);
      setCurrentLocation(locationId);
      toast.success(`Traveled to ${location.name}`);

      // Reload quests in case exploration quest updated
      const updatedQuests = await api.getQuests(authToken);
      setQuests(updatedQuests);
    } catch (error: any) {
      console.error("Failed to travel:", error);
      toast.error("Failed to travel");
    }
  };

  if (isLoading || !character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your adventure...</p>
        </div>
      </div>
    );
  }

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