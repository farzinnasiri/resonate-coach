## Overview
- Add a settings icon in the existing top‑right toolbar. Clicking it opens a modal consistent with app theme.
- Modal shows two editable sections: `Profile Memory` and `Goals Memory`, each with its own Save button. Saves persist to localStorage via existing `storageUtils` APIs, update the modal state, and show toasts.

## UI Entry Point
- Update `src/components/ChatInterface.tsx` to include a `Settings` icon button adjacent to the color profile select, dark mode toggle, and reset button.
  - Reference: toolbar is implemented in `src/components/ChatInterface.tsx:78–123`.
  - Add local state to open/close the modal.

## Modal Component
- Create `src/components/SettingsModal.tsx`:
  - Overlay and container follow `UserNamePopup` visual language and theme tokens.
    - Reference: `src/components/UserNamePopup.tsx:21–23` for `fixed inset-0` backdrop and `bg-[var(--color-surface)]` container.
  - Inside the modal:
    - Section 1: `Profile Memory`
      - A multiline `textarea` prefilled from `storageUtils.getProfileMemory()`.
      - `Save Profile` button: calls `storageUtils.setProfileMemory(value)` and shows `toast.success`.
    - Section 2: `Goals Memory`
      - A multiline `textarea` prefilled from `storageUtils.getGoalsMemory()`.
      - `Save Goals` button: calls `storageUtils.setGoalsMemory(value)` and shows `toast.success`.
  - Close button in header (top‑right) and backdrop click to dismiss.

## Storage Integration
- Use existing localStorage helpers to avoid duplicating logic:
  - `src/utils/storage.ts:160–178`: `getProfileMemory`, `setProfileMemory`, `getGoalsMemory`, `setGoalsMemory`.
- No new keys or context changes required; coach/observer already read these values on message send.
  - Reference reads: `src/utils/fitnessCoach.ts:69–75` (input assembly), and `src/utils/observer.ts:56–68`.

## Styling & Theme
- Match theme tokens and Tailwind conventions used elsewhere:
  - Container: `bg-[var(--color-surface)]`, border `border-[var(--color-outline)]`, text `var(--color-on-surface)`.
  - Buttons: primary color `var(--color-primary)` / `var(--color-on-primary)` with subtle glass/shadow effects.
  - Inputs: same rounded, outline behavior and focus ring as `UserNamePopup` input (`src/components/UserNamePopup.tsx:44–51`).
- Icons via `lucide-react` (`Settings`). Dependency is already used (`Trash2`, `User`).

## Accessibility & UX
- Provide labels for both textareas and aria‑labels for buttons.
- Modal is dismissible with ESC, backdrop click, and an explicit close icon.
- Use `sonner` to present save feedback, consistent with existing app notifications (`src/App.tsx:24–37`).

## Wiring in ChatInterface
- Add the settings button next to existing controls.
- When open, render `<SettingsModal onClose={...} />` at the root of `ChatInterface`.
- Maintain UX balance with spacing classes (`gap-2`) consistent with the toolbar.

## Verification
- Manual checks:
  - Open modal; textareas prefill from localStorage.
  - Edit and save each section; verify persistence in localStorage and toast feedback.
  - Send a message; chain should read the updated values (observer/coaching prompt path).
- No unit tests currently; can add lightweight tests later if desired.

## Files to Add/Change
- Add: `src/components/SettingsModal.tsx`
- Change: `src/components/ChatInterface.tsx` (add settings button + modal mount)

## Rollback
- Changes are isolated; removing the settings button and component restores previous behavior without affecting storage.
