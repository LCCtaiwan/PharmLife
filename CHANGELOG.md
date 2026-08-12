# Changelog

## Unreleased

## 0.2.0 — 2026-08-13

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
