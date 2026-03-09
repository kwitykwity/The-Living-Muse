import { IAvatarAdapter, AvatarGenerationInput, AvatarGenerationOutput, AIGenerationResult } from './adapter';
/**
 * Imagen (Nano Banana) Avatar Adapter — generates stylized avatars from photos.
 */
export declare class ImagenAvatarAdapter implements IAvatarAdapter {
    private model;
    constructor(model?: string);
    generateAvatar(input: AvatarGenerationInput): Promise<AIGenerationResult<AvatarGenerationOutput>>;
    private estimateCost;
}
//# sourceMappingURL=imagen.d.ts.map