import { apiRequest } from './api';
import { Chapter, Section, Template, LegalAidCenter, Lawyer, ProfessionalMatch, FirmMatch } from '../types';

export { Chapter, Section, Template, LegalAidCenter as Center, Lawyer, ProfessionalMatch, FirmMatch };

const FALLBACK_TEMPLATES: Template[] = [
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement',
    category: 'Business',
    description: 'A general confidentiality draft with clear placeholders for the parties, protected information and duration.',
    content_template: 'NON-DISCLOSURE AGREEMENT\\n\\nDisclosing Party: {{disclosing_party}}\\nReceiving Party: {{receiving_party}}\\nPurpose: {{purpose}}\\nTerm: {{term}}',
    fields: [
      { key: 'disclosing_party', label: 'Disclosing party', placeholder: 'Name of person or organisation' },
      { key: 'receiving_party', label: 'Receiving party', placeholder: 'Name of person or organisation' },
      { key: 'purpose', label: 'Purpose', placeholder: 'Why the information will be shared' },
      { key: 'term', label: 'Confidentiality period', placeholder: 'e.g. 2 years' },
    ],
  },
  {
    id: 'tenancy-agreement',
    title: 'Residential Tenancy Agreement',
    category: 'Property',
    description: 'A structured residential tenancy draft covering the parties, property, rent and term.',
    content_template: 'RESIDENTIAL TENANCY AGREEMENT\\n\\nLandlord: {{landlord}}\\nTenant: {{tenant}}\\nProperty: {{property}}\\nRent: {{rent}}\\nTerm: {{term}}',
    fields: [
      { key: 'landlord', label: 'Landlord name', placeholder: 'Full legal name' },
      { key: 'tenant', label: 'Tenant name', placeholder: 'Full legal name' },
      { key: 'property', label: 'Property address', placeholder: 'Full property address' },
      { key: 'rent', label: 'Rent', placeholder: 'Amount and payment frequency' },
      { key: 'term', label: 'Tenancy term', placeholder: 'Start date and duration' },
    ],
  },
  {
    id: 'demand-letter',
    title: 'Demand Letter',
    category: 'Dispute',
    description: 'A structured demand-letter draft with placeholders for the parties, issue, amount and requested resolution.',
    content_template: 'FORMAL DEMAND LETTER\\n\\nTo: {{recipient}}\\nFrom: {{sender}}\\nIssue: {{issue}}\\nAmount: {{amount}}\\nRequested resolution: {{resolution}}',
    fields: [
      { key: 'recipient', label: 'Recipient', placeholder: 'Name and address' },
      { key: 'sender', label: 'Sender', placeholder: 'Your name and address' },
      { key: 'issue', label: 'Issue', placeholder: 'What happened and when' },
      { key: 'amount', label: 'Amount involved', placeholder: 'Amount, if applicable' },
      { key: 'resolution', label: 'Requested resolution', placeholder: 'What you want the recipient to do' },
    ],
  },
];

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

  async getProfessionalMatches(filters: {
    practiceArea?: string;
    location?: string;
    serviceArea?: string;
    language?: string;
    feeBand?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (filters.practiceArea) params.set('practice_area', filters.practiceArea);
    if (filters.location) params.set('location', filters.location);
    if (filters.serviceArea) params.set('service_area', filters.serviceArea);
    if (filters.language) params.set('language', filters.language);
    if (filters.feeBand) params.set('fee_band', filters.feeBand);
    const query = params.toString();
    return apiRequest<ProfessionalMatch[]>(
      `/api/legal/professionals/match${query ? `?${query}` : ''}`,
    );
  },

  async getFirmMatches(filters: {
    practiceArea?: string;
    location?: string;
    serviceArea?: string;
    language?: string;
    feeBand?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (filters.practiceArea) params.set('practice_area', filters.practiceArea);
    if (filters.location) params.set('location', filters.location);
    if (filters.serviceArea) params.set('service_area', filters.serviceArea);
    if (filters.language) params.set('language', filters.language);
    if (filters.feeBand) params.set('fee_band', filters.feeBand);
    const query = params.toString();
    return apiRequest<FirmMatch[]>(
      `/api/legal/firms/match${query ? `?${query}` : ''}`,
    );
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

  async createEnquiry(input: {
    professional_id?: string;
    firm_id?: string;
    message: string;
    practice_area?: string;
  }) {
    return apiRequest<{
      id: string;
      reference_number: string;
      message: string;
      practice_area?: string | null;
      status: string;
      response_message?: string | null;
      created_at: string;
      updated_at: string;
      professional?: { id: string; display_name: string; role: string } | null;
      firm?: { id: string; name: string } | null;
    }>('/api/legal/enquiries', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async getMyEnquiries() {
    return apiRequest<any[]>('/api/legal/enquiries');
  },

  async getReceivedEnquiries() {
    return apiRequest<any[]>('/api/legal/enquiries?view=received');
  },

  async updateEnquiry(id: string, input: { status: 'accepted' | 'declined' | 'closed'; response_message?: string }) {
    return apiRequest<any>(`/api/legal/enquiries/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async getOwnProfessionalProfile() {
    return apiRequest<any>('/api/professionals/me');
  },

  async updateOwnProfessionalProfile(input: {
    role: string;
    display_name: string;
    bio?: string;
    location?: string;
    practice_areas?: string[];
    service_areas?: string[];
    languages?: string[];
    availability?: string;
    fee_band?: string;
  }) {
    return apiRequest<any>('/api/professionals/me', {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  async getTemplates() {
    const templates = await apiRequest<Template[]>('/api/legal/templates');
    return Array.isArray(templates) && templates.length > 0 ? templates : FALLBACK_TEMPLATES;
  },
};
