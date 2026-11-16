import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const s: any = {};
runInNewContext(readFileSync("public/items.js", "utf8"), s);
runInNewContext(readFileSync("public/charging.js", "utf8"), s);
const C = s.LawlCharging, I = s.LawlItems;
const game = readFileSync("public/reinos.html", "utf8");

const rich = (extra: any = {}) => {
  const loot: Record<string, number> = {};
  for (const T of C.TYPES) for (const n of T.items) loot[n] = 100;
  return { level: 200, gold: 10_000_000, loot, charging: [] as any[], ...extra };
};

describe("imbuement catalog (Lawl charging)", () => {
  it("has the 13 types of the Lawl window in Misc, Skills and Protection", () => {
    expect(C.TYPES.map((t: any) => t.id)).toEqual(["speed", "life", "mana", "crit", "melee", "distance", "magic", "defense", "fire", "ice", "earth", "energy", "death"]);
    expect(C.TIERS.map((t: any) => t.k)).toEqual([1, 2, 3]);
  });
  it("Extreme life drain gives 25% with 100% chance, lasts 20h and needs level 150 and Premium", () => {
    expect(C.describe("life", 3)).toEqual(["+25% de dreno de vida com 100% de chance", "Duração: 20h", "Ativação: em combate", "Nível necessário: 150", "Só Premium: Sim"]);
    expect(C.tierOf(3).gold).toBe(150000);
  });
  it("every requirement is a creature item that monsters drop", () => {
    for (const T of C.TYPES) for (const n of T.items) { const it = I.lootItem(n); expect(it, n).toBeTruthy(); expect(Object.keys(it.drops).length, n).toBeGreaterThan(0); }
  });
  it("tier N asks for the first N items of the type", () => {
    expect(C.recipe("life", 1)).toEqual([{ name: "Bat Wing", n: 20 }]);
    expect(C.recipe("life", 3).length).toBe(3);
  });
});

describe("charging with Charles", () => {
  it("charges gold and items and adds a 20h active imbuement", () => {
    const pl = rich();
    const r = C.charge(pl, "crit", 2, { premium: false });
    expect(r.ok).toBe(true);
    expect(pl.gold).toBe(10_000_000 - 50000);
    expect(pl.loot["Orc Skin"]).toBe(80);
    expect(pl.loot["Minotaur Horn"]).toBe(85);
    expect(pl.charging).toEqual([{ t: "crit", tier: 2, left: 72000, on: true }]);
  });
  it("Extreme is Premium only", () => {
    expect(C.check(rich(), "life", 3, { premium: false }).reason).toBe("premium");
    expect(C.check(rich(), "life", 3, { premium: true }).ok).toBe(true);
  });
  it("blocks low level, missing gold and missing items", () => {
    expect(C.check(rich({ level: 19 }), "speed", 1, {}).reason).toBe("level");
    expect(C.check(rich({ gold: 14999 }), "speed", 1, {}).reason).toBe("gold");
    const pl = rich(); pl.loot["Elf Ear"] = 19;
    const c = C.check(pl, "speed", 1, {});
    expect(c.reason).toBe("items");
    expect(c.missing).toEqual([{ name: "Elf Ear", n: 20, have: 19 }]);
  });
  it("only one of each type; up to 8 kept and only 4 switched on", () => {
    const pl = rich();
    expect(C.charge(pl, "speed", 1, {}).ok).toBe(true);
    expect(C.check(pl, "speed", 2, {}).reason).toBe("owned");
    for (const id of ["life", "mana", "crit", "melee", "distance", "magic", "defense"]) expect(C.charge(pl, id, 1, {}).ok).toBe(true);
    expect(pl.charging.length).toBe(8);
    expect(pl.charging.filter((e: any) => e.on).length).toBe(4);
    expect(C.check(pl, "fire", 1, {}).reason).toBe("full");
    expect(C.toggle(pl, "magic").reason).toBe("active");
    expect(C.toggle(pl, "speed").on).toBe(false);
    expect(C.toggle(pl, "magic").on).toBe(true);
  });
});

describe("Russel cancels", () => {
  it("removes the imbuement without refunding gold or items", () => {
    const pl = rich(); C.charge(pl, "fire", 1, {});
    const gold = pl.gold, leather = pl.loot["Dragon Leather"];
    expect(C.cancel(pl, "fire").t).toBe("fire");
    expect(pl.charging).toEqual([]);
    expect(pl.gold).toBe(gold);
    expect(pl.loot["Dragon Leather"]).toBe(leather);
    expect(C.cancel(pl, "fire")).toBeNull();
  });
});

describe("effects", () => {
  it("skills and protections add to the gear bonuses, protection capped", () => {
    const pl = { charging: [{ t: "melee", tier: 3, left: 100, on: true }, { t: "fire", tier: 3, left: 100, on: true }, { t: "death", tier: 1, left: 100, on: false }] };
    const b = C.merge({ skill: { sword: 2 }, res: { fire: 40 } }, pl, true, 50);
    expect(b.skill.sword).toBe(6);
    expect(b.res.fire).toBe(50);
    expect(b.res.death).toBeUndefined();
  });
  it("speed, life and mana drain values per tier", () => {
    const pl = { charging: [{ t: "speed", tier: 3, left: 9, on: true }, { t: "life", tier: 1, left: 9, on: true }, { t: "mana", tier: 2, left: 9, on: true }] };
    const b = C.bonus(pl, true);
    expect(b.speed).toBe(30);
    expect(C.leech(b, 200)).toEqual({ hp: 10, mp: 10 });
  });
  it("Extreme stops working without Premium", () => {
    const pl = { charging: [{ t: "life", tier: 3, left: 9, on: true }] };
    expect(C.bonus(pl, false).life).toBe(0);
    expect(C.bonus(pl, true).life).toBe(25);
  });
  it("critical hits 10% of the time for the tier bonus", () => {
    const b = C.bonus({ charging: [{ t: "crit", tier: 3, left: 9, on: true }] }, true);
    expect(C.strike(b, 100, 0.05)).toEqual({ dmg: 150, crit: true });
    expect(C.strike(b, 100, 0.1)).toEqual({ dmg: 100, crit: false });
  });
  it("time only runs in combat and expired imbuements are removed", () => {
    const pl: any = { charging: [{ t: "speed", tier: 1, left: 5, on: true }, { t: "life", tier: 1, left: 5, on: false }] };
    expect(C.tick(pl, 10, false, false)).toEqual([]);
    expect(pl.charging[0].left).toBe(5);
    const gone = C.tick(pl, 10, true, false);
    expect(gone.map((e: any) => e.t)).toEqual(["speed"]);
    expect(pl.charging).toEqual([{ t: "life", tier: 1, left: 5, on: false }]);
  });
  it("a forged save is cleaned: unknown types, duplicates, too much time, more than 4 on", () => {
    const raw = [{ t: "x", tier: 1, left: 5, on: true }, { t: "speed", tier: 9, left: 5, on: true },
      ...["speed", "speed", "life", "mana", "crit", "melee", "distance"].map(t => ({ t, tier: 1, left: 1e9, on: true }))];
    const n = C.normalize(raw);
    expect(n.map((e: any) => e.t)).toEqual(["speed", "life", "mana", "crit", "melee", "distance"]);
    expect(n.every((e: any) => e.left === 72000)).toBe(true);
    expect(n.filter((e: any) => e.on).length).toBe(4);
  });
});

describe("game wiring", () => {
  it("Charles and Russel stand in the Lawl plaza and open their windows", () => {
    expect(game).toContain('id:"charging",x:28,y:32');
    expect(game).toContain('id:"uncharging",x:32,y:32');
    expect(game).toContain('if(id==="charging")return openCharging();if(id==="uncharging")return openUncharge();');
    expect(game).toContain('<script src="/charging.js"></script>');
  });
});
