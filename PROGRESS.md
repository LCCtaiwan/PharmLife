# Progress

## Current Status

- Change: C-011
- Date: 2026-08-18
- Scope: Hospital v0.6 age 25–29 newcomer／PGY playable slice
- Verification: pass — 31 tests, production build, 390×844 five-year browser flow, 0 console errors／warnings

## Completed

- v0.6 文件 Gate 已由使用者確認並 Freeze。
- 新增隔離的 v0.6 Hospital State、資料與純函式引擎，舊 v0.5 runtime 保留為歷史回歸基準。
- 完成 25–29 歲「分派 → 兩個工作片段 → 自願生活事件 → 培育志願 → 院方決定 → 年度報告」循環。
- 門診、住院、急診夜間及藥品管理可依資格、缺額與 Seed 分派；受監督與獨立作業資格需靠實際經驗取得。
- 職場關係分開記錄專業信任、私人親近、摩擦與共同經歷；感情事件可在開局完全關閉。
- Hospital v0.6 已整理為 25→65 的單一醫院藥師職涯；35 歲改為第一章小結。
- 移除「值班行動」與抽象年度工作方向，改以醫院指派、具體案件、培育志願及院方決定形成循環。
- 將成長拆成基礎能力、單位熟練度、資格與身心狀態。
- 納入持續性職場人際與自願感情線；完整育兒、置產與家庭財務仍排除。
- Hospital v0.5 已完成 25→35 十年垂直切片：年度目標、工作方向、職場事件、事件回應、年度成績單與多結局。
- 陳主任、林學姊、許新人會累積信任與關係記憶；四條多步事件鏈會根據旗標與選擇繼續。
- Seed 現在決定五種隱藏命運偏向，只在相關事件發生時揭露。

## Next

1. 由使用者試玩 25–29 歲新人期，確認工作片段、培育與關係節奏。
2. 通過產品手感後，延伸至 35 歲第一章小結。
3. 再沿用同一系統完成 36–65 歲 Hospital 職涯，不擴其他 Career。

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
- 本機入口已切至 v0.6 Hospital 新人期；舊引擎、資料、存檔與 UI 檔仍保留，未刪除。
- Debug helpers 位於 `window.pharmLifeDebug`，支援 `fastForward`、`simulate`、`dumpTimeline` 與 `getState`。
- 使用者已判定 v0.4「技術能跑但無趣」；C-008 暫停擴七 Career，先證明 Hospital 十年值得重玩。
- v0.5 本機版已通過技術驗收，尚未 push 或更新 GitHub Pages。
