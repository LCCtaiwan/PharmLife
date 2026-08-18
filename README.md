# PharmLife Hospital Career v0.6

手機優先的台灣醫院藥師職涯模擬器。目前產品規格聚焦單一 Hospital Career：從 25 歲新人、輪調與培育，一路發展至 65 歲。35 歲是第一章職涯小結，不是人生結局。

目前產品基準是已 `FREEZE` 的 [Hospital Career SPEC v0.6](docs/hospital-career-v0.6.md)。目前 runtime 已完成 25–29 歲新人／PGY 垂直切片；30–65 歲尚待沿用同一系統擴充。[v0.5](docs/hospital-vertical-slice-v0.5.md) 與 [Career Layer SPEC v0.4](docs/career-layer-v0.4.md) 保留為歷史紀錄。

## 公開舊版

[GitHub Pages](https://lcctaiwan.github.io/PharmLife/) 目前保留 v0.4 技術版；v0.5 十年故事版尚未發布。

## v0.6 重做範圍

- 版本化 Seed／RNG，相同 Seed 與選擇可重現同一人生。
- Hospital 25→65 完整職涯；先重做 25→35 第一章。
- 由醫院安排單位與班別，玩家處理具體工作案件並提出培育／輪調志願。
- 基礎能力、單位熟練度、資格與身心狀態分開建模。
- 持續性職場人際，以及可關閉且不懲罰單身玩家的感情線。
- 分層薪資、工作紀錄、Burnout、章節小結與分開呈現的職涯／感情結算。
- 只做 Hospital；其他七條 Career 暫停。
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

- `src/career-layer/engine-v06.ts`：v0.6 Hospital 新人期純函式引擎、Seed、培育、判定與 Debug simulation。
- `src/career-layer/hospital-v06.ts`：v0.6 工作分派、案件、人物、感情與培育志願資料。
- `src/career-layer/v06-types.ts`：v0.6 Hospital State 與資料契約。
- `src/career-layer/` 其他檔案：保留的 v0.5 Career Layer 歷史實作。
- `src/engine/`：純函式遊戲引擎、Seed/RNG 與結算。
- `src/data/`：職涯、NPC、事件、成就與結局資料。
- `src/save/`：版本化本機存檔與匯出／匯入。
- `src/ui/`：React 畫面元件。
- `docs/v0.2-deep-spec.md`：產品規格。
- `docs/SDD.md`：技術設計。
- `docs/authoring-events.md`：事件資料撰寫規則。
- `docs/deployment.md`：GitHub Pages、Vercel 與 Netlify 部署。
- `docs/develog.md`：決策與驗證紀錄。
- `docs/hospital-career-v0.6.md`：目前 FREEZE 的 Hospital 25→65 玩法與驗收條件。
- `docs/career-layer-v0.4.md`：Career Layer 架構基礎與歷史紀錄。
- `docs/hospital-vertical-slice-v0.5.md`：已被 v0.6 取代的十年故事版歷史規格。
- `TASKS.md`：本輪實作狀態與後續順序。

## 部署

`npm run build` 會產生 `dist/`。`.github/workflows/deploy-pages.yml` 可部署到 GitHub Pages；`vercel.json` 與 `netlify.toml` 也提供單頁應用程式的靜態部署設定。

目前正式站仍是舊技術版。v0.6 新人期已完成本機驗收，本輪尚未更新 GitHub Pages。
