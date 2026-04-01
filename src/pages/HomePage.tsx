import { Link } from 'react-router-dom'
import { useNextRace, useLastRace, useDriverStandings, useConstructorStandings } from '@/hooks/useJolpica'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { TeamDot } from '@/components/ui/TeamBar'
import { Countdown } from '@/components/ui/Countdown'
import { ErrorState } from '@/components/ui/ErrorState'
import { formatRaceDateTime, getTeamColor, getNationalityFlag, getPodiumColor } from '@/utils'

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <LastRaceSection />
        <StandingsSnapshot />
      </div>
    </div>
  )
}

// ─── Hero: Next Race ──────────────────────────────────────────────────────────

function HeroSection() {
  const { data: race, error, isLoading } = useNextRace()

  return (
    <section className="relative bg-f1-black-2 border-b border-f1-gray overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      {/* Red glow bottom-left */}
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-f1-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <Badge variant="red" className="mb-4">Next Race</Badge>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <div className="flex gap-2 mt-6">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-14" />)}
            </div>
          </div>
        )}

        {error && <ErrorState message="Couldn't load next race info." />}

        {race && (
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-widest text-white leading-tight">
                {race.raceName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="text-f1-gray-4 text-sm">
                  🏟 {race.Circuit.circuitName}
                </span>
                <span className="text-f1-gray-2">·</span>
                <span className="text-f1-gray-4 text-sm">
                  📍 {race.Circuit.Location.locality}, {race.Circuit.Location.country}
                </span>
                <span className="text-f1-gray-2">·</span>
                <span className="text-f1-gray-4 text-sm">
                  🗓 {formatRaceDateTime(race.date, race.time)}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-f1-gray-3 text-xs uppercase tracking-widest font-semibold">
                  Round {race.round} · {race.season}
                </span>
              </div>

              <div className="mt-6">
                <p className="text-f1-gray-3 text-xs uppercase tracking-widest font-semibold mb-3">
                  Countdown
                </p>
                <Countdown date={race.date} time={race.time} />
              </div>
            </div>

            <div className="flex gap-3">
              <Link to={`/races/${race.season}/${race.round}`} className="btn-f1">
                Race Info
              </Link>
              <Link to="/races" className="btn-ghost">
                Full Calendar
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Last Race Results ────────────────────────────────────────────────────────

function LastRaceSection() {
  const { data: race, error, isLoading } = useLastRace()

  return (
    <section>
      <SectionHeader
        title="Last Race"
        subtitle={race ? `${race.raceName} · Round ${race.round}` : undefined}
        action={
          <Link to="/races" className="text-f1-red text-sm font-semibold hover:text-f1-red-light transition-colors">
            All races →
          </Link>
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {error && <ErrorState message="Couldn't load last race results." />}

      {race?.Results && (
        <>
          {/* Podium cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {race.Results.slice(0, 3).map((result) => {
              const podiumColor = getPodiumColor(result.position)
              const teamColor = getTeamColor(result.Constructor.constructorId)
              return (
                <div
                  key={result.Driver.driverId}
                  className="f1-card p-5 relative overflow-hidden"
                >
                  {/* Position glow */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: podiumColor }}
                  />
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className="font-display text-5xl font-bold"
                      style={{ color: podiumColor, opacity: 0.9 }}
                    >
                      {result.position}
                    </span>
                    <TeamDot constructorId={result.Constructor.constructorId} size={10} />
                  </div>
                  <div>
                    <p className="text-f1-gray-4 text-xs uppercase tracking-widest mb-0.5">
                      {getNationalityFlag(result.Driver.nationality)} {result.Driver.nationality}
                    </p>
                    <p className="font-display text-lg font-bold text-white uppercase tracking-wide leading-tight">
                      {result.Driver.givenName}
                    </p>
                    <p className="font-display text-2xl font-bold uppercase tracking-widest leading-tight"
                      style={{ color: teamColor }}>
                      {result.Driver.familyName}
                    </p>
                    <p className="text-f1-gray-4 text-xs mt-2">{result.Constructor.name}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-f1-gray flex items-center justify-between">
                    <span className="text-f1-white-2 font-mono text-sm font-semibold">
                      {result.Time?.time ?? result.status}
                    </span>
                    <span className="text-f1-gray-4 text-xs">{result.points} pts</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Rest of results table */}
          <div className="f1-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-f1-gray">
                  <th className="text-left text-f1-gray-3 text-xs uppercase tracking-widest font-semibold px-4 py-3 w-10">Pos</th>
                  <th className="text-left text-f1-gray-3 text-xs uppercase tracking-widest font-semibold px-4 py-3">Driver</th>
                  <th className="text-left text-f1-gray-3 text-xs uppercase tracking-widest font-semibold px-4 py-3 hidden sm:table-cell">Team</th>
                  <th className="text-right text-f1-gray-3 text-xs uppercase tracking-widest font-semibold px-4 py-3 hidden md:table-cell">Laps</th>
                  <th className="text-right text-f1-gray-3 text-xs uppercase tracking-widest font-semibold px-4 py-3">Status</th>
                  <th className="text-right text-f1-gray-3 text-xs uppercase tracking-widest font-semibold px-4 py-3">Pts</th>
                </tr>
              </thead>
              <tbody>
                {race.Results.slice(3).map((result) => (
                  <tr key={result.Driver.driverId} className="f1-table-row">
                    <td className="px-4 py-3">
                      <span className="text-f1-gray-4 font-mono text-sm">{result.position}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TeamDot constructorId={result.Constructor.constructorId} size={8} />
                        <div>
                          <span className="text-white font-semibold">
                            {result.Driver.givenName} {result.Driver.familyName}
                          </span>
                          {result.Driver.code && (
                            <span className="text-f1-gray-3 text-xs ml-2 font-mono">{result.Driver.code}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-f1-gray-4">
                      {result.Constructor.name}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-right text-f1-gray-4 font-mono">
                      {result.laps}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status={result.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-f1-white-2">
                      {result.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

// ─── Standings Snapshot ───────────────────────────────────────────────────────

function StandingsSnapshot() {
  const { data: driverStandings, isLoading: loadingDrivers } = useDriverStandings('current')
  const { data: constructorStandings, isLoading: loadingConstructors } = useConstructorStandings('current')

  return (
    <section>
      <SectionHeader
        title="Standings"
        subtitle={`${new Date().getFullYear()} season`}
        action={
          <Link to="/standings" className="text-f1-red text-sm font-semibold hover:text-f1-red-light transition-colors">
            Full standings →
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver standings */}
        <div className="f1-card overflow-hidden">
          <div className="px-4 py-3 border-b border-f1-gray">
            <h3 className="text-xs font-bold uppercase tracking-widest text-f1-gray-4">Drivers</h3>
          </div>

          {loadingDrivers ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-5" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div>
              {driverStandings?.slice(0, 10).map((standing) => {
                const teamColor = getTeamColor(standing.Constructors[0]?.constructorId ?? '')
                const pos = parseInt(standing.position)
                return (
                  <Link
                    key={standing.Driver.driverId}
                    to={`/drivers/${standing.Driver.driverId}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-f1-black-3 border-b border-f1-gray/50 transition-colors last:border-0"
                  >
                    {/* Left team color bar */}
                    <div className="w-[3px] h-7 rounded-full flex-shrink-0" style={{ backgroundColor: teamColor }} />

                    <span className="font-mono text-sm w-5 text-center text-f1-gray-4 flex-shrink-0">{pos}</span>

                    {pos <= 3 && (
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getPodiumColor(pos) }} />
                    )}

                    <div className="flex-1 min-w-0">
                      <span className="text-white font-semibold text-sm truncate block">
                        {standing.Driver.givenName} {standing.Driver.familyName}
                      </span>
                      <span className="text-f1-gray-3 text-xs">{standing.Constructors[0]?.name}</span>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-mono font-bold text-white text-sm">{standing.points}</span>
                      <span className="text-f1-gray-3 text-xs ml-1">pts</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Constructor standings */}
        <div className="f1-card overflow-hidden">
          <div className="px-4 py-3 border-b border-f1-gray">
            <h3 className="text-xs font-bold uppercase tracking-widest text-f1-gray-4">Constructors</h3>
          </div>

          {loadingConstructors ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-5" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div>
              {constructorStandings?.slice(0, 10).map((standing) => {
                const teamColor = getTeamColor(standing.Constructor.constructorId)
                const pos = parseInt(standing.position)
                return (
                  <div
                    key={standing.Constructor.constructorId}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-f1-gray/50 last:border-0"
                  >
                    <div className="w-[3px] h-7 rounded-full flex-shrink-0" style={{ backgroundColor: teamColor }} />
                    <span className="font-mono text-sm w-5 text-center text-f1-gray-4 flex-shrink-0">{pos}</span>

                    {pos <= 3 && (
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getPodiumColor(pos) }} />
                    )}

                    <div className="flex-1 min-w-0">
                      <span className="text-white font-semibold text-sm">{standing.Constructor.name}</span>
                      <span className="text-f1-gray-3 text-xs block">{standing.Constructor.nationality}</span>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-end gap-1">
                        <span className="font-mono font-bold text-white text-sm">{standing.points}</span>
                        <span className="text-f1-gray-3 text-xs">pts</span>
                      </div>
                      <span className="text-f1-gray-3 text-xs">{standing.wins} wins</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
