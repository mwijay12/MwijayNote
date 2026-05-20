# Security Specification for Mwijay App

## Data Invariants
1. A user can only access data where the path variable `userId` matches their `request.auth.uid`.
2. All writes must include a valid `userId` field that matches `request.auth.uid`.
3. IDs must be strictly validated.

## The Dirty Dozen Payloads (Denial Tests)

1. **Identity Spoofing**: Try to create a journal entry with a different `userId`.
2. **Path Injection**: Try to use a huge string as `userId`.
3. **Ghost Field**: Adding `isVerified: true` to a user profile.
4. **Terminal State Break**: (Not applicable yet, no terminal states).
5. **PII Leak**: Non-owner trying to 'get' a user profile.
6. **Query Scraping**: `allow list: if isSignedIn()` without `resource.data` check.
7. **Type Poisoning**: Sending `amount: "lots"` (string) instead of number for Expense.
8. **Size Attack**: Sending a 1MB string for a title.
9. **Orphaned Write**: Creating a journal for a non-existent user path.
10. **Timestamp Spoofing**: Sending a fake `createdAt` in the past.
11. **Immutable Break**: Trying to change `userId` on update.
12. **Recursive Cost Attack**: Designing deep paths.

## Test Runner
(Omitted for brevity in this scratchpad, but would be in `firestore.rules.test.ts`)
