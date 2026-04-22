import * as ohm from "ohm-js";

/**
 * D-Forma+ 文法定義
 * 言語の構造（キーワード、座標の書き方、ブロック構造など）を定義します。
 */
export const dformaGrammar = ohm.grammar(`
  DForma {
    Program = Mode Bpm? Offset? Youtube? Stage
    space += comment
    comment = "//" (~"\\n" any)*
    
    Mode = "mode" ("time" | "measure")
    Bpm = "bpm" number 
    Offset = "offset" number
    Youtube = "youtube" "(" String ")"
    
    Stage = "stage" "(" ListOf<StageArg, ","> ")" "{" StageBody* "}"
    StageArg = identifier "=" String
    StageBody = Members | Colors | Element
    
    Members = "members" ":" StringArray
    Colors = "colors" ":" StringArray
    StringArray = "[" ListOf<String, ","> "]"
    
    Element = Section | Frame
    Section = "section" String "{" Frame* "}"
    Frame = "frame" "@" FrameId "{" Transition? (ShapeCall+ | Formation) "}"
    
    ShapeCall = ShapeName "(" ListOf<ShapeParam, ","> ")" ":" Coordinate
    ShapeName = "line"
    ShapeParam = identifier "=" (NumArray | NumberVal | String)
    
    NumArray = "[" ListOf<NumberVal, ","> "]"
    NumberVal = number
    Transition = "transition" ":" number
    
    FrameId = Time | number
    Formation = Position*
    Position = MemberName ":" Coordinate
    Coordinate = "(" number "," number ")"
    
    MemberName = String
    Time = digit+ ":" digit+
    String = "\\"" (~"\\"" any)* "\\""
    number = "-"? digit+ ("." digit+)?
    identifier = letter (letter | digit)*
  }
`);
