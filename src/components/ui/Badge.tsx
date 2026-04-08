import { cn } from "@/utils";

type BadgeVariant =
  | "red"
  | "gray"
  | "green"
  | "gold"
  | "silver"
  | "bronze"
  | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANTS: Record<BadgeVariant, string> = {
  red: "bg-f1-red/15 text-f1-red border border-f1-red/20",
  gray: "bg-f1-gray/50 text-f1-gray-4 border border-f1-gray-2/30",
  green: "bg-green-500/15 text-green-400 border border-green-500/20",
  gold: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  silver: "bg-zinc-400/15 text-zinc-300 border border-zinc-400/20",
  bronze: "bg-orange-700/15 text-orange-400 border border-orange-700/20",
  outline: "border border-f1-gray-2 text-f1-gray-4",
};

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span className={cn("f1-badge", VARIANTS[variant], className)}>
      {children}
    </span>
  );
}

export function PositionBadge({ position }: { position: string | number }) {
  const p = parseInt(String(position));
  const variant =
    p === 1 ? "gold" : p === 2 ? "silver" : p === 3 ? "bronze" : "gray";
  return <Badge variant={variant}>P{p}</Badge>;
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-f1-red/15 text-f1-red border border-f1-red/20">
      <span className="w-1.5 h-1.5 bg-f1-red rounded-full animate-pulse" />
      Live
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const isFinished = status === "Finished";
  const isRetired = status.startsWith("+") === false && !isFinished;
  return (
    <Badge variant={isFinished ? "green" : isRetired ? "red" : "gray"}>
      {status}
    </Badge>
  );
}
