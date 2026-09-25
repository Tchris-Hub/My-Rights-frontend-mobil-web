# RAG + Client Hallucination Guard

## Goal

My Rights must not treat the language model as the legal source of truth. The model is a synthesis layer over verified legal evidence.

The enforcement chain is:

`user question -> server retrieval -> verified evidence gate -> DeepSeek synthesis -> citation validation -> persisted evidence metadata -> client validation -> display`

## Server rules

1. Retrieval is server-side.
2. Only verified legal sources in the configured jurisdiction are eligible.
3. Expired sources are excluded.
4. Constitution provisions are eligible only when linked to a verified LegalSource.
5. Legal source chunks are retrieved with PostgreSQL full-text ranking.
6. If no verified evidence is retrieved, the AI provider is not called.
7. Every legal answer must contain source labels such as `[S1]`.
8. The backend rejects answers containing no source labels.
9. The backend rejects source labels that were not in the retrieved evidence packet.
10. Streaming is buffered server-side until citation validation succeeds.
11. Assistant messages persist the evidence packet and citation status.
12. User-supplied text and retrieved source text are treated as data, not executable instructions.

## Mobile/client rules

The mobile app is a second safety gate, not the legal authority.

1. A new assistant answer is displayed only when `citation_status === verified_context`.
2. At least one source must be present.
3. The answer must contain a valid source label.
4. A source label not present in the source packet causes the client to reject the answer.
5. Streaming chunks are buffered on the client until the final `done` event and validation succeeds.
6. Historical assistant messages without persisted verified evidence are replaced with a neutral notice instead of being presented as verified legal information.

## Important limitation

RAG reduces hallucination risk; it cannot mathematically guarantee that a language model will never make a mistake. My Rights therefore uses a closed-world generation rule: unsupported legal propositions are rejected rather than filled from model memory.

## Next RAG phases

- Restore and provenance-link the Constitution corpus from the supplied PDF.
- Ingest authoritative statutes/regulations/cases as source + chunk records.
- Add live research for freshness-sensitive questions.
- Add semantic/vector retrieval after the embedding provider is selected.
- Add evidence-ledger records so individual claims can be traced to source chunks.
- Add adversarial tests for prompt injection, nonexistent laws, stale law, conflicting sources, and missing evidence.
