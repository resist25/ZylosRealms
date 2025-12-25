import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Wallet, TrendingUp, Award, ArrowUpRight } from "lucide-react";

interface Transaction {
  id: number;
  type: "reward" | "quest" | "combat";
  amount: number;
  description: string;
  timestamp: Date;
}

interface CryptoWalletProps {
  balance: number;
  transactions: Transaction[];
}

export function CryptoWallet({ balance, transactions }: CryptoWalletProps) {
  const totalEarned = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-emerald-600/30">
      <h2 className="text-emerald-400 flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5" />
        Crystal Wallet
      </h2>

      {/* Balance */}
      <div className="p-4 bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 rounded-lg border border-emerald-600/30 mb-4">
        <div className="text-sm text-slate-400 mb-1">Total Balance</div>
        <div className="text-3xl text-emerald-400 mb-2">
          {balance.toFixed(4)}
          <span className="text-sm text-slate-400 ml-2">CRYSTAL</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <TrendingUp className="w-3 h-3" />
          <span>+{totalEarned.toFixed(4)} Total Earned</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Transactions</div>
          <div className="text-xl text-slate-200">{transactions.length}</div>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Avg. Reward</div>
          <div className="text-xl text-slate-200">
            {transactions.length > 0
              ? (totalEarned / transactions.length).toFixed(4)
              : "0.0000"}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="mb-2">
        <h3 className="text-sm text-slate-400 mb-2">Recent Transactions</h3>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2 pr-4">
          {transactions.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">
              No transactions yet. Complete quests and battles to earn Crystal
              Coins!
            </p>
          ) : (
            transactions
              .slice()
              .reverse()
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1 rounded ${
                          transaction.type === "quest"
                            ? "bg-purple-900/30 text-purple-400"
                            : transaction.type === "combat"
                            ? "bg-red-900/30 text-red-400"
                            : "bg-emerald-900/30 text-emerald-400"
                        }`}
                      >
                        {transaction.type === "quest" ? (
                          <Award className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-slate-200">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-slate-500">
                          {transaction.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-emerald-400">
                      +{transaction.amount.toFixed(4)}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </ScrollArea>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-600/30">
        <p className="text-xs text-blue-400">
          💡 Crystal Coins are earned through combat victories and quest
          completions. The more challenging the task, the greater the reward!
        </p>
      </div>
    </Card>
  );
}
