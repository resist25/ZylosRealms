import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Scroll, CheckCircle, Circle, Award } from "lucide-react";

interface Quest {
  id: number;
  title: string;
  description: string;
  type: "combat" | "exploration" | "collection";
  progress: number;
  required: number;
  expReward: number;
  goldReward: number;
  cryptoReward: number;
  completed: boolean;
}

interface QuestPanelProps {
  quests: Quest[];
  onClaimReward: (questId: number) => void;
}

export function QuestPanel({ quests, onClaimReward }: QuestPanelProps) {
  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed && q.progress < q.required + 1);
  const claimedQuests = quests.filter((q) => q.completed && q.progress >= q.required + 1);

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-purple-600/30">
      <h2 className="text-purple-400 flex items-center gap-2 mb-4">
        <Scroll className="w-5 h-5" />
        Quest Log
      </h2>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {/* Active Quests */}
          {activeQuests.length > 0 && (
            <div>
              <h3 className="text-sm text-slate-400 mb-2">Active Quests</h3>
              {activeQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="mb-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Circle className="w-4 h-4 text-yellow-400" />
                        <h4 className="text-slate-200">{quest.title}</h4>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        {quest.description}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        quest.type === "combat"
                          ? "border-red-600/50 text-red-400"
                          : quest.type === "exploration"
                          ? "border-blue-600/50 text-blue-400"
                          : "border-green-600/50 text-green-400"
                      }
                    >
                      {quest.type}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-slate-300">
                        {quest.progress} / {quest.required}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
                        style={{
                          width: `${(quest.progress / quest.required) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>+{quest.expReward} EXP</span>
                      <span>+{quest.goldReward} Gold</span>
                      <span>+{quest.cryptoReward.toFixed(4)} Crystal</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Quests */}
          {completedQuests.length > 0 && (
            <div>
              <h3 className="text-sm text-slate-400 mb-2">
                Ready to Claim
              </h3>
              {completedQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="mb-3 p-3 bg-emerald-900/20 rounded-lg border border-emerald-600/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-slate-200">{quest.title}</h4>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        {quest.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-400 mb-3">
                    <span>+{quest.expReward} EXP</span>
                    <span>+{quest.goldReward} Gold</span>
                    <span>+{quest.cryptoReward.toFixed(4)} Crystal</span>
                  </div>
                  <Button
                    onClick={() => onClaimReward(quest.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    size="sm"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Claim Rewards
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Claimed Quests */}
          {claimedQuests.length > 0 && (
            <div>
              <h3 className="text-sm text-slate-400 mb-2">
                Completed
              </h3>
              {claimedQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="mb-2 p-2 bg-slate-800/30 rounded border border-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-500 line-through">
                      {quest.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {quests.length === 0 && (
            <p className="text-slate-400 text-center py-8">
              No quests available. Check back later!
            </p>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
