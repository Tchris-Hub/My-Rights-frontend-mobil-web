# My Rights — Privacy Processing Register

Status: engineering baseline for security remediation; not a legal compliance certification.

## Data categories and purposes

| Data | Purpose | Current system location | Retention status |
|---|---|---|---|
| Email / account identity | Authentication and account management | Supabase Auth; app profile | Account lifetime plus provider operational retention |
| Profile fields | Account display and support | Supabase `users`; local cache may exist | Account lifetime; deletion path must be verified |
| Legal chat prompts/responses | Provide legal-information service and conversation history | Supabase chat tables; AI provider during request processing | No zero-retention claim; exact provider retention must be confirmed |
| Uploaded/pasted document content | User-requested analysis/generation | Mobile memory/request body; AI provider during processing | No zero-retention claim; app should not log content |
| Technical/security metadata | Authentication, abuse prevention, diagnostics | Supabase/Edge Function/provider infrastructure | Minimum necessary; exact operational retention must be configured and documented |

## Processor / service flow

Mobile app → Supabase Auth/Edge Function → OpenRouter → configured AI model provider.

Supabase and the AI-processing path are service providers/processors in the technical flow; the exact legal roles, contracts, transfer mechanisms and registration obligations must be confirmed for the production entity and deployment. This document intentionally does not declare regulatory compliance.

## Sensitive-data rule

Legal prompts and documents can contain highly sensitive personal information. The client must avoid unnecessary identifiers, and server logs must never record raw prompts, document contents, authorization headers, provider keys, or full AI responses.

## Retention rule

The product must not promise “zero trace”, “instant deletion”, “never logged”, or equivalent guarantees unless configuration and operational evidence supports them. Deletion is complete only after account data, cached data, application records, and applicable processor/backup retention paths are addressed.

## User rights / requests

The product should provide a documented path for account/data-access and deletion requests. Until an automated deletion workflow is deployed and verified, support-assisted requests remain the fallback. The NDP Act provides data-subject rights including erasure subject to applicable limitations; implementation must therefore distinguish a request from a guaranteed immediate erasure outcome.

## Cross-border processing

The AI request may leave Nigeria through the selected provider chain. The production privacy notice must identify the relevant recipients/processors and applicable transfer safeguards once the actual provider configuration and contracts are confirmed.

## Evidence required before production release

- deployed RLS policies and adversarial authorization tests;
- provider data-processing/retention terms for the exact production account;
- log-redaction and retention configuration;
- verified local-cache deletion on logout/account switch;
- verified account deletion/export workflow;
- current privacy notice with effective date/version;
- processor/data-transfer documentation;
- applicable NDPC registration/DPO/compliance assessment by the responsible legal/privacy team.
