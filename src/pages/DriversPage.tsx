import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAllDrivers, useDriverStandings, useAvailableSeasons } from '@/hooks/useJolpica'
import { PageHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { getTeamColor, getNationalityFlag, cn } from '@/utils'
import type { Driver, DriverStanding } from '@/types'

const CURRENT_YEAR = new Date().getFullYear()

export default function DriversPage() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [search, setSearch] = useState('')

  const { data: drivers, error, isLoading } = useAllDrivers(selectedYear)
  const { data: standings } = useDriverStandings(selectedYear)
  const { data: seasons } = useAvailableSeasons()

  // Map standings by driverId for quick lookup
  const standingsMap = useMemo(() => {
    const map = new Map<string, DriverStanding>()
    standings?.forEach((s) => map.set(s.Driver.driverId, s))
    return map
  }, [standings])

  const filtered = useMemo(() => {
    if (!drivers) return []
    const q = search.toLowerCase()
    return drivers.filter(
      (d) =>
        (d.givenName ?? '').toLowerCase().includes(q) ||
        (d.familyName ?? '').toLowerCase().includes(q) ||
        (d.nationality ?? '').toLowerCase().includes(q) ||
        (d.code ?? '').toLowerCase().includes(q)
    )
  }, [drivers, search])

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Drivers"
        subtitle={`${selectedYear} season — ${drivers?.length ?? '—'} drivers`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Controls row: search + year selector */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search drivers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-f1-black-2 border border-f1-gray rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-f1-gray-3 focus:outline-none focus:border-f1-red transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-3 flex items-center text-f1-gray-3 hover:text-white transition-colors"
              >
                <XIcon />
              </button>
            )}
          </div>

          {/* Year selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-f1-gray-3 text-xs uppercase tracking-widest font-semibold flex-shrink-0">
              Season
            </span>
            {(seasons ?? []).slice(0, 8).map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={cn(
                  'px-3 py-1.5 rounded text-sm font-semibold font-mono transition-all duration-150',
                  selectedYear === year
                    ? 'bg-f1-red text-white'
                    : 'bg-f1-gray/40 text-f1-gray-4 hover:text-white hover:bg-f1-gray'
                )}
              >
                {year}
              </button>
            ))}
            {(seasons ?? []).length > 8 && (
              <select
                value={(seasons ?? []).slice(0, 8).includes(selectedYear) ? '' : selectedYear}
                onChange={(e) => e.target.value && setSelectedYear(parseInt(e.target.value))}
                className="bg-f1-gray/40 text-f1-gray-4 border border-f1-gray-2 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-f1-red"
              >
                <option value="">Older...</option>
                {(seasons ?? []).slice(8).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {error && <ErrorState message="Couldn't load drivers." />}

        {isLoading && <DriversGridSkeleton />}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-f1-gray-4 text-sm">
            No drivers found{search ? ` for "${search}"` : ''}.
          </div>
        )}

        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((driver) => (
              <DriverCard
                key={driver.driverId}
                driver={driver}
                standing={standingsMap.get(driver.driverId)}
                year={selectedYear}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Driver Card ──────────────────────────────────────────────────────────────

function DriverCard({
  driver,
  standing,
  year,
}: {
  driver: Driver
  standing?: DriverStanding
  year: number
}) {
  const teamId = standing?.Constructors[0]?.constructorId ?? ''
  const teamName = standing?.Constructors[0]?.name ?? 'Unknown team'
  const teamColor = getTeamColor(teamId)
  const pos = standing ? parseInt(standing.position) : null

  return (
    <Link
      to={`/drivers/${driver.driverId}?year=${year}`}
      className="f1-card group flex flex-col overflow-hidden hover:border-f1-gray-2 transition-all duration-200"
    >
      {/* Team color top bar */}
      <div className="h-[3px] w-full" style={{ backgroundColor: teamColor }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Position + number */}
        <div className="flex items-start justify-between mb-4">
          <div>
            {pos !== null ? (
              <span className={cn(
                'font-display text-4xl font-bold leading-none',
                pos === 1 ? 'text-yellow-400' :
                pos === 2 ? 'text-zinc-300' :
                pos === 3 ? 'text-orange-400' : 'text-f1-gray-2'
              )}>
                P{pos}
              </span>
            ) : (
              <span className="font-display text-4xl font-bold text-f1-gray-2 leading-none">—</span>
            )}
          </div>
          {driver.permanentNumber && (
            <span
              className="font-display text-3xl font-bold leading-none opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ color: teamColor }}
            >
              #{driver.permanentNumber}
            </span>
          )}
        </div>

        {/* Name */}
        <div className="flex-1">
          <p className="text-f1-gray-4 text-xs mb-0.5">
            {getNationalityFlag(driver.nationality)} {driver.nationality}
          </p>
          <p className="font-display font-bold text-white text-lg uppercase leading-tight">
            {driver.givenName}
          </p>
          <p
            className="font-display font-bold text-2xl uppercase leading-tight group-hover:opacity-90 transition-opacity"
            style={{ color: teamColor }}
          >
            {driver.familyName}
          </p>
          {driver.code && (
            <p className="font-mono text-xs text-f1-gray-3 mt-1 tracking-widest">{driver.code}</p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-f1-gray flex items-center justify-between">
          <span className="text-f1-gray-4 text-xs truncate">{teamName}</span>
          {standing && (
            <span className="font-mono text-sm font-bold text-white flex-shrink-0 ml-2">
              {standing.points} <span className="text-f1-gray-3 font-normal text-xs">pts</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DriversGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="f1-card overflow-hidden">
          <div className="h-[3px] skeleton" />
          <div className="p-5 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-9 w-12" />
              <Skeleton className="h-9 w-10" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-7 w-3/4" />
            </div>
            <div className="pt-4 border-t border-f1-gray flex justify-between">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-f1-gray-3">
      <path d="M10 6.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM13 13l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
