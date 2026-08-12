import { CAREERS } from '../data/careers'
import type { GameState } from '../engine/types'

export function Portrait({ state, compact = false }: { state: GameState; compact?: boolean }) {
  const accent = state.career.trackId ? CAREERS[state.career.trackId].accent : '#48d6ba'
  const era = state.age < 25 ? '學生' : state.age < 40 ? '青年' : state.age < 55 ? '中年' : '資深'
  return <div className={`portrait ${compact ? 'portrait--compact' : ''}`} style={{ '--portrait-accent': accent } as React.CSSProperties}>
    <div className="portrait-grid" />
    <div className="portrait-halo" />
    <div className="portrait-person">
      <div className="portrait-head"><i /><b /></div>
      <div className="portrait-body"><span /></div>
    </div>
    <div className="portrait-copy">
      <small>{era}篇</small>
      <strong>{state.profile.name}</strong>
      <span>{state.career.trackId ? CAREERS[state.career.trackId].roles[state.career.roleIndex].title : state.phase === 'student' ? `藥學系 ${state.studentYear} 年級` : '準藥師'}</span>
    </div>
  </div>
}
