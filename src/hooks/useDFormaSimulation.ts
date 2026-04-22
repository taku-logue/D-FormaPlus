// src/hooks/useDFormaSimulation.ts
import { useState, useCallback } from "react";
import { parseDForma } from "../lib/dformaParser";
import { generateTimeline } from "../lib/timelineGenerator";
import { DFormaData, TimelineFrame } from "../types";

export function useDFormaSimulation() {
  const [parsedData, setParsedData] = useState<DFormaData | null>(null);
  const [richTimeline, setRichTimeline] = useState<TimelineFrame[]>([]);
  const [maxTime, setMaxTime] = useState(0);
  const [syntaxError, setSyntaxError] = useState("");
  const [semanticErrors, setSemanticErrors] = useState<string[]>([]);
  const [videoId, setVideoId] = useState("");

  // 🌟 自動計算をやめ、手動コンパイル関数を作成
  const compile = useCallback((fileContent: string) => {
    if (!fileContent) {
      setParsedData(null);
      setRichTimeline([]);
      setMaxTime(0);
      setSyntaxError("");
      setSemanticErrors([]);
      setVideoId("");
      return;
    }

    try {
      const data = parseDForma(fileContent);
      const ytId = data.youtube
        ? data.youtube
            .replace(/^"|"$/g, "")
            .match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1] || ""
        : "";

      const {
        timeline,
        maxTime: mTime,
        semanticErrors: sErrors,
      } = generateTimeline(data);

      // 成功したらデータを更新し、エラーを消す
      setParsedData(data);
      setRichTimeline(timeline);
      setMaxTime(mTime);
      setSyntaxError("");
      setSemanticErrors(sErrors);
      setVideoId(ytId);
    } catch (err: any) {
      // 🚨 【最重要】エラーになっても、以前の parsedData や videoId は初期化しない！
      // これにより、動画やシミュレーションが消えずに残ります。
      setSyntaxError(err.message || "予期せぬエラーが発生しました");
    }
  }, []);

  return {
    parsedData,
    richTimeline,
    maxTime,
    syntaxError,
    semanticErrors,
    videoId,
    compile, // 🌟 この関数を外部（page.tsx）に渡す
  };
}
