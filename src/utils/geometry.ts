import { Position } from "../types";

// 衝突回避関数
export const checkCollision = (
  start1: Position,
  end1: Position,
  start2: Position,
  end2: Position,
  threshold = 0.45,
) => {
  // 速度ベクトル
  const v1x = end1.x - start1.x;
  const v1y = end1.y - start1.y;
  const v2x = end2.x - start2.x;
  const v2y = end2.y - start2.y;
  // 相対位置ベクトル
  const dpx = start1.x - start2.x;
  const dpy = start1.y - start2.y;
  // 相対速度ベクトル
  const dvx = v1x - v2x;
  const dvy = v1y - v2y;
  // 相対速度大きさの2乗
  const a = dvx * dvx + dvy * dvy;
  // 初期位置での距離の2乗
  const c = dpx * dpx + dpy * dpy;
  const EPSILON = 0.001;
  const safeThreshold = threshold - EPSILON;
  if (a === 0) return Math.sqrt(c) < safeThreshold;
  const b = 2 * (dpx * dvx + dpy * dvy);
  let t = -b / (2 * a);
  t = Math.max(0, Math.min(1, t));
  return a * t * t + b * t + c < safeThreshold * safeThreshold;
};

// ステージ外判定関数
export const isBackstage = (p: Position) =>
  p.x < -10 || p.x > 10 || p.y < -9 || p.y > 3;
