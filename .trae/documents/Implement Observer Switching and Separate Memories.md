## Overview

* Add per‑observer switching with distinct thresholds and cadence, moving from profiling → goals → free coaching.

* Split memory into `PROFILE_MEMORY` and `GOALS_MEMORY` across storage, observers, and prompt injection.

* Refactor `coach-sentinel` to receive both memories separately.

## Types & Storage

* Update `ObserverTask` to include explicit states: `gather_user_profile`, `explore_goals`, `free_coaching`.

* Add storage keys and helpers for separate memories:

  * `getProfileMemory` / `setProfileMemory`

  * `getGoalsMemory` / `setGoalsMemory`

* Keep existing observer task persistence (`getObserverTask`, `setObserverTask`) and rounds; introduce per‑observer config to avoid per‑observer counters.

## Observer Engine

* In `src/utils/observer.ts`:

  * Select base prompt by `ObserverTask`.

  * Inject `PROFILE_MEMORY` and `GOALS_MEMORY` distinctly when `ExploreGoals` runs; inject `PROFILE_MEMORY` only for profiling.

  * Adjust JSON parsing:

    * Profiling observer returns `{ active_task, profile_memory, agenda, brief }`.

    * Goals observer returns `{ active_task, goals_memory, agenda, brief }`.

    * Free coaching observer can return `{ active_task, agenda, brief }` (no memory updates) or keep minimal state.

  * Route updated memory into storage based on which observer produced it.

## Threshold Config (3 constants per observer)

* Replace universal `OBSERVER_START_THRESHOLD`/`OBSERVER_CADENCE` with per‑observer config object:

  * `PROFILING: { start_after_rounds, cadence, recent_window }`

  * `GOALS: { start_after_rounds, cadence, recent_window }`

  * `FREE_COACHING: { start_after_rounds, cadence, recent_window }`

* Use these to decide when to trigger an observer and how many recent messages to pass.

## Switching Logic

* In `src/utils/fitnessCoach.ts`:

  * On each user turn, increment global rounds.

  * Determine which observer to run using active task and its config.

  * After an observer returns JSON:

    * If `active_task` is `explore_goals`, set observer task to goals.

    * If `active_task` is `free_coaching`, set observer task to free coaching.

    * Persist updated `profile_memory` or `goals_memory` as appropriate.

## Prompt Injection

* For the observer:

  * Pass `PROFILE_MEMORY` and `GOALS_MEMORY` explicitly to `state-observer-goals.md`.

  * Pass `PROFILE_MEMORY` only to profiling observer.

* For `coach-sentinel`:

  * Render with separate fields: `{ profile_memory, goals_memory, observer_task, brief, agenda, time }`.

  * Remove single `memory` usage.

## Prompt Files

* `src/prompts/state-observer-goals.md`:

  * Already defines `PROFILE_MEMORY`/`GOALS_MEMORY`. Ensure the engine injects both.

* `src/prompts/state-observer-profiling.md`:

  * Update references from generic `MEMORY` to `PROFILE_MEMORY`.

* `src/prompts/coach-sentinel.md`:

  * Replace `MEMORY: {memory}` with two lines:

    * `PROFILE_MEMORY: {profile_memory}`

    * `GOALS_MEMORY: {goals_memory}`

## Flow Details

* Start in `gather_user_profile` until profiling observer indicates goals are ready (via \`active\_task: "explore\_goals").

* Run goals observer on its cadence; it updates `goals_memory` and sets `active_task` to `free_coaching` after confirmation.

* In `free_coaching`, stop observer cadence unless config allows periodic check‑ins; continue to inject both memories into `coach-sentinel` for personalization.

## Defaults (tunable)

* `PROFILING`: `{ start_after_rounds: 2, cadence: 2, recent_window: 10 }`

* `GOALS`: `{ start_after_rounds: 0, cadence: 2, recent_window: 10 }`

* `FREE_COACHING`: `{ start_after_rounds: 0, cadence: 3, recent_window: 20 }`

## Validation

* Manual run by the user, giving feedback

## Deliverables

* Updated `types`, `storage`, `observer`, `fitnessCoach`.

* Prompt updates for profiling and coach sentinel.

