# Software Design Document

## 架構

```text
React UI
  ↓ dispatch command
Game Engine（純函式）
  ├─ State transition
  ├─ Condition / effect interpreter
  ├─ Seeded RNG
  ├─ Career / economy / relationship systems
  └─ Achievement / ending evaluator
  ↓
Versioned GameState
  ├─ UI state
  ├─ player / career / family / economy
  ├─ NPC relationships / flags / history
  └─ seedVersion / seed / rngCursor
  ↓
Browser persistence（localStorage + JSON export）
```

UI 不直接改數值；所有遊戲狀態變動由 engine command 產生下一份 immutable state。這讓測試能直接驗證同 Seed 的重現性。

## 主要模組

- `src/engine/types.ts`：State、data schema、command 與 effect 型別。
- `src/engine/rng.ts`：字串 Seed 雜湊、PRNG 與版本識別。
- `src/engine/game.ts`：新遊戲、行動、事件、選項、年度結算與結局。
- `src/engine/rules.ts`：條件與效果 interpreter、檢定、評級。
- `src/data/*.ts`：不含 UI 邏輯的職涯、事件、NPC、成就與結局資料。
- `src/save/storage.ts`：schema validation、migration、slots 與 JSON。
- `src/ui/*.tsx`：畫面與互動元件。

## RNG 合約

- `seedVersion = "PL02-MULBERRY32-1"`。
- 初始狀態保存原始 seed 與 `rngCursor = 0`。
- 每次抽取使用 `hash(seed + ":" + cursor)` 產生一個 0–1 數值，使用後 cursor 加一。
- UI 動畫與裝飾不得消耗遊戲 RNG。
- 新 RNG 必須換版本字串；舊存檔保留原版本並走相容實作或拒絕載入。

## 事件條件與效果

條件採宣告式結構，可組合 age、phase、career、role、能力門檻、狀態門檻、flag、是否曾發生、NPC 關係與家庭狀態。效果採 key-path + add/set，並提供 startCareer、jobOffer、addNPC、achievement、endGame 等明確操作。

事件選擇可含檢定。檢定分數由能力加權、人格、狀態、NPC 關係與 Seed 骰值組成；成功與失敗都有獨立敘事與效果。

## 存檔

- `saveVersion = 2`。
- `pharmlife:v0.2:autosave` 與三個手動 slot。
- 讀檔先 parse，再做最小 schema 驗證；版本 1 可補入新增欄位遷移至版本 2。
- 匯入 JSON 不執行其中內容，只接受資料結構。

## UI 狀態

- `menu`：首頁、繼續、存檔管理。
- `create`：角色、背景、難度與 Seed。
- `play`：年度行動或事件對話。
- `career`：工作邀請／轉職選擇。
- `summary`：年度結算。
- `ending`：時間線、成就與人生卡。

## 測試策略

- RNG：相同輸入一致、不同 cursor 形成穩定序列。
- Engine：建角、學生推進、國考、職涯進入、事件條件與效果。
- Systems：Burnout 恢復、負債、升遷、創業與結局。
- Save：round-trip、錯誤版本與 migration。
- E2E：手機寬度完成建角、數個年度、存讀檔與人生卡。
