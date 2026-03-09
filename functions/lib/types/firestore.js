"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOICE_OPTIONS = exports.VIDEO_TIER_CONFIG = exports.MOOD_PROMPTS = exports.POEM_STYLE_PROMPTS = exports.COLOR_PROMPT_MAP = exports.VIBE_STYLE_MAP = exports.AVATAR_STYLE_PROMPTS = exports.CREDIT_PACKS = exports.TIER_PRICING = exports.TIER_FEATURES = exports.TIER_CREDITS = exports.CREDIT_COSTS = void 0;
// ──────────────────────────────────────────────────────
// Constants — Credit System
// ──────────────────────────────────────────────────────
/**
 * Cost in credits for each generation type.
 * Based on Loveable cost-protection-strategy.md analysis.
 * Weighted to ensure ≥65% margins even in worst-case (all-video) scenarios.
 */
exports.CREDIT_COSTS = {
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
};
/**
 * Monthly credit allocation per subscription tier.
 */
exports.TIER_CREDITS = {
    free: 15,
    starter: 75,
    pro: 300,
    studio: 1000,
};
/**
 * Feature gates per tier.
 */
exports.TIER_FEATURES = {
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
};
/**
 * Subscription pricing.
 */
exports.TIER_PRICING = {
    starter: { monthly: 9.99, annual: 7.99 },
    pro: { monthly: 29.99, annual: 24.99 },
    studio: { monthly: 79.99, annual: 64.99 },
};
/**
 * Credit pack one-time purchases.
 */
exports.CREDIT_PACKS = [
    { id: 'pack_starter', name: 'Starter Pack', credits: 50, price: 4.99 },
    { id: 'pack_creator', name: 'Creator Pack', credits: 150, price: 11.99 },
    { id: 'pack_power', name: 'Power Pack', credits: 500, price: 29.99 },
    { id: 'pack_studio', name: 'Studio Pack', credits: 1500, price: 69.99 },
];
// ──────────────────────────────────────────────────────
// Constants — Style Maps
// ──────────────────────────────────────────────────────
exports.AVATAR_STYLE_PROMPTS = {
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
exports.VIBE_STYLE_MAP = {
    harlem_soul: 'urban texture, jazz-era warmth, Harlem Renaissance spirit',
    k_dreamer: 'ethereal K-pop aesthetics, pastel dream, soft light flares',
    orchid_noir: 'dark botanical, gothic orchid motifs, shadow and mystery',
    cosmic_bloom: 'celestial flowers, nebula colors, cosmic garden',
};
exports.COLOR_PROMPT_MAP = {
    purple: 'orchid and lavender hues, deep violet undertones',
    blue: 'sapphire and azure tones, ocean-deep mystique',
    gold: 'warm amber and gold leaf, sunlit radiance',
    rose: 'blush pink and rose petals, soft romantic warmth',
};
exports.POEM_STYLE_PROMPTS = {
    romantic: 'Write a deeply romantic poem with tender imagery and emotional vulnerability',
    melancholic: 'Write a melancholic poem with themes of loss, longing, and bittersweet beauty',
    whimsical: 'Write a whimsical, playful poem with imaginative imagery and light humor',
    epic: 'Write an epic, grand poem with sweeping language and heroic themes',
    haiku: 'Write a haiku (5-7-5 syllable structure) capturing a fleeting, beautiful moment',
    free_verse: 'Write a free verse poem with natural rhythm, vivid imagery, and emotional depth',
};
exports.MOOD_PROMPTS = {
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
exports.VIDEO_TIER_CONFIG = {
    draft: { maxDurationSeconds: 5, resolution: '720p', model: 'veo-3-draft' },
    standard: { maxDurationSeconds: 10, resolution: '1080p', model: 'veo-3-standard' },
    premium: { maxDurationSeconds: 15, resolution: '1080p', model: 'veo-3-premium' },
    cinematic: { maxDurationSeconds: 20, resolution: '4K', model: 'veo-3-cinematic' },
};
/**
 * Voice options for audio generation.
 */
exports.VOICE_OPTIONS = [
    { id: 'sarah', name: 'Sarah', style: 'Warm & Gentle', tier: 'standard' },
    { id: 'george', name: 'George', style: 'Deep & Resonant', tier: 'standard' },
    { id: 'lily', name: 'Lily', style: 'Soft & Poetic', tier: 'standard' },
    { id: 'brian', name: 'Brian', style: 'Calm & Narrative', tier: 'standard' },
    { id: 'alice', name: 'Alice', style: 'Ethereal & Dreamy', tier: 'premium' },
    { id: 'daniel', name: 'Daniel', style: 'Rich & Cinematic', tier: 'premium' },
    { id: 'jessica', name: 'Jessica', style: 'Intimate & Expressive', tier: 'premium' },
    { id: 'chris', name: 'Chris', style: 'Bold & Dramatic', tier: 'premium' },
];
//# sourceMappingURL=firestore.js.map