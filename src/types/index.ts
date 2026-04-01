// ─── Ergast / Jolpica types ───────────────────────────────────────────────────

export interface Driver {
  driverId: string
  permanentNumber?: string
  code?: string
  url: string
  givenName: string
  familyName: string
  dateOfBirth: string
  nationality: string
}

export interface Constructor {
  constructorId: string
  url: string
  name: string
  nationality: string
}

export interface Circuit {
  circuitId: string
  url: string
  circuitName: string
  Location: {
    lat: string
    long: string
    locality: string
    country: string
  }
}

export interface RaceResult {
  number: string
  position: string
  positionText: string
  points: string
  Driver: Driver
  Constructor: Constructor
  grid: string
  laps: string
  status: string
  Time?: { millis: string; time: string }
  FastestLap?: {
    rank: string
    lap: string
    Time: { time: string }
    AverageSpeed: { units: string; speed: string }
  }
}

export interface Race {
  season: string
  round: string
  url: string
  raceName: string
  Circuit: Circuit
  date: string
  time?: string
  Results?: RaceResult[]
  QualifyingResults?: QualifyingResult[]
}

export interface QualifyingResult {
  number: string
  position: string
  Driver: Driver
  Constructor: Constructor
  Q1?: string
  Q2?: string
  Q3?: string
}

export interface DriverStanding {
  position: string
  positionText: string
  points: string
  wins: string
  Driver: Driver
  Constructors: Constructor[]
}

export interface ConstructorStanding {
  position: string
  positionText: string
  points: string
  wins: string
  Constructor: Constructor
}

export interface LapTime {
  number: string
  Timings: { driverId: string; position: string; time: string }[]
}

// ─── OpenF1 types ─────────────────────────────────────────────────────────────

export interface OpenF1Session {
  session_key: number
  session_name: string
  session_type: string
  status: string
  date_start: string
  date_end: string
  gmt_offset: string
  location: string
  country_name: string
  circuit_short_name: string
  meeting_key: number
  year: number
}

export interface OpenF1Position {
  session_key: number
  meeting_key: number
  driver_number: number
  date: string
  position: number
}

export interface OpenF1Driver {
  session_key: number
  meeting_key: number
  driver_number: number
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string
  country_code: string
  headshot_url: string | null
}

export interface OpenF1Lap {
  session_key: number
  meeting_key: number
  driver_number: number
  lap_number: number
  lap_duration: number | null
  duration_sector_1: number | null
  duration_sector_2: number | null
  duration_sector_3: number | null
  i1_speed: number | null
  i2_speed: number | null
  st_speed: number | null
  is_pit_out_lap: boolean
  date_start: string
}

export interface OpenF1Pit {
  session_key: number
  meeting_key: number
  driver_number: number
  lap_number: number
  pit_duration: number | null
  date: string
}

export interface OpenF1Weather {
  session_key: number
  meeting_key: number
  date: string
  air_temperature: number
  track_temperature: number
  humidity: number
  pressure: number
  wind_speed: number
  wind_direction: number
  rainfall: number
}

// ─── App-level types ──────────────────────────────────────────────────────────

export interface LiveDriverState {
  driverNumber: number
  position: number
  nameAcronym: string
  fullName: string
  teamName: string
  teamColour: string
  headshotUrl: string | null
  lastLapTime: number | null
  gap: string | null
}

export type SeasonYear = number

export type StandingsTab = 'drivers' | 'constructors'

export type SessionType = 'Race' | 'Qualifying' | 'Sprint' | 'Practice 1' | 'Practice 2' | 'Practice 3'
