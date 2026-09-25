"use client";

export type ConfettiTrigger = () => void;

declare global {
  interface Window {
    __confetti_trigger__?: ConfettiTrigger;
  }
}

const TOKEN_KEY = "__confetti_trigger__";

export const triggerConfetti: ConfettiTrigger = () => {
  window.dispatchEvent(new Event(TOKEN_KEY));
};
