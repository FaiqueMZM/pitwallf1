import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-f1-gray bg-f1-black-2 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 bg-f1-red rounded flex items-center justify-center">
                <span className="text-white font-display font-bold text-xs">
                  F1
                </span>
              </div>
              <span className="font-display font-bold text-white uppercase tracking-widest text-base">
                Pitwall
              </span>
            </div>
            <p className="text-f1-gray-4 text-sm leading-relaxed max-w-xs">
              F1 data, straight from the wall. Race results, standings, driver
              stats and near-live session data — free and open-source, forever.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-f1-gray-3 mb-3">
              Pages
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/races", label: "Races" },
                { to: "/standings", label: "Standings" },
                { to: "/drivers", label: "Drivers" },
                { to: "/live", label: "Live" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-f1-gray-4 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data sources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-f1-gray-3 mb-3">
              Data Sources
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://api.jolpi.ca/ergast/f1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-f1-gray-4 hover:text-white text-sm transition-colors"
                >
                  Jolpica / Ergast API
                </a>
                <p className="text-f1-gray-3 text-xs mt-0.5">
                  Historical race data since 1950
                </p>
              </li>
              <li>
                <a
                  href="https://openf1.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-f1-gray-4 hover:text-white text-sm transition-colors"
                >
                  OpenF1 API
                </a>
                <p className="text-f1-gray-3 text-xs mt-0.5">
                  Near-live session data
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-f1-gray mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-f1-gray-3 text-xs">
            © {year} Pitwall F1. Open-source under MIT licence.
          </p>
          <p className="text-f1-gray-3 text-xs text-center">
            Not affiliated with Formula 1, FIA, or any F1 team.
          </p>
          <a
            href="https://github.com/FaiqueMZM/pitwallf1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-f1-gray-4 hover:text-white text-xs transition-colors font-semibold uppercase tracking-wider"
          >
            Star on GitHub ★
          </a>
        </div>
      </div>
    </footer>
  );
}
