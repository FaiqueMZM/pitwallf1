interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-f1-gray/30 border border-f1-gray flex items-center justify-center mb-6">
        <span className="text-2xl">🏁</span>
      </div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-white mb-3">
        {title}
      </h1>
      <p className="text-f1-gray-4 text-sm max-w-sm">
        This page is being built. Check back soon — we're going lap by lap.
      </p>
      <div className="mt-8 h-[2px] w-16 bg-f1-red rounded-full" />
    </div>
  );
}
