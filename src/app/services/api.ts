import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export async function login(credentials: LoginCredentials): Promise<{ session: any; user: any }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) throw error;
  return { session: data.session, user: data.user };
}

export async function register(data: RegisterData): Promise<{ session: any; user: any }> {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (error) throw error;

  if (authData.user) {
    await supabase.from("user_profiles").insert({
      id: authData.user.id,
      username: data.username,
      character_class: data.characterClass,
    });
  }

  return { session: authData.session, user: authData.user };
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ============================================================================
// CHARACTER/GAME API
// ============================================================================

export interface UserProfile {
  id: string;
  username: string;
  character_class: string;
  level: number;
  experience: number;
  crystals: number;
  btc_balance: number;
  total_earnings: number;
}

export async function getUserProfile(): Promise<UserProfile> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(
    `${supabaseUrl}/functions/v1/game-data?action=profile`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", session.user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// QUEST API
// ============================================================================

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward_crystals: number;
  difficulty: string;
}

export async function getQuests() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(
    `${supabaseUrl}/functions/v1/game-data?action=quests`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch quests");
  return response.json();
}

export async function completeQuest(questId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(
    `${supabaseUrl}/functions/v1/game-mechanics?action=complete_quest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quest_id: questId }),
    }
  );

  if (!response.ok) throw new Error("Failed to complete quest");
  return response.json();
}

// ============================================================================
// INVENTORY API
// ============================================================================

export interface Item {
  id: string;
  item_name: string;
  item_type: string;
  rarity: string;
  quantity: number;
}

export async function getInventory() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(
    `${supabaseUrl}/functions/v1/game-data?action=inventory`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch inventory");
  return response.json();
}

// ============================================================================
// GAME MECHANICS API
// ============================================================================

export async function performCombat(opponentName: string, opponentLevel = 1) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(
    `${supabaseUrl}/functions/v1/game-mechanics?action=combat`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ opponent_name: opponentName, opponent_level: opponentLevel }),
    }
  );

  if (!response.ok) throw new Error("Failed to perform combat");
  return response.json();
}

export async function explore(areaName = "Forest") {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(
    `${supabaseUrl}/functions/v1/game-mechanics?action=explore`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ area_name: areaName }),
    }
  );

  if (!response.ok) throw new Error("Failed to explore");
  return response.json();
}

// ============================================================================
// FAUCETPAY API INTEGRATION
// ============================================================================

export async function convertCrystals(crystalsAmount: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(
    `${supabaseUrl}/functions/v1/faucetpay?action=convert_crystals`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ crystals_amount: crystalsAmount }),
    }
  );

  if (!response.ok) throw new Error("Failed to convert crystals");
  return response.json();
}

export async function requestWithdrawal(btcAmount: number, faucetpayAddress: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(
    `${supabaseUrl}/functions/v1/faucetpay?action=withdraw`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        btc_amount: btcAmount,
        faucetpay_address: faucetpayAddress,
      }),
    }
  );

  if (!response.ok) throw new Error("Failed to process withdrawal");
  return response.json();
}

export async function getWithdrawals() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(
    `${supabaseUrl}/functions/v1/faucetpay?action=withdrawals`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch withdrawals");
  return response.json();
}

