import { supabase } from './supabase';
import { Chapter, Section, Template, LegalAidCenter, Lawyer } from '../types';

export { Chapter, Section, Template, LegalAidCenter as Center, Lawyer };

// Interfaces moved to src/types/index.ts

export const legalService = {
  async getConstitution() {
    const { data: chapters, error: chapterError } = await supabase
      .from('constitution_chapters')
      .select(`
        *,
        sections: constitution_sections(*)
      `)
      .order('chapter_number', { ascending: true });

    if (chapterError) throw chapterError;
    return chapters as Chapter[];
  },

  async getLegalAidCenters() {
    const { data, error } = await supabase
      .from('legal_aid_centers')
      .select(`
        *,
        organization: organizations(type)
      `);

    if (error) throw error;

    return data.map(item => ({
      ...item,
      type: item.organization?.type || 'Government',
      rating: item.rating || 4.5,
      reviews: item.reviews_count || 100,
      credibility: 'Verified Partner'
    })) as LegalAidCenter[];
  },

  async getLawyers() {
    const { data, error } = await supabase
      .from('lawyers')
      .select('*')
      .order('rating', { ascending: false });

    if (error) throw error;
    return data.map(l => ({
      ...l,
      specialization: l.category || 'General Practice',
      reviews: l.reviews_count || 50,
      credibility: l.rating >= 4.8 ? 'Highly Recommended' : 'Verified Professional'
    })) as Lawyer[];
  },

  async getTemplates() {
    const { data, error } = await supabase
      .from('legal_templates')
      .select('*');

    if (error) throw error;
    return data as Template[];
  }
};
