import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

// ============================================================================
// ADMIN USER MANAGEMENT
// ============================================================================

export async function getAllUsers(c: Context) {
  try {
    // Get all users by prefix
    const userKeys = await kv.getByPrefix("user:");
    const users = [];

    for (const key of userKeys) {
      // Skip email mapping keys
      if (key.startsWith("user:email:")) continue;
      
      const user = await kv.get(key);
      if (user && user.id) {
        // Get character data
        const character = await kv.get(`character:${user.id}`) || {};
        
        // Exclude sensitive data
        const { passwordHash, ...userData } = user;
        
        users.push({
          ...userData,
          level: character.level || 1,
          crypto: character.crypto || 0,
        });
      }
    }

    return c.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    return c.json({ error: "Failed to get users: " + error.message }, 500);
  }
}

export async function getUserById(c: Context) {
  try {
    const targetUserId = c.req.param("userId");
    
    const user = await kv.get(`user:${targetUserId}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const character = await kv.get(`character:${targetUserId}`);
    const quests = await kv.get(`quests:${targetUserId}`) || [];
    const inventory = await kv.get(`inventory:${targetUserId}`) || [];
    const transactions = await kv.get(`transactions:${targetUserId}`) || [];

    const { passwordHash, ...userData } = user;

    return c.json({
      user: userData,
      character,
      quests,
      inventory,
      transactions,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    return c.json({ error: "Failed to get user: " + error.message }, 500);
  }
}

export async function updateUserStatus(c: Context) {
  try {
    const targetUserId = c.req.param("userId");
    const { status } = await c.req.json();

    if (!["active", "suspended"].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    const user = await kv.get(`user:${targetUserId}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    user.status = status;
    await kv.set(`user:${targetUserId}`, user);

    const { passwordHash, ...userData } = user;
    return c.json(userData);
  } catch (error) {
    console.error("Update user status error:", error);
    return c.json({ error: "Failed to update status: " + error.message }, 500);
  }
}

export async function deleteUser(c: Context) {
  try {
    const targetUserId = c.req.param("userId");

    const user = await kv.get(`user:${targetUserId}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Delete all user data
    await kv.mdel([
      `user:${targetUserId}`,
      `user:email:${user.email}`,
      `character:${targetUserId}`,
      `quests:${targetUserId}`,
      `inventory:${targetUserId}`,
      `transactions:${targetUserId}`,
    ]);

    // Delete all sessions for this user
    const sessionKeys = await kv.getByPrefix("session:");
    for (const key of sessionKeys) {
      const session = await kv.get(key);
      if (session && session.userId === targetUserId) {
        await kv.del(key);
      }
    }

    return c.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json({ error: "Failed to delete user: " + error.message }, 500);
  }
}

// ============================================================================
// SYSTEM STATISTICS
// ============================================================================

export async function getSystemStats(c: Context) {
  try {
    // Get all users
    const userKeys = await kv.getByPrefix("user:");
    const users = [];
    
    for (const key of userKeys) {
      if (key.startsWith("user:email:")) continue;
      const user = await kv.get(key);
      if (user && user.id) {
        users.push(user);
      }
    }

    const totalUsers = users.length;
    
    // Count active users (logged in within last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = users.filter(u => 
      new Date(u.lastLogin) > sevenDaysAgo
    ).length;

    // Calculate total crypto distributed
    let totalCryptoDistributed = 0;
    let totalBattles = 0;
    let totalQuests = 0;

    for (const user of users) {
      const character = await kv.get(`character:${user.id}`);
      if (character) {
        totalCryptoDistributed += character.crypto || 0;
      }

      const transactions = await kv.get(`transactions:${user.id}`) || [];
      totalBattles += transactions.filter((t: any) => t.type === "combat").length;
      totalQuests += transactions.filter((t: any) => t.type === "quest").length;
    }

    // Count new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = users.filter(u => 
      new Date(u.createdAt) >= today
    ).length;

    return c.json({
      totalUsers,
      activeUsers,
      totalCryptoDistributed: parseFloat(totalCryptoDistributed.toFixed(4)),
      totalBattles,
      totalQuests,
      serverUptime: "99.8%",
      averageSessionTime: "45 min",
      newUsersToday,
    });
  } catch (error) {
    console.error("Get system stats error:", error);
    return c.json({ error: "Failed to get stats: " + error.message }, 500);
  }
}

export async function getAllTransactions(c: Context) {
  try {
    // Get all users
    const userKeys = await kv.getByPrefix("user:");
    const allTransactions = [];

    for (const key of userKeys) {
      if (key.startsWith("user:email:")) continue;
      
      const user = await kv.get(key);
      if (user && user.id) {
        const transactions = await kv.get(`transactions:${user.id}`) || [];
        
        // Add username to each transaction
        const transactionsWithUser = transactions.map((t: any) => ({
          ...t,
          username: user.username,
        }));
        
        allTransactions.push(...transactionsWithUser);
      }
    }

    // Sort by timestamp (most recent first)
    allTransactions.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return top 100 most recent
    return c.json(allTransactions.slice(0, 100));
  } catch (error) {
    console.error("Get all transactions error:", error);
    return c.json({ error: "Failed to get transactions: " + error.message }, 500);
  }
}

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

export async function grantCrypto(c: Context) {
  try {
    const targetUserId = c.req.param("userId");
    const { amount, reason } = await c.req.json();

    if (!amount || amount <= 0) {
      return c.json({ error: "Invalid amount" }, 400);
    }

    const character = await kv.get(`character:${targetUserId}`);
    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }

    character.crypto += amount;
    await kv.set(`character:${targetUserId}`, character);

    // Create transaction record
    const transactions = await kv.get(`transactions:${targetUserId}`) || [];
    transactions.push({
      id: crypto.randomUUID(),
      userId: targetUserId,
      type: "admin_grant",
      amount,
      description: reason || "Admin Grant",
      timestamp: new Date().toISOString(),
    });
    await kv.set(`transactions:${targetUserId}`, transactions);

    return c.json({
      character,
      message: `Granted ${amount} crypto to user`,
    });
  } catch (error) {
    console.error("Grant crypto error:", error);
    return c.json({ error: "Failed to grant crypto: " + error.message }, 500);
  }
}

export async function adjustLevel(c: Context) {
  try {
    const targetUserId = c.req.param("userId");
    const { level } = await c.req.json();

    if (!level || level < 1) {
      return c.json({ error: "Invalid level" }, 400);
    }

    const character = await kv.get(`character:${targetUserId}`);
    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }

    character.level = level;
    character.expToNext = Math.floor(100 * Math.pow(1.5, level - 1));
    await kv.set(`character:${targetUserId}`, character);

    return c.json({
      character,
      message: `Adjusted level to ${level}`,
    });
  } catch (error) {
    console.error("Adjust level error:", error);
    return c.json({ error: "Failed to adjust level: " + error.message }, 500);
  }
}

export async function broadcastMessage(c: Context) {
  try {
    const { message, type } = await c.req.json();

    // Store broadcast message (could be retrieved by clients)
    const broadcast = {
      id: crypto.randomUUID(),
      message,
      type: type || "info",
      timestamp: new Date().toISOString(),
    };

    // Store recent broadcasts
    const broadcasts = await kv.get("system:broadcasts") || [];
    broadcasts.unshift(broadcast);
    
    // Keep only last 10 broadcasts
    if (broadcasts.length > 10) {
      broadcasts.length = 10;
    }

    await kv.set("system:broadcasts", broadcasts);

    return c.json({
      broadcast,
      message: "Message broadcast successfully",
    });
  } catch (error) {
    console.error("Broadcast message error:", error);
    return c.json({ error: "Failed to broadcast: " + error.message }, 500);
  }
}

export async function getSystemBroadcasts(c: Context) {
  try {
    const broadcasts = await kv.get("system:broadcasts") || [];
    return c.json(broadcasts);
  } catch (error) {
    console.error("Get broadcasts error:", error);
    return c.json({ error: "Failed to get broadcasts: " + error.message }, 500);
  }
}
