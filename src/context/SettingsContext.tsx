"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SettingsContextValue = {
  numDecks: number;
  setNumDecks: (value: number) => void;
  showCount: boolean;
  setShowCount: (value: boolean) => void;
  showDiscardPile: boolean;
  setShowDiscardPile: (value: boolean) => void;
  trainingMode: boolean;
  setTrainingMode: (value: boolean) => void;
  resetToken: number;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "blackjack-trainer-settings";

// Helper to get initial numDecks from localStorage
const getInitialNumDecks = (): number => {
  if (typeof window === "undefined") return 6;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.numDecks === "number" && parsed.numDecks > 0) {
        return parsed.numDecks;
      }
    }
  } catch (e) {
    // Ignore errors, use default
  }
  return 6;
};

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [numDecks, setNumDecksState] = useState(getInitialNumDecks);
  const [showCount, setShowCount] = useState(false);
  const [showDiscardPile, setShowDiscardPile] = useState(true);
  const [trainingMode, setTrainingMode] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.numDecks === "number" && parsed.numDecks > 0) {
          setNumDecksState(parsed.numDecks);
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }, []);

  // Save to localStorage whenever numDecks changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ numDecks }),
      );
    } catch (e) {
      // Ignore errors (e.g., localStorage quota exceeded)
    }
  }, [numDecks]);

  const setNumDecks = (value: number) => {
    setNumDecksState(value);
    // bump token to signal shoe resets across modes
    setResetToken((token) => token + 1);
  };

  const value = useMemo(
    () => ({
      numDecks,
      setNumDecks,
      showCount,
      setShowCount,
      showDiscardPile,
      setShowDiscardPile,
      trainingMode,
      setTrainingMode,
      resetToken,
    }),
    [numDecks, showCount, showDiscardPile, trainingMode, resetToken],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return ctx;
};

