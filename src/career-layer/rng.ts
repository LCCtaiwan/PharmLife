export const CAREER_RNG_VERSION = 'PLCL04-MULBERRY32-1' as const

export function generateCareerSeed(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const values = new Uint32Array(8)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(values)
  else for (let index = 0; index < values.length; index += 1) values[index] = Math.floor(Math.random() * 0xffffffff)
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join('')
}

export function normalizeCareerSeed(seed: string): string {
  const normalized = seed.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24)
  return normalized || 'PHARMLIFE04'
}

function hashString(input: string): number {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
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

export function careerRandomAt(seed: string, cursor: number): number {
  return mulberry32(hashString(`${CAREER_RNG_VERSION}:${normalizeCareerSeed(seed)}:${cursor}`))
}

export function careerRandomInt(seed: string, cursor: number, min: number, max: number): number {
  return min + Math.floor(careerRandomAt(seed, cursor) * (max - min + 1))
}
