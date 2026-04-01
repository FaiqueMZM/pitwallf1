import { NavLink, Link } from 'react-router-dom'
import { useAppStore } from '@/store'
import { cn } from '@/utils'

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/races', label: 'Races' },
  { to: '/standings', label: 'Standings' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/live', label: 'Live', live: true },
]

export default function Navbar() {
  const { mobileNavOpen, setMobileNavOpen } = useAppStore()

  return (
    <header className="sticky top-0 z-50 border-b border-f1-gray bg-f1-black/95 backdrop-blur-sm">
      {/* Red top bar */}
      <div className="h-[3px] bg-f1-red w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMobileNavOpen(false)}>
            <div className="w-7 h-7 bg-f1-red rounded flex items-center justify-center flex-shrink-0 group-hover:bg-f1-red-light transition-colors">
              <span className="text-white font-display font-bold text-xs tracking-tight">F1</span>
            </div>
            <span className="font-display font-bold text-white text-lg uppercase tracking-widest">
              Pitwall
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, exact, live }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  cn(
                    'relative px-4 py-1.5 text-sm font-semibold uppercase tracking-wider transition-colors duration-150 rounded',
                    isActive
                      ? 'text-white'
                      : 'text-f1-gray-4 hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {live && (
                      <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-f1-red rounded-full animate-pulse-red" />
                    )}
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-f1-red rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* GitHub link (desktop) */}
          <a
            href="https://github.com/FaiqueMZM/pitwallf1"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-f1-gray-4 hover:text-white transition-colors text-sm"
          >
            <GitHubIcon />
            <span className="font-semibold tracking-wide">GitHub</span>
          </a>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-f1-gray-4 hover:text-white transition-colors"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="md:hidden border-t border-f1-gray bg-f1-black-2 animate-slide-up">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label, exact, live }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold uppercase tracking-wider transition-colors',
                    isActive
                      ? 'bg-f1-red/10 text-white border-l-2 border-f1-red pl-[10px]'
                      : 'text-f1-gray-4 hover:text-white hover:bg-f1-gray/30'
                  )
                }
              >
                {label}
                {live && (
                  <span className="w-1.5 h-1.5 bg-f1-red rounded-full animate-pulse-red" />
                )}
              </NavLink>
            ))}
            <div className="border-t border-f1-gray mt-2 pt-3">
              <a
                href="https://github.com/FaiqueMZM/pitwallf1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-f1-gray-4 hover:text-white transition-colors text-sm font-semibold"
              >
                <GitHubIcon />
                View on GitHub
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}
