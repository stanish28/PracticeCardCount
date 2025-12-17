import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Card, buildShoe, getHiLoValue, shuffle } from "@/lib/cards";

type UseShoeResult = {
  runningCount: number;
  trueCount: number;
  cardsRemaining: number;
  cardsDealt: number;
  totalCards: number;
  penetration: number;
  history: Card[];
  isExhausted: boolean;
  drawCard: () => Card | null;
  resetShoe: () => void;
  shoeSnapshot: Card[];
};

const HISTORY_LIMIT = 10;

export const useShoe = (): UseShoeResult => {
  const { numDecks, resetToken } = useSettings();
  const [shoe, setShoe] = useState<Card[]>([]);
  const shoeRef = useRef<Card[]>([]);
  const [runningCount, setRunningCount] = useState(0);
  const [cardsDealt, setCardsDealt] = useState(0);
  const [history, setHistory] = useState<Card[]>([]);
  const [isExhausted, setIsExhausted] = useState(false);

  const initialize = useCallback(
    (decks: number) => {
      const fresh = shuffle(buildShoe(decks));
      shoeRef.current = fresh;
      setShoe(fresh);
      setRunningCount(0);
      setCardsDealt(0);
      setHistory([]);
      setIsExhausted(false);
    },
    [],
  );

  // Initialize shoe on mount - ensures fresh shoe on every page load/refresh
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initialize(numDecks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = runs once on mount

  // Reset shoe whenever deck settings change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initialize(numDecks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numDecks, resetToken]);

  const drawCard = useCallback(() => {
    if (shoeRef.current.length === 0) {
      setIsExhausted(true);
      return null;
    }
    const [card, ...rest] = shoeRef.current;
    shoeRef.current = rest;
    setShoe(rest);
    setIsExhausted(false);
    setRunningCount((prev) => prev + getHiLoValue(card));
    setCardsDealt((prev) => prev + 1);
    setHistory((prev) => [card, ...prev].slice(0, HISTORY_LIMIT));
    return card;
  }, []);

  // Keep shoe ref aligned with state when external changes occur (unlikely but safe)
  useEffect(() => {
    shoeRef.current = shoe;
    if (shoe.length === 0 && !isExhausted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsExhausted(true);
    }
  }, [shoe, isExhausted]);

  const resetShoe = useCallback(() => {
    initialize(numDecks);
  }, [initialize, numDecks]);

  const cardsRemaining = shoe.length;
  const totalCards = useMemo(() => numDecks * 52, [numDecks]);
  const penetration = totalCards > 0 ? cardsDealt / totalCards : 0;
  const decksRemaining = cardsRemaining > 0 ? cardsRemaining / 52 : 0;
  const trueCount =
    decksRemaining > 0
      ? Math.round((runningCount / decksRemaining) * 10) / 10
      : 0;

  return {
    runningCount,
    trueCount,
    cardsRemaining,
    cardsDealt,
    totalCards,
    penetration,
    history,
    isExhausted,
    drawCard,
    resetShoe,
    shoeSnapshot: shoe,
  };
};

