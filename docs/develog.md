# Development Log

## Current Goal

依 Hospital v0.5 完成 25→35 十年故事型垂直切片；先讓 Hospital 值得重玩，再考慮其他七條 Career。

## Stack And Run Commands

- React 19 + TypeScript + Vite
- Vitest + Testing Library
- `npm run dev`：本機開發
- `npm test`：單元測試
- `npm run build`：正式建置

## Brainstorming Summary

- 以「取捨」而非知識問答為遊戲核心。
- 原實作採年度 4 行動點與單局 10–20 分鐘；C-005 已判定需要重新確認，不再視為既定共識。
- 失敗打開事件鏈，不設計純懲罰空回合。
- 手機先行，桌面再漸進增強成三欄儀表板。

## SDD

完整設計見 `docs/SDD.md`。遊戲引擎採純函式、資料驅動事件與版本化 Seed；UI 僅 dispatch command。

## Completed Work

### 2026-08-18 — C-011 Hospital v0.6 Newcomer Runtime

- 以隔離的 `v06-types.ts`、`hospital-v06.ts` 與 `engine-v06.ts` 實作新循環，保留 v0.5 檔案與測試，不用高風險重寫掩蓋歷史行為。
- 開局由醫院指派門診調劑；每年經過兩個具體工作片段、自願生活事件、培育志願、院方核准／拒絕及年度報告。
- 基礎能力、單位經驗、受監督／獨立資格及疲勞／壓力／健康／Burnout Risk 分開結算。
- 實作門診、住院、急診夜間及藥品管理資料；急診訓練需先取得門診與住院受監督資格。
- 職場人際分開顯示專業信任、私人親近與摩擦；周以安感情線可選擇開放或只維持朋友，單身路線不受數值懲罰。
- 新增 10 個 v0.6 單元測試；全專案 6 files、31 tests 通過，production build 通過。
- 390×844 實際走完五年：門診→住院→急診夜間、資格取得、感情發展、年度報告與 30 歲新人期小結均可到達；console 0 errors／0 warnings。
- 實作階段判定：`pass（技術）`；25–29 歲產品手感等待使用者試玩，30–65 歲尚未實作。

### 2026-08-18 — C-010 Hospital v0.6 Documentation Revision

- 實玩 CheerLife 至高中畢業與職業簽約入口，確認其核心是行動準備、事件檢驗、關係鏈與階段分流，而不是事件數量。
- 實玩 YaKyoLife 高中三年、選秀與職棒二軍入口，確認其核心是有限資源分配、風險事件、賽季成果與再次成長。
- 對照衛福部藥師訓練指引及公開醫院藥劑部業務，否決把「值班行動」、提升效率、經營主任信任或普遍帶新人當作醫院藥師的通用年度工作。
- 建立 `docs/hospital-career-v0.6.md`：醫院負責工作分派，玩家處理具體案件、累積能力與熟練度並提出培育志願。
- 成長拆成基礎能力、單位熟練度、資格及身心狀態；恢復 Hospital 25→65 完整職涯，35 歲僅為章節小結。
- 依使用者確認納入持續性職場人際與自願感情線；專業信任、私人親近及摩擦分開，NPC 有自己的輪調、升遷、離職與退休。
- 感情線可關閉，單身不受懲罰；職涯與感情分開結算，育兒、置產及完整家庭財務仍不在 v0.6 範圍。
- 文件階段判定：`revise`；結構已整理完成，等待使用者確認實務貼合度後才能 Freeze 與修改 runtime。

### 2026-08-17 — C-008 Documentation Gate

- 接受使用者「好無趣」的產品判定；v0.4 技術驗收仍成立，但不視為玩法驗收通過。
- 建立 `docs/hospital-vertical-slice-v0.5.md`，將產品測試改為 25→35 十年內完成一局並想立即重玩。
- 鎖定年度目標、固定同事、事件鏈、隱藏 Seed fate、資訊隱藏規則與至少五種十年結局。
- 明確排除其他 Career、完整轉職、學生／家庭與公開部署，避免再用內容量掩蓋核心無趣。
- 文件階段判定：`pass`；十年產品測試、事件資料契約、角色記憶、Seed fate、結局與排除範圍均已通過內容及格式檢查。

### 2026-08-17 — C-008 Hospital Ten-Year Implementation

- 將年度迴圈重做為「年度目標 → 工作方向 → 職場事件 → 兩難回應 → 結果 → 成績單」，並在第十張成績單後於 35 歲結算。
- 新增陳主任、林學姊、許新人的信任／尊重／緊張狀態，以及用藥安全、缺藥、帶新人、臨床專案四條多步事件鏈。
- 每個 Seed 有一個隱藏 fate；它調整事件權重與初始關係，並只在第一次相關事件時揭露。
- 十年結局依升遷、Burnout、健康、專業價值、生活界線與關係記憶決定，共六種。
- `npm test -- --run`：5 files、21 tests 全數通過；`npm run build`：TypeScript 與 Vite production build 通過。
- 390×844 實際檢查開局、年度目標、事件、結果、成績單與 Debug 十年快轉結局；console 0 errors / 0 warnings。
- 1,000 局平衡探測顯示策略取向會產生明顯代價：200 個 Seed 中，work-life 路線 Burnout 6%，money-max 89.5%；後者平均資產較高。
- 實作階段判定：`pass（技術）`；是否「真正有趣」留給使用者試玩驗收，本輪不發布。

### 2026-08-17 — C-007 UI Readability

- 放大年度選項標題、描述、取捨文字、側欄狀態、薪資明細與年度成績單字級，移除大量 8–11px 小字。
- 將米灰低對比儀表板改為深綠職涯 Hero、高對比白卡與更清楚的狀態數字層級。
- 修正手機版隱藏 Seed 的問題；Seed 改放在職涯 Hero，所有尺寸都可直接查看。
- 參考 YaKyoLife 的單欄開局節奏，新增 PharmLife 原生開局頁：固定 Hospital 25 歲、可輸入或更換 Seed，不加入 v0.4 以外的角色或天賦系統。
- 以 390×844 實際檢查年度選擇與成績單；兩畫面資訊可讀，console 0 errors / 0 warnings。
- `npm run build` 通過；遊戲邏輯與 Scope 未變更。

### 2026-08-17 — C-006 Documentation Gate

- 將 `docs/career-layer-v0.4.md` 設為本輪唯一實作基準，明訂 M0/M1、Hospital 數值、Debug contract 與驗收證據。
- 建立 `TASKS.md`，把文件、基礎、垂直切片與驗證拆成可勾選工作。
- 決定保留舊 v0.2 runtime，新 Career Layer 使用獨立目錄；驗收前不刪舊資料、不更新公開站。
- 文件階段判定：`pass`；Freeze、Scope、資料與驗收條件已通過內容及格式檢查，runtime 編輯可開始。

### 2026-08-17 — C-006 M0/M1 Implementation

- 新增 `src/career-layer/`，包含 Career Schema、完整 GameState、版本化 Seeded RNG、Hospital data、schema validation、年度引擎與 Debug helpers。
- Compensation 拆成本薪、夜班津貼、進階津貼、職務津貼、年薪月數與變動獎金；Hospital 使用 14.5 個月，夜班月津貼 0.9 萬。
- 完成每年六抽三、選一結算、Performance、Signature、Stress、Burnout Risk、簡化 Promotion/Burnout 與 25→65 退休流程。
- 本機入口改為純 HTML 語意結構的年度成績單與結局卡；舊 v0.2 runtime 檔案完整保留，公開站未更新。
- 新增 7 個 Career Layer tests；連同既有測試共 18 tests 全部通過。
- `npm run build` 通過；桌面 1280×820 完成選擇與成績單，Debug 快轉完成 40 年／65 歲結局；手機 390×844 版面通過，console 0 errors / 0 warnings。
- M0/M1 階段判定：`pass`。

### 2026-08-13 — C-005

- 回讀原始參考對話，確認 YaKyoLife、《實況野球》、《活俠傳》與 PharmLife 的原定分工。
- 對照實際 `game.ts`、`GameView.tsx` 與 `Portrait.tsx`，確認四行動點迴圈、職涯回饋與 CSS 幾何人物的偏差。
- 建立 `docs/v0.2-revision-spec.md`，定義核心迴圈、年度績效、職涯紀錄、事件／NPC 定位、美術 Gate、版本策略與修正里程碑。
- 文件驗收為 `revise`；等待使用者確認四項產品決策，尚未修改 runtime 或公開站。

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

### 2026-08-13 — C-003

- 關閉瀏覽器驗收時發現系統分享被取消會拋出 `AbortError`。
- 將使用者取消視為正常操作；其他分享錯誤仍向上拋出。

### 2026-08-13 — C-004

- 建立公開 GitHub repository `LCCtaiwan/PharmLife`，推送 `main` 與 `v0.2.0`。
- 啟用由 GitHub Actions 發布的 GitHub Pages。
- 首次 workflow 在 Pages 尚未啟用時於 `configure-pages` 回傳 404；啟用站點後重跑即完整通過，遊戲程式與測試沒有失敗。
- 使用真實公開網址以 390×844 驗收首頁與建角入口，瀏覽器 0 errors / 0 warnings。

## Accepted / Rejected Outputs

- `pass（技術）`：桌面首頁資訊層級與響應式布局可正常顯示。
- `pass（技術）`：390×844 手機首頁、行動、事件、職涯、存檔與結局流程無阻斷。
- `pass`：人生卡產生流程，瀏覽器無錯誤。
- `revise → pass`：手機原先先顯示人物卡，已改為年度決策／事件優先。
- `revise → pass`：SPA 切頁保留舊捲動位置，已在畫面切換時回頂端。
- `revise（產品）`：四行動點核心迴圈、職涯差異與年度回饋未對齊原始共識。
- `reject（美術）`：現有 CSS 幾何玩家與 NPC 不得作為正式人物資產。

## Current Checkpoint

Career Layer v0.4 M0/M1 已完成；本機入口為 Hospital 25→65 垂直切片，公開站仍為 v0.2 技術 Alpha。

## Recommended Next Step

由使用者試玩 Hospital 垂直切片；通過產品手感後，再以資料檔擴充其餘七條 Career，且不得修改 engine。

## Verification Status

- 文件結構：pass。
- 核心引擎：pass，11 tests。
- 正式建置：pass，Vite 8.2.1。
- 依賴安全：pass，0 vulnerabilities。
- 桌面首頁：pass，1280×720。
- 手機流程：pass，390×844；建角、年度行動、事件、下一年、職涯、存檔、結局與分享卡。
- 瀏覽器 console：pass，0 errors / 0 warnings。
- GitHub Actions：pass，安裝、測試、build、Pages artifact 與 deploy 全部完成。
- GitHub Pages 正式站：pass，`https://lcctaiwan.github.io/PharmLife/`。

### 2026-08-17 — C-009 Hidden Choice Consequences

- 實際遊玩 YaKyoLife `aebtp2pi` Seed：開局先分配五顆訓練骰，事件選項會顯示成功率與成敗數值，選擇後立即追加結果並進入下一事件。
- PharmLife 依使用者決定採取不同資訊策略：年度方向與職場事件按鈕只顯示行動名稱，不顯示描述、成功率、數值方向或預測後果。
- 選擇卡高度隨資訊減少，手機版保留大型觸控區，後果仍在結果與年度成績單揭露。
- 390×844 實際檢查年度方向與「許新人的第一個錯」事件選項；兩階段均無後果副文字，console 0 errors / 0 warnings。
