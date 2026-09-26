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

  async getProfessionals(filters?: { role?: string; location?: string; practiceArea?: string }) {
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.location) params.set('location', filters.location);
    if (filters?.practiceArea) params.set('practice_area', filters.practiceArea);
    const query = params.toString();
    return apiRequest<any[]>(`/api/legal/professionals${query ? `?${query}` : ''}`);
  },

  async getFirms(filters?: { location?: string; practiceArea?: string }) {
    const params = new URLSearchParams();
    if (filters?.location) params.set('location', filters.location);
    if (filters?.practiceArea) params.set('practice_area', filters.practiceArea);
    const query = params.toString();
    return apiRequest<any[]>(`/api/legal/firms${query ? `?${query}` : ''}`);
  },

  async getLawyers() {
    const professionals = await this.getProfessionals({ role: 'practising_lawyer' });
    if (professionals.length > 0) {
      return professionals.map((professional) => ({
        ...professional,
        name: professional.display_name,
        specialization: professional.practice_areas?.[0] || 'General Practice',
        experience_years: 0,
        location: professional.location || '',
        verification_status: professional.verification_status,
        credibility: 'Verified professional profile',
      })) as Lawyer[];
    }

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
