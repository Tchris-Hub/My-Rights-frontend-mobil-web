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

export function assertGroundedChat(
    content: string,
    sources: GroundingSource[] | undefined,
    citationStatus: string | undefined,
): GroundingSource[] {
    const answer = content.trim();
    if (citationStatus !== 'verified_context' || !sources?.length) {
        throw new Error('This answer could not be verified against the available legal sources.');
    }

    const citations = answer.match(/\[S\d+\]/g) ?? [];
    if (citations.length === 0) {
        throw new Error('This answer did not include the required source citations.');
    }

    const allowed = new Set(sources.map((source) => source.id));
    if (citations.some((citation) => !allowed.has(citation.slice(1, -1)))) {
        throw new Error('This answer contained an invalid source citation.');
    }

    return sources;
}
