# Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants
1. **Default-Deny Catch-All**: No read or write is permitted to any path unless explicitly matched and validated.
2. **PII Split Isolation**: User email is isolated inside `/users/{userId}/private/{docId}` and strictly accessible only by `isOwner(userId)` or `isAdmin()`.
3. **Strict Ownership & Query Enforcement**: `/mockAttempts/{attemptId}` and `/mistakeNotebook/{mistakeId}` require `userId == request.auth.uid` on both single-document reads/writes and collection `list` queries (`resource.data.userId == request.auth.uid`).
4. **Terminal State Locking**: Once a `MockTestAttempt` reaches `status == 'SUBMITTED'`, no subsequent client updates are permitted unless `isAdmin()`.
5. **Temporal & Immutable Integrity**: `createdAt` must equal `request.time` on creation and remain immutable on update; `updatedAt` must equal `request.time` on update.
6. **Verified Email**: Standard writes require `request.auth.token.email_verified == true`.

## 2. The "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. **Identity Spoofing on Profile**: Authenticated user `uid_A` creates `/users/uid_B` with `{ "uid": "uid_B", ... }`.
2. **Shadow Field Injection on Profile**: Authenticated user creates `/users/uid_A` with extra field `{ "isAdmin": true }`.
3. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to create `/users/uid_A`.
4. **Cross-User PII Read**: Authenticated user `uid_B` attempts `get` on `/users/uid_A/private/info`.
5. **ID Poisoning**: Authenticated user creates `/mockAttempts/` with a 200-char ID or invalid characters (`$bad$id`).
6. **Score Tampering After Submission (Terminal Lock)**: User attempts to update `/mockAttempts/att_1` when `existing().status == 'SUBMITTED'`.
7. **Timestamp Forgery**: User supplies a past or future timestamp for `createdAt` instead of `request.time`.
8. **Immutable Field Mutation**: User updates `userId` or `createdAt` on `/mistakeNotebook/m_1`.
9. **Value Poisoning on Update**: User updates `revisionStatus` on `/mistakeNotebook/m_1` with `"HACKED_STATUS"` not in `['NEEDS_REVIEW', 'REVIEWED', 'MASTERED']`.
10. **Blanket List Scraping**: User runs an unfiltered `list` query on `/mockAttempts` without `where('userId', '==', request.auth.uid)`.
11. **Oversized String DoS**: User creates `/users/uid_A` with `displayName` of 5,000 characters (`> 100` maxLength).
12. **Subcollection Orphan Write**: User `uid_A` creates `/users/uid_A/private/info` when parent `/users/uid_A` does not exist.
