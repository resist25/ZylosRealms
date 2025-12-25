import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Backpack, Sword, Shield, Shirt, Sparkles } from "lucide-react";

interface Item {
  id: number;
  name: string;
  type: "weapon" | "armor" | "accessory" | "consumable";
  rarity: "common" | "rare" | "epic" | "legendary";
  equipped: boolean;
  stats?: {
    attack?: number;
    defense?: number;
    magic?: number;
    hp?: number;
    mp?: number;
  };
}

interface InventoryPanelProps {
  inventory: Item[];
  onEquip: (itemId: number) => void;
  onUnequip: (itemId: number) => void;
}

export function InventoryPanel({
  inventory,
  onEquip,
  onUnequip,
}: InventoryPanelProps) {
  const rarityColors = {
    common: "text-slate-400 border-slate-600/50",
    rare: "text-blue-400 border-blue-600/50",
    epic: "text-purple-400 border-purple-600/50",
    legendary: "text-amber-400 border-amber-600/50",
  };

  const rarityBg = {
    common: "bg-slate-800/50",
    rare: "bg-blue-900/20",
    epic: "bg-purple-900/20",
    legendary: "bg-amber-900/20",
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "weapon":
        return <Sword className="w-4 h-4" />;
      case "armor":
        return <Shield className="w-4 h-4" />;
      case "accessory":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Backpack className="w-4 h-4" />;
    }
  };

  const equippedItems = inventory.filter((item) => item.equipped);
  const unequippedItems = inventory.filter((item) => !item.equipped);

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-emerald-600/30">
      <h2 className="text-emerald-400 flex items-center gap-2 mb-4">
        <Backpack className="w-5 h-5" />
        Inventory
      </h2>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="equipped">Equipped</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {inventory.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  Your inventory is empty. Defeat monsters to find loot!
                </p>
              ) : (
                inventory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border ${rarityBg[item.rarity]} ${rarityColors[item.rarity]}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getIcon(item.type)}
                        <div>
                          <h4 className="text-slate-200">{item.name}</h4>
                          <div className="flex gap-2 items-center">
                            <Badge
                              variant="outline"
                              className={`text-xs ${rarityColors[item.rarity]}`}
                            >
                              {item.rarity}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      {item.equipped && (
                        <Badge className="bg-emerald-600">Equipped</Badge>
                      )}
                    </div>

                    {item.stats && (
                      <div className="flex flex-wrap gap-2 mb-2 text-xs">
                        {item.stats.attack && (
                          <span className="text-red-400">
                            +{item.stats.attack} ATK
                          </span>
                        )}
                        {item.stats.defense && (
                          <span className="text-blue-400">
                            +{item.stats.defense} DEF
                          </span>
                        )}
                        {item.stats.magic && (
                          <span className="text-purple-400">
                            +{item.stats.magic} MAG
                          </span>
                        )}
                        {item.stats.hp && (
                          <span className="text-red-400">
                            +{item.stats.hp} HP
                          </span>
                        )}
                        {item.stats.mp && (
                          <span className="text-blue-400">
                            +{item.stats.mp} MP
                          </span>
                        )}
                      </div>
                    )}

                    {item.type !== "consumable" && (
                      <Button
                        onClick={() =>
                          item.equipped ? onUnequip(item.id) : onEquip(item.id)
                        }
                        size="sm"
                        variant={item.equipped ? "outline" : "default"}
                        className="w-full"
                      >
                        {item.equipped ? "Unequip" : "Equip"}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="equipped">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {equippedItems.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  No items equipped. Equip items to boost your stats!
                </p>
              ) : (
                equippedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border ${rarityBg[item.rarity]} ${rarityColors[item.rarity]}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getIcon(item.type)}
                        <div>
                          <h4 className="text-slate-200">{item.name}</h4>
                          <div className="flex gap-2 items-center">
                            <Badge
                              variant="outline"
                              className={`text-xs ${rarityColors[item.rarity]}`}
                            >
                              {item.rarity}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {item.stats && (
                      <div className="flex flex-wrap gap-2 mb-2 text-xs">
                        {item.stats.attack && (
                          <span className="text-red-400">
                            +{item.stats.attack} ATK
                          </span>
                        )}
                        {item.stats.defense && (
                          <span className="text-blue-400">
                            +{item.stats.defense} DEF
                          </span>
                        )}
                        {item.stats.magic && (
                          <span className="text-purple-400">
                            +{item.stats.magic} MAG
                          </span>
                        )}
                        {item.stats.hp && (
                          <span className="text-red-400">
                            +{item.stats.hp} HP
                          </span>
                        )}
                        {item.stats.mp && (
                          <span className="text-blue-400">
                            +{item.stats.mp} MP
                          </span>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={() => onUnequip(item.id)}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      Unequip
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
