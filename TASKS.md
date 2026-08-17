# Tasks

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
