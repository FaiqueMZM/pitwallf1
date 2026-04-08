interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong loading this data.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-f1-red/10 border border-f1-red/20 flex items-center justify-center mb-4">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-f1-red"
        >
          <path
            d="M10 6v4M10 14h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-f1-gray-4 text-sm max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 btn-ghost text-xs">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  message = "No data available.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-f1-gray/30 flex items-center justify-center mb-4">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-f1-gray-3"
        >
          <path
            d="M9 9a3 3 0 114.243 4.243M9 9l6.364 6.364M9 9L3 3m6 6L3 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-f1-gray-4 text-sm">{message}</p>
    </div>
  );
}
