# Security Validation Specifications - FireStore Access Controls

These specifications map directly to attribute-based access controls for the Google Internal Job Mobility platform to defend against unauthorized write or read operations.

## 1. Data Invariants

- **User Accounts Isolation:** A user doc matching parent `/users/{userId}` can only be read or written by the authenticated user with a UID identical to `{userId}`.
- **RBAC Immutability:** Employees cannot modify their own `role` attribute once assigned by corporate directories.
- **Profile Ownership:** A `/profiles/{profileId}` document must have its `userId` field matched to the authenticated accessor `request.auth.uid`. No user can tamper with someone else's career metrics.
- **Timestamp Integrity:** All created/updated milestones are stamped with `request.time` (no client tampering).

## 2. The Dirty Dozen Payloads (Simulated Vulnerabilities Defeated)

1. **Privilege Escalation Request:** Changing user role from `EMPLOYEE` to `HR_ADMIN`. (Defeated by: `incoming().diff(existing()).affectedKeys().hasOnly(['title', ...])`).
2. **Profile Spoofing Write:** Accessing a profile that belongs to another employee. (Defeated by: checking `resource.data.userId == request.auth.uid`).
3. **Anomalous Document Poisoning:** Injecting oversized string fields to incur heavy costs or UI clipping. (Defeated by: `.size() <= 200` checks).
4. **Impostor ID Creation:** Suffixing invalid or malicious junk characters as directory IDs. (Defeated by: `id.matches('^[a-zA-Z0-9_-]+$')`).
5. **PII Leak Query:** Sourcing lists of other email entries. (Defeated by: requiring explicit ownership on lists).

## 3. Recommended Firebase Security Rules

Refer to `firestore.rules` for the finalized access rule declarations.
