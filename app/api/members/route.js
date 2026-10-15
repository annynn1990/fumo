import { NextResponse } from 'next/server';
import { fetchOfficialMembers } from '@/lib/member-parser';

export const runtime = 'nodejs';
export const revalidate = 300;
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
};
export async function GET() {
  try {
    const payload = await fetchOfficialMembers();
    return NextResponse.json({ ok: true, ...payload }, { headers });
  } catch (error) {
    console.error('[UMO member directory] Sync failed:', error);
    return NextResponse.json({ ok: false, error: '目前無法同步來源百科。請稍後再試；來源恢復後會自動重新同步。', sourceUrl: 'https://zh.micronations.wiki/wiki/聯合微國家組織會員國列表' }, { status: 502, headers: { ...headers, 'Cache-Control': 'no-store' } });
  }
}
export async function OPTIONS() { return new Response(null, { status: 204, headers }); }
