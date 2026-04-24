"use client";
import { useState, useEffect, useCallback } from "react";

// UIパーツの読み込み
import EditorPanel from "../components/EditorPanel";
import StageViewer from "../components/StageViewer";

// ロジックの読み込み
import { calculateCurrentPositions } from "../lib/positionCalculator";
import { formatTimeUI } from "../utils/timeFormat";

// カスタムックの読み込み
import { useYouTubePlayer } from "../hooks/useYouTubePlayer";
import { usePlaybackSync } from "../hooks/usePlaybackSync";
import { useDFormaSimulation } from "../hooks/useDFormaSimulation";

export default function EditorApp() {
  // ファイル名やエディタ上の文字の記憶
  const [fileName, setFileName] = useState("ファイルが選択されていません");
  const [fileContent, setFileContent] = useState(
    "// 左上の「ファイルを開く」から \n// D-Forma+のコードを読み込んでください。\n// もしくはここに直接コードを記述できます。",
  );

  // 文字をデータに変換
  const {
    parsedData,
    richTimeline,
    maxTime,
    syntaxError,
    semanticErrors,
    videoId,
    compile,
  } = useDFormaSimulation();

  // 描写準備
  const { youtubePlayer, isPlaying, setIsPlaying } = useYouTubePlayer(videoId);

  // 同期準備
  const { currentTime, setCurrentTime, handleSeek } = usePlaybackSync(
    youtubePlayer,
    isPlaying,
    parsedData?.offset || 0,
  );

  // 初期表示時に一度コンパイル
  useEffect(() => {
    compile(fileContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // シミュレーションデータが更新されたら時間をリセット
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [parsedData, setCurrentTime, setIsPlaying]);

  // ファイルがアップロードされたときの処理
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // 拡張子が .dfp かどうかをチェック
      if (!file.name.toLowerCase().endsWith(".dfp")) {
        alert(
          "🚨 エラー: 読み込めるのは D-Forma+ のファイル（.dfp）のみです！",
        );
        event.target.value = "";
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text);
        compile(text);
      };
      reader.readAsText(file);

      event.target.value = "";
    },
    [compile],
  );

  // エディタで文字が入力されたときの処理
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setFileContent(value);
        if (fileName === "ファイルが選択されていません")
          setFileName("unsaved.ifs");
      }
    },
    [fileName],
  );

  // 実行ボタンやショートカットが押されたときの処理
  const handleCompile = useCallback(() => {
    compile(fileContent);
  }, [compile, fileContent]);

  // オフセットをコピーする処理
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

  // 毎フレームの計算
  const currentPositions = calculateCurrentPositions(
    parsedData,
    richTimeline,
    currentTime,
  );
  // 土のセクションを計算しているか特定
  const currentFrameObj = [...richTimeline]
    .reverse()
    .find((f) => f.endTime <= currentTime);

  // レンダリング
  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white font-sans overflow-hidden">
      {/* 画面上部のヘッダー */}
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

      {/* メイン画面 */}
      <main className="flex flex-1 overflow-hidden">
        {/* 左側：エディタパネル */}
        <EditorPanel
          fileName={fileName}
          fileContent={fileContent}
          errorMsg={syntaxError}
          semanticErrors={semanticErrors}
          handleFileUpload={handleFileUpload}
          handleEditorChange={handleEditorChange}
          handleCompile={handleCompile}
        />
        {/* 右側：ステージビューワー */}
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
