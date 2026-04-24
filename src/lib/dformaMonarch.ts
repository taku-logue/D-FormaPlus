export const dformaLanguageDef = {
  // 予約語の登録
  keywords: [
    "mode",
    "time",
    "measure",
    "bpm",
    "offset",
    "youtube",
    "stage",
    "members",
    "colors",
    "section",
    "frame",
    "transition",
    "line",
  ],
  operators: ["=", ":", "@"],
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // 文字の読み取り機構
  tokenizer: {
    root: [
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],

      // 空白
      { include: "@whitespace" },

      // 数値
      [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
      [/\d+/, "number"],

      // 文字列
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

      // 括弧類
      [/[{}()\[\]]/, "@brackets"],

      // 演算子
      [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],
    ],

    string: [
      [/[^\\"]+/, "string"],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/\/\/.*$/, "comment"], // // から始まる行をコメントとして認識
    ],
  },
};

// D-Forma+ カラーテーマ
export const dformaTheme = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "keyword", foreground: "c242f5", fontStyle: "bold" }, // 紫色
    { token: "string", foreground: "2ed573" }, // 緑色
    { token: "number", foreground: "ff4757" }, // 赤色
    { token: "comment", foreground: "6c757d", fontStyle: "italic" }, // グレー
    { token: "identifier", foreground: "e0e0e0" }, // グレー
    { token: "operator", foreground: "00d2ff" }, // 水色
  ],
  colors: {
    "editor.background": "#1e1e1e", // Editorの背景色
  },
};
