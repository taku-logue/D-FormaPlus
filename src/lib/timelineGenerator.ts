import {
  DFormaData,
  PositionData,
  Movement,
  TimelineFrame,
  Position,
} from "../types";
import { checkCollision, isBackstage } from "../utils/geometry";
import { formatTimeError } from "../utils/timeFormat";
import { ShapeLibrary } from "./shapes";

export function generateTimeline(parsedData: DFormaData) {
  if (!parsedData || parsedData.frames.length === 0) {
    return { timeline: [], maxTime: 0, semanticErrors: [] };
  }

  const bpm = parsedData.bpm || 120;
  const parseTime = (id: string) => {
    if (parsedData.mode === "measure") {
      let m = 1,
        b = 1;
      if (id.includes(":")) [m, b] = id.split(":").map(Number);
      else m = parseFloat(id);
      const totalBeats = (m - 1) * 4 + (b - 1);
      return totalBeats * (60 / bpm);
    } else {
      if (id.includes(":")) {
        const [min, sec] = id.split(":").map(Number);
        return min * 60 + sec;
      }
      return parseFloat(id);
    }
  };

  const sortedFrames = [...parsedData.frames].sort(
    (a, b) => parseTime(a.id) - parseTime(b.id),
  );
  const initialPositions: Record<string, Position> = {};
  const newSemanticErrors: string[] = [];

  sortedFrames.forEach((frame) => {
    try {
      if (frame.shapes) {
        frame.shapes.forEach((shapeData) => {
          const calculated = ShapeLibrary[shapeData.type](
            parsedData.members,
            shapeData.params,
            shapeData.origin,
          );
          calculated.forEach((p) => {
            if (!initialPositions[p.name])
              initialPositions[p.name] = { ...p.position };
          });
        });
      } else if (frame.positions) {
        frame.positions.forEach((p) => {
          if (!initialPositions[p.name])
            initialPositions[p.name] = { ...p.position };
        });
      }
    } catch (e: any) {
      newSemanticErrors.push(`[初期配置] ${e.message}`);
    }
  });

  const timeline: TimelineFrame[] = [];
  const currentState: Record<string, PositionData> = {};
  let mTime = 0;
  let lastTime = 0;

  parsedData.members.forEach((m) => {
    currentState[m] = {
      name: m,
      position: initialPositions[m] || { x: 0, y: 0 },
    };
  });

  sortedFrames.forEach((frame) => {
    const t = parseTime(frame.id);
    mTime = Math.max(mTime, t);

    const targetPositions: Record<string, PositionData> = {};
    try {
      if (frame.shapes) {
        frame.shapes.forEach((shapeData) => {
          const calculatedPositions = ShapeLibrary[shapeData.type](
            parsedData.members,
            shapeData.params,
            shapeData.origin,
          );
          calculatedPositions.forEach((p) => {
            targetPositions[p.name] = { ...p };
          });
        });
      } else if (frame.positions) {
        frame.positions.forEach((p) => {
          targetPositions[p.name] = { ...p };
        });
      }
    } catch (e: any) {
      newSemanticErrors.push(
        `[${formatTimeError(t, parsedData)}] Shape生成エラー: ${e.message}`,
      );
    }

    parsedData.members.forEach((m) => {
      if (!targetPositions[m] && currentState[m])
        targetPositions[m] = { ...currentState[m] };
    });

    const movements: Record<string, Movement> = {};
    parsedData.members.forEach((m) => {
      const startPos = currentState[m]?.position || { x: 0, y: 0 };
      const endPos = targetPositions[m]?.position || startPos;
      movements[m] = {
        start: { x: startPos.x, y: startPos.y },
        end: { x: endPos.x, y: endPos.y },
      };
    });

    let moveDuration = Math.max(0, t - lastTime);
    if (frame.transition !== undefined && frame.transition !== null) {
      moveDuration =
        parsedData.mode === "measure"
          ? frame.transition * (60 / bpm)
          : frame.transition;
    }

    const members = parsedData.members;

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const p1 = targetPositions[members[i]]?.position;
        const p2 = targetPositions[members[j]]?.position;
        if (p1 && p2 && !isBackstage(p1) && !isBackstage(p2)) {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 0.48)
            newSemanticErrors.push(
              `[${formatTimeError(t, parsedData)}] 配置被り: ${members[i]} と ${members[j]}`,
            );
        }
      }
    }

    members.forEach((m) => {
      const move = movements[m];
      if (
        moveDuration === 0 ||
        isBackstage(move.start) ||
        isBackstage(move.end)
      )
        return;
      const speed =
        Math.hypot(move.end.x - move.start.x, move.end.y - move.start.y) /
        moveDuration;
      if (speed > 3)
        newSemanticErrors.push(
          `[${formatTimeError(t, parsedData)}] 速度超過: ${m} (${speed.toFixed(1)}m/s)`,
        );
    });

    const BASE_EVADE = 0.6;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const m1 = members[i],
          m2 = members[j];
        const move1 = movements[m1],
          move2 = movements[m2];
        if (
          moveDuration === 0 ||
          isBackstage(move1.start) ||
          isBackstage(move1.end) ||
          isBackstage(move2.start) ||
          isBackstage(move2.end)
        )
          continue;

        const isM1Moving =
          move1.start.x !== move1.end.x || move1.start.y !== move1.end.y;
        const isM2Moving =
          move2.start.x !== move2.end.x || move2.start.y !== move2.end.y;
        if (!isM1Moving && !isM2Moving) continue;

        if (
          checkCollision(move1.start, move1.end, move2.start, move2.end, 0.6)
        ) {
          let evade1 = BASE_EVADE,
            evade2 = BASE_EVADE;
          if (!isM1Moving) evade2 *= 2;
          if (!isM2Moving) evade1 *= 2;

          const len1 =
            Math.hypot(
              move1.end.x - move1.start.x,
              move1.end.y - move1.start.y,
            ) || 1;
          const n1 = {
            x: -(move1.end.y - move1.start.y) / len1,
            y: (move1.end.x - move1.start.x) / len1,
          };
          const len2 =
            Math.hypot(
              move2.end.x - move2.start.x,
              move2.end.y - move2.start.y,
            ) || 1;
          const n2 = {
            x: -(move2.end.y - move2.start.y) / len2,
            y: (move2.end.x - move2.start.x) / len2,
          };
          const mid1 = {
            x: (move1.start.x + move1.end.x) / 2,
            y: (move1.start.y + move1.end.y) / 2,
          };
          const mid2 = {
            x: (move2.start.x + move2.end.x) / 2,
            y: (move2.start.y + move2.end.y) / 2,
          };

          if (!movements[m1].control && isM1Moving)
            movements[m1].control = {
              x: mid1.x + n1.x * evade1,
              y: mid1.y + n1.y * evade1,
            };
          if (!movements[m2].control && isM2Moving)
            movements[m2].control = {
              x: mid2.x + n2.x * evade2,
              y: mid2.y + n2.y * evade2,
            };
        }
      }
    }

    timeline.push({
      endTime: t,
      startTime: t - moveDuration,
      duration: moveDuration,
      movements,
      sectionName: frame.sectionName,
      songName: frame.songName,
    });
    parsedData.members.forEach((m) => {
      if (targetPositions[m]) currentState[m] = { ...targetPositions[m] };
    });
    lastTime = t;
  });

  return { timeline, maxTime: mTime, semanticErrors: newSemanticErrors };
}
