import { apiRequest } from './api';
import { Chapter, Section, Template, LegalAidCenter, Lawyer } from '../types';

export { Chapter, Section, Template, LegalAidCenter as Center, Lawyer };

export const legalService = {
  async getConstitution() {
    return apiRequest<Chapter[]>('/api/legal/constitution');
  },

  async getLegalAidCenters() {
    const data = await apiRequest<any[]>('/api/legal/aid-centers');
    return data.map((item) => ({
      ...item,
      type: item.organization?.type || 'Government',
      rating: item.rating || 0,
      reviews: item.reviews_count || 0,
      credibility: item.verification_status === 'verified' ? 'Verified by source registry' : 'Unverified',
    })) as LegalAidCenter[];
  },

  async getLawyers() {
    const data = await apiRequest<any[]>('/api/legal/lawyers');
    return data.map((lawyer) => ({
      ...lawyer,
      specialization: lawyer.category || 'General Practice',
      reviews: lawyer.reviews_count || 0,
      credibility: lawyer.verification_status === 'verified' ? 'Verified by source registry' : 'Unverified',
    })) as Lawyer[];
  },

  async getTemplates() {
    return apiRequest<Template[]>('/api/legal/templates');
  },
};
