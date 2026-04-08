import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StandingsTab } from "@/types";

interface AppState {
  // Selected season (for browsing historical data)
  selectedYear: number;
  setSelectedYear: (year: number) => void;

  // Standings tab preference
  standingsTab: StandingsTab;
  setStandingsTab: (tab: StandingsTab) => void;

  // Live session key (cached so we don't re-fetch on tab switch)
  liveSessionKey: number | null;
  setLiveSessionKey: (key: number | null) => void;

  // Nav state
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedYear: new Date().getFullYear(),
      setSelectedYear: (year) => set({ selectedYear: year }),

      standingsTab: "drivers",
      setStandingsTab: (tab) => set({ standingsTab: tab }),

      liveSessionKey: null,
      setLiveSessionKey: (key) => set({ liveSessionKey: key }),

      mobileNavOpen: false,
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    }),
    {
      name: "pitwallf1-store",
      // Only persist user preferences, not UI state
      partialize: (state) => ({
        selectedYear: state.selectedYear,
        standingsTab: state.standingsTab,
        liveSessionKey: state.liveSessionKey,
      }),
    },
  ),
);
