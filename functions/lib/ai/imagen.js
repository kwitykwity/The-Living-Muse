"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagenAvatarAdapter = void 0;
const logger = __importStar(require("firebase-functions/logger"));
const env_1 = require("../config/env");
/**
 * Imagen (Nano Banana) Avatar Adapter — generates stylized avatars from photos.
 */
class ImagenAvatarAdapter {
    model;
    constructor(model) {
        this.model = model || env_1.env.imagenModel;
    }
    async generateAvatar(input) {
        const start = Date.now();
        try {
            // ─── Call Vertex AI Imagen API ───
            // TODO: Replace with actual Vertex AI Imagen SDK call
            //
            // const { ImageGenerationModel } = require('@google-cloud/vertexai');
            // const imageModel = new ImageGenerationModel({ model: this.model });
            // const result = await imageModel.generateImage({
            //   prompt: input.stylePrompt,
            //   referenceImage: input.photoURL, // Use photo as reference
            //   outputImageCount: 1,
            //   aspectRatio: '1:1',
            //   outputMimeType: 'image/png',
            // });
            // const imageBuffer = Buffer.from(result.images[0].bytesBase64Encoded, 'base64');
            // ─── Placeholder for hackathon ───
            const imageBuffer = Buffer.from('placeholder-avatar-image');
            const durationMs = Date.now() - start;
            return {
                success: true,
                data: {
                    imageBuffer,
                    mimeType: 'image/png',
                },
                model: this.model,
                durationMs,
                estimatedCostUSD: this.estimateCost(input.resolution),
            };
        }
        catch (error) {
            const durationMs = Date.now() - start;
            logger.error('Imagen avatar generation failed', { error: error.message, model: this.model });
            return {
                success: false,
                model: this.model,
                durationMs,
                estimatedCostUSD: 0,
                error: error.message,
            };
        }
    }
    estimateCost(resolution) {
        switch (resolution) {
            case '4096x4096': return 0.24;
            case '2048x2048': return 0.134;
            case '1024x1024':
            default: return 0.039;
        }
    }
}
exports.ImagenAvatarAdapter = ImagenAvatarAdapter;
//# sourceMappingURL=imagen.js.map