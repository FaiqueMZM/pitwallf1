import { useState, useEffect } from 'react'
import { parseISO, differenceInSeconds, isPast } from 'date-fns'

interface CountdownProps {
  date: string
  time?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(date: string, time?: string): TimeLeft | null {
  try {
    const dt = time ? parseISO(`${date}T${time}`) : parseISO(date)
    if (isPast(dt)) return null
    const total = differenceInSeconds(dt, new Date())
    return {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    }
  } catch {
    return null
  }
}

export function Countdown({ date, time }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => getTimeLeft(date, time))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(date, time))
    }, 1000)
    return () => clearInterval(interval)
  }, [date, time])

  if (!timeLeft) {
    return (
      <span className="text-f1-gray-4 text-sm font-mono">Race underway or finished</span>
    )
  }

  const units = [
    { label: 'D', value: timeLeft.days },
    { label: 'H', value: timeLeft.hours },
    { label: 'M', value: timeLeft.minutes },
    { label: 'S', value: timeLeft.seconds },
  ]

  return (
    <div className="flex items-center gap-2">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-f1-black-3 border border-f1-gray rounded px-3 py-1.5 min-w-[48px] text-center">
            <span className="font-mono text-xl font-bold text-white tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-f1-gray-3 text-[10px] uppercase tracking-widest mt-1 font-semibold">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
