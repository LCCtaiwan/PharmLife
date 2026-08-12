import { useEffect, useMemo, useState } from 'react'
import { generateSeed } from './engine/rng'
import { createNewGame } from './engine/game'
import type { Difficulty, GameState, NewGameOptions } from './engine/types'
import { AUTO_SAVE_KEY, SLOT_KEYS, deleteSave, downloadText, exportSave, importSave, listSaves, loadGame, saveGame } from './save/storage'
import { GameView } from './ui/GameView'
import { Icon } from './ui/Icon'

type Screen = 'menu' | 'create' | 'play'

const originOptions: { id: NewGameOptions['origin']; label: string; description: string }[] = [
  { id: 'steady', label: '穩健派', description: '調劑、法規與效率起步較好' },
  { id: 'scholar', label: '研究腦', description: '專業與研究起步較好' },
  { id: 'people', label: '人情派', description: '溝通與管理起步較好' },
  { id: 'hustler', label: '行動派', description: '商業、效率與溝通起步較好' },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [game, setGame] = useState<GameState | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [toast, setToast] = useState('')
  const autosave = useMemo(() => loadGame(AUTO_SAVE_KEY), [screen])

  useEffect(() => {
    if (game) saveGame(game)
  }, [game])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const start = (options: NewGameOptions) => {
    setGame(createNewGame(options)); setScreen('play')
  }

  const resume = (state: GameState) => {
    setGame(state); setScreen('play')
  }

  return <div className="app-shell">
    {screen === 'menu' && <MainMenu onCreate={() => setScreen('create')} autosave={autosave?.state ?? null} onResume={resume} onSaves={() => setSaveOpen(true)} />}
    {screen === 'create' && <CharacterCreate onBack={() => setScreen('menu')} onStart={start} />}
    {screen === 'play' && game && <GameView state={game} onChange={setGame} onMenu={() => setScreen('menu')} onSaves={() => setSaveOpen(true)} />}
    {saveOpen && <SaveManager state={game} onClose={() => setSaveOpen(false)} onLoad={(state) => { resume(state); setSaveOpen(false); setToast('人生已讀取') }} onToast={setToast} />}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>
}

function MainMenu({ onCreate, autosave, onResume, onSaves }: { onCreate: () => void; autosave: GameState | null; onResume: (state: GameState) => void; onSaves: () => void }) {
  return <main className="landing">
    <div className="landing-noise" />
    <header className="landing-header"><Logo /><button className="ghost-btn" onClick={onSaves}><Icon name="save" />存檔</button></header>
    <section className="hero">
      <div className="hero-copy">
        <p className="kicker"><span>v0.2 深度版</span> 台灣藥師職涯模擬</p>
        <h1>這一次，<br />你想成為怎樣的<span>藥師？</span></h1>
        <p className="hero-lead">從白袍、國考到職涯岔路。錢、理想、關係與健康沒有標準答案，只有你願意交換的人生。</p>
        <div className="hero-actions">
          <button className="primary-btn primary-btn--large" onClick={onCreate}>開始新人生 <Icon name="arrow" /></button>
          {autosave && <button className="secondary-btn" onClick={() => onResume(autosave)}><Icon name="clock" />繼續 {autosave.profile.name} · {autosave.age} 歲</button>}
        </div>
        <div className="feature-strip">
          <span><Icon name="spark" />版本化 Seed</span><span><Icon name="briefcase" />8 大職涯</span><span><Icon name="people" />人物事件鏈</span>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="rx-card rx-card--back"><span>Rx</span><small>人生沒有標準處方</small></div>
        <div className="rx-card rx-card--front">
          <div className="rx-top"><i />PHARMLIFE</div>
          <div className="rx-avatar"><div className="mini-head" /><div className="mini-body" /></div>
          <strong>林大藥師</strong><small>社區守護神</small>
          <div className="rx-chart"><i /><i /><i /><i /><i /></div>
          <div className="rx-seed">SEED · 8F72KQ</div>
        </div>
        <div className="pill pill-a" /><div className="pill pill-b" /><div className="orbit orbit-a" /><div className="orbit orbit-b" />
      </div>
    </section>
    <footer className="landing-footer"><span>一局約 10–20 分鐘</span><span>所有資料保留在你的瀏覽器</span></footer>
  </main>
}

function Logo() {
  return <div className="logo"><span><Icon name="pulse" /></span><div><strong>PharmLife</strong><small>藥師人生模擬器</small></div></div>
}

function CharacterCreate({ onBack, onStart }: { onBack: () => void; onStart: (options: NewGameOptions) => void }) {
  const [name, setName] = useState('林予安')
  const [pronoun, setPronoun] = useState('他／她')
  const [origin, setOrigin] = useState<NewGameOptions['origin']>('steady')
  const [difficulty, setDifficulty] = useState<Difficulty>('standard')
  const [seed, setSeed] = useState(generateSeed())
  return <main className="create-page">
    <header className="create-header"><button className="icon-btn" onClick={onBack} aria-label="返回">←</button><Logo /><span>01 / 建立角色</span></header>
    <div className="create-layout">
      <section className="create-intro"><p className="kicker">人生起點</p><h1>白袍很白，<br />未來還沒被寫下。</h1><p>初始背景只影響起點，不會鎖住任何職涯。人格會由你之後的選擇慢慢形成。</p><div className="create-figure"><div className="create-halo" /><div className="portrait-person"><div className="portrait-head"><i /><b /></div><div className="portrait-body"><span /></div></div><small>18 歲 · 藥學系新生</small></div></section>
      <form className="create-form" onSubmit={(event) => { event.preventDefault(); onStart({ name, pronoun, origin, difficulty, seed }) }}>
        <label className="field"><span>名字</span><input value={name} maxLength={12} onChange={(e) => setName(e.target.value)} required /></label>
        <label className="field"><span>代稱</span><select value={pronoun} onChange={(e) => setPronoun(e.target.value)}><option>他／她</option><option>他</option><option>她</option><option>TA</option></select></label>
        <fieldset><legend>起始背景</legend><div className="option-grid">{originOptions.map((item) => <button type="button" key={item.id} className={`option-card ${origin === item.id ? 'selected' : ''}`} onClick={() => setOrigin(item.id)}><span>{item.label}</span><small>{item.description}</small></button>)}</div></fieldset>
        <fieldset><legend>人生難度</legend><div className="segmented">{([['story', '故事'], ['standard', '標準'], ['hard', '現實']] as [Difficulty, string][]).map(([id, label]) => <button type="button" key={id} className={difficulty === id ? 'active' : ''} onClick={() => setDifficulty(id)}>{label}</button>)}</div></fieldset>
        <label className="field seed-field"><span>世界種子 <small>同 Seed＋同選擇可重現</small></span><div><input value={seed} onChange={(e) => setSeed(e.target.value.toUpperCase())} /><button type="button" onClick={() => setSeed(generateSeed())}><Icon name="spark" />重骰</button></div></label>
        <button className="primary-btn primary-btn--large submit-life" type="submit">穿上白袍 <Icon name="arrow" /></button>
      </form>
    </div>
  </main>
}

function SaveManager({ state, onClose, onLoad, onToast }: { state: GameState | null; onClose: () => void; onLoad: (state: GameState) => void; onToast: (message: string) => void }) {
  const [revision, setRevision] = useState(0)
  const saves = useMemo(() => listSaves(), [revision])
  const importFile = async (file: File) => {
    try { onLoad(importSave(await file.text())) } catch (error) { onToast(error instanceof Error ? error.message : '存檔無法讀取') }
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="save-modal" onMouseDown={(e) => e.stopPropagation()}>
    <header><div><p className="kicker">人生檔案室</p><h2>存檔與讀檔</h2></div><button className="icon-btn" onClick={onClose}>×</button></header>
    <div className="save-list">{saves.map(({ key, save }, index) => <article className="save-slot" key={key}>
      <div><small>SLOT {index + 1}</small>{save ? <><strong>{save.state.profile.name} · {save.state.age} 歲</strong><span>{save.state.ending?.title ?? (save.state.career.trackId ? save.state.career.trackId : '藥學系')} · {new Date(save.savedAt).toLocaleString('zh-TW')}</span></> : <strong>空白存檔</strong>}</div>
      <div className="save-actions">{state && <button onClick={() => { saveGame(state, key); setRevision((v) => v + 1); onToast(`已儲存至 SLOT ${index + 1}`) }}>儲存</button>}{save && <><button onClick={() => onLoad(save.state)}>讀取</button><button className="danger" onClick={() => { deleteSave(key); setRevision((v) => v + 1) }}>刪除</button></>}</div>
    </article>)}</div>
    <div className="save-tools">{state && <button onClick={() => downloadText(`PharmLife-${state.profile.name}-${state.seed}.json`, exportSave(state))}><Icon name="download" />匯出 JSON</button>}<label><Icon name="save" />匯入 JSON<input type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} /></label></div>
  </section></div>
}
