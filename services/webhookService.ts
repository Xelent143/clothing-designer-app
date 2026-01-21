
export interface WebhookPayload {
    projectName: string;
    fileName: string;
    label: string;
    image: string; // base64
    webhookUrl: string;
    executionMode: string;
}

const N8N_WEBHOOK_URL = "https://n8n.srv1198053.hstgr.cloud/webhook/91ed2e02-ba01-4cb7-8c25-91f3b89cd115";

export const webhookService = {
    sendImageToWebhook: async (payload: Omit<WebhookPayload, 'webhookUrl' | 'executionMode'>) => {
        try {
            const fullPayload: WebhookPayload = {
                ...payload,
                webhookUrl: N8N_WEBHOOK_URL,
                executionMode: "production"
            };

            console.log(`Sending ${payload.fileName} to webhook...`);

            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(fullPayload)
            });

            if (!response.ok) {
                console.error(`Webhook failed for ${payload.fileName}: ${response.statusText}`);
            } else {
                console.log(`Webhook success for ${payload.fileName}`);
            }
        } catch (error) {
            console.error(`Error sending webhook for ${payload.fileName}:`, error);
        }
    }
};
