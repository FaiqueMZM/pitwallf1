import { useParams, useNavigate } from 'react-router-dom'
import { useDriverStandings, useConstructorStandings, useAvailableSeasons } from '@/hooks/useJolpica'
import { PageHeader } from '@/components/ui/SectionHeader'

import { TeamDot } from '@/components/ui/TeamBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { getTeamColor, getNationalityFlag, getPodiumColor, cn } from '@/utils'
import { useAppStore } from '@/store'
import type { DriverStanding, ConstructorStanding } from '@/types'

export default function StandingsPage() {
  const { year } = useParams<{ year?: string }>()
  const navigate = useNavigate()
  const { standingsTab, setStandingsTab, selectedYear, setSelectedYear } = useAppStore()

  const resolvedYear = year ? parseInt(year) : selectedYear

  const { data: driverStandings, error: driverError, isLoading: driverLoading } =
    useDriverStandings(resolvedYear)
  const { data: constructorStandings, error: constructorError, isLoading: constructorLoading } =
    useConstructorStandings(resolvedYear)
  const { data: seasons } = useAvailableSeasons()

  const leader = driverStandings?.[0]
  const constructorLeader = constructorStandings?.[0]

  function handleYearChange(y: number) {
    setSelectedYear(y)
    navigate(`/standings/${y}`)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Standings"
        subtitle={`${resolvedYear} Formula 1 World Championship`}
        meta={
          <div className="flex flex-wrap items-center gap-3">
            {leader && (
              <span className="text-f1-gray-4 text-sm">
                Drivers leader:{' '}
                <span className="text-white font-semibold">
                  {leader.Driver.givenName} {leader.Driver.familyName}
                </span>
                <span className="text-f1-red font-mono ml-2">{leader.points} pts</span>
              </span>
            )}
            {constructorLeader && (
              <span className="text-f1-gray-4 text-sm hidden sm:inline">
                · Constructors:{' '}
                <span className="text-white font-semibold">{constructorLeader.Constructor.name}</span>
                <span className="text-f1-red font-mono ml-2">{constructorLeader.points} pts</span>
              </span>
            )}
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Season selector */}
        <div className="mb-8">
          <SeasonSelector
            selectedYear={resolvedYear}
            seasons={seasons ?? []}
            onChange={handleYearChange}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-f1-gray">
          {(['drivers', 'constructors'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStandingsTab(tab)}
              className={cn(
                'px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors relative',
                standingsTab === tab ? 'text-white' : 'text-f1-gray-4 hover:text-white'
              )}
            >
              {tab === 'drivers' ? 'Drivers' : 'Constructors'}
              {standingsTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-f1-red rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Drivers tab */}
        {standingsTab === 'drivers' && (
          <>
            {driverLoading && <StandingsSkeleton />}
            {driverError && <ErrorState message="Couldn't load driver standings." />}
            {driverStandings && driverStandings.length > 0 && (
              <DriverStandingsView standings={driverStandings} />
            )}
          </>
        )}

        {/* Constructors tab */}
        {standingsTab === 'constructors' && (
          <>
            {constructorLoading && <StandingsSkeleton />}
            {constructorError && <ErrorState message="Couldn't load constructor standings." />}
            {constructorStandings && constructorStandings.length > 0 && (
              <ConstructorStandingsView standings={constructorStandings} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Driver Standings ─────────────────────────────────────────────────────────

function DriverStandingsView({ standings }: { standings: DriverStanding[] }) {
  const leader = standings[0]
  const leaderPoints = parseFloat(leader.points)

  return (
    <div className="space-y-6">
      {/* Top 3 hero cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {standings.slice(0, 3).map((standing) => {
          const pos = parseInt(standing.position)
          const podiumColor = getPodiumColor(pos)
          const teamColor = getTeamColor(standing.Constructors[0]?.constructorId ?? '')
          const gap = leaderPoints - parseFloat(standing.points)

          return (
            <div key={standing.Driver.driverId} className="f1-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: podiumColor }} />
              <div className="flex items-start justify-between mb-4">
                <span className="font-display text-5xl font-bold" style={{ color: podiumColor, opacity: 0.85 }}>
                  {pos}
                </span>
                <div className="text-right">
                  <p className="font-mono font-bold text-white text-xl">{standing.points}</p>
                  <p className="text-f1-gray-3 text-xs">points</p>
                </div>
              </div>
              <p className="text-f1-gray-4 text-xs mb-0.5">
                {getNationalityFlag(standing.Driver.nationality)} {standing.Driver.nationality}
              </p>
              <p className="font-display text-lg font-bold text-white uppercase leading-tight">
                {standing.Driver.givenName}
              </p>
              <p className="font-display text-2xl font-bold uppercase leading-tight" style={{ color: teamColor }}>
                {standing.Driver.familyName}
              </p>
              <p className="text-f1-gray-4 text-xs mt-1">{standing.Constructors[0]?.name}</p>
              <div className="mt-4 pt-4 border-t border-f1-gray flex items-center justify-between">
                <span className="text-f1-gray-3 text-xs">{standing.wins} wins</span>
                {gap > 0 && (
                  <span className="text-f1-gray-3 text-xs font-mono">-{gap} pts</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Full table */}
      <div className="f1-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-f1-gray">
                <Th className="w-10">Pos</Th>
                <Th>Driver</Th>
                <Th className="hidden sm:table-cell">Team</Th>
                <Th className="text-right hidden md:table-cell">Wins</Th>
                <Th className="text-right">Gap</Th>
                <Th className="text-right">Points</Th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => {
                const pos = parseInt(standing.position)
                const teamColor = getTeamColor(standing.Constructors[0]?.constructorId ?? '')
                const gap = leaderPoints - parseFloat(standing.points)
                const pct = (parseFloat(standing.points) / leaderPoints) * 100

                return (
                  <tr key={standing.Driver.driverId} className="f1-table-row group">
                    <td className="px-4 py-3">
                      <span className={cn(
                        'font-mono text-sm font-bold',
                        pos === 1 ? 'text-yellow-400' :
                        pos === 2 ? 'text-zinc-300' :
                        pos === 3 ? 'text-orange-400' : 'text-f1-gray-4'
                      )}>
                        {pos}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-[3px] h-6 rounded-full flex-shrink-0" style={{ backgroundColor: teamColor }} />
                        <div>
                          <p className="text-white font-semibold">
                            {standing.Driver.givenName} {standing.Driver.familyName}
                            {standing.Driver.code && (
                              <span className="text-f1-gray-3 text-xs font-mono ml-2 hidden sm:inline">
                                {standing.Driver.code}
                              </span>
                            )}
                          </p>
                          <p className="text-f1-gray-3 text-xs">
                            {getNationalityFlag(standing.Driver.nationality)} #{standing.Driver.permanentNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <TeamDot constructorId={standing.Constructors[0]?.constructorId ?? ''} size={8} />
                        <span className="text-f1-gray-4">{standing.Constructors[0]?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-f1-gray-4 hidden md:table-cell">
                      {standing.wins}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-f1-gray-3 text-xs">
                      {gap > 0 ? `-${gap}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* Points bar */}
                        <div className="hidden lg:flex items-center w-24">
                          <div className="w-full bg-f1-gray rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-f1-red transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-mono font-bold text-white">{standing.points}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Constructor Standings ────────────────────────────────────────────────────

function ConstructorStandingsView({ standings }: { standings: ConstructorStanding[] }) {
  const leaderPoints = parseFloat(standings[0].points)

  return (
    <div className="space-y-6">
      {/* Top 3 hero cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {standings.slice(0, 3).map((standing) => {
          const pos = parseInt(standing.position)
          const podiumColor = getPodiumColor(pos)
          const teamColor = getTeamColor(standing.Constructor.constructorId)

          return (
            <div key={standing.Constructor.constructorId} className="f1-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: podiumColor }} />
              {/* Team color left bar */}
              <div className="absolute top-0 left-0 bottom-0 w-[3px]" style={{ backgroundColor: teamColor }} />
              <div className="flex items-start justify-between mb-4 pl-2">
                <span className="font-display text-5xl font-bold" style={{ color: podiumColor, opacity: 0.85 }}>
                  {pos}
                </span>
                <div className="text-right">
                  <p className="font-mono font-bold text-white text-xl">{standing.points}</p>
                  <p className="text-f1-gray-3 text-xs">points</p>
                </div>
              </div>
              <div className="pl-2">
                <p className="font-display text-2xl font-bold uppercase leading-tight" style={{ color: teamColor }}>
                  {standing.Constructor.name}
                </p>
                <p className="text-f1-gray-4 text-xs mt-1">{standing.Constructor.nationality}</p>
                <div className="mt-4 pt-4 border-t border-f1-gray flex items-center justify-between">
                  <span className="text-f1-gray-3 text-xs">{standing.wins} wins</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Full table */}
      <div className="f1-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-f1-gray">
                <Th className="w-10">Pos</Th>
                <Th>Constructor</Th>
                <Th className="hidden sm:table-cell">Nationality</Th>
                <Th className="text-right hidden md:table-cell">Wins</Th>
                <Th className="text-right">Gap</Th>
                <Th className="text-right">Points</Th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => {
                const pos = parseInt(standing.position)
                const teamColor = getTeamColor(standing.Constructor.constructorId)
                const gap = leaderPoints - parseFloat(standing.points)
                const pct = (parseFloat(standing.points) / leaderPoints) * 100

                return (
                  <tr key={standing.Constructor.constructorId} className="f1-table-row">
                    <td className="px-4 py-3">
                      <span className={cn(
                        'font-mono text-sm font-bold',
                        pos === 1 ? 'text-yellow-400' :
                        pos === 2 ? 'text-zinc-300' :
                        pos === 3 ? 'text-orange-400' : 'text-f1-gray-4'
                      )}>
                        {pos}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-[3px] h-6 rounded-full flex-shrink-0" style={{ backgroundColor: teamColor }} />
                        <span className="text-white font-semibold">{standing.Constructor.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-f1-gray-4">
                      {standing.Constructor.nationality}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-f1-gray-4 hidden md:table-cell">
                      {standing.wins}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-f1-gray-3 text-xs">
                      {gap > 0 ? `-${gap}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="hidden lg:flex items-center w-24">
                          <div className="w-full bg-f1-gray rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: teamColor }}
                            />
                          </div>
                        </div>
                        <span className="font-mono font-bold text-white">{standing.points}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Season Selector ──────────────────────────────────────────────────────────

function SeasonSelector({
  selectedYear,
  seasons,
  onChange,
}: {
  selectedYear: number
  seasons: number[]
  onChange: (year: number) => void
}) {
  const recentYears = seasons.slice(0, 8)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-f1-gray-3 text-xs uppercase tracking-widest font-semibold mr-1">Season</span>
      {recentYears.map((year) => (
        <button
          key={year}
          onClick={() => onChange(year)}
          className={cn(
            'px-3 py-1 rounded text-sm font-semibold font-mono transition-all duration-150',
            selectedYear === year
              ? 'bg-f1-red text-white'
              : 'bg-f1-gray/40 text-f1-gray-4 hover:text-white hover:bg-f1-gray'
          )}
        >
          {year}
        </button>
      ))}
      {seasons.length > 8 && (
        <select
          value={recentYears.includes(selectedYear) ? '' : selectedYear}
          onChange={(e) => e.target.value && onChange(parseInt(e.target.value))}
          className="bg-f1-gray/40 text-f1-gray-4 border border-f1-gray-2 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-f1-red"
        >
          <option value="">Older...</option>
          {seasons.slice(8).map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StandingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="f1-card p-5 space-y-3">
            <Skeleton className="h-10 w-12" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
      <div className="f1-card p-4 space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-6 flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn(
      'text-left text-f1-gray-3 text-xs uppercase tracking-widest font-semibold px-4 py-3',
      className
    )}>
      {children}
    </th>
  )
}
