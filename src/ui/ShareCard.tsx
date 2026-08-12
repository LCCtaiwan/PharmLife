import { ACHIEVEMENTS } from '../data/achievements'
import { CAREERS } from '../data/careers'
import { netWorth, personalityTags } from '../engine/rules'
import type { GameState } from '../engine/types'

export function drawLifeCard(state: GameState): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const ctx = canvas.getContext('2d')!
  const accent = state.career.trackId ? CAREERS[state.career.trackId].accent : '#48d6ba'
  ctx.fillStyle = '#0b2421'; ctx.fillRect(0, 0, 1080, 1350)
  const gradient = ctx.createRadialGradient(850, 180, 0, 850, 180, 700)
  gradient.addColorStop(0, `${accent}55`); gradient.addColorStop(1, '#0b242100')
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, 1350)
  ctx.strokeStyle = '#ffffff20'; ctx.lineWidth = 2; ctx.strokeRect(54, 54, 972, 1242)
  ctx.fillStyle = accent; ctx.font = '700 30px system-ui'; ctx.fillText('PHARMLIFE / LIFE RECORD', 86, 112)
  ctx.fillStyle = '#f7f3e8'; ctx.font = '800 78px system-ui'; ctx.fillText(state.profile.name, 86, 224)
  ctx.fillStyle = '#a9c8bf'; ctx.font = '32px system-ui'; ctx.fillText(`${state.age} 歲 · ${state.ending?.title ?? '藥師人生'}`, 90, 280)
  ctx.fillStyle = '#f7f3e8'; ctx.font = '700 50px system-ui'; wrapText(ctx, state.ending?.subtitle ?? '', 86, 380, 870, 66)
  const rows = [
    ['職涯年數', `${state.statsLifetime.yearsWorked} 年`], ['轉換職涯', `${state.career.changes} 次`],
    ['Burnout', `${state.statsLifetime.burnoutEpisodes} 次`], ['淨資產', `${netWorth(state)} 萬`],
    ['家庭', `${Math.round(state.family)}`], ['健康', `${Math.round(state.health)}`],
  ]
  rows.forEach(([label, value], index) => {
    const x = 86 + (index % 2) * 460; const y = 565 + Math.floor(index / 2) * 120
    ctx.fillStyle = '#8aaea4'; ctx.font = '25px system-ui'; ctx.fillText(label, x, y)
    ctx.fillStyle = '#f7f3e8'; ctx.font = '700 42px system-ui'; ctx.fillText(value, x, y + 49)
  })
  ctx.fillStyle = '#ffffff12'; roundRect(ctx, 80, 945, 920, 170, 24); ctx.fill()
  ctx.fillStyle = '#a9c8bf'; ctx.font = '24px system-ui'; ctx.fillText('這一生留下的關鍵字', 112, 995)
  ctx.fillStyle = '#f7f3e8'; ctx.font = '700 34px system-ui'; ctx.fillText([...personalityTags(state), ...(state.ending?.badges ?? [])].slice(0, 5).join('  ·  '), 112, 1054)
  const unlocked = state.achievements.map((id) => ACHIEVEMENTS.find((item) => item.id === id)?.name).filter(Boolean).slice(0, 3).join(' / ')
  ctx.fillStyle = '#8aaea4'; ctx.font = '23px system-ui'; ctx.fillText(unlocked || '一段沒有標準答案的人生', 112, 1095)
  ctx.fillStyle = accent; ctx.font = '700 28px ui-monospace, monospace'; ctx.fillText(`SEED ${state.seed}`, 86, 1225)
  ctx.fillStyle = '#71968d'; ctx.font = '22px system-ui'; ctx.fillText(`${state.seedVersion} · v0.2`, 86, 1264)
  return canvas
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const chars = [...text]; let line = ''; let lineY = y
  for (const char of chars) {
    const test = line + char
    if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, lineY); line = char; lineY += lineHeight } else line = test
  }
  if (line) ctx.fillText(line, x, lineY)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius)
}

export async function shareLifeCard(state: GameState) {
  const canvas = drawLifeCard(state)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return
  const file = new File([blob], `PharmLife-${state.profile.name}-${state.seed}.png`, { type: 'image/png' })
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `我的 PharmLife：${state.ending?.title}`, text: `世界種子 ${state.seed}` })
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== 'AbortError') throw error
    }
  } else {
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); URL.revokeObjectURL(url)
  }
}
