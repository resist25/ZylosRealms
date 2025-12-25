/**
 * API Service Layer
 * 
 * This file contains all the API integration points for the backend.
 * Replace the mock implementations with actual API calls.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
const FAUCETPAY_API_URL = "https://faucetpay.io/api/v1";

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  characterClass: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: "user" | "admin";
  };
  token: string;
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  return response.json();
}

/**
 * Register new user
 * POST /api/auth/register
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return response.json();
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ============================================================================
// CHARACTER/GAME API
// ============================================================================

export interface Character {
  id: string;
  userId: string;
  name: string;
  class: string;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  magic: number;
  gold: number;
  crypto: number;
}

/**
 * Get user's character
 * GET /api/character
 */
export async function getCharacter(token: string): Promise<Character> {
  const response = await fetch(`${API_BASE_URL}/character`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Update character stats
 * PATCH /api/character
 */
export async function updateCharacter(
  token: string,
  updates: Partial<Character>
): Promise<Character> {
  const response = await fetch(`${API_BASE_URL}/character`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  return response.json();
}

// ============================================================================
// QUEST API
// ============================================================================

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  progress: number;
  required: number;
  expReward: number;
  goldReward: number;
  cryptoReward: number;
  completed: boolean;
}

/**
 * Get user's quests
 * GET /api/quests
 */
export async function getQuests(token: string): Promise<Quest[]> {
  const response = await fetch(`${API_BASE_URL}/quests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Update quest progress
 * PATCH /api/quests/:questId
 */
export async function updateQuestProgress(
  token: string,
  questId: string,
  progress: number
): Promise<Quest> {
  const response = await fetch(`${API_BASE_URL}/quests/${questId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ progress }),
  });

  return response.json();
}

// ============================================================================
// INVENTORY API
// ============================================================================

export interface Item {
  id: string;
  name: string;
  type: string;
  rarity: string;
  equipped: boolean;
  stats?: Record<string, number>;
}

/**
 * Get user's inventory
 * GET /api/inventory
 */
export async function getInventory(token: string): Promise<Item[]> {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Equip/unequip item
 * PATCH /api/inventory/:itemId
 */
export async function toggleItemEquip(
  token: string,
  itemId: string,
  equipped: boolean
): Promise<Item> {
  const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ equipped }),
  });

  return response.json();
}

// ============================================================================
// TRANSACTION API
// ============================================================================

export interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  timestamp: Date;
}

/**
 * Get user's transaction history
 * GET /api/transactions
 */
export async function getTransactions(token: string): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Create new transaction (reward)
 * POST /api/transactions
 */
export async function createTransaction(
  token: string,
  data: Omit<Transaction, "id" | "userId" | "timestamp">
): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

// ============================================================================
// FAUCETPAY API INTEGRATION
// ============================================================================

export interface WithdrawalRequest {
  amount: number;
  currency: string; // e.g., "BTC", "DOGE", "LTC"
  to: string; // User's FaucetPay address
}

/**
 * Request withdrawal via FaucetPay
 * POST /api/faucetpay/withdraw
 * 
 * This should be called from your backend, not directly from frontend!
 * The backend should validate the user's balance and make the FaucetPay API call.
 */
export async function requestWithdrawal(
  token: string,
  data: WithdrawalRequest
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/faucetpay/withdraw`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

/**
 * Backend FaucetPay Integration Example:
 * 
 * On your backend, you would implement:
 * 
 * async function processFaucetPayWithdrawal(userId, amount, currency, address) {
 *   // 1. Verify user has sufficient balance
 *   const user = await db.users.findById(userId);
 *   if (user.cryptoBalance < amount) {
 *     throw new Error('Insufficient balance');
 *   }
 * 
 *   // 2. Call FaucetPay API
 *   const response = await fetch('https://faucetpay.io/api/v1/send', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'X-API-KEY': process.env.FAUCETPAY_API_KEY
 *     },
 *     body: JSON.stringify({
 *       api_key: process.env.FAUCETPAY_API_KEY,
 *       amount: amount,
 *       to: address,
 *       currency: currency,
 *       ip_address: req.ip,
 *       referral: false
 *     })
 *   });
 * 
 *   const result = await response.json();
 * 
 *   if (result.status === 200) {
 *     // 3. Deduct balance from user
 *     await db.users.update(userId, {
 *       cryptoBalance: user.cryptoBalance - amount
 *     });
 * 
 *     // 4. Log transaction
 *     await db.transactions.create({
 *       userId,
 *       type: 'withdrawal',
 *       amount,
 *       status: 'completed'
 *     });
 * 
 *     return { success: true, message: 'Withdrawal successful' };
 *   } else {
 *     throw new Error(result.message || 'Withdrawal failed');
 *   }
 * }
 */

// ============================================================================
// ADMIN API
// ============================================================================

export interface AdminUserData {
  id: string;
  username: string;
  email: string;
  level: number;
  crypto: number;
  status: string;
  lastLogin: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCryptoDistributed: number;
  totalBattles: number;
  totalQuests: number;
}

/**
 * Get all users (Admin only)
 * GET /api/admin/users
 */
export async function getAllUsers(token: string): Promise<AdminUserData[]> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Get system statistics (Admin only)
 * GET /api/admin/stats
 */
export async function getSystemStats(token: string): Promise<SystemStats> {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Update user status (Admin only)
 * PATCH /api/admin/users/:userId
 */
export async function updateUserStatus(
  token: string,
  userId: string,
  status: string
): Promise<void> {
  await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// DATABASE SCHEMA REFERENCE
// ============================================================================

/**
 * Suggested Database Tables:
 * 
 * users:
 *   - id (primary key)
 *   - email (unique)
 *   - password_hash
 *   - username
 *   - role (user/admin)
 *   - created_at
 *   - last_login
 *   - status (active/suspended)
 * 
 * characters:
 *   - id (primary key)
 *   - user_id (foreign key)
 *   - name
 *   - class
 *   - level
 *   - exp
 *   - hp, max_hp, mp, max_mp
 *   - attack, defense, magic
 *   - gold
 *   - crypto_balance
 * 
 * quests:
 *   - id (primary key)
 *   - user_id (foreign key)
 *   - title
 *   - description
 *   - type
 *   - progress
 *   - required
 *   - exp_reward, gold_reward, crypto_reward
 *   - completed
 * 
 * inventory:
 *   - id (primary key)
 *   - user_id (foreign key)
 *   - item_name
 *   - item_type
 *   - rarity
 *   - equipped
 *   - stats (JSON)
 * 
 * transactions:
 *   - id (primary key)
 *   - user_id (foreign key)
 *   - type (combat/quest/withdrawal)
 *   - amount
 *   - description
 *   - status
 *   - created_at
 * 
 * withdrawals:
 *   - id (primary key)
 *   - user_id (foreign key)
 *   - amount
 *   - currency
 *   - address
 *   - status (pending/completed/failed)
 *   - faucetpay_tx_id
 *   - created_at
 */
