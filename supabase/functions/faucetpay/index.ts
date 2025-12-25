import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WithdrawalRequest {
  btc_amount: number;
  faucetpay_address: string;
}

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

    // POST /faucetpay?action=convert_crystals
    if (req.method === "POST" && action === "convert_crystals") {
      const { crystals_amount } = await req.json();

      if (!crystals_amount || crystals_amount <= 0) {
        return new Response(
          JSON.stringify({ error: "Invalid crystal amount" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
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

      // Check if user has enough crystals
      if (profile.crystals < crystals_amount) {
        return new Response(
          JSON.stringify({ error: "Insufficient crystals" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Conversion rate: 100 crystals = 0.0001 BTC
      const btc_amount = (crystals_amount / 100) * 0.0001;

      // Update user profile: deduct crystals, add BTC
      const { data: updatedProfile, error: updateError } = await supabase
        .from("user_profiles")
        .update({
          crystals: profile.crystals - crystals_amount,
          btc_balance: profile.btc_balance + btc_amount,
          total_earnings: profile.total_earnings + btc_amount,
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log the conversion
      const { error: logError } = await supabase
        .from("crystals_earned")
        .insert([{
          user_id: userId,
          amount: -crystals_amount,
          source: "conversion_to_btc",
          description: `Converted ${crystals_amount} crystals to ${btc_amount} BTC`,
        }]);

      if (logError) throw logError;

      return new Response(
        JSON.stringify({
          success: true,
          crystals_converted: crystals_amount,
          btc_earned: btc_amount,
          new_balance: updatedProfile,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // POST /faucetpay?action=withdraw
    if (req.method === "POST" && action === "withdraw") {
      const { btc_amount, faucetpay_address }: WithdrawalRequest = await req.json();

      if (!btc_amount || btc_amount <= 0) {
        return new Response(
          JSON.stringify({ error: "Invalid BTC amount" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!faucetpay_address) {
        return new Response(
          JSON.stringify({ error: "Faucetpay address required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
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

      // Check if user has enough BTC
      if (profile.btc_balance < btc_amount) {
        return new Response(
          JSON.stringify({ error: "Insufficient BTC balance" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Create withdrawal request
      const faucetpay_reference = `FP_${userId.substring(0, 8)}_${Date.now()}`;

      const { data: withdrawal, error: withdrawError } = await supabase
        .from("withdrawals")
        .insert([{
          user_id: userId,
          btc_amount,
          faucetpay_reference,
          faucetpay_address,
          status: "pending",
        }])
        .select()
        .single();

      if (withdrawError) throw withdrawError;

      // Deduct BTC from user balance
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          btc_balance: profile.btc_balance - btc_amount,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // TODO: Call actual Faucetpay API to process withdrawal
      // For now, we're just creating the withdrawal record
      // In production, you'd need to authenticate with Faucetpay API
      // and send the actual BTC to the user's address

      return new Response(
        JSON.stringify({
          success: true,
          withdrawal_id: withdrawal.id,
          reference: faucetpay_reference,
          status: "pending",
          amount: btc_amount,
          message: "Withdrawal request submitted. Please check your Faucetpay account.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /faucetpay?action=withdrawals
    if (req.method === "GET" && action === "withdrawals") {
      const { data: withdrawals, error: withdrawError } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (withdrawError) throw withdrawError;

      return new Response(JSON.stringify(withdrawals), {
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
