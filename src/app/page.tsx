"use client";
import { useState, useEffect, useCallback } from "react";
import EditorPanel from "../components/EditorPanel";
import StageViewer from "../components/StageViewer";

import { calculateCurrentPositions } from "../lib/positionCalculator";
import { formatTimeUI } from "../utils/timeFormat";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer";
import { usePlaybackSync } from "../hooks/usePlaybackSync";
// 🌟 先ほど作成した最強のシミュレーション計算フック
import { useDFormaSimulation } from "../hooks/useDFormaSimulation";

export default function EditorApp() {
  // === 1. 唯一の「入力」ステート ===
  const [fileName, setFileName] = useState("ファイルが選択されていません");
  const [fileContent, setFileContent] = useState("");

  // === 2. カスタムフック群（処理の委譲） ===
  // テキストが変わるたびに、裏で1回だけパースとタイムライン計算が走る（useEffect不要！）
  const {
    parsedData,
    richTimeline,
    maxTime,
    syntaxError,
    semanticErrors,
    videoId,
  } = useDFormaSimulation(fileContent);

  const { youtubePlayer, isPlaying, setIsPlaying } = useYouTubePlayer(videoId);
  const { currentTime, setCurrentTime, handleSeek } = usePlaybackSync(
    youtubePlayer,
    isPlaying,
    parsedData?.offset || 0,
  );

  // === 3. 副作用（リセット処理） ===
  // 新しいファイルが読み込まれたら、時間をゼロに戻して一時停止する
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [parsedData, setCurrentTime, setIsPlaying]);

  // === 4. イベントハンドラ ===
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => setFileContent(e.target?.result as string);
      reader.readAsText(file);
    },
    [],
  );

  const handleCopyOffset = useCallback(() => {
    if (youtubePlayer && typeof youtubePlayer.getCurrentTime === "function") {
      const time = youtubePlayer.getCurrentTime();
      navigator.clipboard.writeText(`offset ${time.toFixed(3)}`).then(() => {
        alert(`コピー完了！\n【コピー内容】\noffset ${time.toFixed(3)}`);
      });
    } else {
      alert("YouTubeの再生が始まっていません！");
    }
  }, [youtubePlayer]);

  // === 5. UI用データの算出 ===
  const currentPositions = calculateCurrentPositions(
    parsedData,
    richTimeline,
    currentTime,
  );
  const currentFrameObj = [...richTimeline]
    .reverse()
    .find((f) => f.endTime <= currentTime);

  // === 6. レンダリング ===
  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white font-sans overflow-hidden">
      <header className="flex items-center px-4 py-2 bg-[#111] border-b border-[#333] flex-none">
        <div className="flex items-center gap-3">
          <div className="bg-[#c242f5] text-white font-bold w-7 h-7 flex items-center justify-center rounded text-xs">
            IF
          </div>
          <h1 className="text-sm font-semibold tracking-wide text-gray-200">
            D-Forma+ Editor
          </h1>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <EditorPanel
          fileName={fileName}
          fileContent={fileContent}
          errorMsg={syntaxError} // フックからそのまま渡す
          semanticErrors={semanticErrors} // フックからそのまま渡す
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
          formatTimeUI={(t) => formatTimeUI(t, parsedData)}
          currentFrameObj={currentFrameObj}
          parsedData={parsedData}
          getCurrentPositions={() => currentPositions}
        />
      </main>
    </div>
  );
}
