export type MobileMoneyProvider = 'MTN' | 'ORANGE';

export interface MobileMoneyPaymentRequest {
  provider: MobileMoneyProvider;
  phoneNumber: string;
  amount: number;
  orderCode: string;
  paymentCode: string;
  description?: string;
}

export interface MobileMoneyPaymentResponse {
  success: boolean;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  message: string;
  raw?: unknown;
}

const MOBILE_MONEY_MODE = import.meta.env.VITE_MOBILE_MONEY_MODE || 'sandbox';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function cleanPhone(phoneNumber: string) {
  return phoneNumber.replace(/\s+/g, '').replace(/^\+237/, '237');
}

function isValidCameroonPhone(phoneNumber: string) {
  const cleaned = cleanPhone(phoneNumber);
  return /^(237)?6\d{8}$/.test(cleaned);
}

function simulatedPayment(request: MobileMoneyPaymentRequest): MobileMoneyPaymentResponse {
  return {
    success: true,
    status: 'completed',
    transactionId: `SIM-${request.provider}-${Date.now()}`,
    message: `Paiement ${request.provider} simulé avec succès.`,
  };
}

export async function initiateMobileMoneyPayment(request: MobileMoneyPaymentRequest): Promise<MobileMoneyPaymentResponse> {
  if (!isValidCameroonPhone(request.phoneNumber)) {
    return {
      success: false,
      status: 'failed',
      message: 'Numéro invalide. Utilisez un numéro camerounais au format 6XXXXXXXX ou +2376XXXXXXXX.',
    };
  }

  if (request.amount <= 0) {
    return { success: false, status: 'failed', message: 'Montant invalide.' };
  }

  if (MOBILE_MONEY_MODE !== 'live') {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return simulatedPayment(request);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { success: false, status: 'failed', message: 'Configuration Supabase manquante.' };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/mobile-money-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ ...request, phoneNumber: cleanPhone(request.phoneNumber) }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        status: 'failed',
        message: payload?.message || 'Erreur lors de l’appel à l’API Mobile Money.',
        raw: payload,
      };
    }

    return payload as MobileMoneyPaymentResponse;
  } catch (error) {
    return {
      success: false,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Erreur réseau pendant le paiement.',
    };
  }
}
