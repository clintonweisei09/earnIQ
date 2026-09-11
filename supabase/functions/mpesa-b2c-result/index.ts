import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const result = body?.Result;

    if (!result) {
      return new Response(JSON.stringify({ status: "ignored" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      ResultType,
      ResultCode,
      ResultDesc,
      ConversationID,
      OriginatorConversationID,
      TransactionID,
    } = result;

    const success = Number(ResultCode) === 0;

    // Find withdrawal by conversation ID
    const { data: withdrawal } = await supabase
      .from("withdrawals")
      .select("id, user_id, amount, mpesa_phone")
      .eq("mpesa_transaction_id", ConversationID)
      .maybeSingle();

    if (withdrawal) {
      if (success) {
        // Mark as completed
        await supabase.from("withdrawals").update({
          status: "completed",
          mpesa_transaction_id: TransactionID || ConversationID,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", withdrawal.id);

        // Update wallet totals
        const { data: wallet } = await supabase
          .from("wallets")
          .select("id, total_withdrawn, withdrawal_count")
          .eq("user_id", withdrawal.user_id)
          .maybeSingle();

        if (wallet) {
          await supabase.from("wallets").update({
            total_withdrawn: Number(wallet.total_withdrawn) + Number(withdrawal.amount),
            withdrawal_count: Number(wallet.withdrawal_count) + 1,
            updated_at: new Date().toISOString(),
          }).eq("id", wallet.id);
        }
      } else {
        // Failed — refund the wallet
        await supabase.from("withdrawals").update({
          status: "failed",
          failure_reason: ResultDesc || "B2C payment failed",
          updated_at: new Date().toISOString(),
        }).eq("id", withdrawal.id);

        const { data: wallet } = await supabase
          .from("wallets")
          .select("id, available_balance")
          .eq("user_id", withdrawal.user_id)
          .maybeSingle();

        if (wallet) {
          await supabase.from("wallets").update({
            available_balance: Number(wallet.available_balance) + Number(withdrawal.amount),
            updated_at: new Date().toISOString(),
          }).eq("id", wallet.id);
        }
      }
    }

    return new Response(JSON.stringify({ status: "processed" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
