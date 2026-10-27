import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchOfficialMembers } from '../lib/member-parser.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(projectRoot, 'public/data/members.json');

try {
  const payload = await fetchOfficialMembers();

  if (!Array.isArray(payload.members) || payload.members.length === 0) {
    throw new Error('來源未回傳任何正式成員國；保留上次有效名錄。');
  }

  const document = {
    ok: true,
    ...payload,
    syncSchedule: 'weekly'
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(document, null, 2) + '\n', 'utf8');

  console.log(
    `同步成功：${document.count} 個正式成員國；來源方式：${document.fetchMethod}；同步時間：${document.syncedAt}`
  );
} catch (error) {
  console.error('同步失敗；未覆寫 public/data/members.json。');
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
}
