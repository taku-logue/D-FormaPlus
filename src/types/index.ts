// 座標
export interface Position {
  x: number;
  y: number;
}

// メンバー＋座標
export interface PositionData {
  name: string;
  position: Position;
}

// shapeライブラリ
export interface ShapeData {
  type: string;
  params: Record<string, any>;
  origin: Position;
}

// フレームの時間データ
export interface FrameData {
  type: "frame";
  id: string;
  transition?: number;
  positions?: PositionData[];
  shapes?: ShapeData[];
  sectionName?: string;
  songName?: string;
}

// パーサーが出力する全データ
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

// タイムラインと移動計算の型
export interface Movement {
  start: Position;
  end: Position;
  control?: Position;
}

// タイムラインスケジュール
export interface TimelineFrame {
  endTime: number;
  startTime: number;
  duration: number;
  movements: Record<string, Movement>;
  sectionName?: string;
  songName?: string;
}

// 構文エラー
export interface SyntaxErrorData {
  line: number;
  column: number;
  shortMessage: string;
}

// 意味的エラー
export interface SemanticErrorData {
  time: number;
  formattedTime: string;
  message: string;
}
