import type { GameState } from '../engine/types'

export const AUTO_SAVE_KEY = 'pharmlife:v0.2:autosave'
export const SLOT_KEYS = ['pharmlife:v0.2:slot:1', 'pharmlife:v0.2:slot:2', 'pharmlife:v0.2:slot:3'] as const

export interface SaveEnvelope {
  app: 'PharmLife'
  savedAt: string
  state: GameState
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<GameState>
  return state.saveVersion === 2 && state.seedVersion === 'PL02-MULBERRY32-1' && typeof state.seed === 'string' && typeof state.age === 'number' && typeof state.profile?.name === 'string' && Boolean(state.stats)
}

function envelope(state: GameState): SaveEnvelope {
  return { app: 'PharmLife', savedAt: new Date().toISOString(), state }
}

export function saveGame(state: GameState, key = AUTO_SAVE_KEY): void {
  localStorage.setItem(key, JSON.stringify(envelope(state)))
}

export function loadGame(key = AUTO_SAVE_KEY): SaveEnvelope | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<SaveEnvelope>
    if (parsed.app !== 'PharmLife' || !parsed.savedAt || !isGameState(parsed.state)) return null
    return parsed as SaveEnvelope
  } catch {
    return null
  }
}

export function deleteSave(key: string): void {
  localStorage.removeItem(key)
}

export function listSaves(): { key: string; save: SaveEnvelope | null }[] {
  return SLOT_KEYS.map((key) => ({ key, save: loadGame(key) }))
}

export function exportSave(state: GameState): string {
  return JSON.stringify(envelope(state), null, 2)
}

export function importSave(raw: string): GameState {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('這不是有效的 JSON 存檔。')
  }
  const candidate = parsed && typeof parsed === 'object' && 'state' in parsed ? (parsed as { state: unknown }).state : parsed
  if (!isGameState(candidate)) throw new Error('存檔版本不相容，或缺少必要資料。')
  return candidate
}

export function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
