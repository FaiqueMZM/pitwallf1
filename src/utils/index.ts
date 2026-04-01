import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns'

// ─── Date / Time ──────────────────────────────────────────────────────────────

export function formatRaceDate(date: string, time?: string): string {
  try {
    const dt = time ? parseISO(`${date}T${time}`) : parseISO(date)
    return format(dt, 'dd MMM yyyy')
  } catch {
    return date
  }
}

export function formatRaceDateTime(date: string, time?: string): string {
  try {
    const dt = time ? parseISO(`${date}T${time}`) : parseISO(date)
    return format(dt, 'dd MMM yyyy · HH:mm z')
  } catch {
    return date
  }
}

export function timeUntilRace(date: string, time?: string): string {
  try {
    const dt = time ? parseISO(`${date}T${time}`) : parseISO(date)
    if (isPast(dt)) return 'Race finished'
    return formatDistanceToNow(dt, { addSuffix: true })
  } catch {
    return ''
  }
}

export function isRacePast(date: string): boolean {
  try {
    return isPast(parseISO(date))
  } catch {
    return false
  }
}

// ─── Points / Position ────────────────────────────────────────────────────────

export function getPositionLabel(position: string | number): string {
  const p = parseInt(String(position))
  if (p === 1) return '1st'
  if (p === 2) return '2nd'
  if (p === 3) return '3rd'
  return `${p}th`
}

export function getPodiumColor(position: string | number): string {
  const p = parseInt(String(position))
  if (p === 1) return '#FFD700'
  if (p === 2) return '#C0C0C0'
  if (p === 3) return '#CD7F32'
  return 'transparent'
}

// ─── Team colors ──────────────────────────────────────────────────────────────

const TEAM_COLORS: Record<string, string> = {
  'red_bull': '#3671C6',
  'ferrari': '#E8002D',
  'mercedes': '#27F4D2',
  'mclaren': '#FF8000',
  'aston_martin': '#229971',
  'alpine': '#0093CC',
  'williams': '#64C4FF',
  'rb': '#6692FF',
  'haas': '#B6BABD',
  'kick_sauber': '#52E252',
  'sauber': '#52E252',
}

export function getTeamColor(constructorId: string): string {
  return TEAM_COLORS[constructorId.toLowerCase()] ?? '#888888'
}

// ─── Flag emoji from nationality ─────────────────────────────────────────────

const NATIONALITY_TO_FLAG: Record<string, string> = {
  'British': '🇬🇧', 'Dutch': '🇳🇱', 'Spanish': '🇪🇸', 'Monegasque': '🇲🇨',
  'Mexican': '🇲🇽', 'Australian': '🇦🇺', 'Canadian': '🇨🇦', 'Finnish': '🇫🇮',
  'French': '🇫🇷', 'German': '🇩🇪', 'Italian': '🇮🇹', 'Japanese': '🇯🇵',
  'Chinese': '🇨🇳', 'Thai': '🇹🇭', 'Danish': '🇩🇰', 'American': '🇺🇸',
  'Brazilian': '🇧🇷', 'Argentine': '🇦🇷', 'Austrian': '🇦🇹', 'Belgian': '🇧🇪',
  'Swiss': '🇨🇭', 'Polish': '🇵🇱', 'Russian': '🇷🇺', 'New Zealander': '🇳🇿',
  'South African': '🇿🇦',
}

export function getNationalityFlag(nationality: string): string {
  return NATIONALITY_TO_FLAG[nationality] ?? '🏁'
}

// ─── String helpers ───────────────────────────────────────────────────────────

export function formatDriverName(givenName: string, familyName: string): string {
  return `${givenName} ${familyName}`
}

export function getDriverInitials(familyName: string): string {
  return familyName.slice(0, 3).toUpperCase()
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
