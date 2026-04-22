"use client";
import { useState, useEffect, useCallback } from "react";
import EditorPanel from "../components/EditorPanel";
import StageViewer from "../components/StageViewer";

import { calculateCurrentPositions } from "../lib/positionCalculator";
import { formatTimeUI } from "../utils/timeFormat";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer";
import { usePlaybackSync } from "../hooks/usePlaybackSync";
import { useDFormaSimulation } from "../hooks/useDFormaSimulation";

export default function EditorApp() {
  const [fileName, setFileName] = useState("ファイルが選択されていません");
  const [fileContent, setFileContent] = useState(
    "// 左上の「ファイルを開く」から \n// D-Forma+のコードを読み込んでください。\n// もしくはここに直接コードを記述できます。",
  );

  // 🌟 フックから compile 関数を受け取る（fileContent は渡さない）
  const {
    parsedData,
    richTimeline,
    maxTime,
    syntaxError,
    semanticErrors,
    videoId,
    compile,
  } = useDFormaSimulation();

  const { youtubePlayer, isPlaying, setIsPlaying } = useYouTubePlayer(videoId);
  const { currentTime, setCurrentTime, handleSeek } = usePlaybackSync(
    youtubePlayer,
    isPlaying,
    parsedData?.offset || 0,
  );

  // 🌟 初期表示時に一度だけコンパイルを走らせる
  useEffect(() => {
    compile(fileContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // シミュレーションデータが更新されたら時間をリセット
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [parsedData, setCurrentTime, setIsPlaying]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text);
        compile(text); // 🌟 ファイルを読み込んだ瞬間に自動コンパイル
      };
      reader.readAsText(file);
    },
    [compile],
  );

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setFileContent(value);
        if (fileName === "ファイルが選択されていません")
          setFileName("unsaved.ifs");
        // 🌟 ここでは compile(value) を呼ばない！（手動実行にするため）
      }
    },
    [fileName],
  );

  // 🌟 実行ボタンやショートカットから呼ばれるハンドラ
  const handleCompile = useCallback(() => {
    compile(fileContent);
  }, [compile, fileContent]);

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

  const currentPositions = calculateCurrentPositions(
    parsedData,
    richTimeline,
    currentTime,
  );
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
            D-Forma+ Editor
          </h1>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <EditorPanel
          fileName={fileName}
          fileContent={fileContent}
          errorMsg={syntaxError}
          semanticErrors={semanticErrors}
          handleFileUpload={handleFileUpload}
          handleEditorChange={handleEditorChange}
          handleCompile={handleCompile} // 🌟 関数を渡す
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
