# 02 — AI Research & Living Nigerian Legal Knowledge Architecture

## Objective

The AI must not depend only on a static local corpus or on model memory.

If a user asks about a law, regulation, court development, government directive, or other legal event that changed yesterday, the system must be able to research current sources, identify the evidence, and explain which sources support the answer.

## Core rule

Retrieval/research and synthesis are different jobs.

User question
→ intent + jurisdiction
→ local verified corpus lookup
→ freshness decision
→ live research when needed
→ source validation
→ evidence set
→ DeepSeek synthesis
→ answer + citations + freshness metadata

DeepSeek should synthesize evidence supplied by the retrieval layer. It should not be treated as the legal source of truth.

## When live research is mandatory

Trigger current-source research when:
- the user asks today/yesterday/recent/latest/current;
- the user explicitly asks for a source;
- local sources are too old for the requested time window;
- a source is marked superseded;
- no verified local source adequately answers the query;
- the subject is known to change frequently.

Examples:

"What does section 42 of the 1999 Constitution provide?"
→ local verified corpus first.

"Did Nigeria change this rule yesterday?"
→ live research mandatory.

"What is the current rule on X?"
→ local retrieval plus freshness check; research if freshness cannot be demonstrated.

## Source hierarchy

### Tier 1 — primary/official
- National Assembly Acts and legislative publications
- Government gazettes
- Federal Ministry of Justice publications
- official court/judiciary publications
- regulator notices/circulars
- official NBA notices for professional practice
- state government sources for state law

### Tier 2 — authoritative legal repositories
Used for discovery, cross-checking, historical versions, and metadata gaps.

### Tier 3 — reputable secondary reporting/commentary
Used for breaking-news discovery and context. Must be labelled as commentary and never silently upgraded to primary authority.

## Provenance schema

Every source should have:
- source_id
- canonical_url
- source_type
- jurisdiction
- title
- publisher
- published_at
- effective_from
- effective_to
- retrieved_at
- content_hash
- verification_status
- is_official
- supersedes_source_id
- superseded_by_source_id
- retrieval_method
- excerpt

This makes "current law" a data problem rather than a prompt-writing problem.

## Evidence ledger

For each AI answer, keep an internal evidence record:
- claim
- supporting source IDs
- supporting excerpts
- source freshness
- whether the claim is directly supported or interpretive
- conflict status

The user sees a clear source list. The evidence ledger exists for audit and debugging.

## Research result contract

Suggested shape:

type ResearchResult = {
  answerability: 'supported' | 'partially_supported' | 'unsupported';
  freshness: 'current' | 'recent' | 'historical' | 'unknown';
  sources: ResearchSource[];
  conflicts: ResearchConflict[];
  evidence: EvidenceItem[];
  queryTime: string;
};

## Conflict handling

When sources disagree:
1. prefer official primary material where applicable;
2. prefer later effective versions when the legal status is clear;
3. never merge contradictory texts into one invented rule;
4. show meaningful conflict to the user;
5. route unresolved high-stakes conflict to human legal review.

## Server-side research provider abstraction

Do not bind the mobile application to one search vendor.

interface ResearchProvider {
  search(query, filters): Promise<SearchHit[]>;
  fetch(url): Promise<SourceDocument>;
}

The provider is server-side. The app receives normalized, provenance-rich evidence.

## Research freshness model

At minimum, store:
- publication date
- effective date
- retrieved time
- supersession state
- source hash

A daily/periodic ingestion job should:
1. discover changed official pages/documents;
2. fetch content;
3. normalize text;
4. calculate content hash;
5. compare with stored version;
6. create a new version only when content actually changes;
7. mark superseded versions;
8. update search indexes.

## Official-source examples

The Federal Ministry of Justice describes its Department of Law Reporting and Publication as the official publication arm for Laws of the Federation and related law-reporting publications.

https://justice.gov.ng/

The National Assembly maintains legislative publications and a legislation tracker and currently publishes recent Acts. The 2026 Electoral Act is one example available through the National Assembly.

https://www.nass.gov.ng/documents/magazine
https://nass.gov.ng/documents/download/11248

The existence of current Acts and ongoing legislative activity is why the product needs source versioning and current-source research rather than a frozen legal PDF.

## User-facing source design

Normal answer:
Sources used
- title
- official indicator
- publication/effective date
- retrieved time when relevant
- excerpt
- open source

Recent-law answer:
Research note
"This answer used current-source research because the local legal library did not contain sufficient recent material."

Never show raw provider debugging details.

## Hallucination-control doctrine

No evidence
→ no authoritative claim.

Weak/secondary evidence
→ label it.

Conflicting evidence
→ disclose conflict.

Source unavailable
→ disclose limitation.

Freshness-sensitive query
→ research.

Nonexistent law
→ no invented citation.

The goal is to make hallucination structurally difficult, not merely ask the model to "be accurate."

## AI provider layer

Current backend uses DeepSeek.

Provider tests must cover:
- key exists
- endpoint reachable
- model available
- text completion
- streaming
- JSON output
- image analysis
- timeout/abort
- provider error classification
- usage/quota lifecycle

No secret may appear in logs.

DeepSeek's official 2026 changelog documents a public beta for deepseek-v4-flash and notes that the API calling method remains unchanged.

https://api-docs.deepseek.com/updates/

Model changes must therefore be controlled configuration changes with regression tests, not casual source edits.

## Privacy

Legal questions and documents can contain sensitive data. Research requests should remove unnecessary personal identifiers before being sent to external search providers.

Do not send:
- account IDs
- authentication cookies
- unnecessary personal names or case identifiers

NDPC materials identify rights relating to automated decision-making and provide DPIA guidance for high-risk processing.

https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf
https://ndpc.gov.ng/wp-content/uploads/2025/03/NDP-ACT-GAID-2025-MARCH-20TH.pdf
