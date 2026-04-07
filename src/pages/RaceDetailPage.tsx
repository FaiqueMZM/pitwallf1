import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useRaceResults, useQualifyingResults } from '@/hooks/useJolpica'
import { PageHeader } from '@/components/ui/SectionHeader'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { TeamDot } from '@/components/ui/TeamBar'
import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { formatRaceDate, getTeamColor, getNationalityFlag, getPodiumColor, cn } from '@/utils'
import TrackViewer from '@/components/TrackViewer'
import type { RaceResult, QualifyingResult } from '@/types'

type Tab = 'race' | 'qualifying'

export default function RaceDetailPage() {
  const { year, round } = useParams<{ year: string; round: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('race')

  const parsedYear = year ? parseInt(year) : 'current'
  const parsedRound = round ? parseInt(round) : 'last'

  const { data: raceData, error: raceError, isLoading: raceLoading } = useRaceResults(parsedYear, parsedRound)
  const { data: qualifyingData, error: qualError, isLoading: qualLoading } = useQualifyingResults(parsedYear, parsedRound)

  const race = raceData ?? qualifyingData
  const results = raceData?.Results ?? []
  const qualResults = qualifyingData?.QualifyingResults ?? []

  return (
    <div className="animate-fade-in">
      {raceLoading && !race ? (
        <div className="border-b border-f1-gray bg-f1-black-2 px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ) : (
        <PageHeader
          title={race?.raceName ?? `Round ${round}`}
          subtitle={race ? `${race.Circuit.circuitName} · ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}` : ''}
          badge={
            <div className="flex items-center gap-2">
              <Link to="/races" className="text-f1-gray-4 hover:text-white text-xs transition-colors">
                ← Calendar
              </Link>
              <span className="text-f1-gray-2">·</span>
              <Badge variant="gray">Round {round} · {year}</Badge>
              {race?.date && (
                <>
                  <span className="text-f1-gray-2">·</span>
                  <span className="text-f1-gray-4 text-xs">{formatRaceDate(race.date)}</span>
                </>
              )}
            </div>
          }
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Podium */}
        {results.length > 0 && <Podium results={results.slice(0, 3)} />}

        {/* Circuit map */}
        {race && (
          <div className="f1-card p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="f1-accent-bar">
                <h2 className="section-heading text-xl">Circuit</h2>
              </div>
              <span className="text-f1-gray-3 text-xs">{race.Circuit.circuitName}</span>
            </div>
            <TrackViewer
              circuitId={race.Circuit.circuitId}
              height={340}
              mode="2d"
              showModeToggle={true}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-f1-gray">
          {(['race', 'qualifying'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors relative',
                activeTab === tab ? 'text-white' : 'text-f1-gray-4 hover:text-white'
              )}
            >
              {tab === 'race' ? 'Race Result' : 'Qualifying'}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-f1-red rounded-full" />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'race' && (
          <>
            {raceLoading && <SkeletonTable rows={20} />}
            {raceError && <ErrorState message="Couldn't load race results." />}
            {results.length > 0 && <RaceResultsTable results={results} />}
            {!raceLoading && !raceError && results.length === 0 && (
              <div className="text-center py-16 text-f1-gray-4 text-sm">Race results not yet available.</div>
            )}
          </>
        )}

        {activeTab === 'qualifying' && (
          <>
            {qualLoading && <SkeletonTable rows={20} />}
            {qualError && <ErrorState message="Couldn't load qualifying results." />}
            {qualResults.length > 0 && <QualifyingTable results={qualResults} />}
            {!qualLoading && !qualError && qualResults.length === 0 && (
              <div className="text-center py-16 text-f1-gray-4 text-sm">Qualifying results not yet available.</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Podium ───────────────────────────────────────────────────────────────────

function Podium({ results }: { results: RaceResult[] }) {
  const order = [results[1], results[0], results[2]].filter(Boolean)
  const heights = ['h-24', 'h-32', 'h-20']
  const positions = [2, 1, 3]

  return (
    <div className="mb-10">
      <div className="flex items-end justify-center gap-2 mb-6">
        {order.map((result, i) => {
          const pos = positions[i]
          const podiumColor = getPodiumColor(pos)
          const teamColor = getTeamColor(result.Constructor.constructorId)
          return (
            <div key={result.Driver.driverId} className="flex flex-col items-center">
              <div className="text-center mb-3 px-2">
                <p className="text-f1-gray-4 text-xs mb-1">{getNationalityFlag(result.Driver.nationality)}</p>
                <p className="font-display font-bold text-white text-sm uppercase leading-tight">{result.Driver.givenName}</p>
                <p className="font-display font-bold text-base uppercase leading-tight" style={{ color: teamColor }}>{result.Driver.familyName}</p>
                <p className="text-f1-gray-3 text-xs mt-1">{result.Constructor.name}</p>
                <p className="text-f1-white-2 font-mono text-xs mt-1 font-semibold">{result.Time?.time ?? result.status}</p>
                <p className="text-f1-gray-4 text-xs">{result.points} pts</p>
              </div>
              <div
                className={`w-24 sm:w-32 ${heights[i]} rounded-t-lg flex items-center justify-center`}
                style={{ backgroundColor: `${podiumColor}15`, borderTop: `3px solid ${podiumColor}` }}
              >
                <span className="font-display font-bold text-4xl sm:text-5xl" style={{ color: podiumColor, opacity: 0.8 }}>
                  {pos}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Race Results Table ───────────────────────────────────────────────────────

function RaceResultsTable({ results }: { results: RaceResult[] }) {
  return (
    <div className="f1-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-f1-gray">
              <Th className="w-10">Pos</Th>
              <Th>Driver</Th>
              <Th className="hidden sm:table-cell">Team</Th>
              <Th className="hidden md:table-cell text-right">Grid</Th>
              <Th className="hidden md:table-cell text-right">Laps</Th>
              <Th className="text-right">Time / Status</Th>
              <Th className="hidden sm:table-cell text-right">FL</Th>
              <Th className="text-right">Pts</Th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const teamColor = getTeamColor(result.Constructor.constructorId)
              const pos = parseInt(result.position)
              const hasFastestLap = result.FastestLap?.rank === '1'
              return (
                <tr key={result.Driver.driverId} className="f1-table-row">
                  <td className="px-4 py-3">
                    <span className={cn('font-mono text-sm font-bold',
                      pos === 1 ? 'text-yellow-400' : pos === 2 ? 'text-zinc-300' : pos === 3 ? 'text-orange-400' : 'text-f1-gray-4'
                    )}>{result.positionText}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-[3px] h-6 rounded-full flex-shrink-0" style={{ backgroundColor: teamColor }} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-semibold">{result.Driver.givenName} {result.Driver.familyName}</span>
                          {result.Driver.code && <span className="text-f1-gray-3 text-xs font-mono hidden sm:inline">{result.Driver.code}</span>}
                        </div>
                        <span className="text-f1-gray-3 text-xs">{getNationalityFlag(result.Driver.nationality)} #{result.number}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <TeamDot constructorId={result.Constructor.constructorId} size={8} />
                      <span className="text-f1-gray-4 text-sm">{result.Constructor.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-right font-mono text-f1-gray-4 text-sm">{result.grid === '0' ? 'PL' : result.grid}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-right font-mono text-f1-gray-4 text-sm">{result.laps}</td>
                  <td className="px-4 py-3 text-right">
                    {result.status === 'Finished' || result.Time
                      ? <span className="font-mono text-f1-white-2 text-sm">{result.Time?.time ?? 'Finished'}</span>
                      : <StatusBadge status={result.status} />
                    }
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-right">
                    {hasFastestLap && <span title={`Fastest lap: ${result.FastestLap?.Time.time}`}><Badge variant="red">FL</Badge></span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-f1-white-2 text-sm">
                    {result.points !== '0' ? result.points : <span className="text-f1-gray-3">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Qualifying Table ─────────────────────────────────────────────────────────

function QualifyingTable({ results }: { results: QualifyingResult[] }) {
  return (
    <div className="f1-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-f1-gray">
              <Th className="w-10">Pos</Th>
              <Th>Driver</Th>
              <Th className="hidden sm:table-cell">Team</Th>
              <Th className="text-right">Q1</Th>
              <Th className="text-right hidden sm:table-cell">Q2</Th>
              <Th className="text-right hidden md:table-cell">Q3</Th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const teamColor = getTeamColor(result.Constructor.constructorId)
              const pos = parseInt(result.position)
              return (
                <tr key={result.Driver.driverId} className="f1-table-row">
                  <td className="px-4 py-3">
                    <span className={cn('font-mono text-sm font-bold',
                      pos === 1 ? 'text-yellow-400' : pos <= 3 ? 'text-f1-white-2' : 'text-f1-gray-4'
                    )}>{pos}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-[3px] h-6 rounded-full flex-shrink-0" style={{ backgroundColor: teamColor }} />
                      <div>
                        <span className="text-white font-semibold">{result.Driver.givenName} {result.Driver.familyName}</span>
                        {result.Driver.code && <span className="text-f1-gray-3 text-xs font-mono ml-2 hidden sm:inline">{result.Driver.code}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <TeamDot constructorId={result.Constructor.constructorId} size={8} />
                      <span className="text-f1-gray-4 text-sm">{result.Constructor.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-f1-gray-4 text-sm">{result.Q1 ?? <span className="text-f1-gray-2">—</span>}</td>
                  <td className="px-4 py-3 text-right font-mono text-f1-gray-4 text-sm hidden sm:table-cell">{result.Q2 ?? <span className="text-f1-gray-2">—</span>}</td>
                  <td className="px-4 py-3 text-right font-mono text-f1-white-2 text-sm font-semibold hidden md:table-cell">{result.Q3 ?? <span className="text-f1-gray-3 font-normal">—</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn('text-left text-f1-gray-3 text-xs uppercase tracking-widest font-semibold px-4 py-3', className)}>
      {children}
    </th>
  )
}
