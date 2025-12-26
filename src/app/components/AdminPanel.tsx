import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { LogOut, Users, TrendingUp, Coins, Activity, Shield, AlertCircle } from "lucide-react";
import { toast, Toaster } from "sonner";
import * as api from "../services/api";

interface AdminPanelProps {
  user: {
    email: string;
    username: string;
    role: string;
  };
  authToken: string;
  onLogout: () => void;
}

export function AdminPanel({ user, authToken, onLogout }: AdminPanelProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [usersData, transactionsData, statsData] = await Promise.all([
        api.getAllUsers(authToken),
        api.getAllTransactions(authToken),
        api.getSystemStats(authToken),
      ]);

      setUsers(usersData);
      setTransactions(transactionsData);
      setSystemStats(statsData);
    } catch (error: any) {
      console.error("Failed to load admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      await api.updateUserStatus(authToken, userId, status);
      toast.success(`User ${status === "active" ? "activated" : "suspended"}`);
      await loadAdminData();
    } catch (error: any) {
      console.error("Failed to update user status:", error);
      toast.error("Failed to update user status");
    }
  };

  if (isLoading || !systemStats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading admin panel...</p>
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
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-400" />
              <h1 className="text-2xl bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
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
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-blue-600/30">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <Badge className="bg-blue-600">Live</Badge>
            </div>
            <div className="text-2xl text-blue-400">{systemStats.totalUsers}</div>
            <div className="text-sm text-slate-400">Total Users</div>
            <div className="text-xs text-emerald-400 mt-1">+{systemStats.newUsersToday} today</div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-emerald-600/30">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-600/20 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <Badge className="bg-emerald-600">Online</Badge>
            </div>
            <div className="text-2xl text-emerald-400">{systemStats.activeUsers}</div>
            <div className="text-sm text-slate-400">Active Users</div>
            <div className="text-xs text-slate-500 mt-1">{systemStats.averageSessionTime} avg session</div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-amber-600/30">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-600/20 rounded-lg">
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
              <Badge className="bg-amber-600">Total</Badge>
            </div>
            <div className="text-2xl text-amber-400">{systemStats.totalCryptoDistributed}</div>
            <div className="text-sm text-slate-400">Crypto Distributed</div>
            <div className="text-xs text-slate-500 mt-1">CRYSTAL Coins</div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-purple-600/30">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <Badge className="bg-purple-600">{systemStats.serverUptime}</Badge>
            </div>
            <div className="text-2xl text-purple-400">{systemStats.totalBattles}</div>
            <div className="text-sm text-slate-400">Total Battles</div>
            <div className="text-xs text-slate-500 mt-1">{systemStats.totalQuests} quests completed</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900">
            <TabsTrigger value="users">👥 Users</TabsTrigger>
            <TabsTrigger value="transactions">💰 Transactions</TabsTrigger>
            <TabsTrigger value="system">⚙️ System</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4">
            <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <h2 className="text-xl text-amber-400 mb-4">User Management ({users.length} users)</h2>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {users.map((u) => (
                    <Card key={u.id} className="p-4 bg-slate-800/50 border-slate-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg text-slate-200">{u.username}</h3>
                            <Badge className={u.status === "active" ? "bg-emerald-600" : "bg-red-600"}>
                              {u.status}
                            </Badge>
                            {u.role === "admin" && (
                              <Badge className="bg-purple-600">Admin</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">{u.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-400">Level {u.level}</div>
                          <div className="text-emerald-400">{u.crypto?.toFixed(4) || 0} CRYSTAL</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Last login: {new Date(u.lastLogin).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          {u.status === "active" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600/50 text-red-400 hover:bg-red-600/10"
                              onClick={() => handleUpdateUserStatus(u.id, "suspended")}
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10"
                              onClick={() => handleUpdateUserStatus(u.id, "active")}
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-4">
            <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <h2 className="text-xl text-emerald-400 mb-4">Recent Transactions ({transactions.length})</h2>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <Card key={tx.id} className="p-3 bg-slate-800/50 border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-emerald-400" />
                            <span className="text-slate-200">{tx.username}</span>
                          </div>
                          <div className="text-sm text-slate-400">{tx.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400">+{tx.amount?.toFixed(4)} CRYSTAL</div>
                          <div className="text-xs text-slate-500">
                            {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                <h2 className="text-xl text-purple-400 mb-4">System Health</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-slate-300">Server Status</span>
                    <Badge className="bg-emerald-600">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-slate-300">Database</span>
                    <Badge className="bg-emerald-600">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-slate-300">API Status</span>
                    <Badge className="bg-emerald-600">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-slate-300">Uptime</span>
                    <span className="text-emerald-400">{systemStats.serverUptime}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                <h2 className="text-xl text-amber-400 mb-4">Payment Integration</h2>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-900/20 rounded border border-blue-600/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-blue-400" />
                      <h3 className="text-blue-400">FaucetPay Integration</h3>
                    </div>
                    <p className="text-sm text-slate-400">
                      API endpoint ready for integration. Configure your FaucetPay API credentials in the environment variables.
                    </p>
                    <div className="mt-3 p-2 bg-slate-900 rounded">
                      <p className="text-xs text-slate-500 font-mono">
                        // API Integration Point<br/>
                        // POST /api/faucetpay/withdraw<br/>
                        // Headers: X-API-KEY
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-slate-300">Payment Gateway</span>
                    <Badge className="bg-amber-600">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-slate-300">Withdrawal Requests</span>
                    <span className="text-slate-400">0 pending</span>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 mt-4">
              <h2 className="text-xl text-red-400 mb-4">Database Schema Ready</h2>
              <div className="p-3 bg-slate-900/50 rounded">
                <p className="text-sm text-slate-400 mb-2">
                  The application is structured for easy backend integration:
                </p>
                <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
                  <li>User authentication and management endpoints</li>
                  <li>Character progression and inventory persistence</li>
                  <li>Transaction logging and crypto reward distribution</li>
                  <li>Quest and combat state management</li>
                  <li>FaucetPay API integration points</li>
                </ul>
                <div className="mt-3 p-2 bg-slate-800 rounded">
                  <p className="text-xs text-amber-400">
                    Note: Currently running with mock data. Connect to your backend API to enable full functionality.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}