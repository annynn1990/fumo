# 聯合微國家組織正式成員國名錄（Discuz + Render Static Site）

本專案已改為靜態網站，不再需要 Vercel Serverless API。GitHub Actions 每週從 MicroWiki 同步正式成員國名錄，將結果寫入 `public/data/members.json`；Render 會自動發布 `public/` 靜態資產。

- **名錄網站：** https://fumo-static-directory.onrender.com/embed/
- **靜態 JSON：** https://fumo-static-directory.onrender.com/data/members.json
- **GitHub 儲存庫：** https://github.com/annynn1990/fumo
- **來源頁面：** https://zh.micronations.wiki/wiki/聯合微國家組織會員國列表
- **更新排程：** 每週一台灣時間 08:17（UTC 00:17）；也可到 Actions 手動執行
- **資料處理：** 優先解析來源百科文章 HTML，失敗時使用 MediaWiki `action=parse` API 備援
- **瀏覽器儲存：** 不使用 `localStorage`、`sessionStorage` 或其他瀏覽器端持久化

## 自動發布與每週更新

Render 靜態網站已連接本儲存庫的 `main` 分支，發布目錄為 `public/`。網站程式碼有變動時會由 Render 自動部署；成員國資料則由 GitHub Actions 每週一台灣時間上午 08:17 同步。若資料有變動，工作流程會提交新的 JSON，並由 Render 自動部署更新。可在 [GitHub Actions](https://github.com/annynn1990/fumo/actions/workflows/deploy-pages.yml) 手動執行同步。

## Discuz 原生 DIV 內嵌

如果 Discuz 允許外部 JavaScript，可把以下程式碼貼入帖子：

```html
<div id="umo-member-directory"></div>
<script src="https://fumo-static-directory.onrender.com/umo-embed.js" data-target="#umo-member-directory" data-api="https://fumo-static-directory.onrender.com/data/members.json" defer></script>
```

若 Discuz 會移除 `<script>`，請使用 `discuz-iframe-fallback.html` 中的 iframe 版本。

## 更新方式與快取

- GitHub Actions 每週一執行一次來源同步，使用台灣時間約 08:17 作為排程。
- 同步成功後才會覆寫 `public/data/members.json`；若來源失敗，工作流程會報錯並保留上次有效名錄。
- 前端載入時讀取靜態 JSON；不再輪詢 Vercel API。使用者仍可按「重新整理」重新讀取資料。
- 名錄只解析「成員國」區段；找不到正式成員國表格時會停止同步，避免誤抓觀察國或已退出會員國。
- 圖標使用來源頁面提供的網址，不會複製到本專案。

## 本機同步與測試

需要 Node.js 22：

```bash
npm install
npm run sync:members
npm test
```

此儲存庫仍保留先前的 Next.js 原始碼供參考；Render 正式發布 `public/` 靜態目錄，不執行 Next.js API。
