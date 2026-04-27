import { DFormaData, TimelineFrame, PositionData } from "../types";

// イージング関数
const easeInOut = (t: number) => {
  t = Math.max(0, Math.min(1, t));
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

// 現在座標計算関数
export const calculateCurrentPositions = (
  parsedData: DFormaData | null,
  richTimeline: TimelineFrame[],
  currentTime: number,
): PositionData[] => {
  if (richTimeline.length === 0 || !parsedData) return [];

  const result: PositionData[] = [];
  parsedData.members.forEach((member) => {
    // 次のフレームを検索
    const nextIdx = richTimeline.findIndex((f) => f.endTime >= currentTime);

    if (nextIdx === -1) {
      result.push({
        name: member,
        position: richTimeline[richTimeline.length - 1].movements[member].end,
      });
      return;
    }

    // 時間に達していなかったら待機
    const frame = richTimeline[nextIdx];
    const currentMove = frame.movements[member];

    if (currentTime <= frame.startTime) {
      result.push({ name: member, position: currentMove.start });
      return;
    }

    // 進行度の計算
    const mDuration = currentMove.duration || 0;
    const progress =
      mDuration > 0
        ? Math.min(1, (currentTime - frame.startTime) / mDuration)
        : 1;
    const eased = easeInOut(progress);

    // 座標の計算
    if (currentMove.control) {
      const t = eased;
      const x =
        Math.pow(1 - t, 2) * currentMove.start.x +
        2 * (1 - t) * t * currentMove.control.x +
        Math.pow(t, 2) * currentMove.end.x;
      const y =
        Math.pow(1 - t, 2) * currentMove.start.y +
        2 * (1 - t) * t * currentMove.control.y +
        Math.pow(t, 2) * currentMove.end.y;
      result.push({ name: member, position: { x, y } });
    } else {
      const x =
        currentMove.start.x + (currentMove.end.x - currentMove.start.x) * eased;
      const y =
        currentMove.start.y + (currentMove.end.y - currentMove.start.y) * eased;
      result.push({ name: member, position: { x, y } });
    }
  });
  return result;
};
