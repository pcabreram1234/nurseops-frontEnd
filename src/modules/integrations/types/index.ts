export type ProviderList =
    | "TWILIO" | "WHATSAPP" | "GOOGLE_CALENDAR" | "OUTLOOK" | "SAP" | "ORACLE_HR"
    | "BIOMETRIC_SYSTEM" | "SMTP" | "FIREBASE" | "SENDGRID" | "SLACK" | "WORKDAY"
    | "OPENAI" | "CUSTOM";

export interface Integration {
    id: string;
    organizationId: string;
    provider: ProviderList;
    configuration: any;
    name?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    webhookLogs?: WebhookLog[];
}

export interface WebhookLog {
    id: string;
    integrationId: string;
    payload: any;
    response: any;
}

export interface IntegrationFormData {
    organizationId: string;
    provider: ProviderList;
    name?: string;
    isActive?: boolean;
    configuration: any;
}

export interface IntegrationFilters {
    search?: string;
    provider?: ProviderList;
    name?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedIntegrations {
    data: Integration[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const PROVIDER_LABELS: Record<ProviderList, string> = {
    TWILIO: "Twilio",
    WHATSAPP: "WhatsApp",
    GOOGLE_CALENDAR: "Google Calendar",
    OUTLOOK: "Outlook",
    SAP: "SAP",
    ORACLE_HR: "Oracle HR",
    BIOMETRIC_SYSTEM: "Sistema Biométrico",
    SMTP: "SMTP (Email)",
    FIREBASE: "Firebase",
    SENDGRID: "SendGrid",
    SLACK: "Slack",
    WORKDAY: "Workday",
    OPENAI: "OpenAI",
    CUSTOM: "Personalizado",
};

export const PROVIDER_ICONS: Record<ProviderList, string> = {
    TWILIO: "📞", WHATSAPP: "💬", GOOGLE_CALENDAR: "📅", OUTLOOK: "📧",
    SAP: "🏢", ORACLE_HR: "👥", BIOMETRIC_SYSTEM: "🔒", SMTP: "✉️",
    FIREBASE: "🔥", SENDGRID: "📨", SLACK: "💬", WORKDAY: "🗓️",
    OPENAI: "🤖", CUSTOM: "⚙️",
};

/**
 * Claves que nunca deben mostrarse en el cliente por seguridad.
 */
export const SENSITIVE_KEYS = [
    "apiKey", "api_key", "secret", "secretKey", "secret_key",
    "token", "accessToken", "access_token", "password", "pass",
    "credential", "credentials", "privateKey", "private_key", "auth",
];

export function redactConfiguration(config: any): Record<string, any> {
    if (!config || typeof config !== "object") return {};
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(config)) {
        const isSensitive = SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()));
        result[key] = isSensitive ? "••••••••" : value;
    }
    return result;
}
