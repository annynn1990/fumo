import MemberDirectory from '@/components/MemberDirectory';
import { fetchOfficialMembers } from '@/lib/member-parser';
import './embed.css';

export const revalidate = 300;
export default async function EmbedPage() {
  let initialData;
  try { initialData = { ok: true, ...(await fetchOfficialMembers()) }; }
  catch (error) {
    console.error('[UMO member directory] Initial render sync failed:', error);
    initialData = { ok: false, count: 0, members: [], sourceUrl: 'https://zh.micronations.wiki/wiki/聯合微國家組織會員國列表', error: '目前無法同步來源百科。請稍後重新整理。' };
  }
  return <main className="umo-page"><MemberDirectory initialData={initialData} /></main>;
}
