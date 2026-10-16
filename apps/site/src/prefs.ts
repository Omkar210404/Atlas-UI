import { useSyncExternalStore } from 'react';

export type Theme = 'night' | 'day';
export type ViewChoice = 'spatial' | 'simple';
export type MotionChoice = 'system' | 'reduce' | 'full';

export interface Prefs {
  theme: Theme;
  /** null until the visitor picks a view; the site then decides automatically. */
  view: ViewChoice | null;
  motion: MotionChoice;
}

const KEY = 'atlas-ui:prefs';

function read(): Prefs {
  const fallback: Prefs = { theme: 'night', view: null, motion: 'system' };
  try {
    const stored = JSON.parse(window.localStorage.getItem(KEY) ?? 'null') as Partial<Prefs> | null;
    if (!stored) return fallback;
    return {
      theme: stored.theme === 'day' ? 'day' : 'night',
      view: stored.view === 'spatial' || stored.view === 'simple' ? stored.view : null,
      motion: stored.motion === 'reduce' || stored.motion === 'full' ? stored.motion : 'system',
    };
  } catch {
    return fallback;
  }
}

let prefs = read();
const listeners = new Set<() => void>();

function apply() {
  const root = document.documentElement;
  root.dataset.theme = prefs.theme;
  if (prefs.motion === 'system') delete root.dataset.motion;
  else root.dataset.motion = prefs.motion;
}
apply();

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  prefs = { ...prefs, [key]: value };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the choice still applies now.
  }
  apply();
  listeners.forEach((listener) => listener());
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => prefs,
  );
}

let webgl: boolean | null = null;
function hasWebGL(): boolean {
  if (webgl !== null) return webgl;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    webgl = Boolean(context);
    (context as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webgl = false;
  }
  return webgl;
}

/** Why Simple view was chosen automatically, or null if Spatial view suits this browser. */
export function autoSimpleReason(motionReduced: boolean): string | null {
  if (motionReduced) return 'Your device asks for reduced motion, so this is the Simple view.';
  if (!hasWebGL()) return 'This browser has no WebGL, so this is the Simple view.';
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return 'Data saver is on, so this is the Simple view.';
  return null;
}
