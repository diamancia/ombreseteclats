"use client";
import { useEffect, useState } from "react";

function timeLeft(endAt: string) {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({ endAt, endedLabel = "Offre terminée" }: { endAt: string; endedLabel?: string }) {
  const [left, setLeft] = useState(() => timeLeft(endAt));

  useEffect(() => {
    const id = setInterval(() => setLeft(timeLeft(endAt)), 1000);
    return () => clearInterval(id);
  }, [endAt]);

  if (!left) return <span>{endedLabel}</span>;

  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {left.d > 0 && `${left.d}j `}
      {pad(left.h)}:{pad(left.m)}:{pad(left.s)}
    </span>
  );
}
