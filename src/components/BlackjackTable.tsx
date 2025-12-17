type BlackjackTableProps = {
  children: React.ReactNode;
  headerText?: string;
  footerText?: string;
  className?: string;
};

export const BlackjackTable = ({
  children,
  headerText = "BLACKJACK HI-LO TRAINER",
  footerText = "PAYOUTS FOR PRACTICE ONLY",
  className = "",
}: BlackjackTableProps) => {
  return (
    <div
      className={`felt-surface table-border relative w-full rounded-[36px] px-4 py-5 text-slate-100 shadow-2xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-4 flex justify-center text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/50">
        {headerText}
      </div>
      <div className="pointer-events-none absolute inset-x-6 bottom-4 flex justify-center text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-100/35">
        {footerText}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

