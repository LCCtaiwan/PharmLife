# PharmLife Career Layer SPEC v0.4 — FREEZE

> Status: `FREEZE`
> Change: C-006
> Source of truth: referenced conversation “介紹棒球人生模擬器” and the user-approved v0.4 specification.
> Rule: implementation may fix defects, add tests, and tune balance, but must not add product scope.

## Goal

Build a data-driven pharmacist career simulation in which a player can start as a 25-year-old hospital pharmacist, make one meaningful annual choice, experience performance, compensation, promotion and burnout outcomes, and retire at 65 with a readable career ending.

The architecture passes when a future ninth career can be added as data without changing career-specific branches in the engine.

## Current implementation slice

This delivery covers M0 Foundation and the first M1 vertical slice:

1. TypeScript + Vite application foundation.
2. Versioned seeded RNG and reproducible cursor state.
3. Career-layer `GameState`.
4. Debug URL and console helpers.
5. Career Schema, including compensation, milestones, gap, promotion, burnout and transition state.
6. Hospital career data.
7. Playable annual loop from age 25 through retirement at 65.
8. Semantic HTML annual report and ending card.
9. Unit tests and build verification.

## Explicitly not included

- Student years, pharmacist examinations or job-search season.
- The other seven careers.
- Full Promotion Pity / Hard Pity and Career Ceiling narratives.
- Full five-option Burnout resolution system.
- Career transition scoring, offers or playable transfers.
- Transferable-experience calculation, age penalty and skill decay.
- Full career/common event pools.
- NPC, family, entrepreneurship or complete job-market systems.
- Share PNG or public-site deployment.

The schema reserves state for later frozen steps. Reserved state does not authorize implementing those systems now.

## Annual loop

```text
Start of year
→ draw 3 choices from hospital annualChoices
→ player selects 1 direction
→ apply ability, workload, recovery and compensation effects
→ calculate performance and signature growth
→ calculate stress, simplified burnout and annual income
→ run simplified promotion check
→ show annual report
→ age + 1
→ repeat until age 65
→ show ending card
```

Simplified M1 checks follow the frozen development order:

```ts
promotion = rng() < level.baseChance && performance >= level.perfRequired
burnout = rng() < 0.08 && stress > 70
transition = unavailable
```

## Core state

- Time: age, calendar year and RNG cursor.
- Career: career id, current level, years in career, years in level and total professional years.
- Abilities: `KNOW`, `DISP`, `COMM`, `EFF`, `REG`, `MGT`, `BIZ`, `RES`, internally clamped to 20–80.
- Status: stress, burnout risk, reputation, energy and long-term health, each 0–100.
- Money: money, debt and annual living cost, all in ten-thousand New Taiwan dollars.
- Compensation: monthly base salary, monthly allowances, months per year, variable bonus and annual income.
- Career result: performance, signature value, promotion state, burnout state and annual reports.
- Reserved later state: milestones, gap/employment status, transition state, career history and timed modifiers.

## Career Schema requirements

`Career` contains identity, ability weights, entry rules, ladder, signature, stress/work-life characteristics, compensation policy, annual choices, exits and optional milestones/subtracks/hazards/transfer policy.

Data rules:

- Base ability weights sum to 1.0.
- Every annual choice has at least one cost.
- Compensation is not stored as one opaque salary number.
- Career data does not contain executable career-specific callbacks.
- Engine code must not branch on `career.id`.

## Hospital data

### Identity

- Ability weights: KNOW .30 / DISP .25 / EFF .20 / COMM .15 / REG .10.
- Stress coefficient: 1.35.
- Work-life balance: 40.
- Night shift available.
- Signature: prescriptions intercepted, driven by KNOW, annual growth 6–22.

### Ladder

| Level | Title | Minimum years | Performance | Base chance | Monthly base | Range | Stress delta |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | 新人藥師 | 2 | 45 | .35 | 5.2 | 4.8–5.6 | 0 |
| 2 | 一般藥師 | 3 | 58 | .25 | 5.8 | 5.4–6.4 | +2 |
| 3 | 資深藥師 | 4 | 70 | .18 | 6.5 | 6.0–7.2 | +3 |
| 4 | 組長 | 4 | 82 | .12 | 7.3 | 6.8–8.2 | +8 |
| 5 | 藥劑部主管 | — | — | — | 8.8 | 8.0–10.5 | +10 |

Level 5 is the career ceiling.

### Compensation

```ts
annualIncome =
  (salaryBase + nightShiftAllowance + ladderAllowance + dutyAllowance)
  * monthsPerYear
  + variableBonus
```

- Hospital months per year: 14.5.
- Day shift allowance: 0; evening shift: 0.6/month; night shift: 0.9/month.
- Night-shift burnout-load multipliers: 1.0 / 1.2 / 1.45.
- Ladder allowance may progress from 0.15 to 0.7/month.
- Level 4+ duty allowance ranges from 0.5 to 1.5/month.
- UI must state that values are public-information references adjusted for game design and are not career advice.

### Annual choices

At least these six data entries are required:

- Clinical project.
- Night shifts for allowance.
- Mentor junior pharmacists.
- Professional study.
- Leave work on time.
- Seek administrative responsibility.

Each choice must expose its trade-off in plain language.

## Debug contract

Supported URL example:

```text
/?debug=1&career=hospital&age=28&level=2
&KNOW=55&DISP=40&COMM=60&EFF=50&REG=65&MGT=35&BIZ=40&RES=45
&money=80&stress=30&seed=PHARM-TEST-0001
```

The browser exposes:

- `fastForward(n)` — advance using a deterministic strategy.
- `simulate(config)` — run hospital careers without UI for smoke/balance checks.
- `dumpTimeline()` — return a serializable timeline.

## Acceptance evidence

- Same seed and choice sequence produces identical states and reports.
- Debug parameters are parsed and clamped safely.
- Hospital data passes schema validation.
- Annual income includes separated compensation layers.
- A normal playthrough reaches age 65 without a dead end.
- Annual reports distinguish insufficient performance, eligible RNG failure and ceiling.
- Unit tests pass.
- Production build passes.
- Desktop and mobile browser flow can start, choose a year, view a report and reach an ending through debug fast-forward.
