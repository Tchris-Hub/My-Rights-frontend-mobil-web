export type GroundingSource = {
  id: string;
  title: string;
  section?: string;
  excerpt?: string;
  citation?: string;
  source_url?: string;
  issuing_authority?: string;
  source_type?: string;
  verified_at?: string;
  effective_from?: string;
  effective_to?: string;
  retrieval_score?: number;
};

export type ChatEvidenceStatus = 'verified_context' | 'live_research' | 'unverified';

export type ChatResponseContract = {
  content: string;
  conversation_id: string | null;
  sources?: GroundingSource[];
  citation_status?: ChatEvidenceStatus;
};

export function validateChatResponse(result: ChatResponseContract): void {
  const answer = result.content.trim();
  if (!answer) throw new Error('AI returned no usable response.');

  const status = result.citation_status;
  if (status !== 'verified_context' && status !== 'live_research' && status !== 'unverified') {
    throw new Error('AI returned an invalid evidence status.');
  }

  const sources = Array.isArray(result.sources) ? result.sources : [];
  const citations = answer.match(/\[S\d+\]/g) ?? [];
  const allowed = new Set(sources.map((source) => source.id));

  if (status === 'verified_context' || status === 'live_research') {
    if (sources.length === 0) throw new Error('AI returned evidence-backed content without sources.');
    if (citations.length === 0) throw new Error('AI answer did not include the required source citations.');
    if (citations.some((citation) => !allowed.has(citation.slice(1, -1)))) {
      throw new Error('AI answer contained an invalid source citation.');
    }
    return;
  }

  // Unverified answers are allowed for general/conceptual questions, but
  // they must never contain citations that the server did not provide.
  if (citations.some((citation) => !allowed.has(citation.slice(1, -1)))) {
    throw new Error('AI answer contained an invalid source citation.');
  }
}
