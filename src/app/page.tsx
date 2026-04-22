"use client";
import { useState, useEffect } from "react";
import EditorPanel from "../components/EditorPanel";
import StageViewer from "../components/StageViewer";

import { DFormaData, PositionData } from "../types";
import { parseDForma } from "../lib/dformaParser";

// ShapeLibrary
const ShapeLibrary: Record<string, Function> = {
  line: (members: string[], params: any, origin: { x: number; y: number }) => {
    const spacing = params.spacing !== undefined ? params.spacing : 2;
    const order: number[] = params.order || members.map((_, i) => i + 1);
    let angleDeg = 0;
    if (params.angle !== undefined) {
      if (params.angle === "vertical") angleDeg = 90;
      else if (params.angle === "horizontal") angleDeg = 0;
      else if (typeof params.angle === "number") angleDeg = params.angle;
    }
    const rad = angleDeg * (Math.PI / 180);
    const result: PositionData[] = [];
    const count = order.length;
    order.forEach((memberIndex, i) => {
      const name = members[memberIndex - 1];
      if (!name) return;
      const distance = (i - (count - 1) / 2) * spacing;
      const offsetX = distance * Math.cos(rad);
      const offsetY = -distance * Math.sin(rad);
      result.push({
        name,
        position: { x: origin.x + offsetX, y: origin.y + offsetY },
      });
    });
    return result;
  },
};

export default function EditorApp() {
  const [fileName, setFileName] = useState("ファイルが選択されていません");
  const [fileContent, setFileContent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [semanticErrors, setSemanticErrors] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<DFormaData | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [richTimeline, setRichTimeline] = useState<any[]>([]);

  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [videoId, setVideoId] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setFileContent(e.target?.result as string);
    reader.readAsText(file);
  };

  useEffect(() => {
    if (!fileContent) return;
    try {
      const data = parseDForma(fileContent);
      setParsedData(data);
      setErrorMsg("");
      setSemanticErrors([]);

      if (data.youtube) {
        setVideoId(
          data.youtube
            .replace(/^"|"$/g, "")
            .match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1] || "",
        );
      } else {
        setVideoId("");
      }
    } catch (err: any) {
      setErrorMsg("文法エラー: " + err.message);
      setParsedData(null);
      setSemanticErrors([]);
    }
  }, [fileContent]);

  const checkCollision = (
    start1: any,
    end1: any,
    start2: any,
    end2: any,
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

  const formatTimeStr = (seconds: number) => {
    if (parsedData?.mode === "measure") {
      const bpm = parsedData.bpm || 120;
      const totalBeats = seconds / (60 / bpm);
      const m = Math.floor(totalBeats / 4) + 1;
      const b = (totalBeats % 4) + 1;
      return `M${m}:B${b.toFixed(1).replace(".0", "")}`;
    }
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!parsedData || parsedData.frames.length === 0) return;
    const bpm = parsedData.bpm || 120;

    const parseTime = (id: string) => {
      if (parsedData.mode === "measure") {
        let m = 1,
          b = 1;
        if (id.includes(":")) {
          [m, b] = id.split(":").map(Number);
        } else {
          m = parseFloat(id);
        }
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
    const initialPositions: Record<string, { x: number; y: number }> = {};

    sortedFrames.forEach((frame) => {
      if (frame.shapes) {
        frame.shapes.forEach((shapeData: any) => {
          const calculated = ShapeLibrary[shapeData.type](
            parsedData.members,
            shapeData.params,
            shapeData.origin,
          );
          calculated.forEach((p: PositionData) => {
            if (!initialPositions[p.name])
              initialPositions[p.name] = { ...p.position };
          });
        });
      } else if (frame.positions) {
        frame.positions.forEach((p: any) => {
          if (!initialPositions[p.name])
            initialPositions[p.name] = { ...p.position };
        });
      }
    });

    const timeline: any[] = [];
    const currentState: Record<string, PositionData> = {};
    let mTime = 0;
    let lastTime = 0;
    const newSemanticErrors: string[] = [];

    const isBackstage = (p: { x: number; y: number }) =>
      p.x < -8 || p.x > 8 || p.y < -5 || p.y > 5;

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
      if (frame.shapes) {
        frame.shapes.forEach((shapeData: any) => {
          const calculatedPositions = ShapeLibrary[shapeData.type](
            parsedData.members,
            shapeData.params,
            shapeData.origin,
          );
          calculatedPositions.forEach((p: PositionData) => {
            targetPositions[p.name] = { ...p };
          });
        });
      } else if (frame.positions) {
        frame.positions.forEach((p: any) => {
          targetPositions[p.name] = { ...p };
        });
      }
      parsedData.members.forEach((m) => {
        if (!targetPositions[m] && currentState[m])
          targetPositions[m] = { ...currentState[m] };
      });

      const movements: Record<string, any> = {};
      parsedData.members.forEach((m) => {
        const startPos = currentState[m]?.position || { x: 0, y: 0 };
        const endPos = targetPositions[m]?.position || startPos;
        // 🌟 参照バグを防ぐため、完全に独立した新しいオブジェクトとしてディープコピー
        movements[m] = {
          start: { x: startPos.x, y: startPos.y },
          end: { x: endPos.x, y: endPos.y },
        };
      });

      let moveDuration = t - lastTime;
      moveDuration = Math.max(0, moveDuration);

      if (frame.transition !== undefined && frame.transition !== null) {
        if (parsedData.mode === "measure")
          moveDuration = frame.transition * (60 / bpm);
        else moveDuration = frame.transition;
      }

      const members = parsedData.members;
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const p1 = targetPositions[members[i]]?.position;
          const p2 = targetPositions[members[j]]?.position;
          if (p1 && p2) {
            if (isBackstage(p1) || isBackstage(p2)) continue;
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 0.48) {
              newSemanticErrors.push(
                `[${formatTimeStr(t)}] 配置被り: ${members[i]} と ${members[j]} の最終位置が同じ場所です。`,
              );
            }
          }
        }
      }

      members.forEach((m) => {
        const move = movements[m];
        if (moveDuration === 0) return;
        if (isBackstage(move.start) || isBackstage(move.end)) return;
        const dist = Math.hypot(
          move.end.x - move.start.x,
          move.end.y - move.start.y,
        );
        const speed = dist / moveDuration;
        if (speed > 3) {
          newSemanticErrors.push(
            `[${formatTimeStr(t)}] 速度超過: ${m} の速度限界(3.0m/s)超過（${speed.toFixed(1)}m/s）。`,
          );
        }
      });

      const BASE_EVADE = 0.6;
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const m1 = members[i];
          const m2 = members[j];
          const move1 = movements[m1];
          const move2 = movements[m2];

          if (moveDuration === 0) continue;
          if (
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
            let evade1 = BASE_EVADE;
            let evade2 = BASE_EVADE;
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

    setSemanticErrors(newSemanticErrors);
    setRichTimeline(timeline);
    setMaxTime(mTime);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [parsedData]);

  useEffect(() => {
    if (!videoId) return;
    let player: any = null;
    const loadVideo = () => {
      const container = document.getElementById("youtube-player-container");
      if (container) container.innerHTML = "";
      player = new (window as any).YT.Player("youtube-player-container", {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          origin:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
        events: {
          onReady: (event: any) => setYoutubePlayer(event.target),
          onStateChange: (event: any) => {
            const state = (window as any).YT.PlayerState;
            if (event.data === state.PLAYING) setIsPlaying(true);
            else if (event.data === state.PAUSED) setIsPlaying(false);
          },
        },
      });
    };
    if (!(window as any).YT || !(window as any).YT.Player) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = loadVideo;
    } else loadVideo();
    return () => {
      if (player && typeof player.destroy === "function") player.destroy();
    };
  }, [videoId]);

  useEffect(() => {
    if (!youtubePlayer || typeof youtubePlayer.playVideo !== "function") return;
    if (isPlaying) youtubePlayer.playVideo();
    else youtubePlayer.pauseVideo();
  }, [isPlaying, youtubePlayer]);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      if (
        isPlaying &&
        youtubePlayer &&
        typeof youtubePlayer.getCurrentTime === "function"
      ) {
        const vTime = youtubePlayer.getCurrentTime();
        const offset = parsedData?.offset || 0;
        setCurrentTime(Math.max(0, vTime - offset));
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    if (isPlaying) animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, youtubePlayer, parsedData?.offset]);

  const getCurrentPositions = () => {
    if (richTimeline.length === 0 || !parsedData) return [];
    const easeInOut = (t: number) => {
      t = Math.max(0, Math.min(1, t));
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    };

    const result: any[] = [];
    parsedData.members.forEach((member) => {
      const nextIdx = richTimeline.findIndex((f) => f.endTime >= currentTime);

      if (nextIdx === -1) {
        result.push({
          name: member,
          position: richTimeline[richTimeline.length - 1].movements[member].end,
        });
        return;
      }

      const frame = richTimeline[nextIdx];
      const currentMove = frame.movements[member];

      if (currentTime <= frame.startTime) {
        result.push({ name: member, position: currentMove.start });
        return;
      }

      let progress = 1;
      if (frame.duration > 0) {
        progress = (currentTime - frame.startTime) / frame.duration;
      }
      const eased = easeInOut(progress);

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
          currentMove.start.x +
          (currentMove.end.x - currentMove.start.x) * eased;
        const y =
          currentMove.start.y +
          (currentMove.end.y - currentMove.start.y) * eased;
        result.push({ name: member, position: { x, y } });
      }
    });
    return result;
  };

  const handleSeek = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseFloat(e.currentTarget.value);
    setCurrentTime(val);
    if (youtubePlayer && typeof youtubePlayer.seekTo === "function") {
      const offset = parsedData?.offset || 0;
      youtubePlayer.seekTo(val + offset, true);
    }
  };

  const formatTimeUI = (seconds: number) => {
    if (parsedData?.mode === "measure") {
      const bpm = parsedData.bpm || 120;
      const totalBeats = seconds / (60 / bpm);
      const m = Math.floor(totalBeats / 4) + 1;
      const b = (totalBeats % 4) + 1;
      return `M${m} : B${b.toFixed(1).replace(".0", "")}`;
    }
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const handleCopyOffset = () => {
    if (youtubePlayer && typeof youtubePlayer.getCurrentTime === "function") {
      const currentVideoTime = youtubePlayer.getCurrentTime();
      const codeToCopy = `offset ${currentVideoTime.toFixed(3)}`;
      navigator.clipboard.writeText(codeToCopy).then(() => {
        alert(
          `コピー完了！\nエディタの mode の下に貼り付けてください。\n\n【コピー内容】\n${codeToCopy}`,
        );
      });
    } else {
      alert("YouTubeの再生が始まっていません！");
    }
  };

  const currentFrameObj = [...richTimeline]
    .reverse()
    .find((f) => f.endTime <= currentTime);

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white font-sans overflow-hidden">
      <header className="flex items-center px-4 py-2 bg-[#111] border-b border-[#333] flex-none">
        <div className="flex items-center gap-3">
          <div className="bg-[#c242f5] text-white font-bold w-7 h-7 flex items-center justify-center rounded text-xs">
            IF
          </div>
          <h1 className="text-sm font-semibold tracking-wide text-gray-200">
            IdolFormation Script Editor
          </h1>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <EditorPanel
          fileName={fileName}
          fileContent={fileContent}
          errorMsg={errorMsg}
          semanticErrors={semanticErrors}
          handleFileUpload={handleFileUpload}
        />
        <StageViewer
          videoId={videoId}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          currentTime={currentTime}
          maxTime={maxTime}
          handleSeek={handleSeek}
          handleCopyOffset={handleCopyOffset}
          formatTimeUI={formatTimeUI}
          currentFrameObj={currentFrameObj}
          parsedData={parsedData}
          getCurrentPositions={getCurrentPositions}
        />
      </main>
    </div>
  );
}
