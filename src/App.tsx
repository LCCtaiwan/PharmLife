import { useEffect, useState } from 'react'
import { dumpTimeline, fastForward, parseDebugSearch, simulate } from './career-layer/debug'
import { abilityGrade, choiceById, continueAfterReport, createCareerGame, currentLevel, playCareerYear } from './career-layer/engine'
import { HOSPITAL_CAREER } from './career-layer/hospital'
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
  const game = createCareerGame(HOSPITAL_CAREER, { ...debug, seed: debug.seed ?? generateCareerSeed() })
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
    setGame(createCareerGame(HOSPITAL_CAREER, { seed }))
    setStarted(true)
    window.scrollTo(0, 0)
  }
  const reset = () => {
    if (game.debug) {
      setGame(createCareerGame(HOSPITAL_CAREER, parseDebugSearch(window.location.search)))
      return
    }
    setSeedDraft(game.seed)
    setStarted(false)
    window.scrollTo(0, 0)
  }
  const role = currentLevel(game, HOSPITAL_CAREER)

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
        <div><strong>PharmLife</strong><small>CAREER LAYER v0.4</small></div>
      </div>
      <div className="cl-meta">
        {game.debug && <b>DEBUG</b>}
        <button type="button" onClick={reset}>重新開始</button>
      </div>
    </header>

    <section className="cl-hero">
      <div>
        <div className="cl-hero-kicker">
          <p className="cl-eyebrow">{game.year} · {game.age} 歲</p>
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
      </aside>

      <section className="cl-panel cl-stage" aria-live="polite">
        {game.stage === 'choice' && <ChoiceStage game={game} onChoose={(id) => setGame((state) => playCareerYear(state, id, HOSPITAL_CAREER))} />}
        {game.stage === 'report' && game.lastReport && <ReportCard report={game.lastReport} onContinue={() => setGame((state) => continueAfterReport(state, HOSPITAL_CAREER))} />}
        {game.stage === 'ending' && <EndingCard game={game} onRestart={reset} />}
      </section>

      <aside className="cl-panel cl-sidebar">
        <h2>今年位置</h2>
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
      <p className="cl-start-version">CAREER LAYER · v0.4</p>
      <h1>藥師人生<br />沒有標準處方。</h1>
      <p className="cl-start-lead">從 25 歲醫院藥師開始。每一年都在專業、收入、升遷與健康之間做選擇，一路走到 65 歲。</p>

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
  return <div className="cl-choice-stage">
    <p className="cl-eyebrow">年初 · 方向選擇</p>
    <h2>今年，你要拿什麼換什麼？</h2>
    <p className="cl-intro">系統從六個醫院方向抽出三個。選擇後會直接結算這一年。</p>
    <div className="cl-choice-list">
      {game.availableChoiceIds.map((id, index) => {
        const choice = choiceById(HOSPITAL_CAREER, id)!
        return <button type="button" key={choice.id} onClick={() => onChoose(choice.id)}>
          <i>{String(index + 1).padStart(2, '0')}</i>
          <span><strong>{choice.label}</strong><small>{choice.description}</small><em>{choice.tradeoff}</em></span>
          <b>→</b>
        </button>
      })}
    </div>
  </div>
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
    <section className="cl-year-story">
      <strong>今年：{report.choiceLabel}</strong>
      <p>{report.notes.join(' ')}</p>
      <blockquote>{report.promotionMessage}</blockquote>
    </section>
    <button className="cl-primary" type="button" onClick={onContinue}>進入下一年 <span>→</span></button>
  </article>
}

function EndingCard({ game, onRestart }: { game: GameState; onRestart: () => void }) {
  const title = game.level >= 5 ? '白袍盡頭的掌舵者' : game.health < 55 ? '把太多自己留在醫院' : game.money >= 3000 ? '穩穩走完的專業人生' : '四十年的白袍日常'
  const promotions = game.timeline.filter((entry) => entry.type === 'promotion').length
  return <article className="cl-ending">
    <p className="cl-eyebrow">65 歲 · CAREER ENDING</p>
    <h2>{title}</h2>
    <p>你從 25 歲穿上醫院白袍，走過 {game.reports.length} 個年度。薪水、位置與專業都留下了痕跡，健康也記得每一次交換。</p>
    <div className="cl-ending-stats">
      <Metric label="最高職級" value={`Lv.${game.promotion.highestLevel}`} />
      <Metric label="退休資產" value={Math.round(game.money - game.debt)} suffix="萬" />
      <Metric label="升遷次數" value={promotions} />
      <Metric label="Burnout" value={game.burnout.episodes} suffix="次" tone={game.burnout.episodes ? 'danger' : undefined} />
      <Metric label="健康" value={Math.round(game.health)} suffix="/100" />
      <Metric label="處方攔截" value={Math.round(game.signatureValue)} suffix="件" />
    </div>
    <blockquote>「我要用什麼代價，換什麼人生？」你的四十年，就是答案。</blockquote>
    <button className="cl-primary" type="button" onClick={onRestart}>用同一個 Seed 再走一次</button>
  </article>
}
