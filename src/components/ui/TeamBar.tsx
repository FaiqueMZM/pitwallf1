import { getTeamColor } from "@/utils";

interface TeamBarProps {
  constructorId: string;
  teamColor?: string;
  height?: number;
}

export function TeamBar({
  constructorId,
  teamColor,
  height = 3,
}: TeamBarProps) {
  const color = teamColor ? `#${teamColor}` : getTeamColor(constructorId);
  return (
    <div
      style={{ backgroundColor: color, height }}
      className="w-full rounded-full"
    />
  );
}

interface TeamDotProps {
  constructorId: string;
  teamColor?: string;
  size?: number;
}

export function TeamDot({ constructorId, teamColor, size = 10 }: TeamDotProps) {
  const color = teamColor ? `#${teamColor}` : getTeamColor(constructorId);
  return (
    <div
      style={{ backgroundColor: color, width: size, height: size }}
      className="rounded-full flex-shrink-0"
    />
  );
}
