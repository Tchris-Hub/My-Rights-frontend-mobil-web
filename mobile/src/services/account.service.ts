import { apiRequest } from './api';

export type AccountStats = {
  consultations: number;
  enquiries: number;
  saved_rights: number;
};

export type SavedRight = {
  id: string;
  source_type: string;
  source_id: string;
  title: string;
  citation?: string | null;
  summary?: string | null;
  created_at: string;
};

export type DataRequest = {
  id: string;
  request_type: 'export' | 'deletion';
  status: string;
  details?: string | null;
  created_at: string;
};

export type UserReport = {
  id: string;
  category: string;
  message: string;
  status: string;
  context_type?: string | null;
  context_id?: string | null;
  created_at: string;
};

export const accountService = {
  getStats: () => apiRequest<AccountStats>('/api/account/stats'),
  getSavedRights: () => apiRequest<SavedRight[]>('/api/account/saved-rights'),
  saveRight: (input: { source_type: string; source_id: string; title: string; citation?: string; summary?: string }) =>
    apiRequest<SavedRight>('/api/account/saved-rights', { method: 'POST', body: JSON.stringify(input) }),
  deleteSavedRight: (id: string) =>
    apiRequest<void>(`/api/account/saved-rights/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getDataRequests: () => apiRequest<DataRequest[]>('/api/account/data-requests'),
  createDataRequest: (request_type: 'export' | 'deletion', details?: string) =>
    apiRequest<DataRequest>('/api/account/data-requests', {
      method: 'POST',
      body: JSON.stringify({ request_type, details }),
    }),
  createReport: (input: { category: string; message: string; context_type?: string; context_id?: string }) =>
    apiRequest<UserReport>('/api/account/reports', { method: 'POST', body: JSON.stringify(input) }),
  deleteAccount: () =>
    apiRequest<void>('/api/users/me', { method: 'DELETE' }),
};
