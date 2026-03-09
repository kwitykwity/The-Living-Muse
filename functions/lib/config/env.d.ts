export declare const env: {
    readonly projectId: string;
    readonly region: string;
    readonly storageBucket: string;
    readonly vertexLocation: string;
    readonly geminiModel: string;
    readonly geminiFlashModel: string;
    readonly imagenModel: string;
    readonly veoModel: string;
    readonly lyriaModel: string;
    readonly freeMonthlyLimit: number;
    readonly proMonthlyLimit: number;
    readonly maxRetryAttempts: number;
    readonly stripeSecretKey: string;
    readonly stripeWebhookSecret: string;
    readonly prices: {
        readonly starter: string;
        readonly pro: string;
        readonly studio: string;
        readonly pack50: string;
        readonly pack150: string;
        readonly pack500: string;
        readonly pack1500: string;
    };
};
export declare function validateEnv(): void;
//# sourceMappingURL=env.d.ts.map