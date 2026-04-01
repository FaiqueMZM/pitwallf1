import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'

import HomePage from '@/pages/HomePage'
import RacesPage from '@/pages/RacesPage'
import RaceDetailPage from '@/pages/RaceDetailPage'
import PlaceholderPage from '@/pages/PlaceholderPage'
import StandingsPage from '@/pages/StandingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="races" element={<RacesPage />} />
        <Route path="races/:year/:round" element={<RaceDetailPage />} />
        <Route path="standings" element={<StandingsPage />} />
        <Route path="standings/:year" element={<StandingsPage />} />
        <Route path="drivers" element={<PlaceholderPage title="Drivers" />} />
        <Route path="drivers/:driverId" element={<PlaceholderPage title="Driver Profile" />} />
        <Route path="live" element={<PlaceholderPage title="Live" />} />
        <Route path="*" element={<PlaceholderPage title="404 — Not Found" />} />
      </Route>
    </Routes>
  )
}
