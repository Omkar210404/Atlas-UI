import type { Bounds, Point } from './geometry';

/** A camera looks at world point (x, y) and shows `w` world units across the viewport. */
export interface Camera {
  x: number;
  y: number;
  w: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Fits `bounds` inside the viewport minus `insets` (in px), centred in the remaining area. */
export function fit(bounds: Bounds, viewport: Size, insets: Insets): Camera {
  const availableW = Math.max(viewport.width - insets.left - insets.right, 1);
  const availableH = Math.max(viewport.height - insets.top - insets.bottom, 1);
  const scale = Math.min(availableW / bounds.width, availableH / bounds.height);
  const w = viewport.width / scale;
  // The area's centre is offset from the viewport centre; shift the camera to match.
  const offsetX = (insets.left - insets.right) / 2 / scale;
  const offsetY = (insets.top - insets.bottom) / 2 / scale;
  return {
    x: bounds.x + bounds.width / 2 - offsetX,
    y: bounds.y + bounds.height / 2 - offsetY,
    w,
  };
}

export function scaleOf(camera: Camera, viewport: Size): number {
  return viewport.width / camera.w;
}

export function viewBox(camera: Camera, viewport: Size): string {
  const h = camera.w * (viewport.height / viewport.width);
  return `${camera.x - camera.w / 2} ${camera.y - h / 2} ${camera.w} ${h}`;
}

export function project(point: Point, camera: Camera, viewport: Size): Point {
  const s = scaleOf(camera, viewport);
  return {
    x: (point.x - camera.x) * s + viewport.width / 2,
    y: (point.y - camera.y) * s + viewport.height / 2,
  };
}

export function unproject(point: Point, camera: Camera, viewport: Size): Point {
  const s = scaleOf(camera, viewport);
  return {
    x: (point.x - viewport.width / 2) / s + camera.x,
    y: (point.y - viewport.height / 2) / s + camera.y,
  };
}

/**
 * Interpolates two cameras. Zoom is interpolated in log space so the zoom rate feels
 * constant, and the centre follows the zoom so the target stays steady on screen.
 */
export function lerpCamera(a: Camera, b: Camera, t: number): Camera {
  const w = Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * t);
  // Weight the centre by how far the zoom has progressed, not by time.
  const zoomT = a.w === b.w ? t : (a.w - w) / (a.w - b.w);
  const k = Number.isFinite(zoomT) ? zoomT : t;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, w };
}
