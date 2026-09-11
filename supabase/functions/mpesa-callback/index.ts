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
    const callback = body?.Body?.stkCallback;
    if (!callback) {
      return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: "Invalid callback" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      MerchantRequestID: merchantRequestId,
      CheckoutRequestID: checkoutRequestId,
      ResultCode: resultCode,
      ResultDesc: resultDesc,
    } = callback;

    const success = Number(resultCode) === 0;
    let receiptNo: string | null = null;

    if (success && callback.CallbackMetadata?.Item) {
      for (const item of callback.CallbackMetadata.Item) {
        if (item.Name === "MpesaReceiptNumber") {
          receiptNo = item.Value;
          break;
        }
      }
    }

    const { data: payment } = await supabase
      .from("mpesa_payments")
      .select("id, user_id")
      .eq("checkout_request_id", checkoutRequestId)
      .maybeSingle();

    if (payment) {
      await supabase
        .from("mpesa_payments")
        .update({
          status: success ? "success" : "failed",
          result_code: Number(resultCode),
          result_desc: resultDesc,
          mpesa_receipt_no: receiptNo,
        })
        .eq("id", payment.id);

      if (success) {
        await supabase
          .from("profiles")
          .update({ is_activated: true })
          .eq("id", payment.user_id);
      }
    }

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
