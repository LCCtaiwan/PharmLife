# Development Log

## Current Goal

完成可從建立角色一路玩到人生結算的 PharmLife v0.2 深度版，包含八大職涯、人生系統、存檔分享與手機優先 UI。

## Stack And Run Commands

- React 19 + TypeScript + Vite
- Vitest + Testing Library
- `npm run dev`：本機開發
- `npm test`：單元測試
- `npm run build`：正式建置

## Brainstorming Summary

- 以「取捨」而非知識問答為遊戲核心。
- 以年度 4 行動點維持單局 10–20 分鐘。
- 失敗打開事件鏈，不設計純懲罰空回合。
- 手機先行，桌面再漸進增強成三欄儀表板。

## SDD

完整設計見 `docs/SDD.md`。遊戲引擎採純函式、資料驅動事件與版本化 Seed；UI 僅 dispatch command。

## Completed Work

### 2026-08-12 — C-001

- 確認 `PGY許願池/PharmLife` 原先不存在。
- 搜尋共享 handover，無 PharmLife checkpoint。
- 從參考對話還原 v0.2 的產品範圍、核心樂趣與視覺方向。
- 建立 README、SPEC、v0.2 深度版計畫書、SDD、PROGRESS 與 CHANGELOG。

### 2026-08-13 — C-002

- 完成 React + TypeScript + Vite 正式架構與純函式遊戲引擎。
- 完成 `PL02-MULBERRY32-1` 版本化 Seed、RNG cursor 與可重現選擇序列。
- 完成學生六年、兩階段國考、八大職涯、各四階職位、升遷、跳槽與提前退休。
- 完成 100 個資料事件、NPC 關係、事件鏈 flags、Burnout、家庭、資產負債與創業。
- 完成手機優先遊戲 UI、自動／手動存檔、JSON 匯入匯出與 PNG 人生卡。
- 完成 GitHub Pages、Vercel 與 Netlify 部署設定。
- 修正手機主畫面內容順序、SPA 切頁捲動位置與 favicon 404。
- 升級 Vite 8.2.1 與 Vitest 4.1.10，安全掃描歸零。

## Accepted / Rejected Outputs

- `pass`：桌面首頁視覺與資訊層級。
- `pass`：390×844 手機首頁、行動、事件、職涯、存檔與結局畫面。
- `pass`：人生卡產生流程，瀏覽器無錯誤。
- `revise → pass`：手機原先先顯示人物卡，已改為年度決策／事件優先。
- `revise → pass`：SPA 切頁保留舊捲動位置，已在畫面切換時回頂端。

## Current Checkpoint

v0.2 開發與驗收完成；下一階段是外部玩家測試與平衡調整。

## Recommended Next Step

用 5–10 位玩家進行單局測試，觀察選項猶豫、失敗趣味與二周目意願。

## Verification Status

- 文件結構：pass。
- 核心引擎：pass，11 tests。
- 正式建置：pass，Vite 8.2.1。
- 依賴安全：pass，0 vulnerabilities。
- 桌面首頁：pass，1280×720。
- 手機流程：pass，390×844；建角、年度行動、事件、下一年、職涯、存檔、結局與分享卡。
- 瀏覽器 console：pass，0 errors / 0 warnings。
