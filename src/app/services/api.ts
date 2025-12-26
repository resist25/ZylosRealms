/**
 * API Service Layer
 * 
 * Backend is now fully integrated with Supabase Edge Functions
 */

// Supabase configuration - update these with your project details
const projectId = "rzgngutyyxgzottcuubi";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6Z25ndXR5eXhnem90dGN1dWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NzcxNTAsImV4cCI6MjA4MjI1MzE1MH0.IYlFqeGQMFf41DDroeicwX9ydlSh6ScstsB6eV9uDBM";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1da7ecad`;

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
  character?: any;
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  return response.json();
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  return response.json();
}

/**
 * Logout user
 */
export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
}

/**
 * Get current session
 */
export async function getSession(token: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/session`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Invalid session");
  }

  return response.json();
}

// ============================================================================
// CHARACTER/GAME API
// ============================================================================

export async function getCharacter(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/character`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function updateCharacter(token: string, updates: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/character`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  return response.json();
}

// ============================================================================
// QUEST API
// ============================================================================

export async function getQuests(token: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/quests`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function updateQuestProgress(
  token: string,
  questId: string,
  updates: any
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/quests/${questId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  return response.json();
}

export async function claimQuestReward(token: string, questId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/quests/${questId}/claim`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to claim reward");
  }

  return response.json();
}

// ============================================================================
// INVENTORY API
// ============================================================================

export async function getInventory(token: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function toggleItemEquip(
  token: string,
  itemId: string,
  equipped: boolean
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ equipped }),
  });

  return response.json();
}

export async function addItem(token: string, itemData: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });

  return response.json();
}

// ============================================================================
// COMBAT API
// ============================================================================

export async function processCombatResult(
  token: string,
  data: { victory: boolean; rewards: any; damage: number }
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/combat/result`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

// ============================================================================
// TRANSACTION API
// ============================================================================

export async function getTransactions(token: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}

// ============================================================================
// TRAVEL API
// ============================================================================

export async function travel(token: string, locationId: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/travel`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ locationId }),
  });

  return response.json();
}

// ============================================================================
// ADMIN API
// ============================================================================

export async function getAllUsers(token: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function getSystemStats(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function getAllTransactions(token: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/admin/transactions`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function updateUserStatus(
  token: string,
  userId: string,
  status: string
): Promise<void> {
  await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// SEED ADMIN (Development)
// ============================================================================

export async function seedAdmin(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/seed-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${publicAnonKey}`,
    },
  });

  return response.json();
}