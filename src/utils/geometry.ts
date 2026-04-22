import { Position } from "../types";

export const checkCollision = (
  start1: Position,
  end1: Position,
  start2: Position,
  end2: Position,
  threshold = 0.6,
) => {
  const v1x = end1.x - start1.x;
  const v1y = end1.y - start1.y;
  const v2x = end2.x - start2.x;
  const v2y = end2.y - start2.y;
  const dpx = start1.x - start2.x;
  const dpy = start1.y - start2.y;
  const dvx = v1x - v2x;
  const dvy = v1y - v2y;
  const a = dvx * dvx + dvy * dvy;
  const c = dpx * dpx + dpy * dpy;
  if (a === 0) return Math.sqrt(c) < threshold;
  const b = 2 * (dpx * dvx + dpy * dvy);
  let t = -b / (2 * a);
  t = Math.max(0, Math.min(1, t));
  return a * t * t + b * t + c < threshold * threshold;
};

export const isBackstage = (p: Position) =>
  p.x < -8 || p.x > 8 || p.y < -5 || p.y > 5;
