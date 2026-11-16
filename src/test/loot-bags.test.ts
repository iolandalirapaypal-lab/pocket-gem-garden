import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, it, expect } from 'vitest';

const scope: any = {};
runInNewContext(readFileSync('public/items.js', 'utf8'), scope);
runInNewContext(readFileSync('public/lootbags.js', 'utf8'), scope);
const I = scope.LawlItems, B = scope.LawlBags;
const green = { name: 'Green Backpack', slot: 'Mochila' };      // 15 slots
const sky = { name: 'Sky Backpack', slot: 'Mochila' };          // 40 slots
const gear = (n: string) => ({ name: n, slot: 'Armadura' });
const fill = (pl: any, which: 'bag' | 'loot', n: number) => { for (let i = 0; i < n; i++) B.stow(pl, { kind: 'gear', gear: gear('Chain Armor') }, which, false); };
const player = (extra: any = {}) => ({ bag: [], loot: {}, cons: {}, hpPot: 0, mpPot: 0, equip: { Mochila: green, MochilaLoot: green }, auto: {}, ...extra });

describe('loot destinations and bag limits', () => {
  it('each bag holds exactly the slots of its own backpack (5 without a backpack)', () => {
    expect(B.cap(player(), 'bag')).toBe(15); expect(B.cap(player(), 'loot')).toBe(15);
    const p = player({ equip: { Mochila: green, MochilaLoot: sky } });
    expect(B.cap(p, 'bag')).toBe(15); expect(B.cap(p, 'loot')).toBe(40);
    expect(B.cap(player({ equip: { Mochila: sky } }), 'loot')).toBe(5);
    expect(B.cap(player({ equip: {} }), 'bag')).toBe(5);
  });
  it('the Mochila stops at its 15 spaces while a 40-slot loot backpack keeps taking loot', () => {
    const p = player({ equip: { Mochila: green, MochilaLoot: sky } }); fill(p, 'bag', 15); fill(p, 'loot', 20);
    expect(B.stow(p, { kind: 'gear', gear: gear('Chain Armor') }, 'bag', false)).toBe('');
    expect(B.stow(p, { kind: 'gear', gear: gear('Chain Armor') }, 'loot', false)).toBe('loot');
    expect(B.used(p, 'bag')).toBe(15); expect(B.used(p, 'loot')).toBe(21);
  });
  it('every character gets one starter backpack for the loot bag, only once', () => {
    const p: any = { voc: 'knight', equip: { Mochila: green } };
    expect(I.grantLootBag(p).name).toBe('Green Backpack'); expect(B.cap(p, 'loot')).toBe(15);
    delete p.equip.MochilaLoot; expect(I.grantLootBag(p)).toBeNull(); expect(B.cap(p, 'loot')).toBe(5);
  });
  it('defaults: monster loot goes to the loot bag, potions and gear to the main bag', () => {
    const p = player();
    expect(B.take(p, { kind: 'loot', name: 'Teia', n: 2 }, false)).toBe('loot');
    expect(B.take(p, { kind: 'cons', id: 'hp', n: 1 }, false)).toBe('bag');
    expect(B.take(p, { kind: 'gear', gear: gear('Chain Armor') }, false)).toBe('bag');
    expect(B.used(p, 'loot')).toBe(1); expect(B.used(p, 'bag')).toBe(2);
  });
  it('the chosen destination is followed, and "ignore" leaves the item on the ground', () => {
    const p = player();
    B.setRoute(p, ['l:Teia', 'g:Chain Armor'], 'bag'); B.setRoute(p, ['c:hp'], 'loot'); B.setRoute(p, ['l:Ferrão'], 'ignore');
    expect(B.take(p, { kind: 'loot', name: 'Teia', n: 1 }, false)).toBe('bag');
    expect(B.take(p, { kind: 'cons', id: 'hp', n: 1 }, false)).toBe('loot');
    expect(B.take(p, { kind: 'gear', gear: gear('Chain Armor') }, false)).toBe('bag');
    expect(B.take(p, { kind: 'loot', name: 'Ferrão', n: 1 }, false)).toBe('');
    expect(p.loot['Ferrão']).toBeUndefined();
  });
  it('a full bag takes nothing new', () => {
    const p = player(); fill(p, 'loot', 15);
    expect(B.used(p, 'loot')).toBe(15);
    expect(B.take(p, { kind: 'loot', name: 'Teia', n: 1 }, false)).toBe('');
    expect(B.stow(p, { kind: 'gear', gear: gear('Chain Armor') }, 'loot', false)).toBe('');
    expect(B.used(p, 'loot')).toBe(15);
  });
  it('a full bag still stacks units of a stackable item it already holds', () => {
    const p = player(); B.take(p, { kind: 'loot', name: 'Teia', n: 3 }, false); fill(p, 'loot', 14);
    expect(B.used(p, 'loot')).toBe(15);
    expect(B.take(p, { kind: 'loot', name: 'Teia', n: 4 }, false)).toBe('loot');
    expect(p.loot['Teia']).toBe(7); expect(B.used(p, 'loot')).toBe(15);
  });
  it('the main bag limit no longer counts the loot bag, and vice versa', () => {
    const p = player(); fill(p, 'bag', 15);
    expect(I.bagUsed(p)).toBe(15);
    expect(B.take(p, { kind: 'loot', name: 'Teia', n: 1 }, false)).toBe('loot');
    expect(I.bagUsed(p)).toBe(15);
  });
  it('picking a ground bag checks room in each bag; ignored items go to their default bag', () => {
    const p = player(); B.setRoute(p, ['l:Teia'], 'ignore'); fill(p, 'loot', 15);
    expect(B.fits(p, [{ kind: 'loot', name: 'Teia', n: 1 }], false).ok).toBe(false);
    expect(B.fits(p, [{ kind: 'gear', gear: gear('Chain Armor') }], false).ok).toBe(true);
  });
  it('moving between bags needs room in the target bag', () => {
    const p = player(); B.take(p, { kind: 'loot', name: 'Teia', n: 1 }, false); fill(p, 'bag', 15);
    expect(B.move(p, 'l:Teia', 'bag', false)).toEqual({ ok: false, reason: 'full' });
    p.bag.pop();
    expect(B.move(p, 'l:Teia', 'bag', false).ok).toBe(true);
    expect(I.bagUsed(p)).toBe(15); expect(B.used(p, 'loot')).toBe(0);
  });
  it('the GameMaster is never blocked by bag limits', () => {
    const p = player(); fill(p, 'loot', 15);
    expect(B.take(p, { kind: 'loot', name: 'Teia', n: 1 }, true)).toBe('loot');
  });
  it('saved rules and positions are sanitized', () => {
    expect(B.normRoute({ 'l:Teia': 'loot', 'g:X': 'loot', 'c:hp': 'nowhere', bad: 'bag' })).toEqual({ 'g:X': 'loot' });
    const p: any = player({ where: { 'l:Gone': 'bag', 'c:hp': 'loot' }, hpPot: 2, equip: { Mochila: { ...green, inLoot: true } } });
    B.clean(p);
    expect(p.where).toEqual({ 'c:hp': 'loot' }); expect(p.equip.Mochila.inLoot).toBeUndefined();
  });
});
