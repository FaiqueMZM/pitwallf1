import axios from 'axios'
import type {
  Race,
  DriverStanding,
  ConstructorStanding,
  Driver,
  LapTime,
} from '@/types'

const BASE = 'https://api.jolpi.ca/ergast/f1'

const client = axios.create({
  baseURL: BASE,
  timeout: 10000,
})

// Helper: unwrap the deeply nested Ergast response
function unwrap<T>(path: (data: any) => T) {
  return async (url: string, params?: Record<string, string | number>) => {
    const { data } = await client.get(url, { params })
    return path(data.MRData)
  }
}

// ─── Season / Calendar ────────────────────────────────────────────────────────

export async function getSeasonSchedule(year: number | 'current' = 'current'): Promise<Race[]> {
  const get = unwrap<Race[]>((d) => d.RaceTable.Races)
  return get(`/${year}.json`)
}

export async function getNextRace(): Promise<Race | null> {
  const get = unwrap<Race[]>((d) => d.RaceTable.Races)
  const races = await get('/current/next.json')
  return races[0] ?? null
}

export async function getLastRace(): Promise<Race | null> {
  const get = unwrap<Race[]>((d) => d.RaceTable.Races)
  const races = await get('/current/last/results.json')
  return races[0] ?? null
}

// ─── Race Results ─────────────────────────────────────────────────────────────

export async function getRaceResults(year: number | 'current', round: number | 'last'): Promise<Race | null> {
  const get = unwrap<Race[]>((d) => d.RaceTable.Races)
  const races = await get(`/${year}/${round}/results.json`)
  return races[0] ?? null
}

export async function getQualifyingResults(year: number | 'current', round: number | 'last'): Promise<Race | null> {
  const get = unwrap<Race[]>((d) => d.RaceTable.Races)
  const races = await get(`/${year}/${round}/qualifying.json`)
  return races[0] ?? null
}

export async function getLapTimes(year: number, round: number, lap?: number): Promise<LapTime[]> {
  const get = unwrap<LapTime[]>((d) => d.RaceTable.Races[0]?.Laps ?? [])
  const url = lap ? `/${year}/${round}/laps/${lap}.json` : `/${year}/${round}/laps.json`
  return get(url, { limit: 100 })
}

// ─── Standings ────────────────────────────────────────────────────────────────

export async function getDriverStandings(year: number | 'current' = 'current'): Promise<DriverStanding[]> {
  const get = unwrap<DriverStanding[]>(
    (d) => d.StandingsTable.StandingsLists[0]?.DriverStandings ?? []
  )
  return get(`/${year}/driverStandings.json`)
}

export async function getConstructorStandings(year: number | 'current' = 'current'): Promise<ConstructorStanding[]> {
  const get = unwrap<ConstructorStanding[]>(
    (d) => d.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []
  )
  return get(`/${year}/constructorStandings.json`)
}

// ─── Drivers ─────────────────────────────────────────────────────────────────

export async function getAllDrivers(year: number | 'current' = 'current'): Promise<Driver[]> {
  const get = unwrap<Driver[]>((d) => d.DriverTable.Drivers)
  return get(`/${year}/drivers.json`, { limit: 100 })
}

export async function getDriverProfile(driverId: string): Promise<Driver | null> {
  const get = unwrap<Driver[]>((d) => d.DriverTable.Drivers)
  const drivers = await get(`/drivers/${driverId}.json`)
  return drivers[0] ?? null
}

export async function getDriverSeasonResults(driverId: string, year: number | 'current' = 'current'): Promise<Race[]> {
  const get = unwrap<Race[]>((d) => d.RaceTable.Races)
  return get(`/${year}/drivers/${driverId}/results.json`, { limit: 30 })
}

// ─── Seasons list ─────────────────────────────────────────────────────────────

export async function getAvailableSeasons(): Promise<number[]> {
  const { data } = await client.get('/seasons.json', { params: { limit: 100 } })
  return (data.MRData.SeasonTable.Seasons as { season: string }[])
    .map((s) => parseInt(s.season))
    .reverse()
}

// ─── Driver Seasons list ──────────────────────────────────────────────────────

export async function getDriverSeasons(driverId: string): Promise<number[]> {
  const { data } = await client.get(`/drivers/${driverId}/seasons.json`, {
    params: { limit: 100 },
  })
  return (data.MRData.SeasonTable.Seasons as { season: string }[])
    .map((s) => parseInt(s.season))
    .reverse()
}