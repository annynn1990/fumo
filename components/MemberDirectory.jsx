'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

function formatUpdated(value) {
  if (!value) return '尚無同步時間';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '同步時間未知';
  return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Taipei' }).format(date);
}
export default function MemberDirectory({ initialData }) {
  const [data, setData] = useState(initialData || { members: [], count: 0 });
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState('');
  const refresh = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const response = await fetch('/api/members', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || '同步失敗');
      setData(payload); setStatus(manual ? '名錄已重新整理。' : '');
    } catch (error) { if (manual) setStatus(error.message || '同步失敗，請稍後再試。'); }
    finally { if (manual) setRefreshing(false); }
  }, []);
  useEffect(() => { const timer = window.setInterval(() => refresh(false), 30 * 60 * 1000); return () => window.clearInterval(timer); }, [refresh]);
  const members = Array.isArray(data.members) ? data.members : [];
  const filtered = useMemo(() => { const q = search.trim().toLocaleLowerCase(); return q ? members.filter((m) => String(m.name || '').toLocaleLowerCase().includes(q)) : members; }, [members, search]);
  return <section className="umo-directory" aria-label="聯合微國家組織正式成員國名錄">
    <header className="umo-header"><div className="umo-eyebrow">Federation of United Micronational Organisation</div><h1>聯合微國家組織</h1><p>正式成員國名錄</p><div className="umo-header-rule" /></header>
    <div className="umo-toolbar"><div className="umo-countline"><span className="umo-count">{data.count ?? members.length}</span><span>個正式成員國</span></div><button className="umo-refresh" type="button" onClick={() => refresh(true)} disabled={refreshing}><span className={refreshing ? 'umo-refresh-icon is-spinning' : 'umo-refresh-icon'} aria-hidden="true">↻</span>{refreshing ? '同步中' : '重新整理'}</button></div>
    <div className="umo-search-wrap"><span aria-hidden="true" className="umo-search-icon">⌕</span><input className="umo-search" type="search" placeholder="搜尋成員國名稱…" aria-label="搜尋成員國名稱" value={search} onChange={(e) => setSearch(e.target.value)} />{search && <button type="button" className="umo-clear" onClick={() => setSearch('')} aria-label="清除搜尋">×</button>}</div>
    {status && <p className="umo-status" role="status">{status}</p>}
    {members.length === 0 ? <div className="umo-empty" role="status"><div className="umo-empty-mark">!</div><strong>暫時無法取得成員國名錄</strong><p>{data.error || '請稍後重新整理。'}</p><a href={data.sourceUrl || 'https://zh.micronations.wiki/wiki/聯合微國家組織會員國列表'} target="_blank" rel="noreferrer">前往來源百科查看</a></div> : filtered.length === 0 ? <div className="umo-no-results">沒有符合「{search}」的成員國。</div> : <div className="umo-grid">{filtered.map((m) => <a className="umo-country" href={m.url || data.sourceUrl} target="_blank" rel="noreferrer" key={m.id || m.name} title={'在來源百科查看' + m.name}><span className="umo-flag-box">{m.icon ? <img src={m.icon} alt={m.iconAlt || m.name + '圖標'} loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.classList.add('has-no-flag'); }} /> : null}<span className="umo-no-flag" aria-hidden="true">旗</span></span><span className="umo-country-name">{m.name}</span><span className="umo-country-arrow" aria-hidden="true">↗</span></a>)}</div>}
    <footer className="umo-footer"><span>資料來源：MicroWiki</span><span>最近同步：{formatUpdated(data.syncedAt)}</span><a href={data.sourceUrl || 'https://zh.micronations.wiki/wiki/聯合微國家組織會員國列表'} target="_blank" rel="noreferrer">查看原始名單 ↗</a></footer>
  </section>;
}
