"use client";

type RouteErrorProps = {
  title: string;
  description: string;
  reset: () => void;
};

export function RouteError({ title, description, reset }: RouteErrorProps) {
  return (
    <div className="retro-card mx-auto max-w-2xl bg-white p-8 text-center">
      <div className="display-font text-3xl font-black">{title}</div>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex rounded-[18px] border-[3px] border-line bg-[#7a5af8] px-5 py-3 text-sm font-black text-white shadow-[5px_5px_0_var(--line)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        Try Again
      </button>
    </div>
  );
}
