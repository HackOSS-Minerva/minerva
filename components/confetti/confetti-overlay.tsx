"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export const CONFETTI_DURATION_MS = 5000;

interface ConfettiContextValue {
  triggerConfetti: () => void;
}

const ConfettiContext = createContext<ConfettiContextValue | null>(null);

export const useTriggerConfetti = (): ConfettiContextValue => {
  const ctx = useContext(ConfettiContext);
  if (!ctx) throw new Error("useTriggerConfetti must be used within ConfettiProvider");
  return ctx;
};

export const ConfettiProvider = ({ children }: { children: React.ReactNode }) => {
  const { width, height } = useWindowSize();
  const [active, setActive] = useState(false);

  const triggerConfetti = useCallback(() => {
    setActive(true);
    setTimeout(() => setActive(false), CONFETTI_DURATION_MS);
  }, []);

  return (
    <ConfettiContext.Provider value={{ triggerConfetti }}>
      {children}
      {active && <Confetti width={width} height={height} recycle={false} />}
    </ConfettiContext.Provider>
  );
};
