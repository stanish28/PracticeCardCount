import { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";

const deckOptions = [1, 2, 4, 6, 8];

export const SettingsPanel = () => {
  const {
    numDecks,
    setNumDecks,
    showCount,
    setShowCount,
    showDiscardPile,
    setShowDiscardPile,
    trainingMode,
    setTrainingMode,
  } = useSettings();
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const handleDeckChange = (value: number) => {
    setNumDecks(value);
    setToast(`Deck count changed to ${value}. Current shoe reset.`);
  };

  return (
    <section className="space-y-4 text-slate-100">
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/50">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-300/10 via-transparent to-transparent" />
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-amber-200">
              Deck settings
            </h3>
            <p className="text-sm text-slate-300">
              Applies to all modes. Changing decks resets the shoe.
            </p>
          </div>
          {toast ? (
            <span className="rounded-full bg-amber-200/20 px-3 py-1 text-xs font-medium text-amber-100">
              {toast}
            </span>
          ) : null}
        </div>

        <div className="mt-4 rounded-2xl border border-white/5 bg-slate-800/70 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-slate-700/70 text-sm font-semibold text-amber-200">
              {numDecks}x
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-200/90">
                Shoe preview
              </p>
              <p className="text-xs text-slate-400">
                {numDecks * 52} cards in the shoe
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-200/80">
                Number of decks
              </label>
              <div className="flex flex-wrap gap-2">
                {deckOptions.map((deck) => {
                  const active = deck === numDecks;
                  return (
                    <button
                      key={deck}
                      type="button"
                      onClick={() => handleDeckChange(deck)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/40"
                          : "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70"
                      }`}
                    >
                      {deck} deck{deck > 1 ? "s" : ""}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400">
                More decks mean longer shoes and slower count changes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-200/80">
                    Running count visibility
                  </p>
                  <p className="text-xs text-slate-400">
                    Hide the count to practice. Reveal it to learn the flow.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCount(!showCount)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                    showCount ? "bg-indigo-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showCount ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-200/80">
                  Discard pile display (Single Card Mode)
                </p>
                <p className="text-xs text-slate-400">
                  Hide the discard pile if you prefer a cleaner table surface.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDiscardPile(!showDiscardPile)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  showDiscardPile ? "bg-indigo-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showDiscardPile ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-200/80">
                  Training mode (per-card value)
                </p>
                <p className="text-xs text-slate-400">
                  When training is on, each dealt card shows its Hi-Lo value under the card.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrainingMode(!trainingMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  trainingMode ? "bg-indigo-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    trainingMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

