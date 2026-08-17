# PharmLife Hospital Vertical Slice v0.5

手機優先的台灣藥師職涯人生模擬器。目前垂直切片聚焦 25→35 歲的十年醫院職涯：年度目標、職場事件、固定角色、事件鏈、升遷、Burnout 與多結局。

目前產品基準是 [Hospital 10-Year Vertical Slice SPEC v0.5](docs/hospital-vertical-slice-v0.5.md)。[Career Layer SPEC v0.4](docs/career-layer-v0.4.md) 保留為架構基礎與歷史紀錄。

## 公開舊版

[GitHub Pages](https://lcctaiwan.github.io/PharmLife/) 目前保留 v0.4 技術版；v0.5 十年故事版尚未發布。

## 目前重做範圍

- 版本化 Seed／RNG，相同 Seed 與選擇可重現同一人生。
- 通用 Career Schema 與完整的後續系統狀態欄位。
- Hospital 25→35 十年可玩垂直切片。
- 年度目標、工作方向、職場事件、兩難回應與年度成績單。
- 固定職場角色、選擇記憶、事件鏈與隱藏 Seed 命運。
- 分層薪資、升遷、Burnout 與多結局。
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

- `src/career-layer/`：v0.5 Career Schema、Hospital 故事資料、引擎、Debug 與 UI view model。
- `src/engine/`：純函式遊戲引擎、Seed/RNG 與結算。
- `src/data/`：職涯、NPC、事件、成就與結局資料。
- `src/save/`：版本化本機存檔與匯出／匯入。
- `src/ui/`：React 畫面元件。
- `docs/v0.2-deep-spec.md`：產品規格。
- `docs/SDD.md`：技術設計。
- `docs/authoring-events.md`：事件資料撰寫規則。
- `docs/deployment.md`：GitHub Pages、Vercel 與 Netlify 部署。
- `docs/develog.md`：決策與驗證紀錄。
- `docs/hospital-vertical-slice-v0.5.md`：目前 Freeze 的產品玩法與驗收條件。
- `docs/career-layer-v0.4.md`：Career Layer 架構基礎與歷史紀錄。
- `docs/hospital-vertical-slice-v0.5.md`：十年 Hospital 核心玩法與產品驗收基準。
- `TASKS.md`：本輪實作狀態與後續順序。

## 部署

`npm run build` 會產生 `dist/`。`.github/workflows/deploy-pages.yml` 可部署到 GitHub Pages；`vercel.json` 與 `netlify.toml` 也提供單頁應用程式的靜態部署設定。

目前正式站是 v0.4 技術版。本輪的 v0.5 Hospital 十年版只完成本機驗收，不更新部署。
