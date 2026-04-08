import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";

import HomePage from "@/pages/HomePage";
import RacesPage from "@/pages/RacesPage";
import RaceDetailPage from "@/pages/RaceDetailPage";
import StandingsPage from "@/pages/StandingsPage";
import DriversPage from "@/pages/DriversPage";
import DriverProfilePage from "@/pages/DriverProfilePage";
import LivePage from "@/pages/LivePage";
import PlaceholderPage from "@/pages/PlaceholderPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="races" element={<RacesPage />} />
        <Route path="races/:year/:round" element={<RaceDetailPage />} />
        <Route path="standings" element={<StandingsPage />} />
        <Route path="standings/:year" element={<StandingsPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="drivers/:driverId" element={<DriverProfilePage />} />
        <Route path="live" element={<LivePage />} />
        <Route path="*" element={<PlaceholderPage title="404 — Not Found" />} />
      </Route>
    </Routes>
  );
}
