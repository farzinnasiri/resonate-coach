## Goals

* Allow observer to switch between `gather_user_profile` and `explore_goals` when needed.

* Prevent switching back once `coach_on_training` is active.

* Make profiling single‑path robust: do not move to `explore_goals` until core checklist is complete and ambiguities are cleared.

## Changes

* Observer gating:

  * Encode explicit completeness criteria for profiling: age, height, weight, training age, weekly frequency, session duration, intensity (RPE), key strength/cardio markers (minimal), injuries/pain status, lifestyle load, sleep basics, nutrition basics.

  * Add ambiguity checks: if any of the above are vague/contradictory/missing in MEMORY, keep `active_task = gather_user_profile`.

  * Permit `active_task` to toggle between `gather_user_profile` and `explore_goals` based on gaps and conversation focus; forbid toggling back from `coach_on_training`.

* Observer lifecycle:

  * Keep observer enabled until `active_task` becomes `coach_on_training`.

  * Only disable observer when `active_task === coach_on_training`.

* Cadence and window:

  * Increase `recentMessages` window from 8 → 10 for observer input.

* Prompt updates:

  * Align `observer.md` switching rules with `task_gather_user_profile.md` “Done When”; explicitly require sleep and nutrition coverage.

  * Clarify that “Never go back once you moved forward” applies only after entering `coach_on_training`.

  * Allow nudges to target missing sleep/nutrition even during `explore_goals` if MEMORY lacks them.

* Add a final checklist to the observer, to recall the important sections and its goals so it does not deviate

## Files (planned edits)

* `src/prompts/observer.md`: strengthen switching criteria, ambiguity handling, and backtracking policy limited to pre‑coach stages.

* `src/utils/fitnessCoach.ts`: keep observer enabled until coach mode; change disable logic; set `recentMessages.slice(-10)`.

## Validation

* Conversation tests:

  * Injury deep‑dive → confirm observer stays in profiling until sleep/nutrition are covered, then moves to goals.

  * Vague answers → observer stays in profiling and nudges targeted clarifications.

  * Completed profiling + clear goals → observer moves to coach mode and stays there.

* Manual runs to verify no regression to profiling after coach mode is active.

