
export interface WebhookPayload {
    projectName: string;
    fileName: string;
    label: string;
    image: string; // base64
    webhookUrl: string;
    executionMode: string;
}

const N8N_WEBHOOK_URL = ""; // Disabled

export const webhookService = {
    sendImageToWebhook: async (payload: Omit<WebhookPayload, 'webhookUrl' | 'executionMode'>) => {
        console.log("N8N Webhook is disabled. Use ImgBB instead.");
        return;
    }
};
