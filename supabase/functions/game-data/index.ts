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

    // GET /game-data?action=profile
    if (req.method === "GET" && action === "profile") {
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        // Create new profile if doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert([{
            id: userId,
            username: user.email?.split("@")[0] || "Player",
            character_class: "Warrior",
          }])
          .select()
          .single();

        if (createError) throw createError;
        return new Response(JSON.stringify(newProfile), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(profile), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /game-data?action=characters
    if (req.method === "GET" && action === "characters") {
      const { data: characters, error: charsError } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", userId);

      if (charsError) throw charsError;

      return new Response(JSON.stringify(characters), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /game-data?action=inventory
    if (req.method === "GET" && action === "inventory") {
      const { data: inventory, error: invError } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", userId);

      if (invError) throw invError;

      return new Response(JSON.stringify(inventory), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /game-data?action=stats
    if (req.method === "GET" && action === "stats") {
      const { data: stats, error: statsError } = await supabase
        .from("game_stats")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (statsError) throw statsError;

      if (!stats) {
        const { data: newStats, error: createError } = await supabase
          .from("game_stats")
          .insert([{ user_id: userId }])
          .select()
          .single();

        if (createError) throw createError;
        return new Response(JSON.stringify(newStats), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /game-data?action=quests
    if (req.method === "GET" && action === "quests") {
      const { data: userQuests, error: questError } = await supabase
        .from("user_quests")
        .select("*, quests(*)")
        .eq("user_id", userId);

      if (questError) throw questError;

      return new Response(JSON.stringify(userQuests), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
