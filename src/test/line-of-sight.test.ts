import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, it, expect } from 'vitest';

const scope: any = {};
runInNewContext(readFileSync('public/combat.js', 'utf8'), scope);
runInNewContext(readFileSync('public/chase.js', 'utf8'), scope);
const C = scope.LawlCombat, Ch = scope.LawlChase;

/* . floor, 1 water, 2 tree, 4 wall, 6 cave rock, 9 house wall, R rock (11) */
function grid(rows: string[]) {
  const g = rows.map(r => r.split('').map(c => (c === '.' ? 0 : c === 'R' ? 11 : Number(c))));
  return (x: number, y: number) => g[y]?.[x];
}

describe('attacks and trees/walls (line of sight)', () => {
  it('a tree between attacker and target blocks the shot', () => {
    const t = grid(['.....', '..2..', '.....']);
    expect(C.sight(0, 1, 4, 1, t)).toBe(false);
  });
  for (const [tile, ch] of [[2, '2'], [4, '4'], [6, '6'], [9, '9'], [11, 'R']] as const) it(`tile ${tile} blocks`, () => {
    const t = grid([`..${ch}..`]);
    expect(C.sight(0, 0, 4, 0, t)).toBe(false);
  });
  it('water and floor do not block', () => {
    expect(C.sight(0, 0, 4, 0, grid(['.111.']))).toBe(true);
    expect(C.sight(0, 0, 4, 0, grid(['.....']))).toBe(true);
  });
  it('neighbours always hit each other, diagonal included, even next to walls', () => {
    const t = grid(['.4', '4.']);
    expect(C.sight(0, 0, 1, 1, t)).toBe(true);
    expect(C.sight(0, 0, 1, 0, grid(['..']))).toBe(true);
  });
  it('is symmetric so attacker and victim agree', () => {
    const t = grid(['......', '...2..', '......', '......']);
    for (const [ax, ay, bx, by] of [[0, 0, 5, 3], [1, 0, 5, 2], [0, 2, 5, 1]])
      expect(C.sight(ax, ay, bx, by, t)).toBe(C.sight(bx, by, ax, ay, t));
  });
  it('area spells and runes skip cells behind a wall', () => {
    const t = grid(['.....', '.....', '..4..', '.....', '.....']);
    const cells = [[2, 1], [2, 2], [2, 3], [2, 4], [1, 3]];
    const got = C.reach(cells, 2, 0, t).map((c: number[]) => c.join(','));
    expect(got).toContain('2,1');
    expect(got).not.toContain('2,2');
    expect(got).not.toContain('2,3');
    expect(got).not.toContain('2,4');
  });
});

describe('keep-distance mode looks for a clear shot', () => {
  const open = () => true;
  it('moves when standing at a good distance but behind a tree', () => {
    const t = grid(['.......', '.......', '.......', '...2...', '.......', '.......', '.......']);
    const see = (x: number, y: number) => C.sight(x, y, 3, 0, t);
    const g = Ch.goal('keep', { x: 3, y: 6 }, { x: 3, y: 0 }, 7, open, see);
    expect(g).not.toBeNull();
    expect(see(g[0], g[1])).toBe(true);
  });
  it('stays put when the shot is clear', () => {
    const t = grid(['.......', '.......', '.......', '.......']);
    expect(Ch.goal('keep', { x: 3, y: 3 }, { x: 3, y: 0 }, 7, open, (x: number, y: number) => C.sight(x, y, 3, 0, t))).toBeNull();
  });
});
