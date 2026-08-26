"use client";

import React, { useCallback, useEffect, useState } from "react";
import Confetti from "react-confetti";

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
      setTimeout(() => setActive(false), 3000);
    };

    const token = "__confetti_trigger__";
    window.addEventListener(token, trigger as EventListener);
    return () => window.removeEventListener(token, trigger as EventListener);
  }, []);

  if (!active) return null;

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={150}
    />
  );
};

export default ConfettiOverlay;
