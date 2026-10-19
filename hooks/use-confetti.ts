"use client";

export type ConfettiTrigger = () => void;

declare global {
  interface Window {
    __confetti_trigger__?: ConfettiTrigger;
  }
}

export const CONFETTI_EVENT_KEY = "__confetti_trigger__";
/** How long the burst stays mounted. */
export const CONFETTI_DURATION_MS = 3000;
export const CONFETTI_PIECE_COUNT = 150;

export const triggerConfetti: ConfettiTrigger = () => {
  window.dispatchEvent(new Event(CONFETTI_EVENT_KEY));
};
