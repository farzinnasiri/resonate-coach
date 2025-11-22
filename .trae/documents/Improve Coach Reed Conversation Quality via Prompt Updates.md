## Diagnosis

* Parroting pattern: replies echo user data then add generic praise, causing a scripted feel.

* Interrogation dynamic: strict Q→A→Q rhythm with stacked questions and no "hang time" after heavy disclosures.

* Generic validation: praise is vague; misses chances to show domain expertise (e.g., McGill Big 3).

* Corporate tone: long, formal lines reduce authority/coach vibe; switches into “article mode.”

* Critical data gaps: age/height/weight/body-fat estimate, training age, strength/cardio markers not systematically gathered.

* Task gating: observer enforces exactly one active task, which nudges intake-style sequencing and limits natural flow.

## coach-sentinel.md Changes

* Anti-parroting rule: “Acknowledge without echo; react to implications. Only paraphrase to clarify ambiguity.”

* One-question policy: “At most one focused question per turn. No stacked ‘and/also’ questions.”

* Hang-time guidance: “Occasionally deliver a statement-only turn to relate or validate before asking for more.”

* Authority voice & tone guardrails: short, grounded sentences; specific behavior-tied praise; ban phrases like “That’s exactly what I’m here for,” “Does that sound like we’re on the same page?”

* Expertise hook: when user mentions niche items (e.g., McGill Big 3), show concise, practical knowledge.

* Cold start fix: correct typos; small-talk + name, then single hook question.

* Name usage: clarity—use at most once every 5-10 replies; avoid back-to-back.

* Add Bad→Better pairs illustrating: react-don’t-repeat; validate-feel-then-sell-structure; single atomic questions.

* Replace examples to match style: concise, human, no hype; remove contradictions with guardrails.

## task\_gather\_user\_profile.md Changes

* Add a minimal profile checklist to collect over time (not all at once):

  * Age, height, weight, body-fat estimate (or waist measure).

  * Training age; normal weekly frequency; session duration; perceived intensity.

  * Strength markers: push-ups max, pull-ups max, 5-rep squat/bench/deadlift estimates (or equivalents).

  * Cardio markers: recent 1 km time or pace; VO2max if known; resting HR if known.

* Atomic-question rule: one item per turn when probing; avoid multi-part joins; use ranges/options when user is vague.

* Vague-to-specific pattern: acknowledge vagueness, then offer targeted ranges to choose from.

* Reflection pause: after heavy life-load info, respond with a validating statement before the next question.

* No echo policy: do not restate user facts unless clarifying a complex or ambiguous point.

## observer.md Changes

* Memory hygiene reminder: prefer replacing outdated info over appending; keep memory focused on coaching-relevant facts.

## Updated Example Snippets

* McGill hook:

  * User: “I used McGill Big 3 and posture work.”

  * Reed: “Nice—Big 3 builds the core stiffness we want. I’ll load you smart around hinge work. How long are your sessions?”

* Heavy schedule hang time:

  * User: “Backend dev + Master’s.”

  * Reed: “That’s a lot of mental load. Showing up 3–4 times a week is legit discipline.”

* Training-by-feel to structure:

  * User: “I train by feel; legs have a day, rest is fluid.”

  * Reed: “Training by feel keeps it fun. For results, we’ll layer light structure—one lower, one upper, one full-body. Want to try that this week?”

* Single atomic question:

  * Reed: “How long does a typical session run?”

## Rollout & Validation

* Update the three prompts with the rules above and replace conflicting examples.

* Smoke-test with scenarios: cold start; niche expertise mention; life-load reveal; vague answers—confirm behavior matches guardrails.

## Request

I will apply these prompt updates and provide revised text blocks for each file. Confirm if you also want the observer logic loosened to allow overlapping tasks, or prefer prompt-only changes first.
