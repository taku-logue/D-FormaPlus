import { dformaGrammar } from "./dformaGrammar";
import { DFormaData } from "../types";

/**
 * D-Forma+ 解析ロジック
 * 文法に基づいてテキストを解析し、プログラムで扱えるオブジェクト形式に変換します。
 */
export const semantics = dformaGrammar.createSemantics();

semantics.addOperation("toJSON", {
  _iter(...children) {
    return children.map((c) => c.toJSON());
  },
  _terminal() {
    return this.sourceString;
  },
  Program(mode, optBpm, optOffset, optYoutube, stageBlock) {
    const bpmNode = optBpm.children[0];
    const offsetNode = optOffset.children[0];
    return {
      mode: mode.toJSON(),
      bpm: bpmNode ? bpmNode.toJSON() : undefined,
      offset: offsetNode ? offsetNode.toJSON() : undefined,
      youtube: optYoutube.children[0]?.toJSON(),
      ...stageBlock.toJSON(),
    };
  },
  Bpm(_bpm, num) {
    return parseFloat(num.sourceString);
  },
  Offset(_offset, num) {
    return parseFloat(num.sourceString);
  },
  Youtube(_yt, _lparen, path, _rparen) {
    return path.toJSON();
  },
  StageArg(id, _eq, str) {
    return { key: id.sourceString, val: str.toJSON() };
  },
  Stage(_stage, _lparen, args, _rparen, _lbrace, body, _rbrace) {
    const argList = args.asIteration().children.map((a) => a.toJSON());
    const argObj = Object.fromEntries(argList.map((a: any) => [a.key, a.val]));
    const groupName = argObj.group || "Unknown Group";
    const songName = argObj.song || "Unknown Song";

    let members: string[] = [];
    let colors: string[] = [];
    const frames: any[] = [];

    body.children.forEach((b: any) => {
      const parsed = b.toJSON();
      if (parsed.type === "members") {
        members = parsed.data;
      } else if (parsed.type === "colors") {
        colors = parsed.data;
      } else if (parsed.type === "section") {
        parsed.frames.forEach((f: any) =>
          frames.push({ ...f, sectionName: parsed.name, songName }),
        );
      } else if (parsed.type === "frame") {
        frames.push({ ...parsed, songName });
      }
    });

    return { groupName, songName, members, colors, frames };
  },
  Members(_m, _c, arr) {
    return { type: "members", data: arr.toJSON() };
  },
  Colors(_c, _col, arr) {
    return { type: "colors", data: arr.toJSON() };
  },
  StringArray(_l, list, _r) {
    return list.asIteration().children.map((c: any) => c.toJSON());
  },
  ShapeCall(name, _lparen, params, _rparen, _colon, coord) {
    const pList = params.asIteration().children.map((p) => p.toJSON());
    return {
      type: name.sourceString,
      params: Object.fromEntries(pList.map((p: any) => [p.key, p.val])),
      origin: coord.toJSON(),
    };
  },
  ShapeParam(id, _eq, val) {
    return { key: id.sourceString, val: val.toJSON() };
  },
  NumArray(_l, list, _r) {
    return list.asIteration().children.map((c) => c.toJSON());
  },
  NumberVal(num) {
    return parseFloat(num.sourceString);
  },
  Mode(_mode, type) {
    return type.sourceString;
  },
  Element(e) {
    return e.toJSON();
  },
  Section(_sec, name, _open, frames, _close) {
    return { type: "section", name: name.toJSON(), frames: frames.toJSON() };
  },
  Transition(_trans, _colon, num) {
    return parseFloat(num.sourceString);
  },
  Frame(_frame, _at, id, _open, optTrans, content, _close) {
    const trans = optTrans.children[0]?.toJSON();
    const parsed = content.toJSON();
    let shapes, positions;

    if (Array.isArray(parsed) && parsed.length > 0) {
      if (parsed[0].type) {
        shapes = parsed;
      } else if (parsed[0].name) {
        positions = parsed;
      }
    }

    return {
      type: "frame",
      id: id.sourceString,
      transition: trans,
      positions,
      shapes,
    };
  },
  Formation(pos) {
    return pos.toJSON();
  },
  Position(name, _colon, coord) {
    return { name: name.toJSON(), position: coord.toJSON() };
  },
  Coordinate(_l, x, _c, y, _r) {
    return { x: parseFloat(x.sourceString), y: parseFloat(y.sourceString) };
  },
  String(_ld, chars, _rd) {
    return chars.sourceString;
  },
});

/**
 * 外部から呼び出すためのメイン関数
 */
export function parseDForma(code: string): DFormaData {
  const matchResult = dformaGrammar.match(code);

  if (!matchResult.succeeded()) {
    throw new Error((matchResult as any).message);
  }

  const data = semantics(matchResult).toJSON() as DFormaData;

  if (data.mode === "measure" && data.bpm === undefined) {
    throw new Error(
      "mode が 'measure' の場合、BPMの指定（例: bpm 120）は必須です。",
    );
  }

  return data;
}
