import { Context } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Generate a unique user ID
function generateId(): string {
  return crypto.randomUUID();
}

// Hash password (in production, use bcrypt or similar)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedAttempt = await hashPassword(password);
  return hashedAttempt === hash;
}

// Generate session token
function generateToken(): string {
  return crypto.randomUUID() + "-" + Date.now();
}

export async function signup(c: Context) {
  try {
    const body = await c.req.json();
    const { email, password, username, characterClass } = body;

    if (!email || !password || !username) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Check if user exists
    const existingUser = await kv.get(`user:email:${email}`);
    if (existingUser) {
      return c.json({ error: "Email already exists" }, 409);
    }

    const userId = generateId();
    const passwordHash = await hashPassword(password);

    // Create user
    const user = {
      id: userId,
      email,
      username,
      role: "user",
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: "active",
    };

    // Store user data
    await kv.set(`user:${userId}`, user);
    await kv.set(`user:email:${email}`, userId);

    // Create initial character
    const classStats = {
      warrior: { hp: 120, mp: 40, attack: 18, defense: 12, magic: 6 },
      mage: { hp: 80, mp: 80, attack: 10, defense: 6, magic: 20 },
      rogue: { hp: 100, mp: 60, attack: 16, defense: 8, magic: 10 },
    };

    const stats = classStats[characterClass as keyof typeof classStats] || classStats.warrior;

    const character = {
      id: generateId(),
      userId,
      name: username,
      class: characterClass,
      level: 1,
      exp: 0,
      expToNext: 100,
      hp: stats.hp,
      maxHp: stats.hp,
      mp: stats.mp,
      maxMp: stats.mp,
      attack: stats.attack,
      defense: stats.defense,
      magic: stats.magic,
      gold: 100,
      crypto: 0,
      currentLocation: 1,
    };

    await kv.set(`character:${userId}`, character);

    // Create initial quests
    const quests = [
      {
        id: generateId(),
        userId,
        title: "First Blood",
        description: "Defeat 3 enemies in combat",
        type: "combat",
        progress: 0,
        required: 3,
        expReward: 50,
        goldReward: 30,
        cryptoReward: 0.001,
        completed: false,
      },
      {
        id: generateId(),
        userId,
        title: "Explorer's Journey",
        description: "Visit all available locations",
        type: "exploration",
        progress: 1,
        required: 3,
        expReward: 75,
        goldReward: 50,
        cryptoReward: 0.0015,
        completed: false,
      },
    ];

    await kv.set(`quests:${userId}`, quests);

    // Create initial inventory
    const inventory = [
      {
        id: generateId(),
        userId,
        name: "Iron Sword",
        type: "weapon",
        rarity: "common",
        equipped: true,
        stats: { attack: 5 },
      },
      {
        id: generateId(),
        userId,
        name: "Leather Armor",
        type: "armor",
        rarity: "common",
        equipped: true,
        stats: { defense: 5, hp: 20 },
      },
    ];

    await kv.set(`inventory:${userId}`, inventory);

    // Initialize transactions
    await kv.set(`transactions:${userId}`, []);

    // Create session token
    const token = generateToken();
    const session = {
      userId,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };

    await kv.set(`session:${token}`, session);

    // Return user data (without password hash)
    const { passwordHash: _, ...userResponse } = user;

    return c.json({
      user: userResponse,
      token,
      character,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Signup failed: " + error.message }, 500);
  }
}

export async function login(c: Context) {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Missing email or password" }, 400);
    }

    // Get user ID from email
    const userId = await kv.get(`user:email:${email}`);
    if (!userId) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Get user data
    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Check if user is suspended
    if (user.status === "suspended") {
      return c.json({ error: "Account suspended" }, 403);
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    await kv.set(`user:${userId}`, user);

    // Create session token
    const token = generateToken();
    const session = {
      userId,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await kv.set(`session:${token}`, session);

    // Get character
    const character = await kv.get(`character:${userId}`);

    // Return user data (without password hash)
    const { passwordHash: _, ...userResponse } = user;

    return c.json({
      user: userResponse,
      token,
      character,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed: " + error.message }, 500);
  }
}

export async function logout(c: Context) {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Delete session
    await kv.del(`session:${token}`);

    return c.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({ error: "Logout failed: " + error.message }, 500);
  }
}

export async function getSession(c: Context) {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const session = await kv.get(`session:${token}`);

    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      await kv.del(`session:${token}`);
      return c.json({ error: "Session expired" }, 401);
    }

    // Get user and character
    const user = await kv.get(`user:${session.userId}`);
    const character = await kv.get(`character:${session.userId}`);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const { passwordHash: _, ...userResponse } = user;

    return c.json({
      user: userResponse,
      character,
      session: {
        token,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Get session error:", error);
    return c.json({ error: "Session check failed: " + error.message }, 500);
  }
}

// Middleware to verify authentication
export async function verifyAuth(c: Context, next: Function) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  const session = await kv.get(`session:${token}`);

  if (!session) {
    return c.json({ error: "Invalid session" }, 401);
  }

  if (new Date(session.expiresAt) < new Date()) {
    await kv.del(`session:${token}`);
    return c.json({ error: "Session expired" }, 401);
  }

  // Attach userId to context
  c.set("userId", session.userId);
  await next();
}

// Middleware to verify admin role
export async function verifyAdmin(c: Context, next: Function) {
  const userId = c.get("userId");
  const user = await kv.get(`user:${userId}`);

  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden: Admin access required" }, 403);
  }

  await next();
}
