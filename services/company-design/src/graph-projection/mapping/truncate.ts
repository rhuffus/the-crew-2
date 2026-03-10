export function truncate(text: string | undefined | null, maxLength: number): string | null {
  if (!text || !text.trim()) return null
  return text.length > maxLength ? text.slice(0, maxLength - 1) + '\u2026' : text
}
