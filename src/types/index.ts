export interface PositionData {
  name: string;
  position: { x: number; y: number };
}

export interface ShapeData {
  type: string;
  params: Record<string, any>;
  origin: { x: number; y: number };
}

export interface FrameData {
  type: "frame";
  id: string;
  transition?: number;
  positions?: PositionData[];
  shapes?: ShapeData[];
  sectionName?: string;
  songName?: string;
}

// 古い DiaPlusData を D-Forma+ 用にリネームしました！
export interface DFormaData {
  mode: "time" | "measure";
  bpm?: number;
  offset?: number;
  youtube?: string;
  groupName: string;
  songName?: string;
  members: string[];
  colors: string[];
  frames: FrameData[];
}

// --- エラー処理用の型定義 ---

// 構文エラー（Ohm.jsが弾いた文法ミス）
export interface SyntaxErrorData {
  line: number;
  column: number;
  shortMessage: string;
}

// 監査警告（物理的・論理的なエラー。激突や速度超過など）
export interface SemanticErrorData {
  time: number; // エラー発生時間（内部計算用）
  formattedTime: string; // UI表示用の時間（例: "M1:B1.0"）
  message: string; // エラー内容
}
