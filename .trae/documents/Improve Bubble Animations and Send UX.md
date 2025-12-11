## Goals
- Let users type while the coach is replying, but block sending.
- Make bubble pacing faster for short messages.
- Remove the spinner on the send button; keep the button disabled during replies.
- Replace the paper-plane with a minimal right-pointing triangle icon.
- Fix multi-bubble jank when the typing indicator disappears and the next bubble stacks awkwardly.

## Where To Change
- `src/components/MessageInput.tsx` (composer and button)
- `src/components/ChatInterface.tsx` (reply orchestration and timers)
- `src/components/MessageList.tsx` (typing indicator and scroll behavior)

## Implementation Details
### Allow typing while replying
- In `MessageInput.tsx` remove the textarea lock:
  - Change `disabled={isLoading}` at `src/components/MessageInput.tsx:34` to keep it enabled.
  - Keep sending blocked via existing checks: `handleSubmit` already guards `!isLoading` at `src/components/MessageInput.tsx:13–17` and Enter-to-send at `src/components/MessageInput.tsx:19–24`.

### Faster bubble timing
- In `ChatInterface.tsx` adjust delay computation:
  - Current bounds and scale at `src/components/ChatInterface.tsx:39–53` result in minimum ≈800ms and long tails.
  - New parameters:
    - `WPM = 80`, `SCALE = 0.30`, `MIN_DELAY = 250ms`, `MAX_DELAY = 1800ms`, jitter ±15%.
    - `POST_GAP_BASE = 300ms`, `POST_GAP_MIN = 200ms`, jitter ±20%.
  - These changes shorten small-bubble pauses without making multi-bubble replies feel abrupt.

### Fix typing indicator sequencing
- Reorder the loop in `handleSendMessage` so the typing indicator is shown before each bubble and replaced in-place by the bubble:
  - Current flow adds the bubble then turns on typing for the next one (`src/components/ChatInterface.tsx:65–70`). This causes the visible indicator to disappear, the first bubble drops, then the next bubble appears under it.
  - New flow:
    - Set `setIsTyping(true)` before each bubble.
    - `await delayFor(bubble)`.
    - `setIsTyping(false)` and immediately `addMessage(aiBubble)`.
    - If more remain: `await postGap()` then turn typing back on for the next bubble.
  - This replaces the typing indicator with the bubble in-place, eliminating the stacking/jank.

### Remove spinner and use minimal triangle icon
- In `MessageInput.tsx`:
  - Keep the button disabled while replying: `disabled={!message.trim() || isLoading}` at `src/components/MessageInput.tsx:43` remains.
  - Remove the spinner block `src/components/MessageInput.tsx:46–50`.
  - Replace `lucide-react` `Send` import with a small inline SVG triangle pointing right:
    - `<svg viewBox="0 0 24 24" className="w-4 h-4"><polygon points="5,4 20,12 5,20" fill="currentColor"/></svg>`.
  - Add `aria-label="Send"` and keep `disabled` styling (`disabled:opacity-50` and `cursor-not-allowed`).

### Minor MessageList improvement
- Optionally auto-scroll when `isTyping` changes:
  - Add a small `useEffect(() => scrollToBottom(), [isTyping])` in `src/components/MessageList.tsx` to keep the latest typing bubble/bubble replacement in view and reduce perceived lag.

## Verification
- Functional:
  - Start a multi-bubble reply; type in the textarea and confirm input is editable while the send button stays disabled.
  - Observe faster pacing for short bubbles.
  - Confirm the send button shows a triangle, no spinner, and remains disabled during replies.
  - Watch the typing indicator: it should be replaced by each bubble in-place with no stack-under jank.
- Code references to review:
  - Timing and loop: `src/components/ChatInterface.tsx:39–71`.
  - Input and button: `src/components/MessageInput.tsx:26–51`.
  - Typing bubble: `src/components/MessageList.tsx:39–49`.

## Rationale
- Simplifies UI state exposure by keeping input always interactive and only gating send.
- Reduces cognitive load with shorter, bounded delays and in-place indicator replacement.
- Removes redundant feedback (spinner) since typing indicators already communicate progress.

## Next Step
- I will implement the above edits in the three files and verify in the running UI.