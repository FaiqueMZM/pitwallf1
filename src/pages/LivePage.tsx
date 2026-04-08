import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useLatestSession,
  useLatestPositions,
  useSessionDrivers,
  useLatestWeather,
} from "@/hooks/useOpenF1";
import { useNextRace, useLastRace } from "@/hooks/useJolpica";
import { PageHeader } from "@/components/ui/SectionHeader";
import { Badge, LiveBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Countdown } from "@/components/ui/Countdown";
import TrackViewer from "@/components/TrackViewer";
import { findTrackByName } from "@/data/tracks";
import { formatRaceDate, formatRaceDateTime, cn } from "@/utils";
import type { OpenF1Driver } from "@/types";
import type { CarPosition } from "@/components/TrackMap2D";

// ─── Session state ────────────────────────────────────────────────────────────

function getSessionState(
  session: import("@/types").OpenF1Session | null | undefined,
): "live" | "finished" | "idle" {
  if (!session) return "idle";
  const now = new Date();
  const start = new Date(session.date_start);
  const end = new Date(session.date_end);
  if (session.status === "started" || (now >= start && now <= end))
    return "live";
  if (now > end || session.status === "finished") return "finished";
  return "idle";
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LivePage() {
  const {
    data: session,
    error: sessionError,
    isLoading: sessionLoading,
  } = useLatestSession();
  const sessionState = getSessionState(session);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Live"
        subtitle="Near-live session data via OpenF1 · ~30-60s delay"
        badge={
          sessionState === "live" ? (
            <LiveBadge />
          ) : (
            <Badge variant="gray">No active session</Badge>
          )
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {sessionError && (
          <ErrorState message="Couldn't connect to OpenF1. The service may be temporarily unavailable." />
        )}
        {sessionLoading && <LiveSkeleton />}

        {!sessionLoading && !sessionError && (
          <>
            {session && (
              <SessionBanner session={session} state={sessionState} />
            )}

            {/* Track map — always shown, with car positions when live */}
            <LiveTrackSection session={session} sessionState={sessionState} />

            {(sessionState === "live" || sessionState === "finished") &&
              session && (
                <LiveLeaderboard
                  sessionKey={session.session_key}
                  state={sessionState}
                />
              )}

            {sessionState === "idle" && <IdleState />}
          </>
        )}

        <div className="border border-f1-gray/50 rounded-lg p-4 bg-f1-black-2/50">
          <p className="text-f1-gray-3 text-xs leading-relaxed">
            <span className="text-f1-gray-4 font-semibold">Data source: </span>
            <a
              href="https://openf1.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-f1-red hover:underline"
            >
              OpenF1 API
            </a>{" "}
            — open-source, community-maintained. Data is delayed ~30-60 seconds
            from broadcast. Pitwall F1 is not affiliated with Formula 1 or the
            FIA.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Track section with live car positions ────────────────────────────────────

function LiveTrackSection({
  session,
  sessionState,
}: {
  session: import("@/types").OpenF1Session | null | undefined;
  sessionState: "live" | "finished" | "idle";
}) {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [selectedId] = useState<string | undefined>(undefined);

  // Match session to a track
  const matchedTrack = useMemo(() => {
    if (!session) return undefined;
    return findTrackByName(
      session.circuit_short_name ?? session.location ?? "",
    );
  }, [session?.circuit_short_name, session?.location]);

  const circuitId = matchedTrack?.id ?? selectedId;

  // Get live car positions
  const { data: positions } = useLatestPositions(
    session?.session_key ?? "latest",
  );
  const { data: drivers } = useSessionDrivers(session?.session_key ?? "latest");

  // Build car positions for the map
  const carPositions = useMemo((): CarPosition[] => {
    if (!positions || !drivers || sessionState === "idle") return [];
    const driverMap = new Map<number, OpenF1Driver>();
    drivers.forEach((d) => driverMap.set(d.driver_number, d));
    return positions
      .sort((a, b) => a.position - b.position)
      .slice(0, 20)
      .map((pos) => {
        const driver = driverMap.get(pos.driver_number);
        return {
          driverNumber: pos.driver_number,
          position: pos.position,
          nameAcronym: driver?.name_acronym ?? String(pos.driver_number),
          teamColour: driver?.team_colour ?? "888888",
          trackProgress: undefined, // will use position-based spacing for now
        };
      });
  }, [positions, drivers, sessionState]);

  return (
    <div className="f1-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="f1-accent-bar">
          <h2 className="section-heading text-xl">Track Map</h2>
          {matchedTrack && (
            <p className="text-f1-gray-4 text-xs mt-0.5">
              {matchedTrack.circuit}
            </p>
          )}
          {!matchedTrack && session && (
            <p className="text-f1-gray-3 text-xs mt-0.5">
              Select a circuit below
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {carPositions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-f1-red animate-pulse" />
              <span className="text-f1-gray-4 text-xs">
                {carPositions.length} cars
              </span>
            </div>
          )}
          <div className="flex rounded border border-f1-gray overflow-hidden">
            {(["2d", "3d"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors",
                  mode === m
                    ? "bg-f1-red text-white"
                    : "text-f1-gray-4 hover:text-white",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TrackViewer
        circuitId={circuitId}
        carPositions={carPositions}
        height={400}
        mode={mode}
        showSelector={!matchedTrack}
      />
    </div>
  );
}

// ─── Session banner ───────────────────────────────────────────────────────────

function SessionBanner({
  session,
  state,
}: {
  session: import("@/types").OpenF1Session;
  state: "live" | "finished" | "idle";
}) {
  const { data: weather } = useLatestWeather(session.session_key);

  return (
    <div
      className={cn(
        "rounded-lg border p-5 relative overflow-hidden",
        state === "live"
          ? "bg-f1-red/5 border-f1-red/30"
          : "bg-f1-black-2 border-f1-gray",
      )}
    >
      {state === "live" && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-f1-red" />
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {state === "live" && <LiveBadge />}
            {state === "finished" && <Badge variant="gray">Finished</Badge>}
            <span className="text-f1-gray-3 text-xs font-mono uppercase tracking-widest">
              {session.session_type}
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white uppercase tracking-wide">
            {session.location} · {session.country_name}
          </h2>
          <p className="text-f1-gray-4 text-sm mt-1">
            {session.circuit_short_name} · {session.session_name} ·{" "}
            {session.year}
          </p>
          <p className="text-f1-gray-3 text-xs mt-1 font-mono">
            {new Date(session.date_start).toLocaleString()} →{" "}
            {new Date(session.date_end).toLocaleString()}
          </p>
        </div>
        {weather && (
          <div className="flex flex-wrap gap-4">
            <WeatherStat label="Air" value={`${weather.air_temperature}°C`} />
            <WeatherStat
              label="Track"
              value={`${weather.track_temperature}°C`}
            />
            <WeatherStat label="Humidity" value={`${weather.humidity}%`} />
            <WeatherStat label="Wind" value={`${weather.wind_speed} m/s`} />
            <WeatherStat
              label="Rain"
              value={weather.rainfall > 0 ? "🌧 Yes" : "☀ No"}
              highlight={weather.rainfall > 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function WeatherStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-f1-gray-3 text-xs uppercase tracking-widest font-semibold mb-0.5">
        {label}
      </p>
      <p
        className={cn(
          "font-mono font-bold text-sm",
          highlight ? "text-blue-400" : "text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Live leaderboard ─────────────────────────────────────────────────────────

function LiveLeaderboard({
  sessionKey,
  state,
}: {
  sessionKey: number;
  state: "live" | "finished";
}) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { data: positions, isLoading: posLoading } =
    useLatestPositions(sessionKey);
  const { data: drivers, isLoading: driversLoading } =
    useSessionDrivers(sessionKey);

  useEffect(() => {
    if (positions) setLastUpdated(new Date());
  }, [positions]);

  const isLoading = posLoading || driversLoading;
  const driverMap = new Map<number, OpenF1Driver>();
  drivers?.forEach((d) => driverMap.set(d.driver_number, d));

  const leaderboard =
    positions
      ?.sort((a, b) => a.position - b.position)
      .map((pos) => ({ pos, driver: driverMap.get(pos.driver_number) }))
      .filter((row) => row.driver) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="f1-accent-bar">
          <h2 className="section-heading text-xl">
            {state === "live" ? "Live Leaderboard" : "Final Classification"}
          </h2>
          <p className="text-f1-gray-4 text-xs mt-0.5">
            {state === "live"
              ? "Updating every 10s · ~30-60s behind broadcast"
              : "Session complete"}
          </p>
        </div>
        {lastUpdated && (
          <div className="text-right">
            <p className="text-f1-gray-3 text-xs">Last updated</p>
            <p className="text-f1-gray-4 text-xs font-mono">
              {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 bg-f1-black-2 rounded-lg border border-f1-gray"
            >
              <Skeleton className="h-5 w-6 flex-shrink-0" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-24 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && leaderboard.length === 0 && (
        <div className="text-center py-16 text-f1-gray-4 text-sm">
          No position data available yet.
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="f1-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-f1-gray">
                  <Th className="w-10">Pos</Th>
                  <Th>Driver</Th>
                  <Th className="hidden sm:table-cell">Team</Th>
                  <Th className="text-right hidden md:table-cell">No.</Th>
                  <Th className="text-right">Last seen</Th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(({ pos, driver }) => {
                  if (!driver) return null;
                  const teamColor = driver.team_colour
                    ? `#${driver.team_colour}`
                    : "#888888";
                  return (
                    <tr
                      key={driver.driver_number}
                      className={cn(
                        "f1-table-row",
                        pos.position === 1 && "bg-yellow-400/5",
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "font-mono font-bold text-base",
                            pos.position === 1
                              ? "text-yellow-400"
                              : pos.position === 2
                                ? "text-zinc-300"
                                : pos.position === 3
                                  ? "text-orange-400"
                                  : "text-f1-gray-4",
                          )}
                        >
                          {pos.position}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-[3px] h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: teamColor }}
                          />
                          {driver.headshot_url ? (
                            <img
                              src={driver.headshot_url}
                              alt={driver.full_name}
                              className="w-8 h-8 rounded-full object-cover object-top bg-f1-gray flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-f1-gray flex-shrink-0 flex items-center justify-center">
                              <span className="text-f1-gray-3 text-xs font-mono font-bold">
                                {driver.name_acronym?.slice(0, 2)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-white font-semibold leading-tight">
                              {driver.full_name}
                            </p>
                            <p className="text-f1-gray-3 text-xs font-mono tracking-widest">
                              {driver.name_acronym}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-sm" style={{ color: teamColor }}>
                          {driver.team_name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        <span className="font-mono text-f1-gray-3 text-sm">
                          #{driver.driver_number}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-mono text-f1-gray-3 text-xs">
                          {new Date(pos.date).toLocaleTimeString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Idle state ───────────────────────────────────────────────────────────────

function IdleState() {
  const { data: nextRace, isLoading: nextLoading } = useNextRace();
  const { data: lastRace, isLoading: lastLoading } = useLastRace();

  return (
    <div className="space-y-8">
      <div className="f1-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="relative">
          <Badge variant="gray" className="mb-3">
            No session active
          </Badge>
          {nextLoading && <Skeleton className="h-8 w-1/2 mb-4" />}
          {nextRace && (
            <>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide mb-1">
                Next: {nextRace.raceName}
              </h2>
              <p className="text-f1-gray-4 text-sm mb-5">
                {nextRace.Circuit.circuitName} ·{" "}
                {nextRace.Circuit.Location.locality},{" "}
                {nextRace.Circuit.Location.country}
                {" · "}
                {formatRaceDateTime(nextRace.date, nextRace.time)}
              </p>
              <Countdown date={nextRace.date} time={nextRace.time} />
              <p className="text-f1-gray-3 text-xs mt-4">
                The Live page will automatically show session data when a
                session begins.
              </p>
            </>
          )}
        </div>
      </div>

      {(lastLoading || lastRace) && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading text-xl f1-accent-bar">
              Last Race Results
            </h2>
            {lastRace && (
              <Link
                to={`/races/${lastRace.season}/${lastRace.round}`}
                className="text-f1-red text-sm font-semibold hover:text-f1-red-light transition-colors"
              >
                Full results →
              </Link>
            )}
          </div>
          {lastLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((_, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 bg-f1-black-2 rounded-lg border border-f1-gray"
                >
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          )}
          {lastRace?.Results && (
            <div className="f1-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-f1-gray bg-f1-black-3">
                <p className="text-f1-gray-4 text-xs font-semibold">
                  {lastRace.raceName} · Round {lastRace.round} ·{" "}
                  {formatRaceDate(lastRace.date)}
                </p>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {lastRace.Results.slice(0, 10).map((result) => {
                    const pos = parseInt(result.position);
                    const podiumColors: Record<number, string> = {
                      1: "#FFD700",
                      2: "#C0C0C0",
                      3: "#CD7F32",
                    };
                    return (
                      <tr key={result.Driver.driverId} className="f1-table-row">
                        <td className="px-4 py-2.5 w-10">
                          <span
                            className="font-mono font-bold text-sm"
                            style={{ color: podiumColors[pos] ?? "#555555" }}
                          >
                            {pos}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-white font-semibold">
                          {result.Driver.givenName} {result.Driver.familyName}
                          <span className="text-f1-gray-3 text-xs ml-2 font-mono hidden sm:inline">
                            {result.Driver.code}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-f1-gray-4 hidden sm:table-cell">
                          {result.Constructor.name}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-f1-white-2 font-bold">
                          {result.Time?.time ?? result.status}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-f1-gray-4 text-xs">
                          {result.points} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "text-left text-f1-gray-3 text-xs uppercase tracking-widest font-semibold px-4 py-3",
        className,
      )}
    >
      {children}
    </th>
  );
}

function LiveSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-96 w-full rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Skeleton key={idx} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
