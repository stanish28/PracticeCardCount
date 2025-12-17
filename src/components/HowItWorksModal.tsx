export const HowItWorksModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              How the Hi-Lo count works
            </h2>
            <p className="text-sm text-slate-600">
              Start at 0 each shoe. Each card adjusts the running count using
              Hi-Lo values.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900">Low cards</h3>
            <p className="text-sm text-slate-600">2, 3, 4, 5, 6 → +1</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900">Neutral</h3>
            <p className="text-sm text-slate-600">7, 8, 9 → 0</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900">High cards</h3>
            <p className="text-sm text-slate-600">10, J, Q, K, A → -1</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Example</h3>
          <p className="text-sm text-slate-700">
            Cards: 5, K, 3, 9, A → running count:
            <span className="ml-1 font-semibold text-emerald-700">
              +1 (5)
            </span>
            ,
            <span className="ml-1 font-semibold text-slate-700">0 (K)</span>,
            <span className="ml-1 font-semibold text-emerald-700">
              +1 (3)
            </span>
            ,
            <span className="ml-1 font-semibold text-slate-700">0 (9)</span>,
            <span className="ml-1 font-semibold text-rose-700">-1 (A)</span> →
            total +1.
          </p>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Tip: Hide the running count and check yourself often to build
          intuition.
        </p>
      </div>
    </div>
  );
};

