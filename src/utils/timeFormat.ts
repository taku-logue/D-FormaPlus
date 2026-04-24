import { DFormaData } from "../types";

// エラー表示用の時間フォーマット
export const formatTimeError = (seconds: number, parsedData: DFormaData) => {
  // 小節モード
  if (parsedData.mode === "measure") {
    const bpm = parsedData.bpm || 120;
    const totalBeats = seconds / (60 / bpm);
    const roundedBeats = Math.round(totalBeats * 10) / 10;
    const m = Math.floor(roundedBeats / 4) + 1;
    const b = (roundedBeats % 4) + 1;
    return `M${m} : B${b.toFixed(1).replace(".0", "")}`;
  }
  // 時間モード
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// UI表示用の時間フォーマット
export const formatTimeUI = (
  seconds: number,
  parsedData: DFormaData | null,
) => {
  // 小節モード
  if (parsedData?.mode === "measure") {
    const bpm = parsedData.bpm || 120;
    const totalBeats = seconds / (60 / bpm);
    const roundedBeats = Math.round(totalBeats * 10) / 10;
    const m = Math.floor(roundedBeats / 4) + 1;
    const b = (roundedBeats % 4) + 1;
    return `M${m} : B${b.toFixed(1).replace(".0", "")}`;
  }
  // 時間モード
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
};
