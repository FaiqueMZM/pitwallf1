# Pitwall F1

> F1 data, straight from the wall.

An open-source Formula 1 data hub built for fans. Race results, live standings, driver profiles, and near-live session data — all in one place, free forever.

![Pitwall F1](https://img.shields.io/badge/status-in%20development-red?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-gray?style=flat-square)
![Built with React](https://img.shields.io/badge/React-18-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)

---

## Features

- **Race Calendar** — full season schedule, past and upcoming races
- **Race Results** — podium, full grid, lap counts, fastest laps
- **Standings** — driver and constructor standings for any season
- **Driver Profiles** — stats, nationality, season history
- **Live** — near-live leaderboard during sessions (via OpenF1, ~30s delay)

## Tech Stack

| Category | Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Data fetching | SWR + Axios |
| State | Zustand |
| Charts | Recharts |
| Historical data | [Jolpica / Ergast API](https://api.jolpi.ca/ergast/f1) |
| Live data | [OpenF1 API](https://openf1.org) |
| Deploy | Vercel (free tier) |

No backend. No paid services. Pure client-side.

## Getting Started

```bash
# Clone the repo
git clone https://github.com/FaiqueMZM/pitwallf1.git
cd pitwallf1

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
├── api/          # Jolpica + OpenF1 API functions
├── components/
│   ├── layout/   # Navbar, Footer, Layout shell
│   └── ui/       # Shared components (Badge, Skeleton, Countdown, etc.)
├── hooks/        # SWR data hooks
├── pages/        # One file per page/route
├── store/        # Zustand global state
├── types/        # TypeScript interfaces
└── utils/        # Formatting helpers, team colors, flags
```

## Data Sources

- **[Jolpica](https://api.jolpi.ca/ergast/f1)** — community mirror of the Ergast F1 API. Historical race data going back to 1950. No API key required.
- **[OpenF1](https://openf1.org)** — real session data (positions, laps, pit stops, weather). ~30-60 second delay. No API key required.

## Deployment

The app deploys to Vercel automatically on push to `main`. No configuration needed beyond connecting the repo.

```bash
npm run build   # Build for production
npm run preview # Preview production build locally
```

## Contributing

PRs welcome. Open an issue first if you're planning something big.

## Disclaimer

Pitwall F1 is not affiliated with Formula 1, the FIA, or any F1 team. All F1-related trademarks belong to their respective owners.

## License

MIT © [FaiqueMZM](https://github.com/FaiqueMZM)
