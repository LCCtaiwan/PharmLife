import { useEffect, useState } from 'react'
import { dumpTimeline, fastForward, parseDebugSearch, simulate } from './career-layer/debug'
import { abilityGrade, choiceById, chooseCareerDirection, continueAfterReport, createCareerGame, currentLevel, finalizeCareerYear, resolveWorkplaceEvent, workplaceEventById } from './career-layer/engine'
import { HOSPITAL_CAREER } from './career-layer/hospital'
import { HOSPITAL_COLLEAGUES, HOSPITAL_EVENTS, HOSPITAL_GOALS, SEED_FATE_LABELS, selectTenYearEnding } from './career-layer/hospital-story'
import { generateCareerSeed, normalizeCareerSeed } from './career-layer/rng'
import type { AbilityKey, AnnualReport, GameState, SimulationConfig } from './career-layer/types'
import './career-layer/app.css'

declare global {
  interface Window {
    pharmLifeDebug?: {
      fastForward: (years: number) => GameState
      simulate: (config?: SimulationConfig) => ReturnType<typeof simulate>
      dumpTimeline: () => ReturnType<typeof dumpTimeline>
      getState: () => GameState
    }
  }
}

const ABILITY_LABELS: Record<AbilityKey, string> = {
  KNOW: '專業', DISP: '實務', COMM: '溝通', EFF: '效率', REG: '法規', MGT: '管理', BIZ: '商業', RES: '研究',
}

function initialBoot() {
  const debug = parseDebugSearch(window.location.search)
  const game = createCareerGame(HOSPITAL_CAREER, { ...debug, seed: debug.seed ?? generateCareerSeed() }, HOSPITAL_GOALS)
  return { game, started: Boolean(debug.debug) }
}

export default function App() {
  const [boot] = useState(initialBoot)
  const [game, setGame] = useState<GameState>(boot.game)
  const [started, setStarted] = useState(boot.started)
  const [seedDraft, setSeedDraft] = useState(boot.game.seed)

  useEffect(() => {
    window.pharmLifeDebug = {
      fastForward: (years) => {
        const result = fastForward(game, years, 'balanced', HOSPITAL_CAREER)
        setGame(result)
        return result
      },
      simulate: (config) => simulate(config, HOSPITAL_CAREER),
      dumpTimeline: () => dumpTimeline(game),
      getState: () => game,
    }
    return () => { delete window.pharmLifeDebug }
  }, [game])

  const start = () => {
    const seed = normalizeCareerSeed(seedDraft)
    setSeedDraft(seed)
    setGame(createCareerGame(HOSPITAL_CAREER, { seed }, HOSPITAL_GOALS))
    setStarted(true)
    window.scrollTo(0, 0)
  }
  const reset = () => {
    if (game.debug) {
      setGame(createCareerGame(HOSPITAL_CAREER, parseDebugSearch(window.location.search), HOSPITAL_GOALS))
      return
    }
    setSeedDraft(game.seed)
    setStarted(false)
    window.scrollTo(0, 0)
  }
  const role = currentLevel(game, HOSPITAL_CAREER)
  const displayAge = game.stage === 'report' && game.lastReport ? game.lastReport.age : game.age
  const displayYear = game.stage === 'report' && game.lastReport ? game.lastReport.year : game.year
  const displayRunYear = game.stage === 'report' && game.lastReport ? game.lastReport.age - 24 : Math.min(game.runYear, 10)

  if (!started) return <StartScreen
    seed={seedDraft}
    onSeedChange={setSeedDraft}
    onRandomize={() => setSeedDraft(generateCareerSeed())}
    onStart={start}
  />

  return <main className="cl-shell">
    <header className="cl-header">
      <div className="cl-brand">
        <span>Rx</span>
        <div><strong>PharmLife</strong><small>HOSPITAL STORY v0.5</small></div>
      </div>
      <div className="cl-meta">
        {game.debug && <b>DEBUG</b>}
        <button type="button" onClick={reset}>重新開始</button>
      </div>
    </header>

    <section className="cl-hero">
      <div>
        <div className="cl-hero-kicker">
          <p className="cl-eyebrow">第 {displayRunYear} 年 · {displayYear} · {displayAge} 歲</p>
          <code>SEED · {game.seed}</code>
        </div>
        <h1>{role.title}</h1>
        <p>{HOSPITAL_CAREER.description}</p>
      </div>
      <div className="cl-vitals" aria-label="目前狀態">
        <Metric label="職級" value={`Lv.${game.level}`} />
        <Metric label="壓力" value={Math.round(game.stress)} suffix="/100" tone={game.stress >= 70 ? 'danger' : undefined} />
        <Metric label="健康" value={Math.round(game.health)} suffix="/100" />
        <Metric label="資產" value={Math.round(game.money)} suffix="萬" />
      </div>
    </section>

    <div className="cl-layout">
      <aside className="cl-panel cl-sidebar">
        <h2>能力評級</h2>
        <div className="cl-abilities">
          {(Object.keys(ABILITY_LABELS) as AbilityKey[]).map((key) => <div key={key}>
            <span>{ABILITY_LABELS[key]} <small>{key}</small></span>
            <b>{abilityGrade(game.abilities[key])}</b>
          </div>)}
        </div>
        <hr />
        <dl className="cl-mini-stats">
          <div><dt>年資</dt><dd>{game.yearsInCareer} 年</dd></div>
          <div><dt>本階年資</dt><dd>{game.yearsInLevel} 年</dd></div>
          <div><dt>處方攔截</dt><dd>{Math.round(game.signatureValue)} 件</dd></div>
          <div><dt>Burnout Risk</dt><dd>{Math.round(game.burnout.risk)}</dd></div>
        </dl>
        {game.fateRevealed && !game.fateRevealedThisYear && <div className="cl-fate"><small>SEED 命運已揭露</small><strong>{SEED_FATE_LABELS[game.seedFate].label}</strong><p>{SEED_FATE_LABELS[game.seedFate].reveal}</p></div>}
      </aside>

      <section className="cl-panel cl-stage" aria-live="polite">
        {game.stage === 'choice' && <ChoiceStage game={game} onChoose={(id) => setGame((state) => chooseCareerDirection(state, id, HOSPITAL_CAREER, HOSPITAL_GOALS, HOSPITAL_EVENTS))} />}
        {game.stage === 'event' && <EventStage game={game} onChoose={(id) => setGame((state) => resolveWorkplaceEvent(state, id, HOSPITAL_EVENTS))} />}
        {game.stage === 'outcome' && <OutcomeStage game={game} onContinue={() => setGame((state) => finalizeCareerYear(state, HOSPITAL_CAREER, HOSPITAL_GOALS, HOSPITAL_EVENTS))} />}
        {game.stage === 'report' && game.lastReport && <ReportCard report={game.lastReport} onContinue={() => setGame((state) => continueAfterReport(state, HOSPITAL_CAREER, HOSPITAL_GOALS))} />}
        {game.stage === 'ending' && <EndingCard game={game} onRestart={reset} />}
      </section>

      <aside className="cl-panel cl-sidebar">
        <h2>職場關係</h2>
        <div className="cl-relationships">
          {HOSPITAL_COLLEAGUES.map((person) => <article key={person.id}>
            <div><strong>{person.name}</strong><small>{person.role}</small></div>
            <span>信任 {game.colleagues[person.id]?.trust ?? 0}</span>
          </article>)}
        </div>
        <h2 className="cl-sidebar-subtitle">今年位置</h2>
        <dl className="cl-mini-stats">
          <div><dt>月本薪</dt><dd>{role.salaryBase.toFixed(1)} 萬</dd></div>
          <div><dt>年薪月數</dt><dd>14.5 個月</dd></div>
          <div><dt>進階津貼</dt><dd>{game.compensation.ladderAllowance.toFixed(2)} 萬/月</dd></div>
          <div><dt>上年收入</dt><dd>{game.reports.length ? `${game.compensation.annualIncome} 萬` : '尚未結算'}</dd></div>
        </dl>
        <div className="cl-next-level">
          <small>下一階</small>
          {role.isCeiling
            ? <strong>已到組織天花板</strong>
            : <><strong>{HOSPITAL_CAREER.ladder[game.level]?.title}</strong><span>至少 {role.minYears} 年 · 績效 {role.perfRequired}</span></>}
        </div>
        <p className="cl-disclaimer">薪資數值參考公開資訊並經遊戲化調整，非職涯建議。</p>
      </aside>
    </div>
  </main>
}

function StartScreen({ seed, onSeedChange, onRandomize, onStart }: { seed: string; onSeedChange: (seed: string) => void; onRandomize: () => void; onStart: () => void }) {
  return <main className="cl-start">
    <div className="cl-start-glow" />
    <section className="cl-start-card">
      <div className="cl-start-brand"><span>Rx</span><strong>PharmLife</strong></div>
      <p className="cl-start-version">HOSPITAL STORY · v0.5</p>
      <h1>藥師人生<br />沒有標準處方。</h1>
      <p className="cl-start-lead">從 25 歲醫院藥師開始。十年裡，你會遇見記得選擇的人、無法預測的職場事件，以及不只寫在薪資上的代價。</p>

      <div className="cl-start-career">
        <div><small>起始職涯</small><strong>醫院藥師</strong></div>
        <span>25 歲 · 新人藥師</span>
      </div>

      <label className="cl-seed-field">
        <span>世界種子</span>
        <div><input aria-label="世界種子" value={seed} maxLength={24} onChange={(event) => onSeedChange(event.target.value.toUpperCase())} /><button type="button" onClick={onRandomize}>換一個</button></div>
        <small>相同 Seed＋相同選擇＝相同人生。可以直接輸入朋友的 Seed 互相挑戰。</small>
      </label>

      <button className="cl-start-button" type="button" onClick={onStart}><span>開始職涯</span><b>25 歲 · 醫院藥師　→</b></button>
      <p className="cl-start-note">薪資數值參考公開資訊並經遊戲化調整，非職涯建議。</p>
    </section>
  </main>
}

function Metric({ label, value, suffix, tone }: { label: string; value: string | number; suffix?: string; tone?: 'danger' }) {
  return <div className={tone ? `cl-metric cl-metric--${tone}` : 'cl-metric'}><span>{label}</span><strong>{value}<small>{suffix}</small></strong></div>
}

function ChoiceStage({ game, onChoose }: { game: GameState; onChoose: (id: string) => void }) {
  const goal = HOSPITAL_GOALS.find((item) => item.id === game.currentGoalId)
  return <div className="cl-choice-stage">
    <p className="cl-eyebrow">第 {game.runYear} 年 · 年度目標</p>
    <div className="cl-goal-card"><small>今年要守住的事</small><strong>{goal?.label}</strong><p>{goal?.description}</p></div>
    <h2>今年，你要拿什麼換什麼？</h2>
    <p className="cl-intro">先選工作方向。真正的職場事件，會在計畫之外發生。</p>
    <div className="cl-choice-list">
      {game.availableChoiceIds.map((id, index) => {
        const choice = choiceById(HOSPITAL_CAREER, id)!
        return <button type="button" key={choice.id} onClick={() => onChoose(choice.id)}>
          <i>{String(index + 1).padStart(2, '0')}</i>
          <span><strong>{choice.label}</strong></span>
          <b>→</b>
        </button>
      })}
    </div>
  </div>
}

function EventStage({ game, onChoose }: { game: GameState; onChoose: (id: string) => void }) {
  const event = workplaceEventById(HOSPITAL_EVENTS, game.pendingEventId)
  if (!event) return null
  const speaker = HOSPITAL_COLLEAGUES.find((person) => person.id === event.speakerId)
  return <article className="cl-event-stage">
    <p className="cl-eyebrow">年中 · 職場事件</p>
    {speaker && <div className="cl-speaker"><span>{speaker.name.slice(0, 1)}</span><div><strong>{speaker.name}</strong><small>{speaker.role}</small></div></div>}
    <h2>{event.title}</h2>
    <p className="cl-event-scene">{event.scene}</p>
    <div className="cl-event-choices">
      {event.choices.map((choice) => <button type="button" key={choice.id} onClick={() => onChoose(choice.id)}><strong>{choice.label}</strong><b>→</b></button>)}
    </div>
  </article>
}

function OutcomeStage({ game, onContinue }: { game: GameState; onContinue: () => void }) {
  return <article className="cl-outcome-stage">
    <p className="cl-eyebrow">選擇的結果</p>
    <div className="cl-outcome-mark">Rx</div>
    <h2>{game.pendingOutcomeTitle}</h2>
    <p>{game.pendingOutcomeText}</p>
    {game.yearDraft?.relationshipNotes.length ? <div className="cl-memory-note"><small>有人會記得這件事</small>{game.yearDraft.relationshipNotes.map((note) => <span key={note}>{colleagueNote(note)}</span>)}</div> : null}
    {game.fateRevealedThisYear && <div className="cl-fate-reveal"><small>這個 Seed 的命運開始浮現</small><strong>{SEED_FATE_LABELS[game.seedFate].label}</strong><p>{SEED_FATE_LABELS[game.seedFate].reveal}</p></div>}
    <button className="cl-primary" type="button" onClick={onContinue}>查看年度成績單 <span>→</span></button>
  </article>
}

function colleagueNote(note: string): string {
  return HOSPITAL_COLLEAGUES.reduce((text, person) => text.replace(person.id, person.name), note)
}

function ReportCard({ report, onContinue }: { report: AnnualReport; onContinue: () => void }) {
  return <article className="cl-report">
    <header>
      <div><p className="cl-eyebrow">{report.age} 歲 · 年度成績單</p><h2>{report.title}</h2></div>
      <div className="cl-performance"><span>PERFORMANCE</span><strong>{report.performance}</strong></div>
    </header>
    <div className="cl-report-grid">
      <section>
        <h3>收入與資產</h3>
        <dl>
          <div><dt>月本薪</dt><dd>{report.compensation.salaryBase.toFixed(1)} 萬</dd></div>
          <div><dt>月津貼</dt><dd>+{(report.compensation.nightShiftAllowance + report.compensation.ladderAllowance + report.compensation.dutyAllowance).toFixed(2)} 萬</dd></div>
          <div><dt>年薪月數</dt><dd>× {report.compensation.monthsPerYear}</dd></div>
          <div className="cl-total"><dt>年收入</dt><dd>{report.compensation.annualIncome} 萬</dd></div>
          <div><dt>總資產</dt><dd>{Math.round(report.moneyBefore)} → {Math.round(report.moneyAfter)} 萬</dd></div>
        </dl>
      </section>
      <section>
        <h3>能力與代價</h3>
        <dl>
          {report.abilityChanges.length > 0
            ? report.abilityChanges.map((change) => <div key={change.key}><dt>{ABILITY_LABELS[change.key]}</dt><dd>{abilityGrade(change.before)} → {abilityGrade(change.after)}</dd></div>)
            : <div><dt>能力</dt><dd>本年持平</dd></div>}
          <div><dt>Stress</dt><dd>{Math.round(report.stressBefore)} → {Math.round(report.stressAfter)}</dd></div>
          <div><dt>Burnout Risk</dt><dd>{Math.round(report.burnoutRiskBefore)} → {Math.round(report.burnoutRiskAfter)}</dd></div>
          <div><dt>處方疑義攔截</dt><dd>+{report.signatureGrowth} 件</dd></div>
        </dl>
      </section>
    </div>
    <section className={report.goalCompleted ? 'cl-goal-result success' : 'cl-goal-result failure'}>
      <small>年度目標 · {report.goalLabel}</small><strong>{report.goalCompleted ? '達成' : '未達成'}</strong>
    </section>
    <section className="cl-year-story">
      <strong>今年：{report.choiceLabel}</strong>
      <p className="cl-report-event">事件：{report.eventTitle} · {report.eventChoiceLabel}</p>
      <p>{report.eventOutcome}</p>
      <p>{report.notes.map(colleagueNote).join(' ')}</p>
      <blockquote>{report.promotionMessage}</blockquote>
    </section>
    <button className="cl-primary" type="button" onClick={onContinue}>進入下一年 <span>→</span></button>
  </article>
}

function EndingCard({ game, onRestart }: { game: GameState; onRestart: () => void }) {
  const ending = selectTenYearEnding(game)
  const promotions = game.timeline.filter((entry) => entry.type === 'promotion').length
  return <article className="cl-ending">
    <p className="cl-eyebrow">35 歲 · TEN-YEAR ENDING</p>
    <h2>{ending.title}</h2>
    <p>{ending.description}</p>
    <div className="cl-ending-stats">
      <Metric label="最高職級" value={`Lv.${game.promotion.highestLevel}`} />
      <Metric label="退休資產" value={Math.round(game.money - game.debt)} suffix="萬" />
      <Metric label="升遷次數" value={promotions} />
      <Metric label="Burnout" value={game.burnout.episodes} suffix="次" tone={game.burnout.episodes ? 'danger' : undefined} />
      <Metric label="健康" value={Math.round(game.health)} suffix="/100" />
      <Metric label="處方攔截" value={Math.round(game.signatureValue)} suffix="件" />
    </div>
    <div className="cl-ending-reasons">{ending.reasons.map((reason) => <span key={reason}>{reason}</span>)}</div>
    <blockquote>「我要用什麼代價，換什麼人生？」這十年先給了一個答案。</blockquote>
    <button className="cl-primary" type="button" onClick={onRestart}>換一個選擇，再走十年</button>
  </article>
}
