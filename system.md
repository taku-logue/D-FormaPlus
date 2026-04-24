# D-Forma+

## 階層構造

```
src/
 ┣ app/
 ┃ ┣ favicon.ico
 ┃ ┣ layout.tsx
 ┃ ┣ globals.css
 ┃ ┗ page.tsx
 ┣ components/
 ┃ ┣ Controlbar.tsx
 ┃ ┣ EditorPanel.tsx
 ┃ ┗ StageViewer.tsx
 ┣ hooks/
 ┃ ┣ useDFormaSimulation.ts
 ┃ ┣ usePlaybackSync.ts
 ┃ ┗ useYouTubePlayer.ts
 ┣ lib/
 ┃ ┣ dformaGrammar.ts
 ┃ ┣ dformaMonarch.ts
 ┃ ┣ dformaParser.ts
 ┃ ┣ positionCalculator.ts
 ┃ ┣ shapes.ts
 ┃ ┗ timelineGenerator.ts
 ┣ types/
 ┃ ┗ index.ts
 ┗ utils/
   ┣ geometry.ts
   ┗ timeFormat.ts
```

## 各ファイルの説明

###  `dformaGrammar.ts`

D-Forma+ の文法定義

### `dFormaMonarch.ts`

D-Forma+ のシンタックスハイライト

### `dformaParser.ts`

パーサー
オブジェクトに変換する

### `positionCalculator.ts`

アニメーションエンジン
メンバーのポジションを計算する

### `shapes.ts`

shapeライブラリの実装
現在はline関数のみ

### `timelineGenerator.ts`

タイムライン構築

### `index.ts`

型定義ファイル

### `geometry.ts`

自動衝突回避システムファイル

### `timeFormat.ts`

時間フォーマットファイル

### `useDFormaSimulation.ts`

コードエディタ中の快適度改革ファイル

### `usePlaybackSync.ts`

再生時間同期・時間管理

### `useYouTubePlayer`

動画部分の描写

### `ControlBar.tsx`

D-Forma+ のダッシュボード

### `EditorPanel.tsx`

D-Forma+ のエディタ部分

### `StageViewer.tsx`

D-Forma+ のステージ描画部分

### `page.tsx`

D-Forma+ すべてのファイルの総括

### `layout.tsx`

HTMLの骨組み
検索用メタデータ

### `global.css`

ベースCSS