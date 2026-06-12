# Private conversations only — design

**Date:** 2026-06-12
**Status:** approved by Arthur

## Problem

The dashboard conversations list and overview stats include WhatsApp **group chats**
(n8n stores them with `customer_phone` like `120363038135166547` or
`554197421194-1495296281`). The owner only wants private 1:1 customer chats.

Also, conversation history looks one-sided (customer messages only). Investigation
showed the backend/frontend already display business-side messages; the gap is that
the n8n workflow rarely stores them: only 40 `role='business'` rows exist, zero
`role='assistant'` (AI replies are never saved), plus 3 corrupted rows with the
JSON-quoted role `'"customer"'`.

## Decisions

1. **Private-only predicate.** A chat is private iff `customer_phone` is digits-only,
   8–14 chars: SQL `customer_phone ~ '^[0-9]{8,14}$'`, Python
   `core.phone.is_private_phone()`. Excludes 18-digit group IDs, legacy
   `number-timestamp` groups, and broadcasts. Applied to:
   - `repositories/conversations.py:list_conversations` (the DISTINCT subquery)
   - all five queries in `services/stats_service.py`
   Group rows stay in the DB; they are only hidden.
2. **/process safety net.** If `customer_phone` is not private, return
   `ProcessOut(reply="", classification="OUT_OF_SCOPE")` without calling the LLM,
   and log a warning. n8n must skip sending empty replies.
3. **Role fixes.** Idempotent migration in `schema.sql` un-quotes corrupted roles
   (`'"customer"'` → `customer`). Stats: human handoffs match
   `role IN ('owner','business','employee')` (only `business` exists in data);
   avg response time keeps `role='assistant'` (correct once n8n saves AI replies).
4. **n8n workflow (Arthur's side, out of repo).** After sending the /process reply,
   INSERT it into `messages` with `role='assistant'`; save manual owner sends with
   `role='business'`. Until then, history stays customer-only for most chats.

## Testing

- pytest for `is_private_phone` (groups, legacy groups, broadcasts, private BR/intl).
- Local server against real DB: `GET /api/conversations` shows no `120363…`/`-` rows;
  `/process` with a group `customer_phone` returns empty reply; stats endpoint works.
