import React, { useMemo } from "react";
import { DFormaData, PositionData, TimelineFrame } from "../types";
import ControlBar from "./ControlBar"; // 🌟 分離したコンポーネントをインポート

interface StageViewerProps {
  videoId: string;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  currentTime: number;
  maxTime: number;
  handleSeek: (e: React.FormEvent<HTMLInputElement>) => void;
  handleCopyOffset: () => void;
  formatTimeUI: (seconds: number) => string;
  currentFrameObj: TimelineFrame | undefined;
  parsedData: DFormaData | null;
  getCurrentPositions: () => PositionData[];
}

export default function StageViewer(props: StageViewerProps) {
  const { videoId, parsedData, getCurrentPositions } = props;

  const REAL_WIDTH = 15;
  const REAL_HEIGHT = 8;
  const DOT_RADIUS = 0.25;
  const SCALE = 50;
  const VIEW_WIDTH = 850;
  const VIEW_HEIGHT = 500;
  const CENTER_X = VIEW_WIDTH / 2;
  const CENTER_Y = VIEW_HEIGHT / 2;

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
      {/* YouTube Preview */}
      <div className="flex-[1.1] min-h-0 p-2 border-b border-[#333] flex justify-center items-center bg-[#151515]">
        <div className="w-full h-full max-h-full max-w-[calc(100vh*16/9)] aspect-video bg-black flex flex-col items-center justify-center border border-[#333] rounded-lg shadow-2xl relative overflow-hidden text-gray-400">
          {videoId ? (
            <div
              id="youtube-player-container"
              className="absolute inset-0 w-full h-full"
            ></div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* 🌟 外部化した ControlBar を配置 */}
      <ControlBar
        isPlaying={props.isPlaying}
        setIsPlaying={props.setIsPlaying}
        currentTime={props.currentTime}
        maxTime={props.maxTime}
        handleSeek={props.handleSeek}
        handleCopyOffset={props.handleCopyOffset}
        formatTimeUI={props.formatTimeUI}
        currentFrameObj={props.currentFrameObj}
      />

      {/* Stage Viewer (SVG) */}
      <div className="flex-[1.3] min-h-0 p-2 flex justify-center items-center bg-[#0f0f0f] relative">
        <div className="w-full h-full max-h-full max-w-[calc(100vh*16/9)] aspect-video border border-[#333] rounded-xl relative overflow-hidden bg-[#1a1a1a] shadow-2xl">
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="absolute inset-0 w-full h-full"
          >
            {Array.from({ length: REAL_WIDTH + 1 }).map((_, i) => {
              const x = CENTER_X - (REAL_WIDTH / 2) * SCALE + i * SCALE;
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1={CENTER_Y - (REAL_HEIGHT / 2) * SCALE}
                  x2={x}
                  y2={CENTER_Y + (REAL_HEIGHT / 2) * SCALE}
                  stroke="#333"
                  strokeWidth={i === REAL_WIDTH / 2 ? 2 : 1}
                />
              );
            })}
            {Array.from({ length: REAL_HEIGHT + 1 }).map((_, i) => {
              const y = CENTER_Y - (REAL_HEIGHT / 2) * SCALE + i * SCALE;
              return (
                <line
                  key={`h-${i}`}
                  x1={CENTER_X - (REAL_WIDTH / 2) * SCALE}
                  y1={y}
                  x2={CENTER_X + (REAL_WIDTH / 2) * SCALE}
                  y2={y}
                  stroke="#333"
                  strokeWidth={i === REAL_HEIGHT / 2 ? 2 : 1}
                />
              );
            })}
            <circle cx={CENTER_X} cy={CENTER_Y} r="4" fill="#666" />

            {getCurrentPositions().map((member) => {
              if (!member || !member.position) return null;
              const color = memberColorMap[member.name] || "#8e44ad";
              return (
                <g
                  key={member.name}
                  transform={`translate(${CENTER_X + member.position.x * SCALE}, ${CENTER_Y - member.position.y * SCALE})`}
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
