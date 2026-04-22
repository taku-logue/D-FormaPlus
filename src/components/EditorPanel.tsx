// src/components/EditorPanel.tsx
import React, { memo } from "react";
import Editor from "@monaco-editor/react";
import { dformaLanguageDef, dformaTheme } from "../lib/dformaMonarch";

interface EditorPanelProps {
  fileName: string;
  fileContent: string;
  errorMsg: string;
  semanticErrors: string[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEditorChange: (value: string | undefined) => void;
  handleCompile: () => void; // 🌟 追加：コンパイル実行関数
}

const EditorPanel = memo(
  ({
    fileName,
    fileContent,
    errorMsg,
    semanticErrors,
    handleFileUpload,
    handleEditorChange,
    handleCompile,
  }: EditorPanelProps) => {
    const handleEditorWillMount = (monaco: any) => {
      if (
        !monaco.languages
          .getLanguages()
          .some((lang: any) => lang.id === "dforma")
      ) {
        monaco.languages.register({ id: "dforma" });
        monaco.languages.setMonarchTokensProvider("dforma", dformaLanguageDef);
        monaco.editor.defineTheme("dforma-dark", dformaTheme);
      }
    };

    // 🌟 Monacoエディタのマウント完了時にショートカット(Ctrl+S / Cmd+S)を登録
    const handleEditorDidMount = (editor: any, monaco: any) => {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        handleCompile(); // 保存ショートカットでコンパイル実行！
      });
    };

    return (
      <section className="w-[45%] flex flex-col border-r border-[#333] bg-[#1e1e1e] relative">
        <div className="px-4 py-2 flex items-center justify-between bg-[#1a1a1a] border-b border-[#333] flex-none">
          <div className="flex items-center gap-2 text-gray-300">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <span className="text-[12px] font-semibold tracking-wider">
              {fileName !== "ファイルが選択されていません"
                ? fileName
                : "CODE.IFS"}
            </span>
          </div>

          {/* 🌟 実行ボタンとファイルを開くボタンを並べる */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCompile}
              title="コンパイルを実行 (Ctrl+S)"
              className="flex items-center gap-1.5 px-3 py-1 bg-[#c242f5] hover:bg-[#a638d1] text-white rounded text-[11px] font-bold transition-colors shadow-sm"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              実行 (Ctrl+S)
            </button>

            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#444] rounded text-[11px] font-medium text-gray-300 transition-colors shadow-sm">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              ファイルを開く
              <input
                type="file"
                accept=".diap,.txt,.ifs"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        <div className="flex-none z-10">
          {errorMsg && (
            <div className="p-3 bg-[#3a1c1c] text-[#ff6b6b] text-xs border-b border-[#ff6b6b]/30">
              <strong>🚨 文法エラー</strong>
              <br />
              {errorMsg}
            </div>
          )}

          {semanticErrors.length > 0 && (
            <div className="p-3 bg-[#3d2a0e] text-[#ff9f43] text-xs border-b border-[#e1b12c]/50 max-h-32 overflow-y-auto">
              <strong>⚠️ 監査警告</strong>
              <ul className="pl-4 mt-1 list-disc">
                {semanticErrors.map((err, idx) => (
                  <li key={idx} className="mb-1">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex-1 w-full relative min-h-0" key="monaco-container">
          <Editor
            height="100%"
            language="dforma"
            theme="dforma-dark"
            value={fileContent}
            onChange={handleEditorChange}
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount} // 🌟 ここでショートカットキーの登録関数を渡す
            loading={
              <div className="flex h-full items-center justify-center text-gray-500 font-mono text-sm tracking-widest">
                LOADING EDITOR...
              </div>
            }
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              lineHeight: 1.6,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              wordWrap: "on",
              formatOnPaste: true,
            }}
          />
        </div>
      </section>
    );
  },
);

EditorPanel.displayName = "EditorPanel";
export default EditorPanel;
