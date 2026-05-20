export interface N8nPayload {
    event: string;
    data: any;
    userEmail?: string;
    userName?: string;
    timestamp: string;
}

export const triggerN8nWebhook = async (url: string, payload: N8nPayload) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('n8n webhook failed:', response.statusText);
        }
        return response.ok;
    } catch (error) {
        console.error('Error triggering n8n webhook:', error);
        return false;
    }
};

export const triggerWelcomeEmail = async (url: string, userName: string, userEmail: string) => {
    return await triggerN8nWebhook(url, {
        event: 'user_registered',
        data: { message: "First login completed" },
        userEmail,
        userName,
        timestamp: new Date().toISOString()
    });
};
