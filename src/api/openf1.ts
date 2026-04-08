import axios from "axios";
import type {
  OpenF1Session,
  OpenF1Position,
  OpenF1Driver,
  OpenF1Lap,
  OpenF1Pit,
  OpenF1Weather,
} from "@/types";

const BASE = "https://api.openf1.org/v1";

const client = axios.create({
  baseURL: BASE,
  timeout: 10000,
});

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function getLatestSession(): Promise<OpenF1Session | null> {
  const { data } = await client.get<OpenF1Session[]>("/sessions", {
    params: { session_key: "latest" },
  });
  return data[0] ?? null;
}

export async function getSessionsByYear(
  year: number,
): Promise<OpenF1Session[]> {
  const { data } = await client.get<OpenF1Session[]>("/sessions", {
    params: { year },
  });
  return data;
}

export async function getSession(
  sessionKey: number,
): Promise<OpenF1Session | null> {
  const { data } = await client.get<OpenF1Session[]>("/sessions", {
    params: { session_key: sessionKey },
  });
  return data[0] ?? null;
}

// ─── Positions (leaderboard) ──────────────────────────────────────────────────

export async function getLatestPositions(
  sessionKey: number | "latest" = "latest",
): Promise<OpenF1Position[]> {
  const { data } = await client.get<OpenF1Position[]>("/position", {
    params: { session_key: sessionKey },
  });
  // Return only the most recent position per driver
  const latestByDriver = new Map<number, OpenF1Position>();
  for (const pos of data) {
    const existing = latestByDriver.get(pos.driver_number);
    if (!existing || new Date(pos.date) > new Date(existing.date)) {
      latestByDriver.set(pos.driver_number, pos);
    }
  }
  return Array.from(latestByDriver.values()).sort(
    (a, b) => a.position - b.position,
  );
}

// ─── Drivers ─────────────────────────────────────────────────────────────────

export async function getSessionDrivers(
  sessionKey: number | "latest" = "latest",
): Promise<OpenF1Driver[]> {
  const { data } = await client.get<OpenF1Driver[]>("/drivers", {
    params: { session_key: sessionKey },
  });
  return data;
}

// ─── Laps ─────────────────────────────────────────────────────────────────────

export async function getDriverLaps(
  sessionKey: number,
  driverNumber: number,
): Promise<OpenF1Lap[]> {
  const { data } = await client.get<OpenF1Lap[]>("/laps", {
    params: { session_key: sessionKey, driver_number: driverNumber },
  });
  return data;
}

export async function getAllLaps(sessionKey: number): Promise<OpenF1Lap[]> {
  const { data } = await client.get<OpenF1Lap[]>("/laps", {
    params: { session_key: sessionKey },
  });
  return data;
}

// ─── Pit stops ────────────────────────────────────────────────────────────────

export async function getPitStops(sessionKey: number): Promise<OpenF1Pit[]> {
  const { data } = await client.get<OpenF1Pit[]>("/pit", {
    params: { session_key: sessionKey },
  });
  return data;
}

// ─── Weather ──────────────────────────────────────────────────────────────────

export async function getLatestWeather(
  sessionKey: number | "latest" = "latest",
): Promise<OpenF1Weather | null> {
  const { data } = await client.get<OpenF1Weather[]>("/weather", {
    params: { session_key: sessionKey },
  });
  return data[data.length - 1] ?? null;
}

// ─── Helper: format lap time from seconds ────────────────────────────────────

export function formatLapTime(seconds: number | null): string {
  if (seconds === null) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toFixed(3).padStart(6, "0")}`;
}
