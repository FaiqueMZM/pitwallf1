import { useState, lazy, Suspense } from 'react'
import { TRACKS, TRACK_MAP } from '@/data/tracks'
import TrackMap2D from './TrackMap2D'
import { cn } from '@/utils'
import type { CarPosition } from './TrackMap2D'

const TrackMap3D = lazy(() => import('./TrackMap3D'))

interface TrackViewerProps {
  circuitId?: string          // lock to a specific circuit (race detail)
  carPositions?: CarPosition[]
  height?: number
  mode?: '2d' | '3d'
  showModeToggle?: boolean
  showSelector?: boolean      // show city buttons to pick a circuit
}

export default function TrackViewer({
  circuitId,
  carPositions = [],
  height = 380,
  mode: initialMode = '2d',
  showModeToggle = false,
  showSelector = false,
}: TrackViewerProps) {
  const [mode, setMode] = useState<'2d' | '3d'>(initialMode)
  const [selectedId, setSelectedId] = useState(circuitId ?? TRACKS[0].id)

  const resolvedId = circuitId ?? selectedId
  const track = TRACK_MAP.get(resolvedId) ?? TRACKS[0]

  return (
    <div>
      {/* Header controls */}
      {(showModeToggle || (showSelector && !circuitId)) && (
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Circuit selector */}
          {showSelector && !circuitId && (
            <div className="flex flex-wrap gap-1.5 flex-1">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-semibold transition-all border',
                    resolvedId === t.id
                      ? 'bg-f1-red border-f1-red text-white'
                      : 'bg-f1-black-2 border-f1-gray text-f1-gray-4 hover:text-white hover:border-f1-gray-2'
                  )}
                >
                  {t.city}
                </button>
              ))}
            </div>
          )}

          {/* 2D / 3D toggle */}
          {showModeToggle && (
            <div className="flex rounded border border-f1-gray overflow-hidden flex-shrink-0">
              {(['2d', '3d'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors',
                    mode === m ? 'bg-f1-red text-white' : 'text-f1-gray-4 hover:text-white'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-f1-gray" style={{ height }}>
        {mode === '2d' ? (
          <TrackMap2D track={track} carPositions={carPositions} />
        ) : (
          <Suspense fallback={
            <div className="w-full h-full bg-f1-black-2 flex items-center justify-center">
              <p className="text-f1-gray-3 text-xs">Loading 3D track...</p>
            </div>
          }>
            <TrackMap3D track={track} carPositions={carPositions} height={height} />
          </Suspense>
        )}
      </div>

      {/* Track metadata */}
      <div className="flex flex-wrap gap-5 mt-3 px-1">
        {[
          { label: 'Circuit', value: track.circuit },
          { label: 'Lap length', value: `${track.lapLength} km` },
          { label: 'Turns', value: String(track.turns) },
          { label: 'Round', value: `${track.round} / 24` },
          { label: 'Country', value: track.country },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-f1-gray-3 text-xs uppercase tracking-widest font-semibold">{label}</p>
            <p className="text-f1-white-2 text-sm font-semibold mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
