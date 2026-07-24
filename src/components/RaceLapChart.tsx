import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getTeamColor, cn } from "@/utils";
import type { LapTime, RaceResult } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

interface RaceLapChartProps {
  laps?: LapTime[];
  results: RaceResult[];
  isLoading?: boolean;
}

export default function RaceLapChart({
  laps,
  results,
  isLoading,
}: RaceLapChartProps) {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const driverMeta = useMemo(() => {
    const map = new Map<string, { code: string; color: string }>();
    results.forEach((r) => {
      map.set(r.Driver.driverId, {
        code: r.Driver.code ?? r.Driver.familyName.slice(0, 3).toUpperCase(),
        color: getTeamColor(r.Constructor.constructorId),
      });
    });
    return map;
  }, [results]);

  const chartData = useMemo(() => {
    if (!laps) return [];
    return laps
      .map((lap) => {
        const row: Record<string, number | string> = {
          lap: parseInt(lap.number),
        };
        lap.Timings.forEach((t) => {
          row[t.driverId] = parseInt(t.position);
        });
        return row;
      })
      .sort((a, b) => (a.lap as number) - (b.lap as number));
  }, [laps]);

  const driverIds = useMemo(() => Array.from(driverMeta.keys()), [driverMeta]);
  const maxPosition = driverIds.length || 20;

  if (isLoading) return <Skeleton className="h-[420px] w-full rounded-lg" />;

  if (!laps || laps.length === 0) {
    return (
      <div className="text-center py-16 text-f1-gray-4 text-sm">
        Lap-by-lap data not available for this race.
      </div>
    );
  }

  return (
    <div className="f1-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="f1-accent-bar">
          <h3 className="section-heading text-xl">Lap Chart</h3>
          <p className="text-f1-gray-4 text-xs mt-0.5">
            Position by lap · click a driver below to highlight
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            stroke="#2a2a2a"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="lap"
            tick={{ fill: "#555555", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Lap",
              position: "insideBottom",
              offset: -2,
              fill: "#555555",
              fontSize: 11,
            }}
          />
          <YAxis
            reversed
            domain={[1, maxPosition]}
            allowDecimals={false}
            tick={{ fill: "#555555", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#f5f5f5",
            }}
            labelFormatter={(label) => `Lap ${label}`}
            formatter={(value: number, key: string) => [
              `P${value}`,
              driverMeta.get(key)?.code ?? key,
            ]}
          />
          {driverIds.map((id) => {
            const meta = driverMeta.get(id)!;
            const isDimmed = highlighted !== null && highlighted !== id;
            return (
              <Line
                key={id}
                type="monotone"
                dataKey={id}
                stroke={meta.color}
                strokeWidth={highlighted === id ? 3 : 1.5}
                strokeOpacity={isDimmed ? 0.15 : 1}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-f1-gray">
        {driverIds.map((id) => {
          const meta = driverMeta.get(id)!;
          const isActive = highlighted === id;
          return (
            <button
              key={id}
              onClick={() => setHighlighted(isActive ? null : id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all border",
                isActive
                  ? "border-f1-gray-2 bg-f1-black-3 text-white"
                  : "border-transparent bg-f1-black-3/50 text-f1-gray-4 hover:text-white",
              )}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: meta.color }}
              />
              {meta.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
