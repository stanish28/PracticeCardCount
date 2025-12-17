"use client";
import { createContext, useContext, useMemo, useState } from "react";

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

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [numDecks, setNumDecksState] = useState(6);
  const [showCount, setShowCount] = useState(false);
  const [showDiscardPile, setShowDiscardPile] = useState(true);
  const [trainingMode, setTrainingMode] = useState(false);
  const [resetToken, setResetToken] = useState(0);

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

