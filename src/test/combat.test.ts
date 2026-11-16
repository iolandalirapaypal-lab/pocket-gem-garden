import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, it, expect } from 'vitest';

const scope: any = {}; runInNewContext(readFileSync('public/combat.js', 'utf8'), scope);
const C = scope.LawlCombat;
const game = readFileSync('public/reinos.html', 'utf8');

describe('damage shown in combat', () => {
  it('shows the HP really lost on a normal hit', () => { const t = { hp: 100 }; expect(C.apply(t, 37)).toBe(37); expect(t.hp).toBe(63); });
  it('never shows more than the HP that was left (killing blow)', () => { const t = { hp: 12 }; expect(C.apply(t, 90)).toBe(12); expect(t.hp).toBe(0); });
  it('shows nothing for a hit fully absorbed (0 damage)', () => { expect(C.shown(50, 0)).toBe(0); });
  it('rejects forged hurt broadcasts', () => {
    expect(C.hurtMsg({ n: 25, el: 'fire' })).toEqual({ n: 25, el: 'fire', ms: false, miss: false });
    expect(C.hurtMsg({ n: -5 })).toBeNull();
    expect(C.hurtMsg({ n: 1e9 })).toBeNull();
    expect(C.hurtMsg({ n: 10, el: '<img>' })!.el).toBe('phys');
  });
  it('the PvP attacker no longer draws its own raw roll over the victim', () => {
    const fn = game.slice(game.indexOf('function pvpHit('), game.indexOf('function pvpRefreshAttack('));
    expect(fn).not.toContain('pop(');
  });
  it('the PvP victim shows and broadcasts the mitigated damage', () => {
    const fn = game.slice(game.indexOf('function pvpReceive('), game.indexOf('function pvpKilled('));
    expect(fn).toContain('hurtMe(dmg');
  });
});

describe('death at 0 HP', () => {
  it('a player at 0 HP does not regenerate back to life', () => { expect(C.regen(0, 200, 5)).toBe(0); expect(C.regen(10, 200, 5)).toBe(15); });
  it('the game resolves death before regenerating each frame', () => {
    const upd = game.slice(game.indexOf('function update(dt){'));
    expect(upd.indexOf('checkDeath();')).toBeLessThan(upd.indexOf('LawlCombat.regen('));
  });
  it('death sends the player to the temple and consumes the blessing charge', () => {
    const fn = game.slice(game.indexOf('function checkDeath(){'), game.indexOf('function hit(m,dmg'));
    expect(fn).toContain('p.x=30;p.y=30');
    expect(fn).toContain('LawlMarket.death(p');
    const M: any = {}; runInNewContext(readFileSync('public/market-specials.js', 'utf8'), M);
    const hero = { xp: 1000, deathBlessings: 1 }; M.LawlMarket.death(hero, ''); expect(hero.deathBlessings).toBe(0);
  });
});
