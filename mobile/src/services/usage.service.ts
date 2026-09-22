import { apiRequest } from './api';

export type AiQuota = {
    feature: 'chat' | 'document_analyze' | 'document_generate';
    used: number;
    limit: number;
    remaining: number;
};

export const usageService = {
    async getAiQuota(): Promise<AiQuota[]> {
        const response = await apiRequest<{ plan: 'free'; daily: AiQuota[] }>('/api/usage');
        return response.daily;
    },
};
