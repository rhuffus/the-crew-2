export function isPersistenceModeDrizzle(): boolean {
  const mode = process.env.PERSISTENCE_MODE
  if (mode) return mode === 'drizzle'
  // Auto-detect: only use drizzle if DATABASE_URL is available
  return !!process.env.DATABASE_URL
}
