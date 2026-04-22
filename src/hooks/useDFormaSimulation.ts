import { useMemo } from "react";
import { parseDForma } from "../lib/dformaParser";
import { generateTimeline } from "../lib/timelineGenerator";
import { DFormaData, TimelineFrame } from "../types";

// fileContent を受け取り、解析結果・タイムライン・エラーなどをすべて一括で返す
export function useDFormaSimulation(fileContent: string) {
  return useMemo(() => {
    // 1. ファイルが空の場合
    if (!fileContent) {
      return {
        parsedData: null as DFormaData | null,
        richTimeline: [] as TimelineFrame[],
        maxTime: 0,
        syntaxError: "",
        semanticErrors: [] as string[],
        videoId: "",
      };
    }

    try {
      // 2. 構文解析
      const data = parseDForma(fileContent);
      const ytId = data.youtube
        ? data.youtube
            .replace(/^"|"$/g, "")
            .match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1] || ""
        : "";

      // 3. タイムライン計算
      const { timeline, maxTime, semanticErrors } = generateTimeline(data);

      // 成功時の完全なデータを一括返却
      return {
        parsedData: data,
        richTimeline: timeline,
        maxTime,
        syntaxError: "",
        semanticErrors,
        videoId: ytId,
      };
    } catch (err: any) {
      // 文法エラー時のフォールバック
      return {
        parsedData: null,
        richTimeline: [],
        maxTime: 0,
        syntaxError: err.message || "予期せぬエラーが発生しました",
        semanticErrors: [],
        videoId: "",
      };
    }
  }, [fileContent]); // fileContent が変わった時だけ再計算！
}
