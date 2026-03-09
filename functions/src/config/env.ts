// Environment configuration with defaults and validation.
// All secrets should be in Secret Manager and injected via Cloud Functions env.

export const env = {
  // Google Cloud
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'the-living-muse',
  region: process.env.FUNCTIONS_REGION || 'us-central1',
  storageBucket: process.env.STORAGE_BUCKET || 'the-living-muse.firebasestorage.app',

  // Vertex AI
  vertexLocation: process.env.VERTEX_AI_LOCATION || 'us-central1',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.1-pro-002',
  geminiFlashModel: process.env.GEMINI_FLASH_MODEL || 'gemini-3.1-flash',
  imagenModel: process.env.IMAGEN_MODEL || 'imagen-3-fast-1',
  veoModel: process.env.VEO_MODEL || 'veo-3.1-generate-preview-001',
  lyriaModel: process.env.LYRIA_MODEL || 'lyria-3',

  // App Config
  freeMonthlyLimit: parseInt(process.env.FREE_MONTHLY_LIMIT || '3', 10),
  proMonthlyLimit: parseInt(process.env.PRO_MONTHLY_LIMIT || '15', 10),
  maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '2', 10),

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  prices: {
    // Subscriptions
    starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_test',
    pro: process.env.STRIPE_PRICE_PRO || 'price_pro_test',
    studio: process.env.STRIPE_PRICE_STUDIO || 'price_studio_test',
    // Credit Packs
    pack50: process.env.STRIPE_PRICE_PACK_50 || 'price_pack_50_test',
    pack150: process.env.STRIPE_PRICE_PACK_150 || 'price_pack_150_test',
    pack500: process.env.STRIPE_PRICE_PACK_500 || 'price_pack_500_test',
    pack1500: process.env.STRIPE_PRICE_PACK_1500 || 'price_pack_1500_test',
  },
} as const;

// Validate required secrets exist
export function validateEnv(): void {
  const warnings: string[] = [];

  if (!env.stripeSecretKey) {
    warnings.push('STRIPE_SECRET_KEY not set — payments will not work');
  }

  if (warnings.length > 0) {
    console.warn('[ENV] Configuration warnings:', warnings.join('; '));
  }
}
