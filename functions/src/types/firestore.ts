import { Timestamp } from 'firebase-admin/firestore';

// ──────────────────────────────────────────────────────
// User
// ──────────────────────────────────────────────────────
export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'apple' | 'email';
  favoriteColor: string;
  vibePreset: VibePreset;
  onboardingComplete: boolean;
  bio?: string;                // Social Muse: user bio
  location?: string;           // Social Muse: user location
  isPublicProfile: boolean;    // Social Muse: opt-in to public discovery
  
  // Empathetic AI (server-managed)
  sentimentTrend: number;      // Rolling average (-1.0 to 1.0)
  lastSentiment?: Sentiment;

  // Subscription (server-managed)
  subscriptionTier: SubscriptionTier;
  subscriptionStartDate?: Timestamp;
  subscriptionEndDate?: Timestamp;
  stripeCustomerId?: string;

  // Credits (server-managed)
  creditBalance: number;       // Monthly allocation remaining
  creditLimit: number;         // Monthly allocation cap for tier
  creditResetDate: Timestamp;  // When balance resets
  purchasedCredits: number;    // One-time pack credits (never expire)
  memoryCount: number;         // For RAG scaling awareness

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'studio';
export type VibePreset = 'harlem_soul' | 'k_dreamer' | 'orchid_noir' | 'cosmic_bloom';

// ──────────────────────────────────────────────────────
// Subscription
// ──────────────────────────────────────────────────────
export interface SubscriptionDoc {
  id: string;
  uid: string;
  tier: 'starter' | 'pro' | 'studio';
  status: 'active' | 'canceled' | 'past_due' | 'expired';
  provider: 'stripe' | 'apple' | 'google';
  providerSubscriptionId: string;
  priceId: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  canceledAt?: Timestamp;
  createdAt: Timestamp;
}

// ──────────────────────────────────────────────────────
// Muse (Avatar)
// ──────────────────────────────────────────────────────
export interface MuseDoc {
  id: string;
  uid: string;
  originalPhotoURL: string;
  avatarURL: string;
  thumbnailURL: string;
  artisticStyle: AvatarStyle;
  stylizationStrength: number; // 10–100
  aspectRatio: '1:1' | '3:4' | '4:3';
  vibePreset: VibePreset;
  colorPalette: string;
  voiceID: string;
  status: AssetStatus;
  error?: string;
  createdAt: Timestamp;
}

export type AvatarStyle =
  | 'oil_painting'
  | 'watercolor'
  | 'anime'
  | 'pop_art'
  | 'pencil_sketch'
  | 'cyberpunk'
  | 'renaissance'
  | 'impressionist'
  | 'orchid_surrealism';

export type AssetStatus = 'processing' | 'ready' | 'failed';

// ──────────────────────────────────────────────────────
// Poem
// ──────────────────────────────────────────────────────
export interface PoemDoc {
  id: string;
  uid: string;
  museId?: string;             // Optional — poems can be standalone
  livingPageId?: string;
  textContent: string;
  promptUsed: string;
  poemStyle: PoemStyle;
  mood: PoemMood;
  sentiment: Sentiment;
  sentimentScore: number;
  poemType: PoemType;
  generationModel: string;
  tokensUsed: number;
  version: number;
  isEdited: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PoemStyle = 'romantic' | 'melancholic' | 'whimsical' | 'epic' | 'haiku' | 'free_verse';
export type PoemMood = 'joyful' | 'nostalgic' | 'mysterious' | 'serene' | 'passionate' | 'dark';
export type Sentiment = 'melancholic' | 'joyful' | 'fierce' | 'reflective' | 'playful' | 'mysterious';
export type PoemType = 'haiku' | 'free_verse' | 'quatrain' | 'couplet' | 'spoken_word';

// ──────────────────────────────────────────────────────
// Media Asset
// ──────────────────────────────────────────────────────
export interface MediaAssetDoc {
  id: string;
  uid: string;
  livingPageId?: string;
  poemId?: string;
  museId?: string;
  type: MediaType;
  qualityTier?: VideoQualityTier | AudioQualityTier;
  storageURL: string;
  downloadURL?: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
  resolution?: string;
  generationModel?: string;
  voiceId?: string;
  voiceSpeed?: number;
  motionStyle?: MotionStyle;
  status: AssetStatus;
  error?: string;
  creditsCharged: number;
  createdAt: Timestamp;
}

export type MediaType = 'audio' | 'video' | 'avatar' | 'thumbnail' | 'export';
export type VideoQualityTier = 'draft' | 'standard' | 'premium' | 'cinematic';
export type AudioQualityTier = 'standard' | 'premium';
export type MotionStyle = 'slow_zoom' | 'pan' | 'parallax' | 'cinematic_drift' | 'dynamic' | 'static';

// ──────────────────────────────────────────────────────
// Living Page
// ──────────────────────────────────────────────────────
export interface LivingPageDoc {
  id: string;
  uid: string;
  userName: string;
  museId: string;
  poemId: string;
  audioAssetId?: string;
  videoAssetId?: string;
  title: string;
  avatarURL: string;
  thumbnailURL: string;
  audioURL?: string;
  videoURL?: string;
  poemPreview: string;
  sentiment: Sentiment;
  vibePreset: VibePreset;
  status: LivingPageStatus;
  lastGenerationStatus?: 'success' | 'failed' | 'running';
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type LivingPageStatus = 'draft' | 'ready' | 'performing' | 'complete';

// ──────────────────────────────────────────────────────
// Collection
// ──────────────────────────────────────────────────────
export interface CollectionDoc {
  id: string;
  uid: string;
  title: string;
  description?: string;
  theme?: string;
  coverImageURL?: string;
  livingPageIds: string[];
  livingPageCount: number;
  isLivingBook: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ──────────────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────────────
export interface ExportDoc {
  id: string;
  uid: string;
  livingPageId: string;
  type: ExportType;
  status: ExportStatus;
  storageURL?: string;
  downloadURL?: string;
  resolution: string;
  watermarked: boolean;
  expiresAt: Timestamp;
  error?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export type ExportType = 'video_sd' | 'video_4k' | 'image' | 'living_book_pdf';
export type ExportStatus = 'queued' | 'processing' | 'ready' | 'failed' | 'expired';

// ──────────────────────────────────────────────────────
// Credit Transaction
// ──────────────────────────────────────────────────────
export interface CreditTransactionDoc {
  id: string;
  uid: string;
  type: CreditTransactionType;
  amount: number;        // Positive = added, negative = deducted
  action?: CreditAction; // What operation consumed credits
  qualityTier?: string;  // Video/audio quality tier
  balanceAfter: number;  // Running total for audit trail
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
}

export type CreditTransactionType = 'debit' | 'credit' | 'refund' | 'reset' | 'purchase' | 'upgrade';
export type CreditAction = 'poem' | 'refinement' | 'avatar' | 'audio_standard' | 'audio_premium' | 'video_draft' | 'video_standard' | 'video_premium' | 'video_cinematic' | 'export_hd';

// ──────────────────────────────────────────────────────
// Usage Event
// ──────────────────────────────────────────────────────
export interface UsageEventDoc {
  id: string;
  uid: string;
  action: UsageAction;
  model: string;
  tokensInput?: number;
  tokensOutput?: number;
  durationSeconds?: number;
  estimatedCostUSD: number;
  creditsCharged: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
}

export type UsageAction = 'avatar_gen' | 'poem_gen' | 'audio_gen' | 'video_gen' | 'export';

// ──────────────────────────────────────────────────────
// Feature Flag
// ──────────────────────────────────────────────────────
export interface FeatureFlagDoc {
  id: string;
  enabled: boolean;
  enabledForTiers: SubscriptionTier[];
  enabledForUsers: string[];
  rolloutPercent: number;
  description: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

// ──────────────────────────────────────────────────────
// Session (Conversational Verse)
// ──────────────────────────────────────────────────────
export interface SessionDoc {
  id: string;
  uid: string;
  museId: string;
  type: 'conversational' | 'single';
  turns: ConversationTurn[];
  currentSentiment: Sentiment;
  turnCount: number;
  maxTurns: number;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ConversationTurn {
  role: 'user' | 'muse';
  content: string;
  sentiment?: Sentiment;
  timestamp: Timestamp;
}

// ──────────────────────────────────────────────────────
// Constants — Credit System
// ──────────────────────────────────────────────────────

/**
 * Cost in credits for each generation type.
 * Based on Loveable cost-protection-strategy.md analysis.
 * Weighted to ensure ≥65% margins even in worst-case (all-video) scenarios.
 */
export const CREDIT_COSTS: Record<CreditAction, number> = {
  poem: 1,
  refinement: 1,
  avatar: 5,
  audio_standard: 3,
  audio_premium: 10,
  video_draft: 20,
  video_standard: 40,
  video_premium: 60,
  video_cinematic: 80,
  export_hd: 2,
} as const;

/**
 * Monthly credit allocation per subscription tier.
 */
export const TIER_CREDITS: Record<SubscriptionTier, number> = {
  free: 15,
  starter: 75,
  pro: 300,
  studio: 1000,
} as const;

/**
 * Feature gates per tier.
 */
export const TIER_FEATURES: Record<SubscriptionTier, {
  videoEnabled: boolean;
  premiumAudioEnabled: boolean;
  conversationalMuse: boolean;
  maxMuses: number;
  maxCollections: number;
  exportResolution: '720p' | '1080p' | '4K';
  watermark: boolean;
  storageGB: number;
  poemModel: string;
  creditPackDiscount: number; // percentage
}> = {
  free: {
    videoEnabled: false,
    premiumAudioEnabled: false,
    conversationalMuse: false,
    maxMuses: 1,
    maxCollections: 3,
    exportResolution: '720p',
    watermark: true,
    storageGB: 0.5,
    poemModel: 'gemini-3-flash',
    creditPackDiscount: 0,
  },
  starter: {
    videoEnabled: false,
    premiumAudioEnabled: false,
    conversationalMuse: false,
    maxMuses: 1,
    maxCollections: 10,
    exportResolution: '1080p',
    watermark: true,
    storageGB: 2,
    poemModel: 'gemini-3-flash',
    creditPackDiscount: 10,
  },
  pro: {
    videoEnabled: true,
    premiumAudioEnabled: true,
    conversationalMuse: true,
    maxMuses: 3,
    maxCollections: Infinity,
    exportResolution: '1080p',
    watermark: false,
    storageGB: 10,
    poemModel: 'gemini-3.1-pro',
    creditPackDiscount: 20,
  },
  studio: {
    videoEnabled: true,
    premiumAudioEnabled: true,
    conversationalMuse: true,
    maxMuses: Infinity,
    maxCollections: Infinity,
    exportResolution: '4K',
    watermark: false,
    storageGB: 50,
    poemModel: 'gemini-3.1-pro',
    creditPackDiscount: 30,
  },
} as const;

/**
 * Subscription pricing.
 */
export const TIER_PRICING: Record<Exclude<SubscriptionTier, 'free'>, { monthly: number; annual: number }> = {
  starter: { monthly: 9.99, annual: 7.99 },
  pro: { monthly: 29.99, annual: 24.99 },
  studio: { monthly: 79.99, annual: 64.99 },
} as const;

/**
 * Credit pack one-time purchases.
 */
export const CREDIT_PACKS = [
  { id: 'pack_starter', name: 'Starter Pack', credits: 50, price: 4.99 },
  { id: 'pack_creator', name: 'Creator Pack', credits: 150, price: 11.99 },
  { id: 'pack_power', name: 'Power Pack', credits: 500, price: 29.99 },
  { id: 'pack_studio', name: 'Studio Pack', credits: 1500, price: 69.99 },
] as const;

// ──────────────────────────────────────────────────────
// Constants — Style Maps
// ──────────────────────────────────────────────────────

export const AVATAR_STYLE_PROMPTS: Record<AvatarStyle, string> = {
  oil_painting: 'Classical oil painting portrait, rich brushstrokes, renaissance lighting',
  watercolor: 'Soft watercolor wash portrait, translucent layers, dreamy edges',
  anime: 'Japanese anime style portrait, cel shading, vibrant colors, expressive eyes',
  pop_art: 'Bold Warhol-inspired pop art, halftone dots, high contrast, vivid colors',
  pencil_sketch: 'Detailed graphite pencil drawing, cross-hatching, fine lines, high detail',
  cyberpunk: 'Neon-lit cyberpunk portrait, futuristic tech elements, glowing edges',
  renaissance: 'Classical Renaissance master portrait, chiaroscuro, sfumato technique',
  impressionist: 'Monet-inspired impressionist portrait, visible brushstrokes, natural light',
  orchid_surrealism: 'Surrealist portrait with orchid flower elements, dreamlike, botanical fantasy',
};

export const VIBE_STYLE_MAP: Record<VibePreset, string> = {
  harlem_soul: 'urban texture, jazz-era warmth, Harlem Renaissance spirit',
  k_dreamer: 'ethereal K-pop aesthetics, pastel dream, soft light flares',
  orchid_noir: 'dark botanical, gothic orchid motifs, shadow and mystery',
  cosmic_bloom: 'celestial flowers, nebula colors, cosmic garden',
};

export const COLOR_PROMPT_MAP: Record<string, string> = {
  purple: 'orchid and lavender hues, deep violet undertones',
  blue: 'sapphire and azure tones, ocean-deep mystique',
  gold: 'warm amber and gold leaf, sunlit radiance',
  rose: 'blush pink and rose petals, soft romantic warmth',
};

export const POEM_STYLE_PROMPTS: Record<PoemStyle, string> = {
  romantic: 'Write a deeply romantic poem with tender imagery and emotional vulnerability',
  melancholic: 'Write a melancholic poem with themes of loss, longing, and bittersweet beauty',
  whimsical: 'Write a whimsical, playful poem with imaginative imagery and light humor',
  epic: 'Write an epic, grand poem with sweeping language and heroic themes',
  haiku: 'Write a haiku (5-7-5 syllable structure) capturing a fleeting, beautiful moment',
  free_verse: 'Write a free verse poem with natural rhythm, vivid imagery, and emotional depth',
};

export const MOOD_PROMPTS: Record<PoemMood, string> = {
  joyful: 'The overall tone should be joyful, celebratory, and uplifting',
  nostalgic: 'The overall tone should be nostalgic, wistful, and warmly remembering',
  mysterious: 'The overall tone should be mysterious, enigmatic, and evocative',
  serene: 'The overall tone should be serene, peaceful, and meditative',
  passionate: 'The overall tone should be passionate, intense, and emotionally charged',
  dark: 'The overall tone should be dark, brooding, and introspective',
};

/**
 * Video quality tier configurations.
 */
export const VIDEO_TIER_CONFIG: Record<VideoQualityTier, {
  maxDurationSeconds: number;
  resolution: string;
  model: string;
}> = {
  draft: { maxDurationSeconds: 5, resolution: '720p', model: 'veo-3-draft' },
  standard: { maxDurationSeconds: 10, resolution: '1080p', model: 'veo-3-standard' },
  premium: { maxDurationSeconds: 15, resolution: '1080p', model: 'veo-3-premium' },
  cinematic: { maxDurationSeconds: 20, resolution: '4K', model: 'veo-3-cinematic' },
};

/**
 * Voice options for audio generation.
 */
export const VOICE_OPTIONS = [
  { id: 'sarah', name: 'Sarah', style: 'Warm & Gentle', tier: 'standard' as AudioQualityTier },
  { id: 'george', name: 'George', style: 'Deep & Resonant', tier: 'standard' as AudioQualityTier },
  { id: 'lily', name: 'Lily', style: 'Soft & Poetic', tier: 'standard' as AudioQualityTier },
  { id: 'brian', name: 'Brian', style: 'Calm & Narrative', tier: 'standard' as AudioQualityTier },
  { id: 'alice', name: 'Alice', style: 'Ethereal & Dreamy', tier: 'premium' as AudioQualityTier },
  { id: 'daniel', name: 'Daniel', style: 'Rich & Cinematic', tier: 'premium' as AudioQualityTier },
  { id: 'jessica', name: 'Jessica', style: 'Intimate & Expressive', tier: 'premium' as AudioQualityTier },
  { id: 'chris', name: 'Chris', style: 'Bold & Dramatic', tier: 'premium' as AudioQualityTier },
] as const;

/**
 * MemoryDoc — A semantic "clipping" of a creative moment.
 * Stored in 'memories' collection with a vector index.
 */
export interface MemoryDoc {
  id: string;
  uid: string;
  text: string;           // The poem, dialogue turn, or journal entry
  embedding: number[];    // 768d vector (Vertex AI text-embedding-004)
  metadata: {
    type: 'poem' | 'refinement' | 'journal';
    mood?: string;
    vibe?: string;
    isPublic?: boolean;   // Added for Global Discovery
    relatedId?: string;   // e.g. poemId
  };
  createdAt: Timestamp;
}
