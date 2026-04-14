type RouteLoadingProps = {
  title: string;
  description: string;
  blocks?: number;
};

export function RouteLoading({
  title,
  description,
  blocks = 3,
}: RouteLoadingProps) {
  return (
    <div className="min-h-[50vh] animate-pulse">
      <div className="max-w-3xl space-y-4">
        <div className="h-4 w-28 rounded-full bg-purple/25" />
        <div className="h-12 w-full max-w-2xl rounded-[20px] bg-ink/10" />
        <div className="h-5 w-full max-w-xl rounded-full bg-ink/10" />
      </div>

      <div className="mt-4 text-sm font-semibold text-muted">{description}</div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: blocks }).map((_, index) => (
          <div
            key={`${title}-${index}`}
            className="rounded-[28px] border-[3px] border-line bg-white p-6 shadow-[7px_7px_0_var(--line)]"
          >
            <div className="h-5 w-24 rounded-full bg-ink/10" />
            <div className="mt-5 h-8 w-3/4 rounded-full bg-ink/10" />
            <div className="mt-4 h-4 w-full rounded-full bg-ink/10" />
            <div className="mt-2 h-4 w-5/6 rounded-full bg-ink/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
