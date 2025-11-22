## Goals

* Remove use of `resonate_observer_tasks` (plural). It is not present anywhere.

* Stop defaulting `resonate_observer_task` to `gather_user_profile`.

* Run the coach without any observer for the first N (N = 3 default, stored as const somewher) rounds; only after N rounds should the observer kick in.

* When the observer kicks in, if the task key is missing OR there is no memory, set the task to `gather_user_profile` and initialize the observer accordingly.

## Current Behavior (Key References)

* Storage keys are defined in `src/utils/storage.ts:4–13`.

* `getObserverTask` returns `GatherUserProfile` by default when missing/invalid `src/utils/storage.ts:113–123`.

* Observer runs every 4 rounds if enabled `src/utils/fitnessCoach.ts:41–48`.

* On chat clear, code sets task to `GatherUserProfile` and enables observer `src/context/AppContext.tsx:82–90`.

* Observer fallback returns stored task and previous memory `src/utils/observer.ts:74–77` and requires non-empty `updated_memory` `src/utils/observer.ts:94–95`.

## Design Changes

* Introduce an optional accessor `getObserverTaskOptional(): ObserverTask | null` that returns `null` when the task is unset; keep existing `getObserverTask()` for compatibility.

* Gate observer execution behind a start threshold `N` in addition to the current modulo cadence; example: `enabled && nextRounds >= N && nextRounds % 4 === 0`.

* On the first observer run (i.e., when crossing `N`), compute the task:

  * If `getObserverTaskOptional()` is `null` OR `getCoachMemory()` is empty, set `taskToRun = ObserverTask.GatherUserProfile` and persist it before running observer.

  * Otherwise, use the previously stored task.

* Stop forcing `ObserverTask.GatherUserProfile` on chat clear; do not set any task so it remains unset until the first observer run after `N` rounds.

* Keep `getObserverEnabled()` default true; the `N` gating ensures “no observer” for the first rounds without changing enable semantics.

* Adjust observer fallback to honor the new logic: if the stored task is unset OR memory is empty, fall back to `GatherUserProfile`; otherwise use the stored task.

## Implementation Steps

1. Storage (non-breaking addition):

   * Add `getObserverTaskOptional` returning `ObserverTask | null` when `LOCAL_STORAGE_KEYS.OBSERVER_TASK` is missing/invalid `src/utils/storage.ts`.
2. FitnessCoach observer gating:

   * Add `const OBSERVER_START_THRESHOLD = 4` (or configurable) near `OBSERVER_RECENT` `src/utils/fitnessCoach.ts:7–9`.

   * Change the trigger condition to `enabled && nextRounds >= OBSERVER_START_THRESHOLD && nextRounds % 4 === 0` `src/utils/fitnessCoach.ts:47`.

   * Before constructing `StateObserver`, compute `taskToRun`:

     * Read `const currentTask = storageUtils.getObserverTaskOptional()` `src/utils/fitnessCoach.ts:51`.

     * Read `const memory = storageUtils.getCoachMemory()` `src/utils/fitnessCoach.ts:48`.

     * If `!currentTask || !memory`, set and persist `ObserverTask.GatherUserProfile` via `storageUtils.setObserverTask(...)` then run observer with that task.
3. AppContext clear behavior:

   * Remove `storageUtils.setObserverTask(ObserverTask.GatherUserProfile)` from `clearMessages` `src/context/AppContext.tsx:86`.

   * Keep resetting rounds and memory `src/context/AppContext.tsx:85,87`.
4. Observer fallback:

   * Replace `const active_task: ObserverTask = storageUtils.getObserverTask();` with optional accessor; compute fallback `active_task` as `GatherUserProfile` when no stored task OR memory is empty `src/utils/observer.ts:74–76`.

## Code Touchpoints

* `src/utils/storage.ts:113–127` add `getObserverTaskOptional()` and keep existing `getObserverTask()` intact for other callers.

* `src/utils/fitnessCoach.ts:41–67` update trigger condition and pre-run task selection.

* `src/context/AppContext.tsx:82–90` stop forcing `GatherUserProfile` on clear.

* `src/utils/observer.ts:70–77, 79–101` adjust fallback logic to respect unset task + empty memory rule.

## Validation Plan

* Simulate 3 rounds: verify observer not invoked; `OBSERVER_TASK` remains unset; memory remains empty.

* On 4th round: verify observer initializes with `GatherUserProfile` if task unset OR memory empty; task persisted to storage; memory updated from observer.

* With non-empty memory and a stored task, later runs should use the stored task; observer cadence remains every 4 rounds.

* Clear chat: verify task is unset, rounds reset to 0, memory cleared; observer re-initializes after threshold with `GatherUserProfile`.

## Risks & Mitigations

* Type change ripple: avoid by adding `getObserverTaskOptional` rather than changing `getObserverTask` signature.

* Backward compatibility: callers still using `getObserverTask()` retain old behavior; only observer paths switch to optional logic.

* User data: ensure we never log or persist secrets; only task and memory fields in localStorage per existing patterns.

Please confirm N (default proposed: 4) or specify a different threshold, and I will implement these changes and run a quick local verification.
