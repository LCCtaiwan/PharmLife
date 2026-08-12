# PharmLife v0.2 深度版

手機優先的台灣藥師職涯人生模擬器。玩家從藥學系開始，經歷實習與國考，進入八大職涯，在能力、人格、關係、金錢、家庭與健康之間做取捨，最後產生可分享的人生結算卡。

## 遊戲特色

- 可重現的版本化 Seed／RNG；相同版本、Seed 與選擇可重現同一人生。
- 藥學系、兩階段國考與失敗後續內容。
- 醫院、社區、連鎖、診所、藥廠、臨床試驗、公職、學術八大職涯。
- 資料驅動事件、事件鏈、flags 與有自己人生進度的 NPC。
- 100 個學生、職涯、關係、家庭、經濟、健康、創業與世界事件。
- Burnout、資產負債、升遷、跳槽、創業、家庭、成就與多結局。
- 本機存檔、JSON 匯出／匯入與可下載的人生結算卡。

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

- `src/engine/`：純函式遊戲引擎、Seed/RNG 與結算。
- `src/data/`：職涯、NPC、事件、成就與結局資料。
- `src/save/`：版本化本機存檔與匯出／匯入。
- `src/ui/`：React 畫面元件。
- `docs/v0.2-deep-spec.md`：產品規格。
- `docs/SDD.md`：技術設計。
- `docs/authoring-events.md`：事件資料撰寫規則。
- `docs/deployment.md`：GitHub Pages、Vercel 與 Netlify 部署。
- `docs/develog.md`：決策與驗證紀錄。

## 部署

`npm run build` 會產生 `dist/`。`.github/workflows/deploy-pages.yml` 可部署到 GitHub Pages；`vercel.json` 與 `netlify.toml` 也提供單頁應用程式的靜態部署設定。
