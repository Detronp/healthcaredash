// Demonstration thresholds for adult patients. These ranges are simplified for
// UI illustration only and are NOT clinical decision support.

export const LEVEL = { normal: "normal", elevated: "elevated", critical: "critical" };

const band = (v, { critLow, warnLow, warnHigh, critHigh }) => {
  if (v == null || Number.isNaN(v)) return LEVEL.normal;
  if ((critLow != null && v < critLow) || (critHigh != null && v > critHigh)) return LEVEL.critical;
  if ((warnLow != null && v < warnLow) || (warnHigh != null && v > warnHigh)) return LEVEL.elevated;
  return LEVEL.normal;
};

export const RANGES = {
  hr: { label: "Heart Rate", unit: "bpm", critLow: 40, warnLow: 50, warnHigh: 100, critHigh: 120 },
  sbp: { label: "Systolic BP", unit: "mmHg", critLow: 90, warnLow: 100, warnHigh: 140, critHigh: 180 },
  rr: { label: "Respiratory Rate", unit: "/min", critLow: 8, warnLow: 12, warnHigh: 20, critHigh: 28 },
  spo2: { label: "SpO₂", unit: "%", critLow: 90, warnLow: 94 },
  temp: { label: "Temperature", unit: "°C", critLow: 35, warnLow: 36, warnHigh: 38, critHigh: 39 },
  pain: { label: "Pain Score", unit: "/10", warnHigh: 3, critHigh: 6 },
};

export const levelOf = (key, value) => band(value, RANGES[key]);

export function overallLevel(v) {
  const levels = ["hr", "sbp", "rr", "spo2", "temp", "pain"].map((k) => levelOf(k, v[k]));
  if (levels.includes(LEVEL.critical)) return LEVEL.critical;
  if (levels.includes(LEVEL.elevated)) return LEVEL.elevated;
  return LEVEL.normal;
}

/** Deterministic pseudo-random trend so charts are stable between renders. */
export function trend(base, spread, points = 12, seed = 1) {
  let s = seed * 9301 + 49297;
  const out = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280 - 0.5;
    v = v + r * spread;
    v = base + (v - base) * 0.7;
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

export const hours = (n = 12, end = 12) =>
  Array.from({ length: n }, (_, i) => {
    const h = (end - n + 1 + i + 24) % 24;
    return `${String(h).padStart(2, "0")}:00`;
  });
