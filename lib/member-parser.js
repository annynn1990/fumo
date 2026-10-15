import * as cheerio from 'cheerio';

export const SOURCE_ORIGIN = 'https://zh.micronations.wiki';
export const SOURCE_PAGE_URL = 'https://zh.micronations.wiki/wiki/%E8%81%AF%E5%90%88%E5%BE%AE%E5%9C%8B%E5%AE%B6%E7%B5%84%E7%B9%94%E6%9C%83%E5%93%A1%E5%9C%8B%E5%88%97%E8%A1%A8';
export const SOURCE_PAGE_TITLE = '聯合微國家組織會員國列表';

function cleanText(value) {
  return String(value ?? '').replace(/\u00a0/g, ' ').replace(/[\t\r\n ]+/g, ' ').trim();
}
function safeHttpUrl(value, base = SOURCE_ORIGIN) {
  if (!value) return null;
  try {
    const url = new URL(value, base);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}
function headingText(value) {
  return cleanText(value).replace(/\[編輯\]|\[编辑\]|編輯|编辑/g, '').trim();
}
function findMembersTable($, root) {
  const sequence = root.find('h1,h2,h3,h4,h5,h6,table').toArray();
  let section = '';
  for (const element of sequence) {
    const name = (element.name || '').toLowerCase();
    if (/^h[1-6]$/.test(name)) {
      const heading = headingText($(element).text());
      if (heading.includes('觀察國') || heading.includes('观察国')) section = 'observers';
      else if (heading.includes('已退出') || heading.includes('退出的會員國')) section = 'former';
      else if (heading.includes('成員國') || heading.includes('成员国')) section = 'members';
      else section = 'other';
    } else if (name === 'table' && section === 'members') return element;
  }
  return null;
}
function memberColumnIndex($, table) {
  for (const row of $(table).find('tr').toArray()) {
    const cells = $(row).children('th,td').toArray();
    const index = cells.map((cell) => headingText($(cell).text())).findIndex((label) => label === '成員國' || label === '成员国');
    if (index >= 0) return index;
  }
  return -1;
}
function candidateLink($, cell) {
  if (!cell) return null;
  for (const anchor of $(cell).find('a').toArray()) {
    const $a = $(anchor);
    if ($a.find('img').length) continue;
    const name = cleanText($a.text());
    const href = $a.attr('href') || '';
    if (!name || /^(image|file|檔案|文件|圖像|图像|圖片|图片|編輯|编辑)$/i.test(name)) continue;
    if (/\/wiki\/(?:file|檔案|文件|image|media):/i.test(href) || href.startsWith('#') || /^javascript:/i.test(href)) continue;
    return { name, url: safeHttpUrl(href) };
  }
  return null;
}
function imageUrl($, row) {
  const image = $(row).find('img').first();
  if (!image.length) return null;
  let src = image.attr('src') || image.attr('data-src') || image.attr('data-original') || '';
  if (!src) src = (image.attr('srcset') || image.attr('data-srcset') || '').split(',')[0]?.trim().split(/\s+/)[0] || '';
  if (src.startsWith('//')) src = 'https:' + src;
  return safeHttpUrl(src);
}
export function parseOfficialMembers(html, revisionId = null) {
  if (typeof html !== 'string' || !html.trim()) throw new Error('來源 API 沒有回傳可解析的頁面內容。');
  const $ = cheerio.load(html);
  const root = $('.mw-parser-output').first().length ? $('.mw-parser-output').first() : ($('body').first().length ? $('body').first() : $.root());
  const table = findMembersTable($, root);
  if (!table) throw new Error('找不到「成員國」表格；為避免誤抓觀察國，已停止同步。');
  const column = memberColumnIndex($, table);
  const members = [];
  const seen = new Set();
  for (const row of $(table).find('tr').toArray()) {
    const cells = $(row).children('td,th').toArray();
    if (!cells.length || cells.some((cell) => (cell.name || '').toLowerCase() === 'th')) continue;
    let country = column >= 0 ? candidateLink($, cells[column]) : null;
    const imageIndex = cells.findIndex((cell) => $(cell).find('img').length > 0);
    if (!country && imageIndex >= 0) country = candidateLink($, cells[imageIndex]) || candidateLink($, cells[imageIndex + 1]);
    if (!country) {
      for (const cell of cells) { country = candidateLink($, cell); if (country) break; }
    }
    if (!country?.name) continue;
    const name = cleanText(country.name);
    if (!name || /^(序號|序号|成員國|成员国|駐聯代表|驻联代表|加入日期|備註|备注)$/u.test(name)) continue;
    const key = name.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    members.push({ id: 'member-' + (members.length + 1), name, url: country.url || SOURCE_PAGE_URL, icon: imageUrl($, row), iconAlt: name + '圖標' });
  }
  if (!members.length) throw new Error('已找到成員國表格，但未能解析出任何國家；為避免顯示錯誤名單，已停止同步。');
  return { sourceUrl: SOURCE_PAGE_URL, sourceRevisionId: revisionId ? String(revisionId) : null, count: members.length, members };
}
export async function fetchOfficialMembers() {
  const api = new URL('/api.php', SOURCE_ORIGIN);
  api.searchParams.set('action', 'parse');
  api.searchParams.set('page', SOURCE_PAGE_TITLE);
  api.searchParams.set('prop', 'text');
  api.searchParams.set('format', 'json');
  api.searchParams.set('formatversion', '2');
  api.searchParams.set('disablelimitreport', '1');
  const response = await fetch(api.toString(), {
    headers: { Accept: 'application/json', 'User-Agent': 'Wongming-UMO-Member-Directory/1.0' },
    next: { revalidate: 21600, tags: ['umo-official-members'] }
  });
  if (!response.ok) throw new Error('來源百科 API 回應 HTTP ' + response.status);
  const payload = await response.json();
  if (payload?.error) throw new Error('來源百科 API 錯誤：' + (payload.error.info || payload.error.code || '未知錯誤'));
  const parsed = payload?.parse;
  const html = typeof parsed?.text === 'string' ? parsed.text : parsed?.text?.['*'];
  if (typeof html !== 'string') throw new Error('來源百科 API 沒有回傳 parse.text。');
  return { ...parseOfficialMembers(html, parsed?.revid ?? null), syncedAt: new Date().toISOString() };
}
