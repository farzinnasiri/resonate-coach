## Scope
- Implement a single hard‑coded ProfilingObserver (Gemini Flash Lite) that maintains MEMORY and toggles TASKS for onboarding.
- Run the observer every 3 rounds while enabled; stop when `gather_user_profile` becomes `true`.
- Inject MEMORY and task guidance via explicit placeholders inside the coach prompt template.
- Keep the observer interface in code/doc for future expansion, but do not add dynamic registries or managers now.

## Files to Update
- `src/utils/storage.ts`: add minimal keys and getters/setters for MEMORY, observer enabled flag, rounds counter, and tasks.
- `src/utils/fitnessCoach.ts`: integrate the observer (interface + ProfilingObserver) and prompt injection, schedule and stop logic inside `sendMessage()`; enhance `buildContext()` to use template placeholders.
- `src/prompts/coach-sentinel.md`: add two placeholders to enable surgical injection: `<!-- MEMORY_BLOCK -->` and `<!-- TASK_MODULES -->`.

## Storage Keys
- `resonate_coach_memory`: string
- `resonate_observer_enabled`: boolean (default `true`)
- `resonate_observer_rounds`: number (default `0`)
- `resonate_observer_tasks`: JSON `{ gather_user_profile: boolean; explore_goals: boolean; coach_on_training: boolean }` (default all `false`)

## Observer Interface (kept simple)
- `interface IObserver { id: string; name: string; run(input: { memory: string; recentMessages: ChatMessage[] }): Promise<{ tasks; updated_memory }>; }`
- `ProfilingObserver` (id: `user_profile_observer`) uses `src/prompts/observer.md` with the lite Gemini model and strict JSON parsing.

## Scheduling & Stop Condition
- Hard‑code: `roundsInterval = 3`, `stopOnTask = 'gather_user_profile'`, `stopOnValue = true`.
- Inside `FitnessCoachChain.sendMessage()`:
  - Read `observer_enabled` and `observer_rounds` from storage.
  - If `enabled && (rounds % 3 === 0)`, run observer with current `memory` and `chatHistory.slice(-8)`.
  - Persist `updated_memory` and `tasks` back to storage.
  - If `tasks.gather_user_profile === true`, set `observer_enabled = false`.
  - Update `observer_rounds` (increment/reset appropriately).

## Template‑Based Injection
- `buildContext()` loads `coach-sentinel.md` string.
- Replace `<!-- MEMORY_BLOCK -->` with `"MEMORY\n\n" + memory` (or empty if none).
- If `tasks.gather_user_profile === true`, replace `<!-- TASK_MODULES -->` with the text of `src/prompts/task_gather_user_profile.md`; otherwise inject empty.
- Fallback: if placeholders are absent, append minimal, well‑delimited blocks so the coach still receives MEMORY and task module.

## Minimal Changes to App Layer
- Do not wrap `AppContext.sendMessageToAI`; rely on `FitnessCoachChain.sendMessage()` to handle observer scheduling.
- Continue to use existing message flow in `ChatInterface.tsx` without UI changes.

## Error Handling
- Observer JSON parsing: strip code fences, accept only exact keys and booleans per `src/prompts/observer.md:71-78`; on failure, keep previous memory/tasks.
- Low temperature and `maxRetries: 1` for the observer; do not log secrets.

## Verification
- Manual conversation: confirm observer runs at rounds 3 and disables immediately when `gather_user_profile` flips to `true`.
- Confirm MEMORY appears via the placeholder and task module is injected only when active.

## Design Notes
- Keep the observer interface and the `ProfilingObserver` name for future multi‑observer expansion.
- Avoid dynamic configuration and registries for now; behavior is hard‑coded and simple.
- Surgical template injection reduces overexposure and keeps the coach prompt clean while making common usage simple.