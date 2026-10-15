# 聯合微國家組織正式成員國名錄（Discuz + Vercel）

這是一個完整可部署的 Next.js 專案，會從 MicroWiki 的「聯合微國家組織會員國列表」自動抓取資料，只解析「成員國」區段，並直接使用來源表格中的圖標網址。觀察國和已退出會員國不會混入正式名錄。

- 來源頁面：<https://zh.micronations.wiki/wiki/聯合微國家組織會員國列表>
- 首選資料來源：來源百科的文章 HTML（伺服器端抓取）
- 備援：MediaWiki `action=parse` API
- API：`/api/members`
- 獨立嵌入頁：`/embed`
- Discuz 原生 DIV 小工具：`/umo-embed.js` + `/umo-embed.css`
- 不使用 `localStorage`、`sessionStorage` 或瀏覽器端持久化。

## 部署至 Vercel

本專案使用 Next.js。Install command 為 `npm install`，Build command 為 `npm run build`，不需要設定環境變數。

部署後先測試 `/api/members` 是否回傳 `ok: true)，再測試 `/embed`。

## Discuz 原生 DIV 內嵌

將 `YOUR-PROJECT.vercel.app` 替換成實際部署網域，再貼入允許 HTML 與外部 JavaScript 的論壇編輯器：

```html
<div id="umo-member-directory"></div>
<script
  src="https://YOUR-PROJECT.vercel.app/umo-embed.js"
  data-target="#umo-member-directory"
  data-api="https://YOUR-PROJECT.vercel.app/api/members"
  defer>
</script>
```

若論壇會移除 `<script>`，請改用 `discuz-iframe-fallback.html`。

## 同步與快取

- 後端優先抓取來源百科文章 HTML；若文章不可用或表格無法解析，再改用 MediaWiki API。
- Next.js 伺服器端資料快取：6 小時重新驗證來源。
- API CDN 快取：5 分鐘，stale-while-revalidate 1 小時。
- 前端每 30 分鐘重新查詢 API，也能手動重新整理。
- 找不到「成員國」表格時會明確回報錯誤，不會退而抓取觀察國名單。
- 圖標使用來源網址，不會複製到本專案。
- 不使用 `localStorage` 或其他瀏覽器端持久化。

## 本機執行

```bash
npm install
npm run dev
npm test
```
