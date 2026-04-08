import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  useDriverProfile,
  useDriverSeasonResults,
  useDriverStandings,
  useDriverSeasons,
} from "@/hooks/useJolpica";
import { PageHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  formatRaceDate,
  getTeamColor,
  getNationalityFlag,
  getPodiumColor,
  cn,
} from "@/utils";

const CURRENT_YEAR = new Date().getFullYear();

export default function DriverProfilePage() {
  const { driverId } = useParams<{ driverId: string }>();
  const [searchParams] = useSearchParams();

  // chartYear is null until user picks one — we resolve to URL param or driver's latest season
  const urlYear = parseInt(searchParams.get("year") ?? "0") || null;
  const [chartYear, setChartYear] = useState<number | null>(urlYear);

  const {
    data: driver,
    error: driverError,
    isLoading: driverLoading,
  } = useDriverProfile(driverId ?? "");
  const { data: seasons } = useDriverSeasons(driverId ?? "");

  // Use explicit selection > URL param > driver's most recent season > current year
  const activeYear = chartYear ?? seasons?.[0] ?? CURRENT_YEAR;

  const { data: results, isLoading: resultsLoading } = useDriverSeasonResults(
    driverId ?? "",
    activeYear,
  );
  const { data: standings } = useDriverStandings(activeYear);

  const standing = standings?.find((s) => s.Driver.driverId === driverId);
  const teamId = standing?.Constructors[0]?.constructorId ?? "";
  const teamColor = getTeamColor(teamId);

  // Build chart data from race results (position over rounds)
  const chartData =
    results
      ?.filter((r) => r.Results?.[0]?.positionText !== "R")
      .map((r) => ({
        round: `R${r.round}`,
        name: r.raceName.replace(" Grand Prix", ""),
        position: parseInt(r.Results?.[0]?.position ?? "20"),
        points: parseFloat(r.Results?.[0]?.points ?? "0"),
      })) ?? [];

  // Career stats from current season results
  const wins =
    results?.filter((r) => r.Results?.[0]?.position === "1").length ?? 0;
  const podiums =
    results?.filter((r) => {
      const pos = parseInt(r.Results?.[0]?.position ?? "99");
      return pos <= 3;
    }).length ?? 0;
  const dnfs =
    results?.filter(
      (r) =>
        r.Results?.[0]?.status !== "Finished" &&
        !r.Results?.[0]?.status?.startsWith("+"),
    ).length ?? 0;
  const totalPoints =
    results?.reduce(
      (sum, r) => sum + parseFloat(r.Results?.[0]?.points ?? "0"),
      0,
    ) ?? 0;

  if (driverLoading) return <ProfileSkeleton />;
  if (driverError || !driver)
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorState message="Couldn't load driver profile." />
      </div>
    );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${driver.givenName} ${driver.familyName}`}
        subtitle={
          standing
            ? `${standing.Constructors[0]?.name} · ${activeYear} Championship P${standing.position}`
            : driver.nationality
        }
        badge={
          <div className="flex items-center gap-2">
            <Link
              to="/drivers"
              className="text-f1-gray-4 hover:text-white text-xs transition-colors"
            >
              ← Drivers
            </Link>
            {driver.code && (
              <>
                <span className="text-f1-gray-2">·</span>
                <span className="font-mono text-f1-gray-4 text-xs tracking-widest">
                  {driver.code}
                </span>
              </>
            )}
            {driver.permanentNumber && (
              <>
                <span className="text-f1-gray-2">·</span>
                <span className="font-mono text-f1-gray-4 text-xs">
                  #{driver.permanentNumber}
                </span>
              </>
            )}
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Driver bio + season stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity card */}
          <div className="f1-card overflow-hidden">
            <div className="h-[3px]" style={{ backgroundColor: teamColor }} />
            <div className="p-6">
              {/* Large number */}
              {driver.permanentNumber && (
                <div
                  className="font-display text-8xl font-bold leading-none mb-4 opacity-10"
                  style={{ color: teamColor }}
                >
                  {driver.permanentNumber}
                </div>
              )}
              <p className="font-display text-3xl font-bold text-white uppercase leading-tight">
                {driver.givenName}
              </p>
              <p
                className="font-display text-4xl font-bold uppercase leading-tight"
                style={{ color: teamColor }}
              >
                {driver.familyName}
              </p>
              <div className="mt-4 space-y-2">
                <InfoRow
                  label="Nationality"
                  value={`${getNationalityFlag(driver.nationality)} ${driver.nationality}`}
                />
                <InfoRow
                  label="Date of birth"
                  value={formatRaceDate(driver.dateOfBirth)}
                />
                {standing && (
                  <InfoRow
                    label="Team"
                    value={standing.Constructors[0]?.name ?? "—"}
                  />
                )}
                {standing && (
                  <InfoRow
                    label="Championship"
                    value={`P${standing.position} · ${standing.points} pts`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Season stats */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                label: "Points",
                value: totalPoints.toString(),
                sub: `${activeYear} season`,
              },
              {
                label: "Wins",
                value: wins.toString(),
                sub: `${activeYear} season`,
              },
              {
                label: "Podiums",
                value: podiums.toString(),
                sub: `${activeYear} season`,
              },
              {
                label: "DNFs",
                value: dnfs.toString(),
                sub: `${activeYear} season`,
              },
            ].map(({ label, value, sub }) => (
              <div key={label} className="f1-card p-5">
                <p className="text-f1-gray-3 text-xs uppercase tracking-widest font-semibold mb-2">
                  {label}
                </p>
                <p className="font-display text-4xl font-bold text-white">
                  {value}
                </p>
                <p className="text-f1-gray-3 text-xs mt-1">{sub}</p>
              </div>
            ))}

            {/* Championship position bar */}
            {standing && (
              <div className="f1-card p-5 col-span-2 sm:col-span-4 lg:col-span-2 xl:col-span-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-f1-gray-3 text-xs uppercase tracking-widest font-semibold">
                    Championship gap to leader
                  </p>
                  <span className="font-mono text-sm text-f1-gray-4">
                    P{standing.position}
                  </span>
                </div>
                {(() => {
                  const leaderPts = parseFloat(standings?.[0]?.points ?? "0");
                  const driverPts = parseFloat(standing.points);
                  const pct =
                    leaderPts > 0 ? (driverPts / leaderPts) * 100 : 100;
                  const gap = leaderPts - driverPts;
                  return (
                    <>
                      <div className="w-full bg-f1-gray rounded-full h-2 mb-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: teamColor,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs font-mono text-f1-gray-3">
                        <span>{standing.points} pts</span>
                        {gap > 0 && <span>-{gap} pts to leader</span>}
                        {gap === 0 && (
                          <span className="text-yellow-400">
                            Championship leader
                          </span>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Season position chart */}
        <div className="f1-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="section-heading text-xl f1-accent-bar">
                Race Results
              </h3>
              <p className="text-f1-gray-4 text-sm mt-1">
                Finishing position by round
              </p>
            </div>
            {/* Year selector for chart */}
            <div className="flex flex-wrap items-center gap-2">
              {(seasons ?? []).slice(0, 8).map((y) => (
                <button
                  key={y}
                  onClick={() => setChartYear(y)}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-mono font-semibold transition-all",
                    activeYear === y
                      ? "bg-f1-red text-white"
                      : "bg-f1-gray/40 text-f1-gray-4 hover:text-white hover:bg-f1-gray",
                  )}
                >
                  {y}
                </button>
              ))}
              {(seasons ?? []).length > 8 && (
                <select
                  value={
                    (seasons ?? []).slice(0, 8).includes(activeYear)
                      ? ""
                      : activeYear
                  }
                  onChange={(e) =>
                    e.target.value && setChartYear(parseInt(e.target.value))
                  }
                  className="bg-f1-gray/40 text-f1-gray-4 border border-f1-gray-2 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-f1-red"
                >
                  <option value="">Older...</option>
                  {(seasons ?? []).slice(8).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {resultsLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="posGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={teamColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={teamColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#2a2a2a"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="round"
                  tick={{ fill: "#555555", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  reversed
                  domain={[1, 20]}
                  ticks={[1, 5, 10, 15, 20]}
                  tick={{ fill: "#555555", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#f5f5f5",
                  }}
                  formatter={(value: number) => [`P${value}`, "Position"]}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.name ?? label
                  }
                />
                <Area
                  type="monotone"
                  dataKey="position"
                  stroke={teamColor}
                  strokeWidth={2}
                  fill="url(#posGradient)"
                  dot={{ fill: teamColor, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: teamColor }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-f1-gray-4 text-sm">
              No race data available for {activeYear}.
            </div>
          )}
        </div>

        {/* Race-by-race results table */}
        {results && results.length > 0 && (
          <div>
            <h3 className="section-heading text-xl mb-4 f1-accent-bar">
              {activeYear} Race Log
            </h3>
            <div className="f1-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-f1-gray">
                      <Th>Round</Th>
                      <Th>Race</Th>
                      <Th className="text-right">Grid</Th>
                      <Th className="text-right">Pos</Th>
                      <Th className="text-right hidden sm:table-cell">
                        Status
                      </Th>
                      <Th className="text-right">Pts</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((race) => {
                      const result = race.Results?.[0];
                      if (!result) return null;
                      const pos = parseInt(result.position);
                      const podiumColor =
                        pos <= 3 ? getPodiumColor(pos) : undefined;

                      return (
                        <tr key={race.round} className="f1-table-row group">
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-f1-gray-3">
                              R{race.round}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to={`/races/${race.season}/${race.round}`}
                              className="text-white hover:text-f1-red transition-colors font-medium"
                            >
                              {race.raceName.replace(" Grand Prix", " GP")}
                            </Link>
                            <p className="text-f1-gray-3 text-xs">
                              {formatRaceDate(race.date)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-f1-gray-4 text-sm">
                            {result.grid === "0" ? "PL" : result.grid}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className="font-mono font-bold text-sm"
                              style={{ color: podiumColor ?? "#888888" }}
                            >
                              {result.positionText === "R"
                                ? "DNF"
                                : `P${result.position}`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
                            <StatusBadge status={result.status} />
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-white text-sm">
                            {result.points !== "0" ? (
                              result.points
                            ) : (
                              <span className="text-f1-gray-3 font-normal">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-f1-gray/50 last:border-0">
      <span className="text-f1-gray-3 text-xs uppercase tracking-wider font-semibold">
        {label}
      </span>
      <span className="text-f1-white-2 text-sm text-right">{value}</span>
    </div>
  );
}

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

function ProfileSkeleton() {
  return (
    <div>
      <div className="border-b border-f1-gray bg-f1-black-2 px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        </div>
        <Skeleton className="h-72 rounded-lg" />
        <SkeletonTable rows={10} />
      </div>
    </div>
  );
}
