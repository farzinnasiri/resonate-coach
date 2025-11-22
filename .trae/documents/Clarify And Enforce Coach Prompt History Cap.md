## Clarification
- Current behavior: the first call can send the entire preloaded `chatHistory`; only after the response do we trim history to the last 10.
- Reason you saw 37: `messages = ['system', ...chatHistory, 'human']` includes all entries present before trimming. See `src/utils/fitnessCoach.ts:59–63` and trimming at `src/utils/fitnessCoach.ts:90–92`.

## Proposed Fix
- Enforce a pre-send cap so every call sends at most the last 10 prior messages.
- Replace magic numbers with constants to make tuning simple.

## Steps
1. Add `const HISTORY_CAP = 10` and `const OBSERVER_RECENT = 8` near the class fields.
2. In `sendMessage()`, use `const history = this.chatHistory.slice(-HISTORY_CAP)` when building `messages`.
3. Keep the post-response trim (`slice(-HISTORY_CAP)`) as a safeguard.
4. Update observer slice to use `OBSERVER_RECENT`.
5. Improve logging to show `messages.length` so it’s obvious what is sent.

## Outcome
- Every LLM invocation will include the system prompt, the last 10 prior messages, and the new user message—never the whole back scroll. No API changes; purely internal reliability improvement.