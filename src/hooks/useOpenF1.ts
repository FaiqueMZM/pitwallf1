import useSWR from 'swr'
import * as openf1 from '@/api/openf1'

// Live data polling — 10s interval during active sessions
const LIVE_OPTS = {
  refreshInterval: 10_000,
  revalidateOnFocus: true,
  dedupingInterval: 5_000,
}

const SESSION_OPTS = {
  revalidateOnFocus: false,
  dedupingInterval: 60_000,
}

export function useLatestSession() {
  return useSWR('latest-session', openf1.getLatestSession, SESSION_OPTS)
}

export function useLatestPositions(sessionKey: number | 'latest' = 'latest') {
  return useSWR(
    `positions-${sessionKey}`,
    () => openf1.getLatestPositions(sessionKey),
    LIVE_OPTS
  )
}

export function useSessionDrivers(sessionKey: number | 'latest' = 'latest') {
  return useSWR(
    `session-drivers-${sessionKey}`,
    () => openf1.getSessionDrivers(sessionKey),
    SESSION_OPTS
  )
}

export function useLatestWeather(sessionKey: number | 'latest' = 'latest') {
  return useSWR(
    `weather-${sessionKey}`,
    () => openf1.getLatestWeather(sessionKey),
    LIVE_OPTS
  )
}

export function usePitStops(sessionKey: number) {
  return useSWR(
    `pits-${sessionKey}`,
    () => openf1.getPitStops(sessionKey),
    LIVE_OPTS
  )
}
