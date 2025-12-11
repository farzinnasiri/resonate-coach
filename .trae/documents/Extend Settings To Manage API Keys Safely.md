## Overview

* Expand the Settings modal to manage API keys for OpenAI and Gemini (Google): add inputs to update keys and explicit Remove buttons for each.

* Ensure updates/removals correctly propagate to storage and AppContext so the coach chain and UI gating remain consistent without corrupting flow.

## UI Changes

* Settings modal (`src/components/SettingsModal.tsx`):

  * Add two sections:

    * OpenAI API Key: text input, Save button, Remove button.

    * Gemini API Key: text input, Save button, Remove button.

  * Prefill values from `storageUtils.getOpenAIApiToken()` and `storageUtils.getGoogleApiToken()`.

  * On Save, persist and show success toasts.

  * On Remove, confirm, persist removals, and show success toasts.

## Storage Layer

* `src/utils/storage.ts`:

  * Add `removeOpenAIApiToken()` to clear `OPENAI_API_TOKEN`.

  * Add `removeGoogleApiToken()` to clear both `GOOGLE_API_TOKEN`&#x20;

  * retrire and legacy `API_TOKEN` from the code and storeage with all related functionalityes and tracesd to it. don't need it anymore

    <br />

## AppContext Integration

* `src/context/AppContext.tsx`:

  * Add `removeOpenAIToken()`:

    * Clear storage via `storageUtils.removeOpenAIApiToken()`.

    * Update `openaiToken` state to `null`.

    * If `coachProvider === 'openai'`, optionally switch to `'google'` if a valid Google key exists; otherwise leave provider unchanged and rely on existing action gating.

  * Add `removeGoogleToken()`:

    * Clear storage via `storageUtils.removeGoogleApiToken()`.

    * Update both `apiToken` and `googleToken` to `null`.

    * Set `fitnessChain` to `null` to disable message sending path.

    * The app-level gating in `src/App.tsx` (`apiToken ? ChatInterface : TokenSetup`) will route back to TokenSetup automatically.

  * Ensure `setApiToken` (Google) and `setOpenAIToken` continue to update state and reinitialize chain (existing behavior). Rebuild `FitnessCoachChain` on Google key updates.

## Flow Guarantees

* Chat send gating in `src/components/ChatInterface.tsx:16–20` already blocks sends if provider lacks token; we retain this.

* Provider selection UI prevents switching to OpenAI without a token (`ChatInterface.tsx:87–94`).

* On Google key removal, `AppContent` (`src/App.tsx`) falls back to `TokenSetup` because `apiToken` becomes `null`.

* Observer logic uses Gemini key; by resetting `fitnessChain` and clearing Google token, observer path cannot run until a key is re-provided.

## Verification

* Manual scenarios:

  * Update Gemini key: chain reinitializes; can send messages; observer reads the new key.

  * Remove Gemini key: app returns to TokenSetup; attempts to send are disabled since `fitnessChain` is `null`.

  * Update OpenAI key: OpenAI provider usable; Gemini-backed observer remains available.

  * Remove OpenAI key: switching to OpenAI is blocked by UI; Google provider continues working if its key remains.

* Confirm localStorage keys reflect operations: `OPENAI_API_TOKEN`, `GOOGLE_API_TOKEN`, and legacy `API_TOKEN`.

## Files to Change

* Update: `src/components/SettingsModal.tsx` (add token inputs/buttons and handlers)

* Update: `src/utils/storage.ts` (add removal helpers)

* Update: `src/context/AppContext.tsx` (add removal methods and state resets)

## Rollback

* Changes are additive and isolated. Removing the new modal fields/buttons or skipping the removal helpers restores previous behavior without impacting other features.

