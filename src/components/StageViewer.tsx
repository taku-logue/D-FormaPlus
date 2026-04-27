import React, { useMemo } from "react";
import { DFormaData, PositionData, TimelineFrame } from "../types";
import ControlBar from "./ControlBar";

// Propsの型定義
interface StageViewerProps {
  videoId: string;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  currentTime: number;
  maxTime: number;
  minTime: number;
  handleSeek: (e: React.FormEvent<HTMLInputElement>) => void;
  handleCopyOffset: () => void;
  formatTimeUI: (seconds: number) => string;
  currentFrameObj: TimelineFrame | undefined;
  parsedData: DFormaData | null;
  getCurrentPositions: () => PositionData[];
}

export default function StageViewer(props: StageViewerProps) {
  const { videoId, parsedData, getCurrentPositions } = props;

  // ステージの大きさ
  const X_MIN = -10;
  const X_MAX = 10;
  const Y_MIN = -9;
  const Y_MAX = 3;

  const SCALE = 40;
  const MARGIN = 40;

  const VIEW_WIDTH = (X_MAX - X_MIN) * SCALE + MARGIN * 2;
  const VIEW_HEIGHT = (Y_MAX - Y_MIN) * SCALE + MARGIN * 2;

  const CENTER_X = MARGIN + Math.abs(X_MIN) * SCALE;
  const CENTER_Y = MARGIN + Math.abs(Y_MIN) * SCALE;

  const DOT_RADIUS = 0.25;

  // 座標クリック機能
  const handleStageClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgP = pt.matrixTransform(ctm.inverse());

    const rawX = (svgP.x - CENTER_X) / SCALE;
    const rawY = (svgP.y - CENTER_Y) / SCALE;

    const snappedX = Math.round(rawX * 2) / 2;
    const snappedY = Math.round(rawY * 2) / 2;

    const coordText = `(${snappedX}, ${snappedY})`;
    navigator.clipboard.writeText(coordText).then(() => {
      alert(`座標 ${coordText} をコピーしました！`);
    });
  };

  // メンバーカラー
  const memberColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (parsedData?.members) {
      parsedData.members.forEach((name, idx) => {
        map[name] = parsedData.colors?.[idx] || "#8e44ad";
      });
    }
    return map;
  }, [parsedData]);

  return (
    <section className="w-[55%] flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* YouTube動画エリア */}
      <div className="flex-[1.1] min-h-0 p-2 border-b border-[#333] flex justify-center items-center bg-[#151515]">
        <div className="w-full h-full max-h-full max-w-[calc(100vh*16/9)] aspect-video bg-black flex flex-col items-center justify-center border border-[#333] rounded-lg shadow-2xl relative overflow-hidden text-gray-400">
          <div
            id="youtube-wrapper"
            className="absolute inset-0 w-full h-full z-10"
            style={{ display: videoId ? "block" : "none" }}
          ></div>
          {!videoId && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-4"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span className="text-xl font-medium tracking-wider">
                YouTube動画が読み込まれていません
              </span>
            </div>
          )}
        </div>
      </div>

      {/* コントロールバー */}
      <ControlBar {...props} />

      {/* ステージ */}
      <div className="flex-[1.3] min-h-0 p-2 flex justify-center items-center bg-[#0f0f0f] relative">
        <div className="w-full h-full max-h-full max-w-[calc(100vh*16/9)] aspect-video border border-[#333] rounded-xl relative overflow-hidden bg-[#1a1a1a] shadow-2xl">
          <svg
            onClick={handleStageClick}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* 縦のグリッド線（X軸の線） */}
            {Array.from({ length: X_MAX - X_MIN + 1 }).map((_, i) => {
              const val = X_MIN + i; // -10 〜 10 に固定！
              const x = CENTER_X + val * SCALE;
              const yStart = CENTER_Y + Y_MIN * SCALE;
              const yEnd = CENTER_Y + Y_MAX * SCALE;
              return (
                <g key={`v-${i}`}>
                  <line
                    x1={x}
                    y1={yStart}
                    x2={x}
                    y2={yEnd}
                    stroke="#333"
                    strokeWidth={val === 0 ? 2 : 1}
                  />
                  {val !== 0 && (
                    <text
                      x={x + 4}
                      y={CENTER_Y - 4}
                      fill="#555"
                      fontSize="10"
                      className="select-none"
                    >
                      {val}
                    </text>
                  )}
                </g>
              );
            })}

            {/* 横のグリッド線（Y軸の線） */}
            {Array.from({ length: Y_MAX - Y_MIN + 1 }).map((_, i) => {
              const val = Y_MIN + i;
              const y = CENTER_Y + val * SCALE;
              const xStart = CENTER_X + X_MIN * SCALE;
              const xEnd = CENTER_X + X_MAX * SCALE;
              return (
                <g key={`h-${i}`}>
                  <line
                    x1={xStart}
                    y1={y}
                    x2={xEnd}
                    y2={y}
                    stroke="#333"
                    strokeWidth={val === 0 ? 2 : 1}
                  />
                  {val !== 0 && (
                    <text
                      x={CENTER_X + 4}
                      y={y - 4}
                      fill="#555"
                      fontSize="10"
                      className="select-none"
                    >
                      {val}
                    </text>
                  )}
                </g>
              );
            })}

            {/* センターマーク */}
            <circle cx={CENTER_X} cy={CENTER_Y} r="4" fill="#666" />

            {/* メンバーの描写 */}
            {getCurrentPositions().map((member) => {
              if (!member || !member.position) return null;
              const color = memberColorMap[member.name] || "#8e44ad";
              return (
                <g
                  key={member.name}
                  transform={`translate(${CENTER_X + member.position.x * SCALE}, ${CENTER_Y + member.position.y * SCALE})`}
                >
                  <circle
                    r={DOT_RADIUS * SCALE}
                    fill={color}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                    style={{ filter: `drop-shadow(0 0 10px ${color})` }}
                  />
                  <text
                    y={-(DOT_RADIUS * SCALE) - 8}
                    fill="#ccc"
                    textAnchor="middle"
                    fontSize="11"
                    className="font-sans font-semibold tracking-wide select-none"
                  >
                    {member.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
