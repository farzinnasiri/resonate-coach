## Goals
- Replace boolean task flags with a single enum while preserving orchestration logic.
- Add observer "nudges" to keep coaching on-track.
- Make observer checklist-driven by comparing memory to required fields.
- Simplify `task_gather_user_profile.md` into a short checklist + minimal behavior rules.

## Current Architecture (Key Touchpoints)
- `src/utils/observer.ts`: boolean `ObserverTasks` and parsing (e.g., lines 6–10, 65–97); `ProfilingObserver.run(...)` builds prompt and returns `ObserverResult` (40–63).
- `src/utils/fitnessCoach.ts`: assembles system prompt with `coach-sentinel.md` and `task_gather_user_profile.md` (imports at 2–3), and runs observer every N rounds (28–46). 
- `src/utils/storage.ts`: persists `OBSERVER_ENABLED`, `OBSERVER_ROUNDS`, and `OBSERVER_TASKS` (88–130).
- `src/prompts/coach-sentinel.md`: contains placeholders `<!-- MEMORY_BLOCK -->`, `<!-- TASK_MODULES -->`.
- `src/prompts/task_gather_user_profile.md`: long ruleset to be simplified.

## Data Model Changes
- Create `enum ObserverTask { GatherUserProfile, ExploreGoals, CoachOnTraining }`.
- Change `ObserverResult` from `{ tasks: ObserverTasks; updated_memory: string }` to `{ active_task: ObserverTask; updated_memory: string; nudges?: string[]; checklist_progress?: { collected: string[]; missing: string[] } }`.
- Parser accepts legacy boolean objects and maps to enum; if both present, enum wins. Normalization still ensures exactly one active task.
- Storage: add `getObserverTask()`/`setObserverTask(ObserverTask)` and maintain backward compatibility by reading old booleans and translating.

## Observer Updates
- Implement a checklist for profile gathering:
  - `age`, `height`, `weight`, `bodyfat_or_waist`, `training_age`, `weekly_frequency`, `session_duration`, `intensity`, `strength_markers`, `cardio_markers`, `injuries_pain`, `lifestyle_load`, `sleep_basic`, `nutrition_basic`.
- In `ProfilingObserver.run(...)`:
  - Compare memory string to checklist keys via lightweight heuristics (key-label detection); build `checklist_progress` arrays.
  - Generate `nudges`: one atomic next-question targeting the top missing item; include a short rationale.
  - Continue existing cadence and fallbacks; if parsing fails, reuse prior memory/task.
- Update `parseObserverJson(...)` to parse enum value or legacy booleans and produce `active_task`.

## Coach Orchestration Updates
- In `buildContext()` (`src/utils/fitnessCoach.ts`):
  - Read `active_task` from storage; include corresponding task module when `ObserverTask.GatherUserProfile`.
  - If `nudges` present, append an "Observer Guidance" block to the system prompt (similar to how memory/tasks are appended when placeholders aren’t found).
  - Preserve existing cadence: run observer every 3 rounds; disable observer when the active task transitions away from `GatherUserProfile` (mirrors prior `gather_user_profile === false` behavior).

## Prompt Simplification
- Replace `src/prompts/task_gather_user_profile.md` with:
  - A concise checklist section (the fields listed above).
  - Minimal behavior rules: respond first, ask at most one atomic follow-up, validate after heavy info, use targeted ranges for vague answers, stop when core profile can be summarized.
  - No long narrative; structured, scannable, and focused on next-question selection.

## Backward Compatibility & Migration
- On app start/reset (`src/context/AppContext.tsx` 85–87): initialize `ObserverTask.GatherUserProfile` instead of the booleans; if legacy booleans exist, auto-convert and clear them.
- Keep storage reads tolerant: if enum missing but booleans exist, derive enum.

## Validation Plan
- Unit-level harness: simulate memory strings with varying completeness; assert `checklist_progress` and `nudges` choose the correct next item.
- Integration test path: run a short conversation, verify observer triggers enum, updates memory, and coach prompt includes Observer Guidance.
- Manual check: ensure disabling observer mirrors prior behavior when profile gathering ends.

## Deliverables
- Enum-based observer data model and parser.
- Checklist-driven comparison and nudge generation.
- Updated storage and orchestration to read/use enum.
- Simplified `task_gather_user_profile.md` with checklists.
- Verification tests or harness to exercise the new flow.