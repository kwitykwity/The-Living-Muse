import { Timestamp } from 'firebase-admin/firestore';
export interface UserDoc {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    provider: 'google' | 'apple' | 'email';
    favoriteColor: string;
    vibePreset: VibePreset;
    onboardingComplete: boolean;
    sentimentTrend: number;
    lastSentiment?: Sentiment;
    subscriptionTier: SubscriptionTier;
    subscriptionStartDate?: Timestamp;
    subscriptionEndDate?: Timestamp;
    stripeCustomerId?: string;
    creditBalance: number;
    creditLimit: number;
    creditResetDate: Timestamp;
    purchasedCredits: number;
    memoryCount: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'studio';
export type VibePreset = 'harlem_soul' | 'k_dreamer' | 'orchid_noir' | 'cosmic_bloom';
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
export interface MuseDoc {
    id: string;
    uid: string;
    originalPhotoURL: string;
    avatarURL: string;
    thumbnailURL: string;
    artisticStyle: AvatarStyle;
    stylizationStrength: number;
    aspectRatio: '1:1' | '3:4' | '4:3';
    vibePreset: VibePreset;
    colorPalette: string;
    voiceID: string;
    status: AssetStatus;
    error?: string;
    createdAt: Timestamp;
}
export type AvatarStyle = 'oil_painting' | 'watercolor' | 'anime' | 'pop_art' | 'pencil_sketch' | 'cyberpunk' | 'renaissance' | 'impressionist' | 'orchid_surrealism';
export type AssetStatus = 'processing' | 'ready' | 'failed';
export interface PoemDoc {
    id: string;
    uid: string;
    museId?: string;
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
    videoURL?: string;
    poemPreview: string;
    sentiment: Sentiment;
    vibePreset: VibePreset;
    status: LivingPageStatus;
    isPublic: boolean;
    isFavorite: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export type LivingPageStatus = 'draft' | 'ready' | 'performing' | 'complete';
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
export interface CreditTransactionDoc {
    id: string;
    uid: string;
    type: CreditTransactionType;
    amount: number;
    action?: CreditAction;
    qualityTier?: string;
    balanceAfter: number;
    metadata?: Record<string, unknown>;
    createdAt: Timestamp;
}
export type CreditTransactionType = 'debit' | 'credit' | 'refund' | 'reset' | 'purchase' | 'upgrade';
export type CreditAction = 'poem' | 'refinement' | 'avatar' | 'audio_standard' | 'audio_premium' | 'video_draft' | 'video_standard' | 'video_premium' | 'video_cinematic' | 'export_hd';
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
/**
 * Cost in credits for each generation type.
 * Based on Loveable cost-protection-strategy.md analysis.
 * Weighted to ensure ≥65% margins even in worst-case (all-video) scenarios.
 */
export declare const CREDIT_COSTS: Record<CreditAction, number>;
/**
 * Monthly credit allocation per subscription tier.
 */
export declare const TIER_CREDITS: Record<SubscriptionTier, number>;
/**
 * Feature gates per tier.
 */
export declare const TIER_FEATURES: Record<SubscriptionTier, {
    videoEnabled: boolean;
    premiumAudioEnabled: boolean;
    conversationalMuse: boolean;
    maxMuses: number;
    maxCollections: number;
    exportResolution: '720p' | '1080p' | '4K';
    watermark: boolean;
    storageGB: number;
    poemModel: string;
    creditPackDiscount: number;
}>;
/**
 * Subscription pricing.
 */
export declare const TIER_PRICING: Record<Exclude<SubscriptionTier, 'free'>, {
    monthly: number;
    annual: number;
}>;
/**
 * Credit pack one-time purchases.
 */
export declare const CREDIT_PACKS: readonly [{
    readonly id: "pack_starter";
    readonly name: "Starter Pack";
    readonly credits: 50;
    readonly price: 4.99;
}, {
    readonly id: "pack_creator";
    readonly name: "Creator Pack";
    readonly credits: 150;
    readonly price: 11.99;
}, {
    readonly id: "pack_power";
    readonly name: "Power Pack";
    readonly credits: 500;
    readonly price: 29.99;
}, {
    readonly id: "pack_studio";
    readonly name: "Studio Pack";
    readonly credits: 1500;
    readonly price: 69.99;
}];
export declare const AVATAR_STYLE_PROMPTS: Record<AvatarStyle, string>;
export declare const VIBE_STYLE_MAP: Record<VibePreset, string>;
export declare const COLOR_PROMPT_MAP: Record<string, string>;
export declare const POEM_STYLE_PROMPTS: Record<PoemStyle, string>;
export declare const MOOD_PROMPTS: Record<PoemMood, string>;
/**
 * Video quality tier configurations.
 */
export declare const VIDEO_TIER_CONFIG: Record<VideoQualityTier, {
    maxDurationSeconds: number;
    resolution: string;
    model: string;
}>;
/**
 * Voice options for audio generation.
 */
export declare const VOICE_OPTIONS: readonly [{
    readonly id: "sarah";
    readonly name: "Sarah";
    readonly style: "Warm & Gentle";
    readonly tier: AudioQualityTier;
}, {
    readonly id: "george";
    readonly name: "George";
    readonly style: "Deep & Resonant";
    readonly tier: AudioQualityTier;
}, {
    readonly id: "lily";
    readonly name: "Lily";
    readonly style: "Soft & Poetic";
    readonly tier: AudioQualityTier;
}, {
    readonly id: "brian";
    readonly name: "Brian";
    readonly style: "Calm & Narrative";
    readonly tier: AudioQualityTier;
}, {
    readonly id: "alice";
    readonly name: "Alice";
    readonly style: "Ethereal & Dreamy";
    readonly tier: AudioQualityTier;
}, {
    readonly id: "daniel";
    readonly name: "Daniel";
    readonly style: "Rich & Cinematic";
    readonly tier: AudioQualityTier;
}, {
    readonly id: "jessica";
    readonly name: "Jessica";
    readonly style: "Intimate & Expressive";
    readonly tier: AudioQualityTier;
}, {
    readonly id: "chris";
    readonly name: "Chris";
    readonly style: "Bold & Dramatic";
    readonly tier: AudioQualityTier;
}];
/**
 * MemoryDoc — A semantic "clipping" of a creative moment.
 * Stored in 'memories' collection with a vector index.
 */
export interface MemoryDoc {
    id: string;
    uid: string;
    text: string;
    embedding: number[];
    metadata: {
        type: 'poem' | 'refinement' | 'journal';
        mood?: string;
        vibe?: string;
        relatedId?: string;
    };
    createdAt: Timestamp;
}
//# sourceMappingURL=firestore.d.ts.map