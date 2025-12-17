import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useShoe } from "@/hooks/useShoe";
import { Card, formatCard, getHiLoValue } from "@/lib/cards";
import { StatsPanel } from "./StatsPanel";
import { PlayingCard } from "./PlayingCard";

const FeltSurface = ({
  discardStrip,
  hint,
  children,
}: {
  discardStrip: React.ReactNode;
  hint: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="relative rounded-[32px] bg-slate-950/60 border border-yellow-500/20 shadow-[0_0_40px_rgba(0,0,0,0.8)] p-6 md:p-8">
    <div className="overflow-hidden rounded-t-[28px] rounded-b-[80px]">
      <div className="relative rounded-[28px] bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 px-6 pt-6 pb-10 md:px-10 md:pt-8 md:pb-12 shadow-inner shadow-black/60">
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-yellow-400/80">
          <div className="flex flex-col gap-1">
            <span>Dealer</span>
            <div className="flex items-center gap-1">{discardStrip}</div>
          </div>
          <div className="text-[11px] text-amber-100/70">{hint}</div>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const SingleCardTable = ({
  discardStrip,
  hint,
  children,
}: {
  discardStrip: React.ReactNode;
  hint: React.ReactNode;
  children: React.ReactNode;
}) => (
  <FeltSurface discardStrip={discardStrip} hint={hint}>
    {children}
  </FeltSurface>
);

const formatSigned = (value: number) =>
  value > 0 ? `+${value}` : value.toString();

export const SingleCardMode = () => {
  const {
    runningCount,
    trueCount,
    cardsRemaining,
    cardsDealt,
    totalCards,
    penetration,
    drawCard,
    resetShoe,
    isExhausted,
  } = useShoe();
  const { showCount, showDiscardPile, trainingMode } = useSettings();

  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [history, setHistory] = useState<Card[]>([]);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState(
    "Deal a card to start practicing your running count.",
  );
  const [validation, setValidation] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDeal = useCallback(() => {
    const card = drawCard();
    if (!card) {
      setFeedback("Shoe exhausted. Reset the shoe to keep practicing.");
      return;
    }
    setValidation("");
    setCurrentCard(card);
    setHistory((prev) => [card, ...prev].slice(0, 8));
    const delta = getHiLoValue(card);
    const deltaText =
      delta > 0 ? `+${delta}` : delta === 0 ? "neutral" : `${delta}`;
    setFeedback(
      `Drew ${formatCard(card)} (${deltaText}). Running count updated.`,
    );
  }, [drawCard]);

  const handleReset = useCallback(() => {
    resetShoe();
    setCurrentCard(null);
    setHistory([]);
    setGuess("");
    setValidation("");
    setFeedback("Shoe reset. Running count is back to 0.");
  }, [resetShoe]);

  const handleCheck = useCallback(() => {
    if (guess.trim() === "" || Number.isNaN(Number(guess))) {
      setValidation("Please enter a number before checking.");
      return;
    }
    const numericGuess = Number(guess);
    setValidation("");
    if (cardsDealt === 0) {
      setFeedback("No cards dealt yet. Running count is 0.");
      return;
    }
    if (numericGuess === runningCount) {
      setFeedback(`Correct! Running count is ${formatSigned(runningCount)}.`);
    } else {
      setFeedback(
        `Not quite. You entered ${formatSigned(
          numericGuess,
        )}, actual running count is ${formatSigned(runningCount)}.`,
      );
    }
  }, [cardsDealt, guess, runningCount]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if (event.code === "Space" && !isInput) {
        event.preventDefault();
        handleDeal();
      }

      if (event.key === "Enter" && document.activeElement === inputRef.current) {
        event.preventDefault();
        handleCheck();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDeal, handleCheck]);

  const deltaValue = currentCard ? getHiLoValue(currentCard) : null;

  const discardStrip =
    !showDiscardPile
      ? null
      : history.length === 0
        ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/40">
            Discard pile
          </span>
        )
        : (
          history.map((card, idx) => (
            <div
              key={`${card.rank}-${card.suit}-${idx}`}
              className={`${idx > 0 ? "-ml-3" : ""}`}
              style={{ zIndex: history.length - idx }}
            >
              <PlayingCard
                card={card}
                size="sm"
                faded={idx > 6}
                watermark={false}
                animateKey={`${card.rank}-${card.suit}-${idx}`}
              />
            </div>
          ))
        );

  const mainCard = currentCard ? (
    <div className="transition duration-200 ease-out">
      <PlayingCard
        card={currentCard}
        size="lg"
        animateKey={`${currentCard.rank}-${currentCard.suit}-${cardsDealt}`}
      />
    </div>
  ) : (
    <div className="text-center text-base font-medium text-slate-400/40">
      No card dealt yet
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <section className="space-y-4">
        <SingleCardTable
          discardStrip={discardStrip}
          hint={<span>Space = deal, Enter = check</span>}
        >
          <div className="mt-6 md:mt-8 mx-auto max-w-2xl">
            <div className="relative mx-auto max-w-2xl rounded-[80px] border border-yellow-500/40 bg-emerald-950/40 px-10 py-10 shadow-inner shadow-black/70 md:px-16 md:py-12">
              <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border border-yellow-500/50 bg-slate-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-400/80">
                Player
              </div>
              <div className="flex flex-col items-center justify-center gap-4">
                {mainCard}
                {currentCard && trainingMode ? (
                  <span
                    className={`mt-2 text-center text-sm font-medium ${
                      deltaValue && deltaValue > 0
                        ? "text-emerald-300"
                        : deltaValue && deltaValue < 0
                          ? "text-rose-300"
                          : "text-slate-300"
                    }`}
                  >
                    {deltaValue === 0
                      ? "0 (neutral)"
                      : deltaValue
                        ? deltaValue > 0
                          ? `+${deltaValue}`
                          : `${deltaValue}`
                        : null}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </SingleCardTable>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleDeal}
            disabled={isExhausted}
            className="relative rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.8)] transition duration-150 hover:-translate-y-0.5 hover:bg-violet-400 hover:shadow-[0_0_32px_rgba(139,92,246,1)] disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            Deal next card
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-slate-500/60 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition duration-150 hover:bg-slate-800"
          >
            Reset shoe
          </button>
          {isExhausted ? (
            <span className="text-xs font-medium text-rose-200">
              Shoe exhausted. Reset to continue.
            </span>
          ) : null}
        </div>

        <div className="control-panel rounded-2xl p-5">
          <h3 className="text-base font-semibold text-amber-200">Check your count</h3>
          <p className="text-sm text-slate-200">
            Enter what you think the current running count is.
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={inputRef}
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white shadow-inner shadow-black/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:max-w-[220px]"
              placeholder="Enter running count"
            />
            <button
              type="button"
              onClick={handleCheck}
              className="soft-glow inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
            >
              Check my count
            </button>
          </div>
          {validation ? (
            <p className="mt-1 text-xs text-rose-300">{validation}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              Enter a number, then press Enter to check quickly.
            </p>
          )}
        </div>
      </section>

      <StatsPanel
        runningCount={runningCount}
        trueCount={trueCount}
        cardsRemaining={cardsRemaining}
        cardsDealt={cardsDealt}
        totalCards={totalCards}
        penetration={penetration}
        showCount={showCount}
        feedback={feedback}
      />
    </div>
  );
};

