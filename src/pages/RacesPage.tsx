import { Link } from "react-router-dom";
import { useSeasonSchedule, useAvailableSeasons } from "@/hooks/useJolpica";
import { PageHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Countdown } from "@/components/ui/Countdown";
import { formatRaceDate, isRacePast } from "@/utils";
import { useAppStore } from "@/store";

// Country name → flag emoji (circuits use country names not nationalities)
const COUNTRY_FLAG: Record<string, string> = {
  Australia: "🇦🇺",
  China: "🇨🇳",
  Japan: "🇯🇵",
  Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  USA: "🇺🇸",
  "United States": "🇺🇸",
  Italy: "🇮🇹",
  Monaco: "🇲🇨",
  Canada: "🇨🇦",
  Spain: "🇪🇸",
  Austria: "🇦🇹",
  UK: "🇬🇧",
  "United Kingdom": "🇬🇧",
  Hungary: "🇭🇺",
  Belgium: "🇧🇪",
  Netherlands: "🇳🇱",
  Singapore: "🇸🇬",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  UAE: "🇦🇪",
  "Abu Dhabi": "🇦🇪",
  Azerbaijan: "🇦🇿",
  Qatar: "🇶🇦",
  "Las Vegas": "🇺🇸",
  Miami: "🇺🇸",
};

function getCountryFlag(country: string): string {
  return COUNTRY_FLAG[country] ?? "🏁";
}

export default function RacesPage() {
  const { selectedYear, setSelectedYear } = useAppStore();
  const { data: schedule, error, isLoading } = useSeasonSchedule(selectedYear);
  const { data: seasons } = useAvailableSeasons();

  // Split into past and upcoming
  const pastRaces = schedule?.filter((r) => isRacePast(r.date)) ?? [];
  const upcomingRaces = schedule?.filter((r) => !isRacePast(r.date)) ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Race Calendar"
        subtitle={`${selectedYear} Formula 1 World Championship`}
        meta={
          <SeasonSelector
            selectedYear={selectedYear}
            seasons={seasons ?? []}
            onChange={setSelectedYear}
          />
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && <ErrorState message="Couldn't load the race calendar." />}

        {isLoading && <CalendarSkeleton />}

        {schedule && (
          <div className="space-y-10">
            {/* Upcoming races */}
            {upcomingRaces.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="section-heading text-xl">Upcoming</h2>
                  <Badge variant="red">{upcomingRaces.length} races left</Badge>
                </div>
                <div className="space-y-3">
                  {upcomingRaces.map((race, i) => (
                    <RaceRow
                      key={race.round}
                      race={race}
                      isNext={i === 0}
                      isPast={false}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Past races */}
            {pastRaces.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="section-heading text-xl">Completed</h2>
                  <Badge variant="gray">{pastRaces.length} races</Badge>
                </div>
                <div className="space-y-3">
                  {[...pastRaces].reverse().map((race) => (
                    <RaceRow
                      key={race.round}
                      race={race}
                      isNext={false}
                      isPast={true}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Season Selector ──────────────────────────────────────────────────────────

function SeasonSelector({
  selectedYear,
  seasons,
  onChange,
}: {
  selectedYear: number;
  seasons: number[];
  onChange: (year: number) => void;
}) {
  // Show current year + last 10 years as quick buttons, rest in a select
  const recentYears = seasons.slice(0, 10);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {recentYears.map((year) => (
        <button
          key={year}
          onClick={() => onChange(year)}
          className={`px-3 py-1 rounded text-sm font-semibold font-mono transition-all duration-150 ${
            selectedYear === year
              ? "bg-f1-red text-white"
              : "bg-f1-gray/40 text-f1-gray-4 hover:text-white hover:bg-f1-gray"
          }`}
        >
          {year}
        </button>
      ))}
      {seasons.length > 10 && (
        <select
          value={recentYears.includes(selectedYear) ? "" : selectedYear}
          onChange={(e) => e.target.value && onChange(parseInt(e.target.value))}
          className="bg-f1-gray/40 text-f1-gray-4 border border-f1-gray-2 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-f1-red"
        >
          <option value="">Older...</option>
          {seasons.slice(10).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// ─── Race Row ─────────────────────────────────────────────────────────────────

function RaceRow({
  race,
  isNext,
  isPast,
}: {
  race: import("@/types").Race;
  isNext: boolean;
  isPast: boolean;
}) {
  return (
    <Link
      to={`/races/${race.season}/${race.round}`}
      className={`group flex items-center gap-4 p-4 rounded-lg border transition-all duration-150 ${
        isNext
          ? "bg-f1-red/5 border-f1-red/30 hover:border-f1-red/60 glow-red"
          : "bg-f1-black-2 border-f1-gray hover:border-f1-gray-2 hover:bg-f1-black-3"
      }`}
    >
      {/* Round number */}
      <div className="flex-shrink-0 w-10 text-center">
        <span
          className={`font-mono text-xs font-bold uppercase tracking-widest ${
            isNext ? "text-f1-red" : "text-f1-gray-3"
          }`}
        >
          R{race.round}
        </span>
      </div>

      {/* Red divider */}
      <div
        className={`w-[2px] h-10 rounded-full flex-shrink-0 ${
          isNext ? "bg-f1-red" : "bg-f1-gray"
        }`}
      />

      {/* Flag + race info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base leading-none">
            {getCountryFlag(race.Circuit.Location.country)}
          </span>
          {isNext && <Badge variant="red">Next Race</Badge>}
          {isPast && <Badge variant="gray">Completed</Badge>}
        </div>
        <p className="font-display font-bold text-white uppercase tracking-wide text-base truncate group-hover:text-f1-red transition-colors">
          {race.raceName}
        </p>
        <p className="text-f1-gray-4 text-xs mt-0.5 truncate">
          {race.Circuit.circuitName} · {race.Circuit.Location.locality},{" "}
          {race.Circuit.Location.country}
        </p>
      </div>

      {/* Date / countdown */}
      <div className="flex-shrink-0 text-right hidden sm:block">
        {isNext ? (
          <div>
            <p className="text-f1-gray-3 text-xs uppercase tracking-widest mb-1">
              Countdown
            </p>
            <Countdown date={race.date} time={race.time} />
          </div>
        ) : (
          <div>
            <p className="text-f1-white-2 text-sm font-semibold font-mono">
              {formatRaceDate(race.date)}
            </p>
            {isPast && (
              <p className="text-f1-red text-xs font-semibold mt-1 group-hover:underline">
                View results →
              </p>
            )}
          </div>
        )}
      </div>

      {/* Chevron */}
      <div className="flex-shrink-0 text-f1-gray-3 group-hover:text-white transition-colors ml-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-lg border border-f1-gray bg-f1-black-2"
        >
          <Skeleton className="w-8 h-4 flex-shrink-0" />
          <Skeleton className="w-[2px] h-10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-4 w-24 hidden sm:block" />
        </div>
      ))}
    </div>
  );
}
