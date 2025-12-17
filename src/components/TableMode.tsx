import { useEffect, useMemo, useRef, useState } from "react";
import { ChipStack } from "@/components/ChipStack";
import { useSettings } from "@/context/SettingsContext";
import { useShoe } from "@/hooks/useShoe";
import { Card, formatCard, handValue } from "@/lib/cards";
import { PlayingCard } from "./PlayingCard";
import { StatsPanel } from "./StatsPanel";

type PlayerStatus = "playing" | "stood" | "busted";
type PlayerSeat = { id: number; hand: Card[]; status: PlayerStatus };

const createPlayers = (count: number): PlayerSeat[] =>
  Array.from({ length: count }, (_, idx) => ({
    id: idx + 1,
    hand: [],
    status: "playing",
  }));

const formatSigned = (value: number) =>
  value > 0 ? `+${value}` : value.toString();

export const TableMode = () => {
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
  const { showCount } = useSettings();

  const [playerCount, setPlayerCount] = useState(3);
  const [players, setPlayers] = useState<PlayerSeat[]>(() =>
    createPlayers(3),
  );
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const dealerHandRef = useRef<Card[]>([]);
  const [dealerHoleRevealed, setDealerHoleRevealed] = useState(true);
  const [activeSeat, setActiveSeat] = useState(0);
  const [feedback, setFeedback] = useState(
    "Deal a new round to start the table flow.",
  );
  const [guess, setGuess] = useState("");
  const [validation, setValidation] = useState("");
  const [roundStarted, setRoundStarted] = useState(false);
  const [isDealing, setIsDealing] = useState(false);
  const [phase, setPhase] = useState<
    "idle" | "dealing" | "playerTurn" | "dealerTurn" | "roundFinished"
  >("idle");
  const dealTimerRef = useRef<NodeJS.Timeout | null>(null);

  const seatLayout = (idx: number, count: number) => {
    // Position seats to align with white card boxes on the background image
    // Scale positions for mobile screens
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const scale = isMobile ? 0.65 : 1; // Scale down on mobile
    
    // Hard-coded positions that align with the white boxes on the background image
    // Fine-tuned to center the first card exactly in each white box
    // With bottom positioning: DECREASE y to move DOWN, INCREASE x (or make less negative) to move RIGHT
    // Fine-tuned from user's almost-correct positioning
    const positions = [
      { x: -155 * scale, y: 150 * scale, rotation: 30 },   // Player 1 - fine-tuned: slightly left and down more
      { x: 10 * scale, y: 100 * scale, rotation: 0 },       // Player 2 - fine-tuned: down more, keeping centered
      { x: 165 * scale, y: 150 * scale, rotation: -30 },    // Player 3 - fine-tuned: slightly right and down more
    ];
    
    // For more than 3 players, calculate positions dynamically
    if (count > 3) {
      const arcSpan = 140;
      const radius = 200 * scale;
      const startAngle = -arcSpan / 2;
      const angleStep = count > 1 ? arcSpan / (count - 1) : 0;
      const angle = startAngle + (angleStep * idx);
      const angleRad = (angle * Math.PI) / 180;
      const x = Math.sin(angleRad) * radius;
      const y = Math.cos(angleRad) * radius;
      const rotation = -angle;
      return { x, y, rotation };
    }
    
    return positions[idx] || { x: 0, y: 130 * scale, rotation: 0 };
  };

  const cardStyle = (cardIdx: number, total: number, seatRotate = 0) => {
    // Cards overlap: each card's bottom-left overlaps previous card's top-right
    // Reduced overlap to show only the top-right tip (20-25% coverage)
    const offsetX = cardIdx * 20; // Reduced offset to the right (smaller overlap)
    const offsetY = cardIdx * -16; // Reduced offset UP (smaller overlap)
    const rotate = cardIdx * 1 + seatRotate * 0.1; // Minimal rotation
    return {
      transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`,
      zIndex: cardIdx + 1, // Higher z-index for cards on top
    };
  };

  useEffect(() => {
    dealerHandRef.current = dealerHand;
  }, [dealerHand]);

  const clearDealTimer = () => {
    if (dealTimerRef.current) {
      clearTimeout(dealTimerRef.current);
      dealTimerRef.current = null;
    }
  };

  const resetTable = () => {
    clearDealTimer();
    setIsDealing(false);
    setPlayers(createPlayers(playerCount));
    setDealerHand([]);
    setDealerHoleRevealed(true);
    setActiveSeat(0);
    setRoundStarted(false);
    setPhase("idle");
  };

  const handleResetShoe = () => {
    resetShoe();
    resetTable();
    setFeedback("Shoe reset. Running count is back to 0.");
  };

  const attemptDraw = (): Card | null => {
    const card = drawCard();
    if (!card) {
      setFeedback("Shoe exhausted. Reset to continue.");
      return null;
    }
    return card;
  };

  const handleDealNewRound = () => {
    if (isDealing) return;
    clearDealTimer();
    const seats = playerCount;
    setPlayers(createPlayers(seats));
    setDealerHand([]);
    setDealerHoleRevealed(false);
    setActiveSeat(0);
    setRoundStarted(false);
    setPhase("dealing");

    const steps: Array<{ type: "player" | "dealer"; idx?: number }> = [];
    for (let round = 0; round < 2; round += 1) {
      for (let p = 0; p < seats; p += 1) {
        steps.push({ type: "player", idx: p });
      }
      steps.push({ type: "dealer" });
    }

    setIsDealing(true);

    const dealStep = (i: number) => {
      if (i >= steps.length) {
        clearDealTimer();
        setIsDealing(false);
        setRoundStarted(true);
        setPhase("playerTurn");
        setActiveSeat(0);
        setFeedback("New round dealt. Track the flow and keep counting.");
        return;
      }

      const step = steps[i];
      const card = attemptDraw();
      if (!card) {
        clearDealTimer();
        setIsDealing(false);
        return;
      }

      if (step.type === "player" && typeof step.idx === "number") {
        setPlayers((prev) =>
          prev.map((seat, idx) =>
            idx === step.idx ? { ...seat, hand: [...seat.hand, card] } : seat,
          ),
        );
      } else if (step.type === "dealer") {
        setDealerHand((prev) => [...prev, card]);
      }

      dealTimerRef.current = setTimeout(() => dealStep(i + 1), 500);
    };

    dealStep(0);
  };

  const handleDealToActive = () => {
    if (isDealing) return;
    if (phase !== "playerTurn") return;
    const card = attemptDraw();
    if (!card) return;
    setPlayers((prev) => {
      const updated = prev.map((seat, idx) =>
        idx === activeSeat ? { ...seat, hand: [...seat.hand, card] } : seat,
      );
      const active = updated[activeSeat];
      if (active) {
        const { total } = handValue(active.hand);
        if (total > 21) {
          updated[activeSeat] = { ...active, status: "busted" };
          setFeedback(
            `Player ${activeSeat + 1} busted at ${total}. Moving to next player.`,
          );
          advanceToNextPlayer(updated);
        } else {
          setFeedback(`Dealt ${formatCard(card)} to Player ${activeSeat + 1}.`);
        }
      }
      return updated;
    });
  };

  const handleNextPlayer = () => {
    if (isDealing) return;
    if (phase !== "playerTurn") return;
    setPlayers((prev) => {
      const updated = [...prev];
      const current = updated[activeSeat];
      if (current) {
        if (current.status === "playing") {
          updated[activeSeat] = { ...current, status: "stood" };
        }
      }
      return updated;
    });
    advanceToNextPlayer();
  };

  const handleClearTable = () => {
    if (isDealing) return;
    resetTable();
    setFeedback("Table cleared. Running count stays the same.");
  };

  const handlePlayerCountChange = (value: number) => {
    if (isDealing) return;
    setPlayerCount(value);
    setPlayers(createPlayers(value));
    setDealerHand([]);
    setDealerHoleRevealed(true);
    setActiveSeat(0);
    setRoundStarted(false);
    setPhase("idle");
    resetShoe();
    setFeedback(
      `Player count set to ${value}. Round and shoe have been reset.`,
    );
  };

  // Clean up timer on unmount
  useMemo(() => {
    return () => clearDealTimer();
  }, []);

  const handleCheck = () => {
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
  };

  const advanceToNextPlayer = (currentPlayers?: PlayerSeat[]) => {
    const list = currentPlayers ?? players;
    const nextIdx = list.findIndex(
      (p, idx) => idx > activeSeat && p.status === "playing",
    );
    const firstIdx = list.findIndex((p) => p.status === "playing");
    const target =
      nextIdx !== -1 ? nextIdx : firstIdx !== -1 && activeSeat !== firstIdx
        ? firstIdx
        : -1;

    if (target === -1) {
      setPhase("dealerTurn");
      runDealerTurn();
    } else {
      setActiveSeat(target);
    }
  };

  const runDealerTurn = () => {
    setDealerHoleRevealed(true);
    setPhase("dealerTurn");
    setFeedback("Dealer playing...");

    const play = () => {
      const currentHand = dealerHandRef.current;
      const { total } = handValue(currentHand);
      if (total >= 17 || isExhausted) {
        setPhase("roundFinished");
        setFeedback("Dealer stands. Round finished.");
        return;
      }
      const card = attemptDraw();
      if (!card) {
        setPhase("roundFinished");
        return;
      }
      setDealerHand((prev) => [...prev, card]);
      setTimeout(play, 500);
    };

    // Flip hole card then start auto-play after a short pause
    setTimeout(play, 400);
  };

  const dealerDisplay = useMemo(() => {
    const visibleHand =
      !dealerHoleRevealed && dealerHand.length > 1
        ? dealerHand.slice(0, 1)
        : dealerHand;
    const totalInfo = handValue(visibleHand);
    const totalColor =
      totalInfo.total > 21
        ? "bg-rose-600/80 text-white"
        : totalInfo.total === 21
          ? "bg-emerald-500/80 text-white"
          : "bg-amber-400/80 text-slate-900";
    return (
      <div className="flex flex-col items-center gap-1.5 md:gap-2">
        <div className="rounded-full border border-yellow-500/50 bg-slate-950 px-3 md:px-4 py-0.5 md:py-1 text-[9px] md:text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-200/80">
          Dealer
        </div>
        <div
          className={`rounded-full px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold shadow ${totalColor}`}
        >
          {totalInfo.total > 21 ? `${totalInfo.total} (bust)` : totalInfo.total}
        </div>
        <div className="relative flex items-center h-[72px] md:h-[96px]">
          {dealerHand.length === 0 ? (
            <span className="text-xs md:text-sm text-amber-100/50">No cards yet</span>
          ) : (
            dealerHand.map((card, idx) => {
              if (!dealerHoleRevealed && idx === 1) {
                // Hidden card - positioned with same overlap logic
                // Scale offset for mobile: 24px on mobile (32px * 0.75), 32px on desktop
                const offsetX = idx * (typeof window !== 'undefined' && window.innerWidth < 768 ? 24 : 32);
                return (
                  <div
                    key={`hidden-${idx}`}
                    className="absolute flex w-12 md:w-16 items-center justify-center rounded-xl border border-slate-200/40 bg-slate-700/70 shadow-[0_6px_16px_rgba(0,0,0,0.6)]"
                    style={{
                      height: typeof window !== 'undefined' && window.innerWidth < 768 ? '72px' : '96px',
                      left: `${offsetX}px`,
                      zIndex: idx + 1,
                    }}
                  >
                    <div className="h-8 md:h-10 w-5 md:w-6 rounded-sm bg-slate-500/60" />
                  </div>
                );
              }
              // Each card overlaps the right half of the previous card
              // Scale offset for mobile
              const offsetX = idx * (typeof window !== 'undefined' && window.innerWidth < 768 ? 24 : 32);
              return (
                <div
                  key={`${card.rank}-${card.suit}-${idx}`}
                  className="absolute scale-75 md:scale-100"
                  style={{
                    left: `${offsetX}px`,
                    zIndex: idx + 1,
                  }}
                >
                  <PlayingCard
                    card={card}
                    size="md"
                    animateKey={`dealer-${card.rank}-${card.suit}-${idx}`}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }, [dealerHand, dealerHoleRevealed]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <section className="space-y-4">
        <div className="relative bg-slate-950/60 border border-yellow-500/20 shadow-[0_0_40px_rgba(0,0,0,0.8)] p-4 md:p-6">
          {/* Casino table with image background */}
          <div className="relative overflow-hidden rounded-lg">
            {/* Table background image */}
            <div 
              className="relative w-full min-h-[400px] md:min-h-[600px] bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(/table-background.png)',
              }}
            >
              {/* Overlay for better visibility of game elements */}
              <div className="absolute inset-0 bg-black/10" />

              {/* All game elements positioned absolutely on top of the image */}
              <div className="relative w-full h-full min-h-[400px] md:min-h-[600px]">
                
                {/* Dealer area - positioned to align with dealer area on background image */}
                <div className="absolute top-8 md:top-16 left-1/2 -translate-x-1/2 z-10 scale-75 md:scale-100">
                  {dealerDisplay}
                </div>

                {/* Header info overlay - positioned at top */}
                <div className="absolute top-1 md:top-2 left-2 md:left-4 right-2 md:right-4 flex justify-between items-start z-10">
                  <div className="text-[9px] md:text-[11px] font-semibold tracking-[0.22em] text-yellow-200/90 bg-black/40 px-2 md:px-3 py-1 rounded">
                    Blackjack Hi-Lo Trainer
                  </div>
                  <div className="text-[9px] md:text-[11px] text-amber-100/90 bg-black/40 px-2 md:px-3 py-1 rounded">
                    Seats: {playerCount}
                  </div>
                </div>

                {/* Player seats positioned along the curved edge */}
                {players.map((player, idx) => {
                  const isActive =
                    idx === activeSeat && roundStarted && player.status === "playing";
                  const { x, y, rotation } = seatLayout(idx, players.length);
                  const totalInfo = handValue(player.hand);
                  const totalColor =
                    totalInfo.total > 21
                      ? "bg-rose-600/80 text-white"
                      : totalInfo.total === 21
                        ? "bg-emerald-500/80 text-white"
                        : "bg-amber-400/80 text-slate-900";
                  return (
                    <div
                      key={player.id}
                      className="absolute z-10"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        bottom: `${y}px`,
                        transform: `translate(-50%, 0) rotate(${rotation}deg)`,
                        transformOrigin: "50% 50%",
                      }}
                    >
                      <div
                        className="relative w-[80px] md:w-[100px] transition"
                      >
                        {/* Player label - positioned below the white box */}
                        <div className="absolute -bottom-8 md:-bottom-10 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border border-yellow-500/50 bg-slate-950 px-2 md:px-3 py-1 text-[8px] md:text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-400/80 z-20 whitespace-nowrap">
                          Player {player.id}
                          {isActive ? (
                            <span className="ml-1 md:ml-2 rounded-full bg-indigo-500/70 px-1.5 md:px-2 py-[2px] text-[8px] md:text-[10px] font-semibold text-white">
                              Acting
                            </span>
                          ) : null}
                        </div>
                        
                        {/* Cards container - transparent, positioned to align with white box on image */}
                        <div className="relative w-full h-[50px] md:h-[60px] flex flex-col items-center justify-center mt-1">
                          {/* Cards - positioned inside the white box on background */}
                          {player.hand.length === 0 ? (
                            <div className="flex items-center justify-center text-xs text-white/30 pointer-events-none">
                              {/* Hide "No cards yet" since it's already on the background */}
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center w-full h-full">
                              {player.hand.map((card, cardIdx) => {
                                // First card (cardIdx 0) should be centered exactly in the white box
                                // Each subsequent card appears on the top-right of the previous card
                                // So each card accumulates offset: move UP (negative Y) and RIGHT (positive X)
                                // This ensures all previous cards remain visible
                                const offsetX = cardIdx * 18; // Each card moves further right
                                const offsetY = cardIdx * -14; // Each card moves further up (negative = up)
                                return (
                                  <div
                                    key={`${card.rank}-${card.suit}-${cardIdx}`}
                                    className="absolute"
                                    style={{
                                      left: '50%',
                                      top: '50%',
                                      transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${cardIdx * 0.8 + rotation * 0.03}deg)`,
                                      zIndex: cardIdx + 1,
                                    }}
                                  >
                                    <div className="scale-75 md:scale-100" style={{ transform: 'scale(1.4)' }}>
                                      <PlayingCard
                                        card={card}
                                        size="sm"
                                        animateKey={`${player.id}-${card.rank}-${card.suit}-${cardIdx}`}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Hand total badge - positioned above the white box */}
                          <div className="absolute -top-8 md:-top-10 left-1/2 z-10" style={{ transform: 'translate(calc(-50% - 8px), 0)' }}>
                            <span
                              className={`rounded-full px-2 md:px-4 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold shadow whitespace-nowrap min-w-[50px] md:min-w-[60px] ${totalColor}`}
                            >
                              {totalInfo.total > 21
                                ? `${totalInfo.total} (bust)`
                                : totalInfo.total === 21
                                  ? "21"
                                  : totalInfo.total}
                            </span>
                          </div>
                          
                          {/* Status label */}
                          {player.status !== "playing" && (
                            <div className="absolute -bottom-24 md:-bottom-32 left-1/2 -translate-x-1/2 text-center text-[10px] md:text-xs font-semibold text-amber-100/70 z-10">
                              {player.status === "stood"
                                ? "Standing"
                                : player.status === "busted"
                                  ? "Busted"
                                  : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hit and Stand buttons - first row */}
          <div className="mt-4 flex justify-center items-center gap-3">
            <button
              type="button"
              onClick={handleDealToActive}
              disabled={isExhausted || !roundStarted || phase === "dealerTurn"}
              className="rounded-full border border-white/10 bg-slate-800 px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 whitespace-nowrap"
            >
              Hit
            </button>
            <button
              type="button"
              onClick={handleNextPlayer}
              disabled={!roundStarted || phase === "dealerTurn"}
              className="rounded-full border border-white/10 bg-slate-800 px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 whitespace-nowrap"
            >
              Stand
            </button>
          </div>

          {/* Other controls - second row */}
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-900/70 px-2 md:px-4 py-2 md:py-3 text-slate-100 shadow-inner shadow-black/40">
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={handleDealNewRound}
                disabled={isExhausted || phase === "dealerTurn"}
                className="relative rounded-full bg-violet-500 px-3 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-white shadow-[0_0_18px_rgba(139,92,246,0.8)] transition duration-150 hover:-translate-y-0.5 hover:bg-violet-400 hover:shadow-[0_0_24px_rgba(139,92,246,1)] disabled:cursor-not-allowed disabled:bg-slate-600 whitespace-nowrap"
              >
                Deal new round
              </button>
              <button
                type="button"
                onClick={handleClearTable}
                className="rounded-full border border-white/10 bg-slate-800 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700 whitespace-nowrap"
              >
                Clear table
              </button>
              <button
                type="button"
                onClick={handleResetShoe}
                className="rounded-full border border-white/10 bg-slate-800 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700 whitespace-nowrap"
              >
                Reset shoe
              </button>
              {isExhausted ? (
                <span className="text-xs font-medium text-rose-200">
                  Shoe exhausted. Reset to continue.
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="text-xs md:text-sm font-medium text-amber-200/80">
                Number of players
              </label>
              <select
                value={playerCount}
                onChange={(e) => handlePlayerCountChange(Number(e.target.value))}
                className="rounded-full border border-violet-400/40 bg-slate-900 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] focus:border-violet-300 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="control-panel rounded-2xl p-5">
          <h3 className="text-base font-semibold text-amber-200">
            What is the running count right now?
          </h3>
          <p className="text-sm text-slate-200">
            Enter what you think the current running count is.
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white shadow-inner shadow-black/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:max-w-[200px]"
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
              Count updates in the background as cards are dealt.
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

