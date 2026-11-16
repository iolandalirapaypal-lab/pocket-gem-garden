import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, it, expect } from 'vitest';

const scope: any = {}; runInNewContext(readFileSync('public/assistant.js', 'utf8'), scope);
runInNewContext(readFileSync('public/items.js', 'utf8'), scope);
const A = scope.LawlAssist, I = scope.LawlItems;
const slots = [{ w: 'exura', pct: 70, on: true }, { w: 'exura gran', pct: 50, on: true }, { w: 'exura vita', pct: 30, on: true }];

describe('assistant healing priorities', () => {
  it('moving priority 2 up makes it priority 1', () => {
    expect(A.moveSpell(slots, 1, -1).map((s: any) => s.w)).toEqual(['exura gran', 'exura', 'exura vita']);
  });
  it('moving priority 1 down makes it priority 2', () => {
    expect(A.moveSpell(slots, 0, 1).map((s: any) => s.w)).toEqual(['exura gran', 'exura', 'exura vita']);
  });
  it('cannot move past the first or last priority', () => {
    expect(A.moveSpell(slots, 0, -1).map((s: any) => s.w)).toEqual(['exura', 'exura gran', 'exura vita']);
    expect(A.moveSpell(slots, 2, 1).map((s: any) => s.w)).toEqual(['exura', 'exura gran', 'exura vita']);
  });
  it('the higher priority is cast first when both are under their limit', () => {
    const order = A.moveSpell(slots, 2, -1); // exura vita becomes priority 2
    expect(A.pickSpell(order, 20, () => true)).toBe('exura');
    expect(A.pickSpell(A.moveSpell(order, 1, -1), 20, () => true)).toBe('exura vita');
  });
});

describe('assistant potion choice', () => {
  it('health slot accepts every health and blended potion in the game', () => {
    for (const id of ['hp', 'hp2', 'hp3', 'hp4', 'hp5', 'bp1', 'bp2']) expect(A.normPotion(id, 'hp', I.byId)).toBe(id);
  });
  it('mana slot accepts every mana and blended potion in the game', () => {
    for (const id of ['mp', 'mp2', 'mp3', 'mp4', 'mp5', 'bp1', 'bp2']) expect(A.normPotion(id, 'mp', I.byId)).toBe(id);
  });
  it('a mana potion cannot go in the health slot (and vice versa); missing choice falls back to small potions', () => {
    expect(A.normPotion('mp3', 'hp', I.byId)).toBe('hp');
    expect(A.normPotion('hp3', 'mp', I.byId)).toBe('mp');
    expect(A.normPotion(undefined, 'hp', I.byId)).toBe('hp');
    expect(A.normPotion('rfire', 'mp', I.byId)).toBe('mp');
  });
});
