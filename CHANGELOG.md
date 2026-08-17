# Changelog

## Unreleased

### C-007 fix: improve Career Layer UI readability

- Increase mobile and desktop type sizes across choices, side panels, compensation details and annual reports.
- Replace the low-contrast beige dashboard with a dark-green career hero, high-contrast cards and clearer visual hierarchy.
- Keep the reproducible Seed visible in the career hero on both mobile and desktop.
- Add a focused start screen with an editable Seed, one-click random Seed and a clear Hospital age-25 starting point.
- Verification: production build passed; 390×844 choice and annual-report screens passed visual inspection with 0 console errors.

### C-006 feat: establish Career Layer v0.4 M0/M1

- Freeze `docs/career-layer-v0.4.md` as the implementation source of truth.
- Preserve the v0.2 runtime while adding an isolated Career Layer and switching only the local entry after verification.
- Scope is limited to shared foundation, Hospital age 25–65, annual reports, ending card and tests; public deployment is excluded.
- Add a versioned reproducible RNG, debug URL/helpers, data validation, layered compensation and reserved later-system state.
- Add the playable annual three-choice loop, simplified promotion/Burnout checks, semantic annual report and retirement ending.
- Verification: 18 tests passed; production build passed; 1280×820 and 390×844 browser flows passed with 0 errors and 0 warnings.

### C-005 docs: realign the v0.2 product specification

- 對照先前討論與實際程式，整理原始共識、目前成品、偏差與必要修正。
- 定義修正版年度迴圈、職涯紀錄、事件／NPC 定位、人物美術 Gate 與 R0–R5 驗收。
- 將現有公開版定位為技術 Alpha；修正版規格通過前不修改正式站。
- 驗證：文件內容與現有 `game.ts`、`GameView.tsx`、`Portrait.tsx`、SPEC、SDD 及交班 #160 交叉核對；產品決策狀態為 `revise`。

## 0.2.0 — 2026-08-13

### C-004 docs: publish the public GitHub Pages release

- 建立公開 repository `LCCtaiwan/PharmLife`，推送 `main` 與 `v0.2.0`。
- 啟用 GitHub Pages，正式站為 `https://lcctaiwan.github.io/PharmLife/`。
- 驗證：GitHub Actions 完整通過；390×844 正式站首頁與建角流程通過；瀏覽器 0 errors / 0 warnings。

### C-003 fix: handle canceled system sharing gracefully

- 使用者關閉人生卡系統分享視窗時，不再產生未處理的 `AbortError`。
- 驗證：`npm test` 與 `npm run build` 通過。

### C-002 feat: complete the playable PharmLife v0.2 deep edition

- 完成手機優先 UI，包含首頁、建角、年度行動、事件演出、能力、關係、資產、存檔與人生結算。
- 完成版本化 Seed/RNG、學生六年、兩階段國考、八大職涯與各四階職位。
- 完成 100 個資料事件、NPC 三軸關係、事件鏈 flags、家庭、Burnout、經濟、創業、升遷與跳槽。
- 完成本機自動存檔、三個手動 slot、JSON 匯出／匯入與 PNG 人生卡。
- 加入 GitHub Pages、Vercel、Netlify 部署設定與事件撰寫文件。
- 將 Vite／Vitest 升級至已修補版本；`npm audit` 為 0 vulnerabilities。
- 驗證：11 個單元測試通過；`npm run build` 通過；390×844 手機流程與 1280×720 桌面首頁實際驗收通過；瀏覽器 0 errors。

### C-001 docs: establish PharmLife v0.2 deep specification

- 建立產品規格、技術設計、里程碑與專案紀錄。
- 將八大職涯、版本化 Seed、資料事件、人生系統與驗收條件定義為 v0.2 完整範圍。
- 驗證：文件完成後以檔案結構與內容檢查確認。
