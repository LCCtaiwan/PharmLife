import { beforeEach, describe, expect, it } from 'vitest'
import { createNewGame } from '../src/engine/game'
import { exportSave, importSave, loadGame, saveGame } from '../src/save/storage'

describe('versioned saves', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips through localStorage and exported JSON', () => {
    const state = createNewGame({ name: '存檔藥師', pronoun: 'TA', origin: 'steady', difficulty: 'standard', seed: 'SAVE0202' })
    saveGame(state)
    expect(loadGame()?.state).toEqual(state)
    expect(importSave(exportSave(state))).toEqual(state)
  })

  it('rejects incompatible data', () => {
    expect(() => importSave('{"saveVersion":1}')).toThrow(/版本不相容/)
    expect(() => importSave('not json')).toThrow(/有效的 JSON/)
  })
})
