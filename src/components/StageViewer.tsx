import React from "react";

interface StageViewerProps {
  videoId: string;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  currentTime: number;
  maxTime: number;
  handleSeek: (e: React.FormEvent<HTMLInputElement>) => void;
  handleCopyOffset: () => void;
  formatTimeUI: (seconds: number) => string;
  currentFrameObj: any;
  parsedData: any;
  getCurrentPositions: () => any[];
}

export default function StageViewer({
  videoId,
  isPlaying,
  setIsPlaying,
  currentTime,
  maxTime,
  handleSeek,
  handleCopyOffset,
  formatTimeUI,
  currentFrameObj,
  parsedData,
  getCurrentPositions,
}: StageViewerProps) {
  // ステージ描画用の定数
  const REAL_WIDTH = 15;
  const REAL_HEIGHT = 8;
  const DOT_RADIUS = 0.25;
  const SCALE = 50;
  const VIEW_WIDTH = 850;
  const VIEW_HEIGHT = 500;
  const CENTER_X = VIEW_WIDTH / 2;
  const CENTER_Y = VIEW_HEIGHT / 2;

  return (
    <section className="w-[55%] flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* YouTube プレビュー */}
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

      {/* コントロールバー */}
      <div className="flex-none flex items-center px-4 py-1.5 border-b border-[#333] bg-[#1e1e1e] gap-4 z-20 shadow-md">
        <div className="flex items-center gap-2 text-gray-400 font-bold tracking-widest text-[10px] w-32">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <line x1="12" y1="2" x2="12" y2="7"></line>
            <line x1="12" y1="17" x2="12" y2="22"></line>
            <line x1="2" y1="12" x2="7" y2="12"></line>
            <line x1="17" y1="12" x2="22" y2="12"></line>
          </svg>
          STAGE PREVIEW
        </div>

        <div className="flex items-center gap-2 border-l border-r border-[#444] px-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-8 h-8 flex items-center justify-center rounded text-white transition-colors ${isPlaying ? "bg-[#ff4757] hover:bg-[#ff6b81]" : "bg-[#2ed573] hover:bg-[#7bed9f]"}`}
          >
            {isPlaying ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>

          <button
            onClick={handleCopyOffset}
            title="今の時間をOffsetとしてコピー"
            className="w-8 h-8 flex items-center justify-center bg-[#333] hover:bg-[#444] rounded text-white transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>
        </div>

        <div className="text-[13px] font-mono w-24 text-center text-gray-200 tracking-wider">
          {formatTimeUI(currentTime)}
        </div>

        <div className="flex-1 flex items-center relative h-5">
          <input
            type="range"
            min="0"
            max={maxTime || 1}
            step="0.001"
            value={currentTime}
            onInput={handleSeek}
            className="absolute w-full h-1 z-10 opacity-0 cursor-pointer"
          />
          <div className="absolute w-full h-1 bg-[#333] rounded-full pointer-events-none"></div>
          <div
            className="absolute h-1 bg-[#c242f5] rounded-full pointer-events-none"
            style={{
              width: `${maxTime > 0 ? (currentTime / maxTime) * 100 : 0}%`,
            }}
          ></div>
          <div
            className="absolute w-3 h-3 bg-[#c242f5] rounded-full shadow-[0_0_8px_#c242f5] pointer-events-none"
            style={{
              left: `${maxTime > 0 ? (currentTime / maxTime) * 100 : 0}%`,
              transform: "translateX(-50%)",
            }}
          ></div>
        </div>

        <div className="w-48 text-right text-[11px] font-bold text-[#00d2ff] truncate">
          {currentFrameObj?.songName ? `🎵 ${currentFrameObj.songName}` : ""}
          {currentFrameObj?.sectionName
            ? ` [${currentFrameObj.sectionName}]`
            : ""}
        </div>
      </div>

      {/* ステージビューア */}
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

            {getCurrentPositions().map((member: any) => {
              if (!member || !member.position) return null;
              const mIdx = parsedData?.members?.indexOf(member.name) ?? -1;
              const color =
                mIdx !== -1 && parsedData?.colors?.[mIdx]
                  ? parsedData.colors[mIdx]
                  : "#8e44ad";

              return (
                <g
                  key={member.name}
                  transform={`translate(${CENTER_X + member.position.x * SCALE}, ${CENTER_Y - member.position.y * SCALE})`}
                  /* 🌟 バグの原因だった className="transition-transform duration-75" を削除しました！ */
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
