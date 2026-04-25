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
  const REAL_WIDTH = 16; // 横16m
  const REAL_HEIGHT = 8; // 縦8m
  const SCALE = 50; // 1m = 50px
  const VIEW_WIDTH = 800; // 16:9の横
  const VIEW_HEIGHT = 450; // 16:9の縦
  const CENTER_X = VIEW_WIDTH / 2; // 400
  const CENTER_Y = VIEW_HEIGHT / 2; // 225
  const DOT_RADIUS = 0.25;

  // 2. 座標クリック機能
  const handleStageClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;

    // SVGが持つ座標変換のための仮想ポイントを作成
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    // 画面全体とSVGのズレ・縮尺の変換マトリクスを取得
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgP = pt.matrixTransform(ctm.inverse());

    // 正確に逆変換された座標を使って、中心からの距離を計算
    const rawX = (svgP.x - CENTER_X) / SCALE;
    const rawY = (svgP.y - CENTER_Y) / SCALE;

    // 0.5刻みにスナップ（丸める）
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

          {/* videoIdがない時用のプレースホルダー */}
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

      {/* ステージ */}
      <div className="flex-[1.3] min-h-0 p-2 flex justify-center items-center bg-[#0f0f0f] relative">
        <div className="w-full h-full max-h-full max-w-[calc(100vh*16/9)] aspect-video border border-[#333] rounded-xl relative overflow-hidden bg-[#1a1a1a] shadow-2xl">
          <svg
            onClick={handleStageClick}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="absolute inset-0 w-full h-full cursor-crosshair"
          >
            {/* 縦のグリッド線 */}
            {Array.from({ length: REAL_WIDTH + 1 }).map((_, i) => {
              const val = i - REAL_WIDTH / 2;
              const x = CENTER_X + val * SCALE;
              const yStart = CENTER_Y - (REAL_HEIGHT / 2) * SCALE;
              const yEnd = CENTER_Y + (REAL_HEIGHT / 2) * SCALE;
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
            {/* 横のグリッド線 */}
            {Array.from({ length: REAL_HEIGHT + 1 }).map((_, i) => {
              const val = i - REAL_HEIGHT / 2;
              const y = CENTER_Y + val * SCALE;
              const xStart = CENTER_X - (REAL_WIDTH / 2) * SCALE;
              const xEnd = CENTER_X + (REAL_WIDTH / 2) * SCALE;
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
                  {/* 丸 */}
                  <circle
                    r={DOT_RADIUS * SCALE}
                    fill={color}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                    style={{ filter: `drop-shadow(0 0 10px ${color})` }}
                  />
                  {/* 名前 */}
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
