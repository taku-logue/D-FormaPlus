import { DFormaData } from "../types";

export const formatTimeError = (seconds: number, parsedData: DFormaData) => {
  if (parsedData.mode === "measure") {
    const bpm = parsedData.bpm || 120;
    const totalBeats = seconds / (60 / bpm);
    const m = Math.floor(totalBeats / 4) + 1;
    const b = (totalBeats % 4) + 1;
    return `M${m}:B${b.toFixed(1).replace(".0", "")}`;
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const formatTimeUI = (
  seconds: number,
  parsedData: DFormaData | null,
) => {
  if (parsedData?.mode === "measure") {
    const bpm = parsedData.bpm || 120;
    const totalBeats = seconds / (60 / bpm);
    const m = Math.floor(totalBeats / 4) + 1;
    const b = (totalBeats % 4) + 1;
    return `M${m} : B${b.toFixed(1).replace(".0", "")}`;
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
};
