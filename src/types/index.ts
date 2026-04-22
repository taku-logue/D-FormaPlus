export interface Position {
  x: number;
  y: number;
}

export interface PositionData {
  name: string;
  position: Position;
}

export interface ShapeData {
  type: string;
  params: Record<string, any>;
  origin: Position;
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

// 🌟 新規追加: タイムラインと移動計算のための型
export interface Movement {
  start: Position;
  end: Position;
  control?: Position; // 衝突回避用のベジェ曲線制御点
}

export interface TimelineFrame {
  endTime: number;
  startTime: number;
  duration: number;
  movements: Record<string, Movement>;
  sectionName?: string;
  songName?: string;
}

export interface SyntaxErrorData {
  line: number;
  column: number;
  shortMessage: string;
}

export interface SemanticErrorData {
  time: number;
  formattedTime: string;
  message: string;
}
