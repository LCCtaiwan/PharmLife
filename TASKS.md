# Tasks

## C-010 — Hospital Career v0.6

### Documentation Gate

- [x] Restore Hospital to a complete age 25→65 career.
- [x] Make age 35 a chapter review rather than a career ending.
- [x] Replace optional duty actions with hospital assignments and representative work episodes.
- [x] Separate core competencies, assignment proficiency, qualifications and current condition.
- [x] Define development preferences, hospital approval and failure-forward rules.
- [x] Define persistent workplace relationships and NPC career movement.
- [x] Include an optional romance line without requiring marriage or penalizing single life.
- [x] Keep parenting, housing and full household-finance simulation out of scope.
- [x] Keep all other careers out of scope.
- [x] Receive user acceptance and Freeze v0.6.

### Runtime rebuild

- [x] Replace annual direction with assignment, episode and preference phases.
- [x] Implement the new growth and qualification state.
- [x] Implement workplace-relationship and opt-in romance state.
- [x] Rebuild and validate age 25–29 newcomer／PGY play.
- [ ] Extend the accepted loop to the age-35 chapter review.
- [ ] Extend the same Hospital system to age 65.
- [x] Run deterministic tests, production build and 25–29 mobile browser playthrough.

## C-008 — Hospital v0.5 ten-year fun slice（historical）

### Documentation Gate

- [x] Freeze the ten-year product test and explicit exclusions.
- [x] Define annual goals, recurring colleagues, event chains and hidden Seed fate.
- [x] Define choice-information rules, endings and verification evidence.

### Core rebuild

- [x] Add annual-goal and colleague-memory state.
- [x] Add generic workplace-event schema and condition selection.
- [x] Add hidden Seed fate and fate modifiers.
- [x] Split work direction from event response and report resolution.
- [x] Add at least three multi-step event chains.
- [x] End the run after ten reports at age 35.

### UI and verification

- [x] Render goal, event, outcome, report and ending screens.
- [x] Add at least five reachable endings.
- [x] Add deterministic story and event-chain tests.
- [x] Run all tests and production build.
- [x] Complete a 390×844 browser playthrough.

## C-006 — Career Layer v0.4 M0/M1

### Documentation Gate

- [x] Record v0.4 as the frozen source of truth.
- [x] Define the old-version preservation strategy.
- [x] Define M0/M1 scope and explicit exclusions.
- [x] Define verifiable acceptance evidence.

### M0 Foundation

- [x] Add versioned seeded RNG for the Career Layer.
- [x] Add Career Schema and GameState types.
- [x] Add compensation, milestone, gap, promotion, burnout and transition state.
- [x] Add URL debug parser and `fastForward`, `simulate`, `dumpTimeline` helpers.
- [x] Add Hospital data and schema validation.

### M1 Hospital vertical slice

- [x] Draw three annual choices and resolve one choice.
- [x] Calculate abilities, performance, signature, stress and compensation.
- [x] Apply simplified promotion and burnout checks.
- [x] Play from age 25 to retirement at 65.
- [x] Render semantic HTML annual report and ending card.

### Verification

- [x] Seed reproducibility tests pass.
- [x] Debug parser tests pass.
- [x] Career schema and compensation tests pass.
- [x] Forty-year Hospital playthrough test passes.
- [x] Existing tests remain passing.
- [x] Production build passes.
- [x] Desktop and mobile browser smoke tests pass.

## Later frozen steps — not part of C-006

- Seven additional career data files without engine changes.
- Dummy ninth-career schema test.
- Full promotion pity and ceiling content.
- Full burnout resolution.
- Transition engine, transferable experience, age penalty and skill decay.
- Career/common event pools and multi-strategy balance analysis.
