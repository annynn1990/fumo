# 聯合微國家組織正式成員國名錄（Discuz + GitHub Pages）

本專案已改為靜態網站，不再需要 Vercel Serverless API。GitHub Actions 每週從 MicroWiki 同步正式成員國名錄，將結果寫入 `public/data/members.json`，再部署到 GitHub Pages。

- **名錄網站：** https://annynn1990.github.io/fumo/embed/
- **靜態 JSON：** https://annynn1990.github.io/fumo/data/members.json
- **GitHub 儲存庫：** https://github.com/annynn1990/fumo
- **來源頁面：** https://zh.micronations.wiki/wiki/聯合微國家組織會員國列表
- **更新排程：** 每週一台灣時間 08:17（UTC 00:17）；也可到 Actions 手動執行
- **資料處理：** 優先解析來源百科文章 HTML，失敗時使用 MediaWiki `action=parse` API 備援
- **瀏覽器儲存：** 不使用 `localStorage`、`sessionStorage` 或其他瀏覽器端持久化

## 第一次啟用 GitHub Pages

1. 開啟本儲存庫的 **Settings → Pages**：https://github.com/annynn1990/fumo/settings/pages
2. 在 **Build and deployment → Source** 選擇 **GitHub Actions**，並儲存設定。
3. 開啟 **Actions**，手動執行 **Sync UMO members and deploy GitHub Pages**。
4. Workflow 成功後，網站會位於上方名錄網站網址。

注意：GitHub Actions 的預設 `GITHUB_TOKEN` 沒有權限替此儲存庫首次建立 Pages 站點，因此無法從工作流程自動開啟 Pages。必須先在 Settings → Pages 手動選擇 GitHub Actions。每週排程已設定為台灣時間週一 08:17；程式碼提交不會每次自動部署，以符合每週更新的設定。

## Discuz 原生 DIV 內嵌

如果 Discuz 允許外部 JavaScript，可把以下程式碼貼入帖子：

```html
<div id="umo-member-directory"></div>
<script src="https://annynn1990.github.io/fumo/umo-embed.js" data-target="#umo-member-directory" data-api="https://annynn1990.github.io/fumo/data/members.json" defer></script>
```

若 Discuz 會移除 `<script>`，請使用 `discuz-iframe-fallback.html` 中的 iframe 版本。

## 更新方式與快取

- GitHub Actions 每週一執行一次來源同步，使用台灣時間約 08:17 作為排程。
- 同步成功後才會覆寫 `public/data/members.json`；若來源失敗，工作流程會報錯並保留上次有效名錄。
- 前端載入時讀取靜態 JSON；不再每 30 分鐘輪詢 Vercel API。使用者仍可按「重新整理」重新讀取資料。
- 名錄只解析「成員國」區段；找不到正式成員國表格時會停止同步，避免誤抓觀察國或已退出會員國。
- 圖標使用來源頁面提供的網址，不會複製到本專案。

## 本機同步與測試

需要 Node.js 22：

```bash
npm install
npm run sync:members
npm test
```

此儲存庫仍保留先前的 Next.js 原始碼供參考；GitHub Pages 正式發布的是 `public/` 靜態目錄，不執行 Next.js API。
