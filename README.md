# PharmLife Career Layer v0.4

手機優先的台灣藥師職涯人生模擬器。目前開發中的垂直切片讓玩家從 25 歲醫院藥師開始，每年在收入、專業、升遷與健康之間做選擇，直到 65 歲結算。

目前唯一實作基準是 [Career Layer SPEC v0.4](docs/career-layer-v0.4.md)。舊 v0.2 程式與資料暫時保留供回退與比對，但不再是新入口的產品規格。

## 公開舊版

[PharmLife v0.2 技術 Alpha](https://lcctaiwan.github.io/PharmLife/) 尚未更新為 v0.4；本輪不部署公開站。

## 這次實作範圍

- 版本化 Seed／RNG，相同 Seed 與選擇可重現同一人生。
- 通用 Career Schema 與完整的後續系統狀態欄位。
- Hospital 25→65 可玩年度循環。
- 分層薪資、簡化升遷與簡化 Burnout。
- 純 HTML 年度成績單與結局卡。
- Debug URL、快轉、模擬與時間線輸出。

## 執行

需求：Node.js 20 以上。

```bash
npm install
npm run dev
```

開發伺服器預設在 `http://localhost:5173`。

## 驗證

```bash
npm test
npm run build
```

## 重要路徑

- `src/career-layer/`：v0.4 Career Schema、資料、引擎、Debug 與 UI 所用 view model。
- `src/engine/`：純函式遊戲引擎、Seed/RNG 與結算。
- `src/data/`：職涯、NPC、事件、成就與結局資料。
- `src/save/`：版本化本機存檔與匯出／匯入。
- `src/ui/`：React 畫面元件。
- `docs/v0.2-deep-spec.md`：產品規格。
- `docs/SDD.md`：技術設計。
- `docs/authoring-events.md`：事件資料撰寫規則。
- `docs/deployment.md`：GitHub Pages、Vercel 與 Netlify 部署。
- `docs/develog.md`：決策與驗證紀錄。
- `docs/career-layer-v0.4.md`：目前 Freeze 規格與驗收條件。
- `TASKS.md`：本輪實作狀態與後續順序。

## 部署

`npm run build` 會產生 `dist/`。`.github/workflows/deploy-pages.yml` 可部署到 GitHub Pages；`vercel.json` 與 `netlify.toml` 也提供單頁應用程式的靜態部署設定。

目前正式站仍是 v0.2 技術 Alpha。本輪只完成本機 M0/M1，不更新部署。
