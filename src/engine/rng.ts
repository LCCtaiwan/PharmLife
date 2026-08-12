export const SEED_VERSION = 'PL02-MULBERRY32-1' as const

export function normalizeSeed(seed: string): string {
  const cleaned = seed.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
  return cleaned || generateSeed()
}

export function generateSeed(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint32Array(8)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes)
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 0xffffffff)
  return Array.from(bytes, (value) => chars[value % chars.length]).join('')
}

export function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number): number {
  let value = seed + 0x6d2b79f5
  value = Math.imul(value ^ (value >>> 15), value | 1)
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296
}

export function randomAt(seed: string, cursor: number): number {
  return mulberry32(hashString(`${SEED_VERSION}:${normalizeSeed(seed)}:${cursor}`))
}

export function randomInt(seed: string, cursor: number, min: number, max: number): number {
  return min + Math.floor(randomAt(seed, cursor) * (max - min + 1))
}

export function pickWeighted<T>(items: T[], weights: number[], roll: number): T | undefined {
  const total = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0)
  if (!items.length || total <= 0) return undefined
  let target = roll * total
  for (let i = 0; i < items.length; i += 1) {
    target -= Math.max(0, weights[i] ?? 0)
    if (target <= 0) return items[i]
  }
  return items.at(-1)
}
