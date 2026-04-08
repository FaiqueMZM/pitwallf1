import { cn } from "@/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  accent?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
  accent = true,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-6", className)}>
      <div className={cn(accent && "f1-accent-bar")}>
        <h2 className="section-heading">{title}</h2>
        {subtitle && <p className="text-f1-gray-4 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, meta }: PageHeaderProps) {
  return (
    <div className="border-b border-f1-gray bg-f1-black-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {badge && <div className="mb-3">{badge}</div>}
        <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-widest text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-f1-gray-4 mt-2 text-sm sm:text-base">{subtitle}</p>
        )}
        {meta && <div className="mt-4">{meta}</div>}
      </div>
    </div>
  );
}
