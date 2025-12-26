import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as auth from "./auth.tsx";
import * as game from "./game.tsx";
import * as admin from "./admin.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get("/make-server-1da7ecad/health", (c) => {
  return c.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Crystal Realms MMORPG Backend"
  });
});

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

app.post("/make-server-1da7ecad/auth/signup", auth.signup);
app.post("/make-server-1da7ecad/auth/login", auth.login);
app.post("/make-server-1da7ecad/auth/logout", auth.logout);
app.get("/make-server-1da7ecad/auth/session", auth.getSession);

// ============================================================================
// CHARACTER ROUTES (Protected)
// ============================================================================

app.get("/make-server-1da7ecad/character", auth.verifyAuth, game.getCharacter);
app.patch("/make-server-1da7ecad/character", auth.verifyAuth, game.updateCharacter);

// ============================================================================
// QUEST ROUTES (Protected)
// ============================================================================

app.get("/make-server-1da7ecad/quests", auth.verifyAuth, game.getQuests);
app.patch("/make-server-1da7ecad/quests/:questId", auth.verifyAuth, game.updateQuest);
app.post("/make-server-1da7ecad/quests/:questId/claim", auth.verifyAuth, game.claimQuestReward);

// ============================================================================
// INVENTORY ROUTES (Protected)
// ============================================================================

app.get("/make-server-1da7ecad/inventory", auth.verifyAuth, game.getInventory);
app.patch("/make-server-1da7ecad/inventory/:itemId", auth.verifyAuth, game.toggleEquip);
app.post("/make-server-1da7ecad/inventory", auth.verifyAuth, game.addItem);

// ============================================================================
// COMBAT ROUTES (Protected)
// ============================================================================

app.post("/make-server-1da7ecad/combat/result", auth.verifyAuth, game.processCombatResult);

// ============================================================================
// TRANSACTION ROUTES (Protected)
// ============================================================================

app.get("/make-server-1da7ecad/transactions", auth.verifyAuth, game.getTransactions);

// ============================================================================
// LOCATION/TRAVEL ROUTES (Protected)
// ============================================================================

app.post("/make-server-1da7ecad/travel", auth.verifyAuth, game.travel);

// ============================================================================
// ADMIN ROUTES (Protected + Admin Only)
// ============================================================================

// User Management
app.get("/make-server-1da7ecad/admin/users", auth.verifyAuth, auth.verifyAdmin, admin.getAllUsers);
app.get("/make-server-1da7ecad/admin/users/:userId", auth.verifyAuth, auth.verifyAdmin, admin.getUserById);
app.patch("/make-server-1da7ecad/admin/users/:userId/status", auth.verifyAuth, auth.verifyAdmin, admin.updateUserStatus);
app.delete("/make-server-1da7ecad/admin/users/:userId", auth.verifyAuth, auth.verifyAdmin, admin.deleteUser);

// Statistics
app.get("/make-server-1da7ecad/admin/stats", auth.verifyAuth, auth.verifyAdmin, admin.getSystemStats);
app.get("/make-server-1da7ecad/admin/transactions", auth.verifyAuth, auth.verifyAdmin, admin.getAllTransactions);

// Admin Actions
app.post("/make-server-1da7ecad/admin/users/:userId/grant-crypto", auth.verifyAuth, auth.verifyAdmin, admin.grantCrypto);
app.post("/make-server-1da7ecad/admin/users/:userId/adjust-level", auth.verifyAuth, auth.verifyAdmin, admin.adjustLevel);
app.post("/make-server-1da7ecad/admin/broadcast", auth.verifyAuth, auth.verifyAdmin, admin.broadcastMessage);

// Public broadcasts endpoint
app.get("/make-server-1da7ecad/broadcasts", admin.getSystemBroadcasts);

// ============================================================================
// SEED ADMIN USER (Development Only)
// ============================================================================

app.post("/make-server-1da7ecad/seed-admin", async (c) => {
  try {
    const adminEmail = "admin@crystalrealms.com";
    
    // Check if admin already exists
    const existingAdmin = await kv.get(`user:email:${adminEmail}`);
    if (existingAdmin) {
      return c.json({ message: "Admin user already exists" }, 200);
    }

    // Hash password
    const encoder = new TextEncoder();
    const data = encoder.encode("admin123");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const adminId = crypto.randomUUID();

    // Create admin user
    const adminUser = {
      id: adminId,
      email: adminEmail,
      username: "AdminLord",
      role: "admin",
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: "active",
    };

    await kv.set(`user:${adminId}`, adminUser);
    await kv.set(`user:email:${adminEmail}`, adminId);

    // Create admin character
    const adminCharacter = {
      id: crypto.randomUUID(),
      userId: adminId,
      name: "AdminLord",
      class: "warrior",
      level: 99,
      exp: 0,
      expToNext: 999999,
      hp: 9999,
      maxHp: 9999,
      mp: 9999,
      maxMp: 9999,
      attack: 999,
      defense: 999,
      magic: 999,
      gold: 999999,
      crypto: 100,
      currentLocation: 1,
    };

    await kv.set(`character:${adminId}`, adminCharacter);
    await kv.set(`quests:${adminId}`, []);
    await kv.set(`inventory:${adminId}`, []);
    await kv.set(`transactions:${adminId}`, []);

    return c.json({ 
      message: "Admin user created successfully",
      email: adminEmail,
      password: "admin123",
      note: "Please change the password after first login"
    });
  } catch (error) {
    console.error("Seed admin error:", error);
    return c.json({ error: "Failed to seed admin: " + error.message }, 500);
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json(
    {
      error: "Internal server error",
      message: err.message,
      timestamp: new Date().toISOString(),
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not found",
      path: c.req.path,
      method: c.req.method,
    },
    404
  );
});

// Start server
Deno.serve(app.fetch);
