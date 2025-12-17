const formatSigned = (value: number) =>
  value > 0 ? `+${value}` : value.toString();

export const StatsPanel = ({
  runningCount,
  showCount,
  trueCount,
  cardsDealt,
  cardsRemaining,
  totalCards,
  penetration,
  feedback,
}: {
  runningCount: number;
  showCount: boolean;
  trueCount: number;
  cardsDealt: number;
  cardsRemaining: number;
  totalCards: number;
  penetration: number;
  feedback?: string;
}) => {
  const countColor =
    runningCount > 0
      ? "text-emerald-400"
      : runningCount < 0
        ? "text-rose-400"
        : "text-slate-100";

  const percent = Math.min(100, Math.round(penetration * 100));

  return (
    <aside className="w-full rounded-2xl bg-slate-900/70 p-4 text-slate-100 shadow-2xl shadow-black/50 ring-1 ring-white/5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-amber-200">Stats</h3>
        <span className="text-xs text-slate-400">Live per shoe</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="stat-tile rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-200/80">Running count</p>
          <p className={`text-2xl font-bold ${countColor}`}>
            {showCount ? formatSigned(runningCount) : "Hidden"}
          </p>
        </div>
        <div className="stat-tile rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-200/80">Cards dealt</p>
          <p className="text-2xl font-bold text-slate-100">{cardsDealt}</p>
        </div>
        <div className="stat-tile rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-200/80">Cards remaining</p>
          <p className="text-2xl font-bold text-slate-100">
            {cardsRemaining}
          </p>
        </div>
        <div className="stat-tile rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-200/80">
            True count{totalCards > 52 ? "" : " (n/a)"}
          </p>
          <p className="text-2xl font-bold text-slate-100">
            {totalCards > 52 ? trueCount : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Shoe penetration</span>
          <span>{percent}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full progress-track">
          <div className="progress-bar h-2 rounded-full" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-amber-100/10 bg-slate-800/80 p-3 shadow-inner shadow-amber-50/5">
        <p className="text-xs font-semibold text-amber-200">Feedback</p>
        <p className="text-sm text-slate-100">
          {feedback || "Interact to see feedback after each check."}
        </p>
      </div>
    </aside>
  );
};

