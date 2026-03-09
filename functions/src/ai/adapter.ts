/**
 * AI Service Adapter — Base interface for all AI providers.
 * Enables model swappability without changing business logic.
 */

export interface AIGenerationResult<T> {
  success: boolean;
  data?: T;
  model: string;
  tokensInput?: number;
  tokensOutput?: number;
  durationMs: number;
  estimatedCostUSD: number;
  error?: string;
}

export interface AvatarGenerationInput {
  photoURL: string;
  stylePrompt: string;
  vibe?: string;          // Harlem Soul, K-Dreamer, Orchid Noir, Cosmic Bloom
  resolution: '1024x1024' | '2048x2048' | '4096x4096';
}

export interface AvatarGenerationOutput {
  imageBuffer: Buffer;
  mimeType: string;
}

export interface PoemGenerationInput {
  context: string;        // Photo mood, vibe, color context
  vibe?: string;          // Harlem Soul, K-Dreamer, Orchid Noir, Cosmic Bloom
  prompt?: string;        // Optional user prompt
  emotion?: string;       // Optional emotion override
  poemType?: string;      // haiku, free_verse, quatrain, etc.
  previousTurns?: { role: string; content: string }[];
  userMemory?: string;    // Personalized user context
}

export interface PoemGenerationOutput {
  textContent: string;
  sentiment: string;
  sentimentScore: number;
  poemType: string;
}

export interface AudioGenerationInput {
  text: string;
  voiceId?: string;
  mood?: string;
}

export interface AudioGenerationOutput {
  audioBuffer: Buffer;
  mimeType: string;
  durationSeconds: number;
}

export interface VideoGenerationInput {
  avatarURL: string;
  audioURL: string;
  poemText: string;
  durationSeconds: number;
}

export interface VideoGenerationOutput {
  videoBuffer: Buffer;
  mimeType: string;
  durationSeconds: number;
}

/**
 * Base adapter interface — every AI provider implements this
 */
export interface IAvatarAdapter {
  generateAvatar(input: AvatarGenerationInput): Promise<AIGenerationResult<AvatarGenerationOutput>>;
}

export interface IPoemAdapter {
  generatePoem(input: PoemGenerationInput): Promise<AIGenerationResult<PoemGenerationOutput>>;
}

export interface IAudioAdapter {
  generateAudio(input: AudioGenerationInput): Promise<AIGenerationResult<AudioGenerationOutput>>;
}

export interface IVideoAdapter {
  generateVideo(input: VideoGenerationInput): Promise<AIGenerationResult<VideoGenerationOutput>>;
}
