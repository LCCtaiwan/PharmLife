import { useEffect, useState } from 'react'
import { chooseV06Episode, chooseV06Preference, continueAfterV06Outcome, continueAfterV06Report, createHospitalV06Game, fastForwardV06, preferenceById, proficiencyLabel, romanceStageLabel, simulateV06, startV06Assignment, v06EpisodeById } from './career-layer/engine-v06'
import { V06_ASSIGNMENTS, V06_PEOPLE } from './career-layer/hospital-v06'
import { generateCareerSeed, normalizeCareerSeed } from './career-layer/rng'
import { CORE_COMPETENCY_KEYS, type CoreCompetencyKey, type HospitalV06State, type RomancePreference, type V06AnnualReport } from './career-layer/v06-types'
import './career-layer/app.css'

declare global {
  interface Window {
    pharmLifeDebug?: {
      fastForward: (years: number) => HospitalV06State
      simulate: (runs?: number) => ReturnType<typeof simulateV06>
      dumpTimeline: () => HospitalV06State['timeline']
      getState: () => HospitalV06State
    }
  }
}

const CORE_LABELS: Record<CoreCompetencyKey, string> = {
  dispensing_verification: '調劑與核對',
  prescription_judgment: '處方判讀',
  drug_knowledge: '藥品知識',
  communication: '溝通協調',
  situational_response: '現場應變',
  medication_safety: '藥事安全',
}

const QUALIFICATION_LABELS: Record<string, string> = {
  pgy_enrolled: 'PGY 培育中',
  outpatient_supervised: '門診受監督作業',
  outpatient_independent: '門診獨立作業',
  inpatient_supervised: '住院受監督作業',
  inpatient_independent: '住院獨立作業',
  emergency_observer: '急診夜間見習',
  emergency_supervised: '急診受監督作業',
  emergency_independent: '急診獨立作業',
  drug_supply_supervised: '藥品管理受監督作業',
  drug_supply_independent: '藥品管理獨立作業',
}

function initialBoot() {
  const params = new URLSearchParams(window.location.search)
  const debug = params.get('debug') === '1'
  const relationshipPreference: RomancePreference = params.get('romance') === 'off' ? 'friends_only' : 'open'
  const seed = params.get('seed') ?? generateCareerSeed()
  return {
    game: createHospitalV06Game({ seed, relationshipPreference, debug }),
    started: debug,
    relationshipPreference,
  }
}

export default function App() {
  const [boot] = useState(initialBoot)
  const [game, setGame] = useState(boot.game)
  const [started, setStarted] = useState(boot.started)
  const [seedDraft, setSeedDraft] = useState(boot.game.seed)
  const [relationshipPreference, setRelationshipPreference] = useState<RomancePreference>(boot.relationshipPreference)

  useEffect(() => {
    window.pharmLifeDebug = {
      fastForward: (years) => {
        const result = fastForwardV06(game, years)
        setGame(result)
        return result
      },
      simulate: (runs) => simulateV06(runs, game.seed),
      dumpTimeline: () => game.timeline.map((entry) => ({ ...entry })),
      getState: () => game,
    }
    return () => { delete window.pharmLifeDebug }
  }, [game])

  const start = () => {
    const seed = normalizeCareerSeed(seedDraft)
    setSeedDraft(seed)
    setGame(createHospitalV06Game({ seed, relationshipPreference }))
    setStarted(true)
    window.scrollTo(0, 0)
  }

  const reset = () => {
    if (game.debug) {
      const params = new URLSearchParams(window.location.search)
      setGame(createHospitalV06Game({ seed: params.get('seed') ?? game.seed, relationshipPreference, debug: true }))
      return
    }
    setStarted(false)
    window.scrollTo(0, 0)
  }

  if (!started) return <StartScreen
    seed={seedDraft}
    relationshipPreference={relationshipPreference}
    onSeedChange={setSeedDraft}
    onRandomize={() => setSeedDraft(generateCareerSeed())}
    onRelationshipChange={setRelationshipPreference}
    onStart={start}
  />

  const assignment = V06_ASSIGNMENTS[game.assignmentId]
  const displayAge = game.stage === 'report' && game.lastReport ? game.lastReport.age : game.age
  const displayYear = game.stage === 'report' && game.lastReport ? game.lastReport.year : game.year
  const displayCareerYear = game.stage === 'report' && game.lastReport ? game.lastReport.careerYear : Math.min(game.careerYear, 5)

  return <main className="cl-shell">
    <header className="cl-header">
      <div className="cl-brand"><span>Rx</span><div><strong>PharmLife</strong><small>HOSPITAL CAREER v0.6</small></div></div>
      <div className="cl-meta">{game.debug && <b>DEBUG</b>}<button type="button" onClick={reset}>重新開始</button></div>
    </header>

    <section className="cl-hero cl-hero--v06">
      <div>
        <div className="cl-hero-kicker"><p className="cl-eyebrow">新人期第 {displayCareerYear} 年 · {displayYear} · {displayAge} 歲</p><code>SEED · {game.seed}</code></div>
        <h1>{assignment.name}</h1>
        <p>{assignment.description}</p>
      </div>
      <div className="cl-vitals" aria-label="目前狀態">
        <Metric label="疲勞" value={Math.round(game.condition.fatigue)} suffix="/100" tone={game.condition.fatigue >= 70 ? 'danger' : undefined} />
        <Metric label="壓力" value={Math.round(game.condition.stress)} suffix="/100" tone={game.condition.stress >= 70 ? 'danger' : undefined} />
        <Metric label="健康" value={Math.round(game.condition.health)} suffix="/100" />
        <Metric label="資產" value={Math.round(game.money)} suffix="萬" />
      </div>
    </section>

    <div className="cl-layout">
      <CoreSidebar game={game} />
      <section className="cl-panel cl-stage" aria-live="polite">
        {game.stage === 'assignment' && <AssignmentStage game={game} onContinue={() => setGame(startV06Assignment)} />}
        {(game.stage === 'episode' || game.stage === 'life') && <EpisodeStage game={game} onChoose={(id) => setGame((state) => chooseV06Episode(state, id))} />}
        {game.stage === 'outcome' && <OutcomeStage game={game} onContinue={() => setGame(continueAfterV06Outcome)} />}
        {game.stage === 'preference' && <PreferenceStage game={game} onChoose={(id) => setGame((state) => chooseV06Preference(state, id))} />}
        {game.stage === 'report' && game.lastReport && <ReportCard report={game.lastReport} finalYear={game.careerYear > 5} onContinue={() => setGame(continueAfterV06Report)} />}
        {game.stage === 'chapter' && <ChapterCard game={game} onRestart={reset} />}
      </section>
      <RelationshipSidebar game={game} />
    </div>
  </main>
}

function StartScreen({ seed, relationshipPreference, onSeedChange, onRandomize, onRelationshipChange, onStart }: {
  seed: string
  relationshipPreference: RomancePreference
  onSeedChange: (seed: string) => void
  onRandomize: () => void
  onRelationshipChange: (value: RomancePreference) => void
  onStart: () => void
}) {
  return <main className="cl-start">
    <div className="cl-start-glow" />
    <section className="cl-start-card">
      <div className="cl-start-brand"><span>Rx</span><strong>PharmLife</strong></div>
      <p className="cl-start-version">HOSPITAL CAREER · v0.6</p>
      <h1>第一天，<br />醫院先替你排好了。</h1>
      <p className="cl-start-lead">從 25 歲新進藥師開始。工作由醫院分派；你決定如何處理案件、接受培育，以及要和哪些人一起走下去。</p>

      <div className="cl-start-career"><div><small>第一個開發章節</small><strong>醫院藥師新人期</strong></div><span>25–29 歲 · PGY／輪調</span></div>

      <fieldset className="cl-relationship-setting">
        <legend>感情事件</legend>
        <div>
          <button className={relationshipPreference === 'open' ? 'active' : ''} type="button" onClick={() => onRelationshipChange('open')}>開放發展</button>
          <button className={relationshipPreference === 'friends_only' ? 'active' : ''} type="button" onClick={() => onRelationshipChange('friends_only')}>只維持朋友</button>
        </div>
        <small>兩種設定都能完整遊玩；單身不會受到懲罰。</small>
      </fieldset>

      <label className="cl-seed-field">
        <span>世界種子</span>
        <div><input aria-label="世界種子" value={seed} maxLength={24} onChange={(event) => onSeedChange(event.target.value.toUpperCase())} /><button type="button" onClick={onRandomize}>換一個</button></div>
        <small>相同 Seed＋相同選擇＝相同分派與結果。</small>
      </label>

      <button className="cl-start-button" type="button" onClick={onStart}><span>開始新人期</span><b>25 歲 · 門診調劑　→</b></button>
      <p className="cl-start-note">目前實作 25–29 歲新人／PGY；30 歲是開發檢查點，不是職涯結局。</p>
    </section>
  </main>
}

function CoreSidebar({ game }: { game: HospitalV06State }) {
  return <aside className="cl-panel cl-sidebar">
    <h2>基礎能力</h2>
    <div className="cl-core-list">
      {CORE_COMPETENCY_KEYS.map((key) => <div key={key}><span>{CORE_LABELS[key]}</span><b>{game.competencies[key]}</b></div>)}
    </div>
    <hr />
    <h2>本單位培育</h2>
    <div className="cl-proficiency-card"><small>{V06_ASSIGNMENTS[game.assignmentId].name}</small><strong>{proficiencyLabel(game.assignmentExperience[game.assignmentId])}</strong><span>累積經驗 {game.assignmentExperience[game.assignmentId]}</span></div>
    <div className="cl-qualification-list">
      {game.qualifications.filter((id) => !id.startsWith('pgy_year_')).slice(-4).map((id) => <span key={id}>{QUALIFICATION_LABELS[id] ?? id}</span>)}
    </div>
  </aside>
}

function RelationshipSidebar({ game }: { game: HospitalV06State }) {
  const romance = game.romanceStates.zhou_yian
  return <aside className="cl-panel cl-sidebar">
    <h2>職場人際</h2>
    <div className="cl-relationships cl-relationships--v06">
      {Object.entries(game.colleagues).map(([id, relation]) => {
        const person = V06_PEOPLE[id as keyof typeof V06_PEOPLE]
        if (!person) return null
        return <article key={id}>
          <div><strong>{person.name}</strong><small>{relation.currentRole}</small></div>
          <dl><span>專業 {relation.professionalTrust}</span><span>親近 {relation.personalCloseness}</span><span>摩擦 {relation.friction}</span></dl>
        </article>
      })}
    </div>
    <h2 className="cl-sidebar-subtitle">生活關係</h2>
    <div className="cl-romance-card"><small>{game.relationshipPreference === 'open' ? '感情事件開放' : '朋友／單身路線'}</small><strong>周以安 · {romanceStageLabel(romance.stage)}</strong><span>親近 {romance.closeness} · 承諾 {romance.commitment} · 衝突 {romance.conflict}</span></div>
    <p className="cl-disclaimer">專業信任不等於私人親近；有伴侶也不等於比較成功。</p>
  </aside>
}

function AssignmentStage({ game, onContinue }: { game: HospitalV06State; onContinue: () => void }) {
  const assignment = V06_ASSIGNMENTS[game.assignmentId]
  return <article className="cl-assignment-stage">
    <p className="cl-eyebrow">年度分派 · 由醫院安排</p>
    <h2>{assignment.name}</h2>
    <p className="cl-assignment-lead">{assignment.description}</p>
    <div className="cl-assignment-grid">
      <div><small>班別</small><strong>{assignment.roster}</strong></div>
      <div><small>目前資格</small><strong>{proficiencyLabel(game.assignmentExperience[game.assignmentId])}</strong></div>
      <div><small>今年工作片段</small><strong>{game.episodeQueue.length} 個</strong></div>
    </div>
    <blockquote>必要工作不是玩家購買的行動。你的選擇，會發生在真正需要判斷的時刻。</blockquote>
    <button className="cl-primary" type="button" onClick={onContinue}>進入第一個工作片段 <span>→</span></button>
  </article>
}

function EpisodeStage({ game, onChoose }: { game: HospitalV06State; onChoose: (id: string) => void }) {
  const episode = v06EpisodeById(game.pendingEpisodeId)
  if (!episode) return null
  const speaker = episode.speakerId ? V06_PEOPLE[episode.speakerId as keyof typeof V06_PEOPLE] : undefined
  return <article className="cl-event-stage">
    <p className="cl-eyebrow">{episode.kind === 'work' ? `工作片段 ${game.episodeIndex + 1}/${game.episodeQueue.length}` : '下班之後 · 自願人生線'}</p>
    {speaker && <div className="cl-speaker"><span>{speaker.name.slice(0, 1)}</span><div><strong>{speaker.name}</strong><small>{speaker.role}</small></div></div>}
    <h2>{episode.title}</h2>
    <p className="cl-event-scene">{episode.scene}</p>
    <div className="cl-event-choices">
      {episode.choices.map((choice) => <button type="button" key={choice.id} onClick={() => onChoose(choice.id)}><strong>{choice.label}</strong><b>→</b></button>)}
    </div>
  </article>
}

function OutcomeStage({ game, onContinue }: { game: HospitalV06State; onContinue: () => void }) {
  const outcome = game.pendingOutcome
  if (!outcome) return null
  const workDone = outcome.kind === 'work' && game.episodeIndex + 1 >= game.episodeQueue.length
  return <article className="cl-outcome-stage">
    <p className="cl-eyebrow">選擇之後才揭露結果</p>
    <div className="cl-outcome-mark">Rx</div>
    <h2>{outcome.title}</h2>
    <p>{outcome.text}</p>
    {outcome.check && <div className={outcome.check.passed ? 'cl-check-result success' : 'cl-check-result failure'}>
      <header><strong>{outcome.check.passed ? '處理成立' : '需要支援完成'}</strong><span>{outcome.check.score} / 難度 {outcome.check.difficulty}</span></header>
      <div>{outcome.check.factors.map((factor) => <span key={factor}>{factor}</span>)}</div>
    </div>}
    {outcome.relationshipNotes.length > 0 && <div className="cl-memory-note"><small>關係留下了記憶</small>{outcome.relationshipNotes.map((note) => <span key={note}>{note}</span>)}</div>}
    <button className="cl-primary" type="button" onClick={onContinue}>{outcome.kind === 'life' ? '填寫下一年度志願' : workDone ? '結束今天的工作' : '進入下一個工作片段'} <span>→</span></button>
  </article>
}

function PreferenceStage({ game, onChoose }: { game: HospitalV06State; onChoose: (id: string) => void }) {
  return <article className="cl-preference-stage">
    <p className="cl-eyebrow">年度培育志願</p>
    <h2>你可以提出志願，<br />但醫院不一定核准。</h2>
    <p className="cl-intro">院方會依資格、缺額、人力與 Seed 決定下年度分派。</p>
    <div className="cl-choice-list">
      {game.availablePreferenceIds.map((id, index) => {
        const preference = preferenceById(id)!
        return <button type="button" key={id} onClick={() => onChoose(id)}><i>{String(index + 1).padStart(2, '0')}</i><span><strong>{preference.label}</strong></span><b>→</b></button>
      })}
    </div>
  </article>
}

function ReportCard({ report, finalYear, onContinue }: { report: V06AnnualReport; finalYear: boolean; onContinue: () => void }) {
  return <article className="cl-report cl-report--v06">
    <header><div><p className="cl-eyebrow">{report.age} 歲 · 新人期第 {report.careerYear} 年</p><h2>{report.assignmentName}</h2></div><div className="cl-report-badge">年度報告</div></header>
    <div className="cl-report-grid">
      <section><h3>工作與培育</h3><dl>
        <div><dt>班別</dt><dd>{report.roster}</dd></div>
        <div><dt>熟練階段</dt><dd>{proficiencyLabel(report.proficiencyBefore)} → {proficiencyLabel(report.proficiencyAfter)}</dd></div>
        <div><dt>取得資格</dt><dd>{report.qualificationsEarned.map((id) => QUALIFICATION_LABELS[id] ?? (id.startsWith('pgy_year_') ? `PGY 第 ${id.match(/\d+/)?.[0]} 年完成` : id)).join('、')}</dd></div>
        <div className="cl-total"><dt>年收入</dt><dd>{report.annualIncome} 萬</dd></div>
        <div><dt>資產</dt><dd>{Math.round(report.assetsBefore)} → {Math.round(report.assetsAfter)} 萬</dd></div>
      </dl></section>
      <section><h3>能力與狀態</h3><dl>
        {Object.entries(report.competencyChanges).map(([key, delta]) => <div key={key}><dt>{CORE_LABELS[key as CoreCompetencyKey]}</dt><dd>+{delta}</dd></div>)}
        <div><dt>疲勞</dt><dd>{Math.round(report.conditionBefore.fatigue)} → {Math.round(report.conditionAfter.fatigue)}</dd></div>
        <div><dt>壓力</dt><dd>{Math.round(report.conditionBefore.stress)} → {Math.round(report.conditionAfter.stress)}</dd></div>
        <div><dt>Burnout Risk</dt><dd>{Math.round(report.conditionBefore.burnoutRisk)} → {Math.round(report.conditionAfter.burnoutRisk)}</dd></div>
      </dl></section>
    </div>
    <section className="cl-year-story"><strong>今年留下的案件</strong>{report.episodeResults.map((result) => <div key={`${result.episodeId}-${result.choiceLabel}`}><p className="cl-report-event">{result.title} · {result.choiceLabel}</p><p>{result.outcome}</p></div>)}</section>
    <section className="cl-hospital-decision"><small>你的志願 · {report.preferenceLabel}</small><strong>{report.preferenceDecision}</strong></section>
    <button className="cl-primary" type="button" onClick={onContinue}>{finalYear ? '查看新人期小結' : '查看下一年度分派'} <span>→</span></button>
  </article>
}

function ChapterCard({ game, onRestart }: { game: HospitalV06State; onRestart: () => void }) {
  const strongest = CORE_COMPETENCY_KEYS.reduce((best, key) => game.competencies[key] > game.competencies[best] ? key : best)
  const closest = Object.entries(game.colleagues).sort(([, first], [, second]) => second.personalCloseness - first.personalCloseness)[0]
  const romance = game.romanceStates.zhou_yian
  return <article className="cl-ending cl-chapter">
    <p className="cl-eyebrow">30 歲 · NEWCOMER CHAPTER REVIEW</p>
    <h2>你不再是第一天的新人。</h2>
    <p>這是 25–29 歲新人／PGY 的開發檢查點，不是退休，也不是完整職涯結局。你的狀態可以繼續延伸到 65 歲。</p>
    <div className="cl-ending-stats">
      <Metric label="最強基礎能力" value={CORE_LABELS[strongest]} />
      <Metric label="取得資格" value={game.qualifications.filter((id) => !id.startsWith('pgy_year_') && id !== 'pgy_enrolled').length} suffix="項" />
      <Metric label="總資產" value={Math.round(game.money)} suffix="萬" />
      <Metric label="健康" value={Math.round(game.condition.health)} suffix="/100" />
      <Metric label="重要同事" value={closest ? V06_PEOPLE[closest[0] as keyof typeof V06_PEOPLE]?.name ?? '尚未形成' : '尚未形成'} />
      <Metric label="生活關係" value={romanceStageLabel(romance.stage)} />
    </div>
    <blockquote>職涯與感情分開計算。你如何工作，和你選擇與誰同行，都會繼續留下影響。</blockquote>
    <button className="cl-primary" type="button" onClick={onRestart}>換一個 Seed，再走一次新人期</button>
  </article>
}

function Metric({ label, value, suffix, tone }: { label: string; value: string | number; suffix?: string; tone?: 'danger' }) {
  return <div className={tone ? `cl-metric cl-metric--${tone}` : 'cl-metric'}><span>{label}</span><strong>{value}<small>{suffix}</small></strong></div>
}
