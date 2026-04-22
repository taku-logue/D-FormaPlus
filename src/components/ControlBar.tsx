import React from "react";
import { TimelineFrame } from "../types";

interface ControlBarProps {
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  currentTime: number;
  maxTime: number;
  handleSeek: (e: React.FormEvent<HTMLInputElement>) => void;
  handleCopyOffset: () => void;
  formatTimeUI: (seconds: number) => string;
  currentFrameObj: TimelineFrame | undefined;
}

export default function ControlBar({
  isPlaying,
  setIsPlaying,
  currentTime,
  maxTime,
  handleSeek,
  handleCopyOffset,
  formatTimeUI,
  currentFrameObj,
}: ControlBarProps) {
  return (
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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
  );
}
