import { defineSecret, defineString, defineInt } from 'firebase-functions/params';

// ─── Secrets ───
// These must be set via `firebase functions:secrets:set NAME`
export const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
export const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');

// ─── Configuration Parameters ───
export const PROJECT_ID = defineString('PROJECT_ID', { default: 'the-living-muse' });
export const REGION = defineString('REGION', { default: 'us-central1' });
export const STORAGE_BUCKET = defineString('STORAGE_BUCKET', { default: 'the-living-muse.firebasestorage.app' });

export const VERTEX_LOCATION = defineString('VERTEX_LOCATION', { default: 'us-central1' });
export const GEMINI_MODEL = defineString('GEMINI_MODEL', { default: 'gemini-3.1-pro-002' });
export const GEMINI_FLASH_MODEL = defineString('GEMINI_FLASH_MODEL', { default: 'gemini-3.1-flash' });
export const IMAGEN_MODEL = defineString('IMAGEN_MODEL', { default: 'imagen-3-fast-1' });
export const VEO_MODEL = defineString('VEO_MODEL', { default: 'veo-3.1-generate-preview-001' });
export const LYRIA_MODEL = defineString('LYRIA_MODEL', { default: 'lyria-3' });

export const FREE_MONTHLY_LIMIT = defineInt('FREE_MONTHLY_LIMIT', { default: 3 });
export const PRO_MONTHLY_LIMIT = defineInt('PRO_MONTHLY_LIMIT', { default: 15 });
export const MAX_RETRY_ATTEMPTS = defineInt('MAX_RETRY_ATTEMPTS', { default: 2 });

export const STRIPE_PRICE_STARTER = defineString('STRIPE_PRICE_STARTER', { default: 'price_starter_test' });
export const STRIPE_PRICE_PRO = defineString('STRIPE_PRICE_PRO', { default: 'price_pro_test' });
export const STRIPE_PRICE_STUDIO = defineString('STRIPE_PRICE_STUDIO', { default: 'price_studio_test' });

export const STRIPE_PRICE_PACK_50 = defineString('STRIPE_PRICE_PACK_50', { default: 'price_pack_50_test' });
export const STRIPE_PRICE_PACK_150 = defineString('STRIPE_PRICE_PACK_150', { default: 'price_pack_150_test' });
export const STRIPE_PRICE_PACK_500 = defineString('STRIPE_PRICE_PACK_500', { default: 'price_pack_500_test' });
export const STRIPE_PRICE_PACK_1500 = defineString('STRIPE_PRICE_PACK_1500', { default: 'price_pack_1500_test' });

/**
 * Migration helper to maintain compatibility with existing service calls 
 * while transitioning to the new Params API.
 */
export const env = {
  get projectId() { return PROJECT_ID.value(); },
  get region() { return REGION.value(); },
  get storageBucket() { return STORAGE_BUCKET.value(); },
  get vertexLocation() { return VERTEX_LOCATION.value(); },
  get geminiModel() { return GEMINI_MODEL.value(); },
  get geminiFlashModel() { return GEMINI_FLASH_MODEL.value(); },
  get imagenModel() { return IMAGEN_MODEL.value(); },
  get veoModel() { return VEO_MODEL.value(); },
  get lyriaModel() { return LYRIA_MODEL.value(); },
  get freeMonthlyLimit() { return FREE_MONTHLY_LIMIT.value(); },
  get proMonthlyLimit() { return PRO_MONTHLY_LIMIT.value(); },
  get maxRetryAttempts() { return MAX_RETRY_ATTEMPTS.value(); },
  get stripeSecretKey() { return STRIPE_SECRET_KEY.value(); },
  get stripeWebhookSecret() { return STRIPE_WEBHOOK_SECRET.value(); },
  prices: {
    get starter() { return STRIPE_PRICE_STARTER.value(); },
    get pro() { return STRIPE_PRICE_PRO.value(); },
    get studio() { return STRIPE_PRICE_STUDIO.value(); },
    get pack50() { return STRIPE_PRICE_PACK_50.value(); },
    get pack150() { return STRIPE_PRICE_PACK_150.value(); },
    get pack500() { return STRIPE_PRICE_PACK_500.value(); },
    get pack1500() { return STRIPE_PRICE_PACK_1500.value(); },
  }
};

export function validateEnv(): void {
  // Params are validated automatically by Firebase on deployment
  console.log('[ENV] Operational parameters initialized');
}
