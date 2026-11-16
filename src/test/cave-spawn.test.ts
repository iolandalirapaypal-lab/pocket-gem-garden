import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { buildWorld } from "./world-harness";

/* The owner asked for underground monsters to be spread through each cave instead of piled in a few spots. */
describe("underground monsters are spread through each deep cave", () => {
  const s = buildWorld();
  s.ZONES.forEach((z: any, i: number) => { for (let k = 0; k < z.nz[1]; k++) s.spawn(i, 1); });
  const cheb = (a: any, b: any) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  for (const [i, z] of s.ZONES.entries() as [number, any][]) {
    const mobs = s.mobsZ[1].filter((m: any) => m.zone === i);
    it(`${z.name}: spawns every monster inside its own cave`, () => {
      expect(mobs.length).toBe(z.nz[1]);
      for (const m of mobs) expect(s.zoneAt(m.x, m.y, 1)).toBe(i);
    });
    if (mobs.length < 2) continue;
    it(`${z.name}: monsters start at least 3 SQM apart`, () => {
      for (const a of mobs) for (const b of mobs) if (a !== b) expect(cheb(a, b)).toBeGreaterThanOrEqual(3);
    });
    it(`${z.name}: no pile of more than 5 monsters in any 9×9 patch (lure chambers used to hold 8)`, () => {
      for (const a of mobs) expect(mobs.filter((b: any) => Math.abs(a.x - b.x) <= 4 && Math.abs(a.y - b.y) <= 4).length).toBeLessThanOrEqual(5);
    });
  }
  it("a respawned monster appears in the emptiest part of the cave", () => {
    const i = 0, u = s.ZONES[i].u;
    const before = s.mobsZ[1].filter((m: any) => m.zone === i);
    const gone = before.filter((m: any) => m.x < u.cx);
    s.mobsZ[1] = s.mobsZ[1].filter((m: any) => !gone.includes(m));
    s.spawn(i, 1);
    const fresh = s.mobsZ[1][s.mobsZ[1].length - 1];
    expect(fresh.x).toBeLessThan(u.cx);
  });
  it("an idle monster squeezed between others steps away from them", () => {
    const busy = new Set(["4,5", "5,4"]), occ = (x: number, y: number) => busy.has(`${x},${y}`);
    const g: any = {};
    runInNewContext(readFileSync("public/monster-ai.js", "utf8"), g);
    expect(g.LawlMonsterAI.idleDir({ x: 5, y: 5 }, occ)).toEqual([1, 1]);
  });
});
