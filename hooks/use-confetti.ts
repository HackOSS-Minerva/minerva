"use client";

import { useEffect } from "react";

export type ConfettiTrigger = () => void;

type UseConfettiResult = {
  trigger: ConfettiTrigger;
};

declare global {
  interface Window {
    __confetti_trigger__?: ConfettiTrigger;
  }
}

const TOKEN_KEY = "__confetti_trigger__";

export function useConfetti(): UseConfettiResult {
  useEffect(() => {
    const handler = () => {
      // Reserved for future global behavior; actual trigger is invoked directly.
    };

    window.addEventListener(TOKEN_KEY, handler as EventListener);
    return () =>
      window.removeEventListener(TOKEN_KEY, handler as EventListener);
  }, []);

  return {
    trigger: () => {
      window.dispatchEvent(new Event(TOKEN_KEY));
    },
  };
}

export const triggerConfetti: ConfettiTrigger = () => {
  window.dispatchEvent(new Event(TOKEN_KEY));
};
