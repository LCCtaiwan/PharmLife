# Progress

## Current Status

- Change: C-007
- Date: 2026-08-17
- Scope: Career Layer v0.4 UI readability and visual hierarchy
- Verification: pass — production build、390×844 choice/report visual review、0 console errors

## In Progress

- 無；C-007 UI 可讀性調整已完成，等待使用者視覺驗收，公開站維持 v0.2。

## Next

1. 由使用者實際試玩 Hospital 垂直切片並回報節奏與數值感受。
2. 通過產品驗收後，以相同 Schema 新增其餘七條 Career data。
3. 新增 Dummy ninth-career test，確認不得修改 engine。

## Notes

- `PGY許願池/PharmLife` 原先不存在，本次為全新建立。
- 專案初始化時尚無 PharmLife handover；目前最新 checkpoint 為交班 #160，記錄 v0.2 公開發布狀態。
- 100 個事件、8 大職涯、4 階職位、版本化 Seed、本機存檔與人生卡均已實作。
- 系統分享被使用者取消時會安靜返回，不產生未處理錯誤。
- 公開 repository：`https://github.com/LCCtaiwan/PharmLife`
- 正式遊玩網址：`https://lcctaiwan.github.io/PharmLife/`
- 現有公開版保留為技術 Alpha；修正版未通過前不更新正式站。
- v0.4 已由使用者 Freeze；C-006 僅做 M0/M1，不加入其他七條 Career 或完整 Transition/Burnout 系統。
- 舊 v0.2 runtime 暫時保留；新程式放在 `src/career-layer/`，通過驗收前不刪除舊資料。
- 本機入口已切至 v0.4 Hospital；舊引擎、資料、存檔與 UI 檔仍保留，未刪除。
- Debug helpers 位於 `window.pharmLifeDebug`，支援 `fastForward`、`simulate`、`dumpTimeline` 與 `getState`。
