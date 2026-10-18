// Supabase Edge Function: Mobile Money payment gateway for GlowBeauty.
// Configure environment variables in Supabase for live mode.

interface PaymentPayload {
  provider: 'MTN' | 'ORANGE';
  phoneNumber: string;
  amount: number;
  orderCode: string;
  paymentCode: string;
  description?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function required(value: string | undefined, name: string) {
  if (!value) throw new Error(`Variable serveur manquante: ${name}`);
  return value;
}

async function requestMtnMomo(payload: PaymentPayload) {
  // MTN MoMo API: le vrai appel se fait côté serveur avec les clés marchand.
  // Variables attendues: MTN_MOMO_BASE_URL, MTN_MOMO_SUBSCRIPTION_KEY, MTN_MOMO_TOKEN, MTN_MOMO_TARGET_ENVIRONMENT.
  const baseUrl = required(Deno.env.get('MTN_MOMO_BASE_URL'), 'MTN_MOMO_BASE_URL');
  const subscriptionKey = required(Deno.env.get('MTN_MOMO_SUBSCRIPTION_KEY'), 'MTN_MOMO_SUBSCRIPTION_KEY');
  const token = required(Deno.env.get('MTN_MOMO_TOKEN'), 'MTN_MOMO_TOKEN');
  const targetEnvironment = Deno.env.get('MTN_MOMO_TARGET_ENVIRONMENT') || 'sandbox';
  const transactionId = crypto.randomUUID();

  const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Reference-Id': transactionId,
      'X-Target-Environment': targetEnvironment,
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: String(payload.amount),
      currency: Deno.env.get('MTN_MOMO_CURRENCY') || 'XAF',
      externalId: payload.paymentCode,
      payer: { partyIdType: 'MSISDN', partyId: payload.phoneNumber },
      payerMessage: payload.description || `Paiement ${payload.orderCode}`,
      payeeNote: `GlowBeauty ${payload.orderCode}`,
    }),
  });

  if (!response.ok && response.status !== 202) {
    const raw = await response.text();
    return { success: false, status: 'failed', message: 'MTN MoMo a refusé la transaction.', raw };
  }

  return { success: true, status: 'completed', transactionId, message: 'Paiement MTN MoMo initié.' };
}

async function requestOrangeMoney(payload: PaymentPayload) {
  // Orange Money Cameroun nécessite un contrat marchand et des paramètres/API fournis par Orange Business.
  // Variables attendues: ORANGE_MONEY_API_URL, ORANGE_MONEY_MERCHANT_CODE, ORANGE_MONEY_AUTH_TOKEN.
  const apiUrl = required(Deno.env.get('ORANGE_MONEY_API_URL'), 'ORANGE_MONEY_API_URL');
  const merchantCode = required(Deno.env.get('ORANGE_MONEY_MERCHANT_CODE'), 'ORANGE_MONEY_MERCHANT_CODE');
  const token = required(Deno.env.get('ORANGE_MONEY_AUTH_TOKEN'), 'ORANGE_MONEY_AUTH_TOKEN');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchantCode,
      msisdn: payload.phoneNumber,
      amount: payload.amount,
      currency: 'XAF',
      externalReference: payload.paymentCode,
      description: payload.description || `Commande GlowBeauty ${payload.orderCode}`,
    }),
  });

  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    return { success: false, status: 'failed', message: 'Orange Money a refusé la transaction.', raw };
  }

  return {
    success: true,
    status: 'completed',
    transactionId: raw?.transactionId || raw?.id || payload.paymentCode,
    message: 'Paiement Orange Money initié.',
    raw,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ success: false, message: 'Méthode non autorisée.' }, 405);

  try {
    const payload = (await req.json()) as PaymentPayload;

    if (!payload.provider || !payload.phoneNumber || !payload.amount || !payload.orderCode || !payload.paymentCode) {
      return json({ success: false, status: 'failed', message: 'Données de paiement incomplètes.' }, 400);
    }

    const liveEnabled = Deno.env.get('MOBILE_MONEY_LIVE') === 'true';
    if (!liveEnabled) {
      return json({
        success: true,
        status: 'completed',
        transactionId: `SIM-${payload.provider}-${Date.now()}`,
        message: `Paiement ${payload.provider} simulé côté serveur.`,
      });
    }

    const result = payload.provider === 'MTN'
      ? await requestMtnMomo(payload)
      : await requestOrangeMoney(payload);

    return json(result, result.success ? 200 : 400);
  } catch (error) {
    return json({
      success: false,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Erreur serveur Mobile Money.',
    }, 500);
  }
});
