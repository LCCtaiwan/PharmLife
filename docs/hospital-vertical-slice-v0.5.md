# PharmLife Hospital 10-Year Vertical Slice SPEC v0.5

> Status: `FREEZE`
> Change: C-008
> Supersedes v0.4 only for the playable Hospital experience. The v0.4 architecture document remains historical foundation.
> Product test: a player should finish ten years and want to try a different Seed or strategy immediately.

## 1. Goal

Turn the Hospital Career Layer from a technical simulation into a short, replayable career story.

One run covers age 25 through 35. The player should remember people, crises and compromises—not only salary and performance numbers.

## 2. Success evidence

- A complete run lasts ten career years and reaches an ending at age 35.
- Every year has a visible goal, one work-direction decision, one workplace event and one consequential event response.
- At least three recurring fictional colleagues remember earlier choices.
- At least three event chains can continue or change because of flags and relationships.
- Seed selects a hidden career fate that materially changes events or modifiers.
- Failure creates a different situation or later event; it does not produce an empty penalty year.
- The player cannot calculate the exact return of every choice before selecting it.
- At least five endings can be reached through different state combinations.
- Same Seed and same decisions reproduce the same ten-year story.
- Unit tests, production build and mobile browser playthrough pass.

## 3. Explicit exclusions

- Other seven careers and career-transition engine.
- Student years, examinations, job-search season and family system.
- Full NPC social simulation or free-form dialogue.
- More than ten Hospital years.
- Large event library, illustrations, audio, account system or cloud saves.
- Public deployment before local product review.

## 4. Ten-year loop

```text
Year opening
→ reveal this year's career goal and workplace situation
→ draw 3 work directions from 6
→ player chooses 1 direction; only directional trade-offs are shown
→ resolve one eligible workplace event
→ player chooses 1 of 2–3 responses
→ apply delayed effects, flags and colleague memory
→ calculate performance, compensation, stress, burnout and promotion
→ show annual report with what actually happened
→ continue until the tenth report
→ age 35 ending
```

The work direction determines the player's plan. The workplace event disrupts that plan. The event response is the year's emotional decision.

## 5. Annual goals

Goals are data, chosen deterministically from the Seed and current state.

| Goal | Success signal | Narrative tension |
|---|---|---|
| 守住調劑安全 | DISP / EFF and no safety failure | Speed versus careful checking |
| 完成臨床專案 | KNOW / RES and project progress | Evidence versus internal politics |
| 撐過缺工排班 | workload and team trust | Income versus health |
| 帶出能獨立值班的新人 | COMM / colleague trust | Time invested in someone else |
| 爭取升遷名額 | performance / reputation | Visibility versus relationships |
| 守住生活界線 | stress / health | Career momentum versus recovery |

A goal grants a report label and a modest reward when completed. Failure changes the following year's event weights or situation.

## 6. Recurring colleagues

All characters are fictional.

| ID | Character | Role | Core tension |
|---|---|---|---|
| `director_chen` | 陳主任 | Department director | Values stability, notices results, avoids public risk |
| `senior_lin` | 林學姊 | Senior pharmacist | Protects professional standards, dislikes political shortcuts |
| `junior_xu` | 許新人 | Junior pharmacist | Can become a trusted partner or leave after repeated neglect |

State per colleague:

```ts
interface ColleagueState {
  trust: number;       // -100..100
  respect: number;     // -100..100
  strain: number;      // 0..100
  flags: string[];
}
```

Events may reference and update these values. Relationship changes must be visible after resolution.

## 7. Event chains

### 7.1 Prescription safety

`疑似劑量錯誤 → 是否堅持攔截 → 醫師施壓／主任支持 → 安全文化或沉默文化`

Possible content: reputation gain, physician conflict, director trust, later invitation to lead safety review.

### 7.2 Night-shift shortage

`同事臨時請假 → 接班／拒絕／協調拆班 → 長期缺工 → Burnout or team loyalty`

Refusing is not automatically selfish; accepting is not automatically heroic.

### 7.3 Junior pharmacist

`許新人犯錯 → 扛責／切割／共同檢討 → 能否獨立值班 → 留任、成長或離開`

Earlier mentoring work direction and relationship state alter later choices and outcomes.

### 7.4 Clinical project

`提出改善案 → 搶資源 → 數據不漂亮 → 誠實修正／包裝結果 → 發表、擱置或反噬`

This chain distinguishes professional achievement from political visibility.

## 8. Hidden Seed fate

Each Seed deterministically selects one hidden fate. It is revealed through play, not on the start screen.

| Fate | Effect |
|---|---|
| `clinical_eye` | Safety events appear earlier; correct challenges gain more reputation |
| `staffing_storm` | Shortage events are more frequent; night-shift income and burnout both rise |
| `mentor_bond` | Junior chain starts with higher trust and can unlock a rare partnership ending |
| `political_headwind` | Promotion openings are rarer; political event responses matter more |
| `quiet_years` | Fewer crises, lower stress and lower visibility; work-life ending becomes viable |

The fate must not determine a single optimal strategy.

## 9. Choice information rule

Before choosing, show:

- narrative intent;
- enough context to understand what the player is doing.

Do not place predicted consequences, stat directions or relationship effects under an option. Known facts may stay in the surrounding scene, but the option itself only states the action.

After resolution, the report shows concrete results and why they happened.

## 10. Event data contract

```ts
interface WorkplaceEvent {
  id: string;
  chainId: string;
  chapter: number;
  title: string;
  scene: string;
  speakerId?: string;
  conditions?: EventCondition[];
  weight: number;
  choices: EventChoice[];
}

interface EventChoice {
  id: string;
  label: string;
  hint: string; // Authoring/debug metadata; never rendered below the option.
  outcome: string;
  effects: EventEffects;
  setsFlags?: string[];
}
```

Engine selection is generic and condition-driven. It must not branch on individual event IDs.

## 11. GameState additions

- `runYear`: 1–10.
- `currentGoalId`, `goalProgress`, `goalOutcome`.
- `seedFate`.
- `colleagues`.
- `pendingEventId`, `eventHistory`, `eventChoiceHistory`.
- `chainProgress` and narrative flags.
- `yearPlanChoiceId` separate from the event response.
- `yearDraft` containing effects accumulated before the annual report.

## 12. Endings at age 35

At least five data-driven endings:

1. `clinical_guardian` — strong safety record and professional respect.
2. `young_manager` — level 4+ or strong director support and visibility.
3. `trusted_senior` — high team relationships and successful junior chain.
4. `well_paid_exhausted` — high assets/night work with poor health or repeated burnout.
5. `life_with_boundaries` — healthy, lower-stress career with intentionally slower promotion.
6. `stalled_and_searching` — low momentum, damaged relationships or unresolved crises.

Ending selection is deterministic from final state and flags. It explains the major causes.

## 13. UI screens

1. Seed start screen.
2. Year opening + annual goal.
3. Three work directions.
4. Workplace event with speaker, scene and 2–3 responses.
5. Outcome reveal.
6. Annual report.
7. Ten-year ending and compact timeline.

All essential mobile body text is at least 14px. The primary decision is always above secondary statistics on mobile.
