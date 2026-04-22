import React, { memo } from "react";

interface EditorPanelProps {
  fileName: string;
  fileContent: string;
  errorMsg: string;
  semanticErrors: string[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// 🌟 React.memo で包むことで、propsが変化しない限り再描画を防ぐ（60FPS対策）
const EditorPanel = memo(
  ({
    fileName,
    fileContent,
    errorMsg,
    semanticErrors,
    handleFileUpload,
  }: EditorPanelProps) => {
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

        {errorMsg && (
          <div className="p-3 bg-[#3a1c1c] text-[#ff6b6b] text-xs border-b border-[#ff6b6b]/30">
            <strong>🚨 文法エラー</strong>
            <br />
            {errorMsg}
          </div>
        )}

        {semanticErrors.length > 0 && (
          <div className="p-3 bg-[#3d2a0e] text-[#ff9f43] text-xs border-b border-[#e1b12c]/50 max-h-32 overflow-y-auto">
            <strong>⚠️ 監査警告（物理的・論理的エラー）</strong>
            <ul className="pl-4 mt-1 list-disc">
              {semanticErrors.map((err, idx) => (
                <li key={idx} className="mb-1">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Monaco Editor用プレースホルダー */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-[13px] leading-[1.6] bg-[#1e1e1e]">
          <div className="flex">
            <div className="text-gray-600 text-right pr-4 select-none flex flex-col items-end">
              {fileContent.split("\n").map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <div className="whitespace-pre text-gray-300">
              {fileContent ||
                "// 左上の「ファイルを開く」から \n// D-Forma+のコードを読み込んでください。"}
            </div>
          </div>
        </div>
      </section>
    );
  },
);

EditorPanel.displayName = "EditorPanel";
export default EditorPanel;
