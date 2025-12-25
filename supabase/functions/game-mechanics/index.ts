import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get auth token from request
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // POST /game-mechanics?action=combat
    if (req.method === "POST" && action === "combat") {
      const { opponent_name, opponent_level = 1 } = await req.json();

      // Get user profile for level
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        throw new Error("User profile not found");
      }

      // Simple combat calculation
      const userDamage = Math.floor(Math.random() * 30) + (profile.level * 5);
      const opponentDamage = Math.floor(Math.random() * 20) + (opponent_level * 3);
      const won = userDamage > opponentDamage;
      const crystals_earned = won ? Math.floor(Math.random() * 50) + 25 : 0;

      // Get or create game stats
      let { data: stats, error: statsError } = await supabase
        .from("game_stats")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!stats) {
        const { data: newStats, error: createError } = await supabase
          .from("game_stats")
          .insert([{ user_id: userId }])
          .select()
          .single();
        if (createError) throw createError;
        stats = newStats;
      }

      // Update stats
      const { error: updateStatsError } = await supabase
        .from("game_stats")
        .update({
          battles_won: stats.battles_won + (won ? 1 : 0),
          battles_lost: stats.battles_lost + (won ? 0 : 1),
          total_damage_dealt: stats.total_damage_dealt + userDamage,
          total_damage_taken: stats.total_damage_taken + opponentDamage,
        })
        .eq("user_id", userId);

      if (updateStatsError) throw updateStatsError;

      // Add crystals if won
      if (won) {
        const { error: updateCrystalsError } = await supabase
          .from("user_profiles")
          .update({
            crystals: profile.crystals + crystals_earned,
          })
          .eq("id", userId);

        if (updateCrystalsError) throw updateCrystalsError;

        // Log crystal earning
        const { error: logError } = await supabase
          .from("crystals_earned")
          .insert([{
            user_id: userId,
            amount: crystals_earned,
            source: "combat",
            description: `Won combat against ${opponent_name}`,
          }]);

        if (logError) throw logError;
      }

      // Log combat
      const { error: combatLogError } = await supabase
        .from("combat_history")
        .insert([{
          user_id: userId,
          opponent_name,
          user_damage: userDamage,
          opponent_damage: opponentDamage,
          won,
          crystals_earned,
        }]);

      if (combatLogError) throw combatLogError;

      return new Response(
        JSON.stringify({
          success: true,
          won,
          user_damage: userDamage,
          opponent_damage: opponentDamage,
          crystals_earned,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // POST /game-mechanics?action=explore
    if (req.method === "POST" && action === "explore") {
      const { area_name = "Forest" } = await req.json();

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        throw new Error("User profile not found");
      }

      // Random exploration outcomes
      const outcomes = [
        { type: "item", name: "Iron Sword", rarity: "common", crystals: 10 },
        { type: "item", name: "Enchanted Ring", rarity: "rare", crystals: 30 },
        { type: "item", name: "Golden Amulet", rarity: "epic", crystals: 50 },
        { type: "crystals", amount: 25, name: "Crystal Shard" },
      ];

      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      let crystals_earned = 0;

      if (outcome.type === "item") {
        // Add item to inventory
        const { error: invError } = await supabase
          .from("inventory")
          .insert([{
            user_id: userId,
            item_name: outcome.name,
            item_type: "equipment",
            rarity: outcome.rarity,
          }]);

        if (invError) throw invError;
        crystals_earned = outcome.crystals;
      } else {
        crystals_earned = outcome.amount;
      }

      // Update profile with crystals
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          crystals: profile.crystals + crystals_earned,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Log crystal earning
      const { error: logError } = await supabase
        .from("crystals_earned")
        .insert([{
          user_id: userId,
          amount: crystals_earned,
          source: "exploration",
          description: `Explored ${area_name} and found ${outcome.name}`,
        }]);

      if (logError) throw logError;

      return new Response(
        JSON.stringify({
          success: true,
          area: area_name,
          found: outcome.name,
          crystals_earned,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // POST /game-mechanics?action=complete_quest
    if (req.method === "POST" && action === "complete_quest") {
      const { quest_id } = await req.json();

      if (!quest_id) {
        return new Response(
          JSON.stringify({ error: "Quest ID required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get user quest
      const { data: userQuest, error: questError } = await supabase
        .from("user_quests")
        .select("*, quests(*)")
        .eq("id", quest_id)
        .eq("user_id", userId)
        .single();

      if (questError || !userQuest) {
        throw new Error("Quest not found");
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        throw new Error("User profile not found");
      }

      const reward_crystals = userQuest.quests.reward_crystals || 50;

      // Update quest status
      const { error: updateQuestError } = await supabase
        .from("user_quests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", quest_id);

      if (updateQuestError) throw updateQuestError;

      // Update profile with crystals and stats
      const { error: updateProfileError } = await supabase
        .from("user_profiles")
        .update({
          crystals: profile.crystals + reward_crystals,
        })
        .eq("id", userId);

      if (updateProfileError) throw updateProfileError;

      // Update game stats
      let { data: stats, error: statsError } = await supabase
        .from("game_stats")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!stats) {
        const { data: newStats, error: createError } = await supabase
          .from("game_stats")
          .insert([{ user_id: userId }])
          .select()
          .single();
        if (createError) throw createError;
        stats = newStats;
      }

      const { error: updateStatsError } = await supabase
        .from("game_stats")
        .update({
          quests_completed: stats.quests_completed + 1,
        })
        .eq("user_id", userId);

      if (updateStatsError) throw updateStatsError;

      // Log crystal earning
      const { error: logError } = await supabase
        .from("crystals_earned")
        .insert([{
          user_id: userId,
          amount: reward_crystals,
          source: "quest_completion",
          description: `Completed quest: ${userQuest.quests.title}`,
        }]);

      if (logError) throw logError;

      return new Response(
        JSON.stringify({
          success: true,
          quest_title: userQuest.quests.title,
          crystals_earned: reward_crystals,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
