import useSWR from "swr";
import * as jolpica from "@/api/jolpica";

// SWR config: stale-while-revalidate, sensible defaults for F1 data
const RACE_OPTS = { revalidateOnFocus: false, dedupingInterval: 60_000 };
const STANDINGS_OPTS = { revalidateOnFocus: false, dedupingInterval: 120_000 };
const SCHEDULE_OPTS = { revalidateOnFocus: false, dedupingInterval: 300_000 };

export function useSeasonSchedule(year: number | "current" = "current") {
  return useSWR(
    `schedule-${year}`,
    () => jolpica.getSeasonSchedule(year),
    SCHEDULE_OPTS,
  );
}

export function useNextRace() {
  return useSWR("next-race", jolpica.getNextRace, SCHEDULE_OPTS);
}

export function useLastRace() {
  return useSWR("last-race", jolpica.getLastRace, RACE_OPTS);
}

export function useRaceResults(
  year: number | "current",
  round: number | "last",
) {
  return useSWR(
    `results-${year}-${round}`,
    () => jolpica.getRaceResults(year, round),
    RACE_OPTS,
  );
}

export function useQualifyingResults(
  year: number | "current",
  round: number | "last",
) {
  return useSWR(
    `qualifying-${year}-${round}`,
    () => jolpica.getQualifyingResults(year, round),
    RACE_OPTS,
  );
}

export function useDriverStandings(year: number | "current" = "current") {
  return useSWR(
    `driver-standings-${year}`,
    () => jolpica.getDriverStandings(year),
    STANDINGS_OPTS,
  );
}

export function useConstructorStandings(year: number | "current" = "current") {
  return useSWR(
    `constructor-standings-${year}`,
    () => jolpica.getConstructorStandings(year),
    STANDINGS_OPTS,
  );
}

export function useAllDrivers(year: number | "current" = "current") {
  return useSWR(
    `drivers-${year}`,
    () => jolpica.getAllDrivers(year),
    STANDINGS_OPTS,
  );
}

export function useDriverProfile(driverId: string) {
  return useSWR(
    `driver-profile-${driverId}`,
    () => jolpica.getDriverProfile(driverId),
    STANDINGS_OPTS,
  );
}

export function useDriverSeasonResults(
  driverId: string,
  year: number | "current" = "current",
) {
  return useSWR(
    `driver-season-${driverId}-${year}`,
    () => jolpica.getDriverSeasonResults(driverId, year),
    RACE_OPTS,
  );
}

export function useAvailableSeasons() {
  return useSWR("seasons", jolpica.getAvailableSeasons, {
    revalidateOnFocus: false,
    dedupingInterval: 3_600_000, // 1 hour — seasons don't change often
  });
}

export function useDriverSeasons(driverId: string) {
  return useSWR(
    driverId ? `driver-seasons-${driverId}` : null,
    () => jolpica.getDriverSeasons(driverId),
    { revalidateOnFocus: false, dedupingInterval: 3_600_000 },
  );
}
