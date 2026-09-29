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
    citation_status: ChatEvidenceStatus;
    sources?: GroundingSource[];
};

/**
 * The backend is authoritative for legal evidence and citation validity.
 * Mobile validates only the canonical transport shape before rendering.
 */
export function validateChatResponse(result: ChatResponseContract): void {
    if (!result || typeof result !== 'object') {
        throw new Error('AI returned an invalid response.');
    }

    if (typeof result.content !== 'string' || !result.content.trim()) {
        throw new Error('AI returned no usable response.');
    }

    if (
        result.citation_status !== 'verified_context' &&
        result.citation_status !== 'live_research' &&
        result.citation_status !== 'unverified'
    ) {
        throw new Error('AI returned an invalid evidence status.');
    }

    if (!('conversation_id' in result) ||
        (result.conversation_id !== null && typeof result.conversation_id !== 'string')) {
        throw new Error('AI returned an invalid conversation ID.');
    }

    if (result.sources !== undefined && !Array.isArray(result.sources)) {
        throw new Error('AI returned an invalid source collection.');
    }

    if (
        (result.citation_status === 'verified_context' || result.citation_status === 'live_research') &&
        (!Array.isArray(result.sources) || result.sources.length === 0)
    ) {
        throw new Error('AI returned evidence-backed content without sources.');
    }
}
