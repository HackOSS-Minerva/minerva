"use client";

import React, { useCallback, useEffect, useState } from "react";
import Confetti from "react-confetti";
import {
  CONFETTI_DURATION_MS,
  CONFETTI_EVENT_KEY,
  CONFETTI_PIECE_COUNT,
} from "@/hooks/use-confetti";

const ConfettiOverlay = () => {
  const [width, setWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const [height, setHeight] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerHeight : 0,
  );
  const [active, setActive] = useState(false);

  const handleResize = useCallback(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    const trigger = () => {
      setActive(true);
      setTimeout(() => setActive(false), CONFETTI_DURATION_MS);
    };

    window.addEventListener(CONFETTI_EVENT_KEY, trigger as EventListener);
    return () =>
      window.removeEventListener(CONFETTI_EVENT_KEY, trigger as EventListener);
  }, []);

  if (!active) return null;

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={CONFETTI_PIECE_COUNT}
    />
  );
};

export default ConfettiOverlay;
