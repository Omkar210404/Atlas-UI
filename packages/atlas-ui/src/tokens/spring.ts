/**
 * Damped spring (mass 1) from 0 to 1, sampled so it can be written as a CSS `linear()` easing.
 * Dependency-free: used by the token build script and by tests.
 */
export interface SampledSpring {
  /** Progress values at evenly spaced times, first 0, last 1. */
  samples: number[];
  /** Time until the spring stays within 0.1% of rest, in milliseconds. */
  durationMs: number;
}

export function sampleSpring(stiffness: number, damping: number, count = 40): SampledSpring {
  const dt = 1 / 1000;
  let x = 0;
  let v = 0;
  const trace: number[] = [0];
  let settledAt = 0;
  for (let step = 1; step <= 5000; step++) {
    const force = -stiffness * (x - 1) - damping * v;
    v += force * dt;
    x += v * dt;
    trace.push(x);
    if (Math.abs(x - 1) > 0.001 || Math.abs(v) > 0.01) settledAt = step;
    else if (step - settledAt > 50) break;
  }
  const durationMs = Math.max(settledAt, 1);
  const samples: number[] = [];
  for (let i = 0; i < count; i++) {
    const index = Math.round((i / (count - 1)) * durationMs);
    samples.push(i === count - 1 ? 1 : (trace[index] ?? 1));
  }
  return { samples, durationMs };
}

/** `linear(0, 0.12, …, 1)` with evenly spaced stops, rounded to 4 decimals. */
export function toCssLinear(samples: number[]): string {
  return `linear(${samples.map((s) => Number(s.toFixed(4))).join(', ')})`;
}
