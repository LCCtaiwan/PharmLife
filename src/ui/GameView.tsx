import { useState } from 'react'
import { ACHIEVEMENTS } from '../data/achievements'
import { ACTIONS } from '../data/actions'
import { CAREERS } from '../data/careers'
import { NPC_BY_ID, NPCS } from '../data/npcs'
import { attemptExam, canRetire, currentEvent, endYear, resolveEventChoice, retire, startCareer, takeAction } from '../engine/game'
import { netWorth, personalityTags, PERSONALITY_LABELS, STAT_LABELS } from '../engine/rules'
import type { CareerId, GameState, PersonalityKey, StatKey } from '../engine/types'
import { Icon, type IconName } from './Icon'
import { Portrait } from './Portrait'
import { shareLifeCard } from './ShareCard'
import { StatBar } from './StatBar'

type Tab = 'life' | 'stats' | 'people' | 'money'

export function GameView({ state, onChange, onMenu, onSaves }: { state: GameState; onChange: (state: GameState) => void; onMenu: () => void; onSaves: () => void }) {
  const [tab, setTab] = useState<Tab>('life')
  const event = currentEvent(state)
  const advance = () => onChange(endYear(state))
  return <main className="game-page">
    <header className="game-header">
      <button className="brand-button" onClick={onMenu}><span><Icon name="pulse" /></span><strong>PharmLife</strong></button>
      <div className="year-chip"><small>{state.year}</small><strong>{state.age} 歲</strong><span>{state.phase === 'student' ? `藥學系 ${state.studentYear} 年級` : state.phase === 'exam' ? `國考第 ${state.examStage} 階段` : state.career.trackId ? CAREERS[state.career.trackId].roles[state.career.roleIndex].title : '選擇第一份工作'}</span></div>
      <div className="header-actions"><button className="ghost-btn seed-chip"><Icon name="spark" />{state.seed}</button><button className="icon-btn" onClick={onSaves} aria-label="存檔"><Icon name="save" /></button></div>
    </header>
    <section className="vitals-strip">
      <Vital icon="pulse" label="體力" value={state.energy} tone="mint" />
      <Vital icon="spark" label="壓力" value={state.stress} tone="gold" inverse />
      <Vital icon="shield" label="Burnout" value={state.burnout} tone="coral" inverse />
      <Vital icon="heart" label="家庭" value={state.family} tone="rose" />
    </section>

    <div className="game-grid">
      <aside className={`side-panel profile-panel mobile-tab ${tab === 'life' ? 'mobile-tab--active' : ''}`}>
        <Portrait state={state} />
        <div className="personality-card"><small>大家眼中的你</small><div>{personalityTags(state).length ? personalityTags(state).map((tag) => <span key={tag}>{tag}</span>) : <span>還在形成</span>}</div></div>
        <div className="quick-stats"><StatBar label="健康" value={state.health} /><StatBar label="聲望" value={state.reputation} color="var(--gold)" /><StatBar label="家庭" value={state.family} color="var(--rose)" /></div>
        {canRetire(state) && <button className="text-btn retire-btn" onClick={() => onChange(retire(state))}>考慮退休</button>}
      </aside>

      <section className={`main-stage mobile-tab ${tab === 'life' ? 'mobile-tab--active' : ''}`}>
        {state.ending ? <EndingPanel state={state} onRestart={onMenu} /> : state.pendingResult ? <OutcomePanel state={state} onContinue={advance} /> : event ? <EventPanel state={state} onChoose={(id) => onChange(resolveEventChoice(state, id))} /> : state.phase === 'exam' ? <ExamPanel state={state} onAttempt={() => onChange(attemptExam(state))} /> : state.phase === 'career' && !state.career.trackId ? <CareerPicker state={state} onPick={(id) => onChange(startCareer(state, id))} /> : <ActionPanel state={state} onAction={(id) => onChange(takeAction(state, id))} onCareer={(id) => onChange(startCareer(state, id))} />}
      </section>

      <aside className={`side-panel details-panel mobile-tab ${tab !== 'life' ? 'mobile-tab--active' : ''}`}>
        {tab === 'stats' && <StatsPanel state={state} />}
        {tab === 'people' && <PeoplePanel state={state} />}
        {tab === 'money' && <MoneyPanel state={state} />}
        {tab === 'life' && <TimelinePanel state={state} />}
      </aside>
    </div>

    <nav className="mobile-nav">{([['life', 'home', '人生'], ['stats', 'chart', '能力'], ['people', 'people', '關係'], ['money', 'wallet', '資產']] as [Tab, IconName, string][]).map(([id, icon, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon name={icon} /><span>{label}</span></button>)}</nav>
  </main>
}

function Vital({ icon, label, value, tone, inverse = false }: { icon: IconName; label: string; value: number; tone: string; inverse?: boolean }) {
  const warning = inverse ? value >= 70 : value <= 30
  return <div className={`vital ${warning ? 'warning' : ''}`}><Icon name={icon} /><div><span>{label}</span><b>{Math.round(value)}</b></div><i className={`vital-dot ${tone}`} /></div>
}

function ActionPanel({ state, onAction, onCareer }: { state: GameState; onAction: (id: string) => void; onCareer: (id: CareerId) => void }) {
  const available = ACTIONS.filter((action) => !action.careerOnly || state.phase === 'career')
  return <div className="stage-card action-stage">
    <header className="stage-heading"><div><p className="kicker">{state.phase === 'student' ? `藥學系 ${state.studentYear} 年級` : '年度規劃'}</p><h2>今年，把時間放在哪裡？</h2><p>選擇只顯示方向。真正的代價，會在結果裡出現。</p></div><div className="ap-counter"><small>剩餘行動</small><span>{[0, 1, 2, 3].map((index) => <i key={index} className={index < state.actionsLeft ? 'filled' : ''} />)}</span></div></header>
    {state.career.offers.length > 0 && state.career.trackId && <div className="offer-banner"><div><small>新的職涯邀請</small><strong>有些門不會一直開著。</strong></div><div>{state.career.offers.map((id) => <button key={id} onClick={() => onCareer(id)}>轉往{CAREERS[id].name}</button>)}</div></div>}
    <div className="action-grid">{available.map((action) => <button className={`action-card ${action.accent}`} key={action.id} onClick={() => onAction(action.id)} disabled={state.actionsLeft <= 0}>
      <span className="action-index">{String(available.indexOf(action) + 1).padStart(2, '0')}</span><strong>{action.name}</strong><p>{action.description}</p><span className="action-arrow">→</span>
    </button>)}</div>
    <p className="stage-footnote">每年行動結束後，人生會回應你的選擇。</p>
  </div>
}

function EventPanel({ state, onChoose }: { state: GameState; onChoose: (id: string) => void }) {
  const event = currentEvent(state)!
  const npc = event.npcId ? NPC_BY_ID[event.npcId] : null
  return <div className="stage-card event-stage">
    <div className="event-scene">
      <div className="scene-grid" /><span className="scene-year">{state.year} / AGE {state.age}</span>
      {npc ? <div className="npc-figure" style={{ '--npc-color': npc.color } as React.CSSProperties}><div className="npc-head" /><div className="npc-body" /><strong>{npc.name}</strong><small>{npc.role}</small></div> : <div className="event-symbol"><Icon name={event.category === 'career' ? 'briefcase' : event.category === 'family' ? 'heart' : event.category === 'startup' ? 'chart' : 'spark'} /></div>}
    </div>
    <div className="event-copy"><p className="kicker">{event.eyebrow}</p><h2>{event.title}</h2><p className="event-text">{event.text}</p><div className="choice-list">{event.choices.map((choice, index) => <button key={choice.id} onClick={() => onChoose(choice.id)}><span>{String.fromCharCode(65 + index)}</span><div><strong>{choice.text}</strong><small>{choice.hint}</small></div><i>→</i></button>)}</div></div>
  </div>
}

function OutcomePanel({ state, onContinue }: { state: GameState; onContinue: () => void }) {
  const result = state.pendingResult!
  return <div className={`stage-card outcome-stage ${result.success === false ? 'outcome-fail' : ''}`}>
    <div className="outcome-mark"><Icon name={result.success === false ? 'pulse' : 'spark'} /></div>
    <p className="kicker">{result.success == null ? '選擇留下了痕跡' : result.success ? '檢定成功' : '檢定失敗 · 但故事繼續'}</p>
    <h2>{result.choiceText}</h2><p className="outcome-text">{result.outcomeText}</p>
    <div className="change-chips">{result.changes.length ? result.changes.map((change) => <span key={change}>{change}</span>) : <span>世界記住了這個選擇</span>}</div>
    <button className="primary-btn primary-btn--large" onClick={onContinue}>{state.phase === 'student' ? '進入下一學年' : '進入下一年'} <Icon name="arrow" /></button>
  </div>
}

function ExamPanel({ state, onAttempt }: { state: GameState; onAttempt: () => void }) {
  return <div className="stage-card exam-stage"><div className="exam-seal"><Icon name="book" /><span>第 {state.examStage} 階段</span></div><p className="kicker">藥師國家考試</p><h2>{state.examStage === 1 ? '基礎科學，決定第一道門。' : '實務與判斷，走完最後一步。'}</h2><p>不會真的考你題目。結果由專業、研究、法規、體力、壓力與世界 Seed 共同決定；落榜會成為新的故事，不會 Game Over。</p><div className="exam-readiness"><StatBar label="專業" value={state.stats.knowledge} /><StatBar label="研究" value={state.stats.research} color="var(--violet)" /><StatBar label="法規" value={state.stats.regulation} color="var(--blue)" /></div><button className="primary-btn primary-btn--large" onClick={onAttempt}>進入考場 <Icon name="arrow" /></button><small>已應試 {state.examAttempts} 次</small></div>
}

function CareerPicker({ state, onPick }: { state: GameState; onPick: (id: CareerId) => void }) {
  return <div className="stage-card career-picker"><header className="stage-heading"><div><p className="kicker">第一份工作</p><h2>八條路，沒有一條只是獎勵。</h2><p>你之後仍能跳槽。現在選的是起點，不是終點。</p></div></header><div className="career-grid">{state.career.offers.map((id) => { const career = CAREERS[id]; return <button key={id} style={{ '--career-color': career.accent } as React.CSSProperties} onClick={() => onPick(id)}><i /><div><small>{career.short}</small><strong>{career.name}</strong><p>{career.tradeoff}</p></div><span>→</span></button> })}</div></div>
}

function TimelinePanel({ state }: { state: GameState }) {
  const track = state.career.trackId ? CAREERS[state.career.trackId] : null
  return <><section className="detail-card career-summary"><header><span><Icon name="briefcase" /></span><div><small>目前職涯</small><strong>{track?.name ?? (state.phase === 'student' ? '藥學系' : '尚未選擇')}</strong></div></header>{track && <><p>{track.roles[state.career.roleIndex].title}</p><div className="mini-metrics"><span>績效 <b>{state.career.performance}</b></span><span>年資 <b>{state.career.yearsInTrack}</b></span></div></>}</section><section className="detail-card timeline"><header><div><small>LIFE LOG</small><strong>人生時間線</strong></div><span>{state.timeline.length}</span></header><div>{state.timeline.slice(-7).reverse().map((item, index) => <article key={`${item.year}-${item.title}-${index}`} className={item.tone}><i /><time>{item.age} 歲</time><div><strong>{item.title}</strong><p>{item.detail}</p></div></article>)}</div></section></>
}

function StatsPanel({ state }: { state: GameState }) {
  return <><section className="detail-card"><header><div><small>ABILITIES</small><strong>能力養成</strong></div></header><div className="all-stats">{(Object.entries(STAT_LABELS) as [StatKey, string][]).map(([key, label]) => <StatBar key={key} label={label} value={state.stats[key]} />)}</div></section><section className="detail-card"><header><div><small>PERSONALITY</small><strong>選擇形成的人格</strong></div></header><div className="personality-axes">{(Object.entries(PERSONALITY_LABELS) as [PersonalityKey, [string, string]][]).map(([key, labels]) => <div key={key}><span>{labels[0]}</span><i><b style={{ left: `${(state.personality[key] + 100) / 2}%` }} /></i><span>{labels[1]}</span></div>)}</div></section></>
}

function PeoplePanel({ state }: { state: GameState }) {
  const met = NPCS.filter((npc) => state.npcs[npc.id]?.met)
  return <section className="detail-card people-card"><header><div><small>RELATIONSHIPS</small><strong>重要的人</strong></div><span>{met.length}</span></header>{met.length ? met.map((npc) => { const relation = state.npcs[npc.id]; return <article key={npc.id}><div className="npc-dot" style={{ background: npc.color }}>{npc.name.slice(-1)}</div><div><strong>{npc.name}</strong><small>{npc.role} · 世界進度 {relation.worldStage}</small><p><span>好感 {relation.favor}</span><span>信任 {relation.trust}</span><span>利益 {relation.interest}</span></p></div></article> }) : <div className="empty-state">重要的人，會在選擇裡慢慢出現。</div>}</section>
}

function MoneyPanel({ state }: { state: GameState }) {
  const rows = [['現金', state.economy.cash], ['資產', state.economy.assets], ['負債', -state.economy.debt], ['淨資產', netWorth(state)]] as [string, number][]
  return <><section className="detail-card networth"><small>NET WORTH</small><strong>{netWorth(state).toLocaleString()}<em> 萬</em></strong><div>{rows.map(([label, value]) => <p key={label}><span>{label}</span><b className={value < 0 ? 'negative' : ''}>{Math.round(value).toLocaleString()} 萬</b></p>)}</div></section><section className="detail-card"><header><div><small>ANNUAL FLOW</small><strong>年度現金流</strong></div></header><div className="money-bars"><p><span>收入</span><i><b style={{ width: `${Math.min(100, state.economy.annualIncome / 2.2)}%` }} /></i><strong>{Math.round(state.economy.annualIncome)} 萬</strong></p><p><span>固定支出</span><i><b className="expense" style={{ width: `${Math.min(100, state.economy.annualExpense)}%` }} /></i><strong>{Math.round(state.economy.annualExpense)} 萬</strong></p></div></section></>
}

function EndingPanel({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const ending = state.ending!
  return <div className="stage-card ending-stage"><p className="kicker">LIFE RECORD · {state.seed}</p><h1>{ending.title}</h1><h2>{ending.subtitle}</h2><p>{ending.summary}</p><div className="ending-score"><span>人生評價</span><strong>{ending.score}</strong><small>/ 100</small></div><div className="ending-metrics"><span>職涯 <b>{state.statsLifetime.yearsWorked} 年</b></span><span>轉職 <b>{state.career.changes} 次</b></span><span>Burnout <b>{state.statsLifetime.burnoutEpisodes} 次</b></span><span>淨資產 <b>{netWorth(state)} 萬</b></span></div><div className="achievement-list">{state.achievements.map((id) => { const item = ACHIEVEMENTS.find((achievement) => achievement.id === id); return item && <span key={id}>{item.name}</span> })}</div><div className="ending-actions"><button className="primary-btn primary-btn--large" onClick={() => shareLifeCard(state)}><Icon name="share" />分享人生卡</button><button className="secondary-btn" onClick={onRestart}>回到首頁</button></div></div>
}
