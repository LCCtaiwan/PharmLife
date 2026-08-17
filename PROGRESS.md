# Progress

## Current Status

- Change: C-008
- Date: 2026-08-17
- Scope: Hospital v0.5 ten-year fun vertical slice
- Verification: pass — 21 tests, production build and 390×844 ten-year browser flow

## Completed

- Hospital v0.5 已完成 25→35 十年垂直切片：年度目標、工作方向、職場事件、事件回應、年度成績單與多結局。
- 陳主任、林學姊、許新人會累積信任與關係記憶；四條多步事件鏈會根據旗標與選擇繼續。
- Seed 現在決定五種隱藏命運偏向，只在相關事件發生時揭露。

## Next

1. 請使用者實際玩不同 Seed 與路線，回饋十年節奏、事件吸引力與結局辨識度。
2. Hospital 通過玩法驗收後，才考慮發布或擴展其他 Career。

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
- 本機入口已切至 v0.5 Hospital 十年版；舊引擎、資料、存檔與 UI 檔仍保留，未刪除。
- Debug helpers 位於 `window.pharmLifeDebug`，支援 `fastForward`、`simulate`、`dumpTimeline` 與 `getState`。
- 使用者已判定 v0.4「技術能跑但無趣」；C-008 暫停擴七 Career，先證明 Hospital 十年值得重玩。
- v0.5 本機版已通過技術驗收，尚未 push 或更新 GitHub Pages。
