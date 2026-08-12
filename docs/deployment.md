# Deployment

## GitHub Pages

1. 將 repository 的預設分支設為 `main`。
2. GitHub repository Settings → Pages → Source 選擇 GitHub Actions。
3. 推送到 `main` 後，`.github/workflows/deploy-pages.yml` 會依序執行 `npm ci`、測試、建置與部署。

Vite 使用相對 base，因此可部署在帳號根路徑或 repository 子路徑。

## Vercel

匯入 repository 後直接部署。`vercel.json` 已指定 Vite、`dist` 與 SPA rewrite。

## Netlify

匯入 repository 後直接部署。`netlify.toml` 已指定建置命令、輸出資料夾與 SPA fallback。

## 發布前檢查

```bash
npm ci
npm audit
npm test
npm run build
```

不要提交 `node_modules/`、`dist/`、測試截圖或本機存檔。
