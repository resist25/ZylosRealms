/*
  # Crystal Realms Game Database Schema

  1. New Tables
    - `user_profiles` - Store user game data (level, experience, crystals, BTC balance)
    - `characters` - User characters with class and stats
    - `inventory` - User inventory items
    - `game_stats` - Game statistics and progression
    - `crystals_earned` - Log of crystal earnings from activities
    - `withdrawals` - Faucetpay withdrawal requests with status tracking
    - `quests` - Available quests in the game
    - `user_quests` - User quest progress and completion
    - `combat_history` - Combat logs for tracking battles

  2. Security
    - Enable RLS on all tables
    - Add policies to restrict users to their own data
    - Service role access for admin operations

  3. Features
    - Default values for game progression
    - Timestamps for activity tracking
    - Status enums for withdrawals and quests
    - Indexes on frequently queried columns
*/

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  character_class text DEFAULT 'Warrior',
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  crystals integer DEFAULT 100,
  btc_balance decimal(16, 8) DEFAULT 0,
  total_earnings decimal(16, 8) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  class text NOT NULL,
  level integer DEFAULT 1,
  health integer DEFAULT 100,
  max_health integer DEFAULT 100,
  mana integer DEFAULT 50,
  max_mana integer DEFAULT 50,
  strength integer DEFAULT 10,
  intelligence integer DEFAULT 10,
  defense integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_type text NOT NULL,
  quantity integer DEFAULT 1,
  rarity text DEFAULT 'common',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Game stats table
CREATE TABLE IF NOT EXISTS game_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  battles_won integer DEFAULT 0,
  battles_lost integer DEFAULT 0,
  quests_completed integer DEFAULT 0,
  items_collected integer DEFAULT 0,
  total_damage_dealt integer DEFAULT 0,
  total_damage_taken integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crystals earned log
CREATE TABLE IF NOT EXISTS crystals_earned (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  source text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reward_crystals integer DEFAULT 50,
  difficulty text DEFAULT 'normal',
  created_at timestamptz DEFAULT now()
);

-- User quests table
CREATE TABLE IF NOT EXISTS user_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES quests(id),
  status text DEFAULT 'active',
  progress integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  btc_amount decimal(16, 8) NOT NULL,
  faucetpay_reference text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  faucetpay_address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Combat history table
CREATE TABLE IF NOT EXISTS combat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_name text NOT NULL,
  user_damage integer NOT NULL,
  opponent_damage integer NOT NULL,
  won boolean NOT NULL,
  crystals_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE crystals_earned ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE combat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for characters
CREATE POLICY "Users can read own characters"
  ON characters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create characters"
  ON characters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for inventory
CREATE POLICY "Users can read own inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own inventory"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON inventory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for game_stats
CREATE POLICY "Users can read own stats"
  ON game_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create stats"
  ON game_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON game_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for crystals_earned
CREATE POLICY "Users can read own crystal logs"
  ON crystals_earned FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create crystal logs"
  ON crystals_earned FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quests (everyone can read)
CREATE POLICY "Everyone can read quests"
  ON quests FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_quests
CREATE POLICY "Users can read own quests"
  ON user_quests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create quests"
  ON user_quests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests"
  ON user_quests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for withdrawals
CREATE POLICY "Users can read own withdrawals"
  ON withdrawals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawals"
  ON withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for combat_history
CREATE POLICY "Users can read own combat history"
  ON combat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create combat logs"
  ON combat_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_crystals_earned_user_id ON crystals_earned(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_combat_history_user_id ON combat_history(user_id);
