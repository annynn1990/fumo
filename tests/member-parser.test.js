import test from 'node:test';
import assert from 'node:assert/strict';
import { parseOfficialMembers } from '../lib/member-parser.js';

const fixture = '<div class="mw-parser-output"><h2>成員國</h2><table class="wikitable"><tr><th>序號</th><th>成員國</th><th>駐聯代表</th></tr><tr><td>1</td><td><a href="/wiki/File:North.png"><img src="//cdn.example.test/north.png" alt=""></a><a href="/wiki/北格蘭共和國">北格蘭共和國</a></td><td>代表甲</td></tr></table><h2>觀察國</h2><table><tr><td><img src="/observer.png"><a href="/wiki/觀察國甲">觀察國甲</a></td></tr></table><h2>已退出的會員國</h2><table><tr><td><a href="/wiki/退出國">退出國</a></td></tr></table></div>';

test('only parses formal members and original icon urls', () => {
  const result = parseOfficialMembers(fixture, 123);
  assert.equal(result.count, 1);
  assert.equal(result.members[0].name, '北格蘭共和國');
  assert.equal(result.members[0].icon, 'https://cdn.example.test/north.png');
  assert.equal(result.members.some((m) => m.name.includes('觀察國') || m.name.includes('退出國')), false);
});

test('fails closed if the formal member table cannot be identified', () => {
  assert.throws(() => parseOfficialMembers('<div class="mw-parser-output"><h2>觀察國</h2><table><tr><td>國甲</td></tr></table></div>'), /找不到「成員國」表格/);
});
