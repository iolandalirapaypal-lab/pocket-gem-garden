import { describe, expect, it } from "vitest";
import { buildWorld, scope } from "./world-harness";

/* Hunting areas (surface and underground) from LawlCaves.carveHunt, for every zone of the expanded world. */
const s = buildWorld(), [top, under] = s.maps;
const zones = s.ZONES;

describe("hunting caves and surface hunts", () => {
  it("has the 41 hunting areas, ordered from the weakest Lawl hunt", () => {
    expect(zones).toHaveLength(41);
    expect(zones[0].top).toBe("Rat");
  });
  for (const [i, z] of zones.entries()) {
    const floors: [string, any[][], number, any[], any][] = [["subsolo", under, 7, z.lures, z.u], ["superfície", top, 0, z.luresTop, z]];
    for (const [label, grid, floor, lures, r] of floors) {
      const f = (x: number, y: number) => grid[y]?.[x] === floor || (grid[y]?.[x] === (label === "subsolo" ? 8 : 5));
      it(`${z.name} (${label}): every open tile is reachable from the stairs`, () => {
        const seen = new Set([`${r.cx},${r.cy}`]), q: [number, number][] = [[r.cx, r.cy]];
        for (let k = 0; k < q.length; k++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as [number, number][]) {
          const x = q[k]![0] + dx, y = q[k]![1] + dy;
          if (x > r.x1 && x < r.x2 && y > r.y1 && y < r.y2 && f(x, y) && !seen.has(`${x},${y}`)) { seen.add(`${x},${y}`); q.push([x, y]); }
        }
        let open = 0;
        for (let y = r.y1 + 1; y < r.y2; y++) for (let x = r.x1 + 1; x < r.x2; x++) if (f(x, y)) open++;
        expect(seen.size).toBe(open);
      });
      it(`${z.name} (${label}): has wide lure spots for 8+ monsters, away from the stairs`, () => {
        const big = lures.filter((c: any) => c.big);
        expect(big.length).toBeGreaterThanOrEqual(label === "subsolo" ? 6 : 2);
        for (const c of big) { expect(c.tiles.length).toBeGreaterThanOrEqual(24); expect(Math.hypot(c.x - r.cx, c.y - r.cy)).toBeGreaterThanOrEqual(4); }
      });
      it(`${z.name} (${label}): has no 1-SQM passages`, () => {
        const pinched: string[] = [];
        for (let y = r.y1 + 1; y < r.y2; y++) for (let x = r.x1 + 1; x < r.x2; x++) if (grid[y]![x] === floor) {
          const o = (a: number, b: number) => grid[b]?.[a] === floor || (b === r.y1 || b === r.y2 || a === r.x1 || a === r.x2) || grid[b]?.[a] === 5 || grid[b]?.[a] === 8;
          if ((!o(x - 1, y) && !o(x + 1, y)) || (!o(x, y - 1) && !o(x, y + 1))) pinched.push(`${x},${y}`);
        }
        expect(pinched).toEqual([]);
      });
    }
  }
  it("generates the same layout for every player", () => {
    const g = () => { const grid = Array.from({ length: 60 }, () => Array(60).fill(6)); scope.LawlCaves.carveHunt(grid, { x1: 2, y1: 2, x2: 30, y2: 30, cx: 16, cy: 16 }, 1234); return JSON.stringify(grid); };
    expect(g()).toBe(g());
  });
});

/* The owner asked for every underground hunt to be at least 6–7× the size it had. */
describe("deep underground hunts", () => {
  const D = scope.LawlWorld.DEEP, C = scope.LawlCaves;
  for (const [i, z] of zones.entries()) {
    const u = z.u, inner = (r: any) => (r.x2 - r.x1 - 1) * (r.y2 - r.y1 - 1);
    it(`${z.name}: the underground area is 6–7.5× the surface hunt above it`, () => {
      const k = inner(u) / inner(z);
      expect(k).toBeGreaterThanOrEqual(6);
      expect(k).toBeLessThanOrEqual(7.5);
    });
    it(`${z.name}: has at least 6× the walkable floor of the old underground cave`, () => {
      const old = Array.from({ length: s.H }, () => Array(s.W).fill(6));
      C.carveHunt(old, z, 9001 + i * 7919);
      let before = 0, after = 0;
      for (let y = z.y1; y <= z.y2; y++) for (let x = z.x1; x <= z.x2; x++) if (old[y]![x] === 7) before++;
      for (let y = u.y1; y <= u.y2; y++) for (let x = u.x1; x <= u.x2; x++) if (under[y]![x] === 7) after++;
      expect(after).toBeGreaterThanOrEqual(before * 6);
    });
    it(`${z.name}: stairs link the surface hunt and its deep cave both ways`, () => {
      expect(top[z.cy]![z.cx]).toBe(5);
      expect(under[u.cy]![u.cx]).toBe(8);
      expect(scope.LawlWorld.stairsTo(zones, 0, z.cx, z.cy)).toEqual({ zone: i, z: 1, x: u.cx, y: u.cy });
      expect(scope.LawlWorld.stairsTo(zones, 1, u.cx, u.cy)).toEqual({ zone: i, z: 0, x: z.cx, y: z.cy });
    });
  }
  it("keeps every deep cave apart, inside the underground map and below the surface rows", () => {
    for (const a of zones) {
      expect(a.u.y1).toBeGreaterThanOrEqual(D.oy);
      expect(a.u.x2).toBeLessThan(D.w);
      expect(a.u.y2).toBeLessThan(D.h);
      for (const b of zones) if (a !== b) expect(a.u.x2 < b.u.x1 || b.u.x2 < a.u.x1 || a.u.y2 < b.u.y1 || b.u.y2 < a.u.y1).toBe(true);
    }
    expect(under).toHaveLength(D.h);
    expect(under[0]).toHaveLength(D.w);
  });
  it("follows the Premium rule of the hunt above", () => {
    const free = zones.find((z: any) => z.city === "Lawl"), prem = zones.find((z: any) => z.city === "Glacira");
    expect(scope.LawlWorld.premiumOn(zones, 1, free.u.cx, free.u.cy)).toBe(false);
    expect(scope.LawlWorld.premiumOn(zones, 1, prem.u.cx, prem.u.cy)).toBe(true);
  });
  it("moves characters saved in the old underground to the stairs of the same deep cave", () => {
    const z = zones[3];
    const p = scope.LawlWorld.deepenSave({ x: z.x1 + 3, y: z.y1 + 4, z: 1 }, zones);
    expect(p).toMatchObject({ x: z.u.cx, y: z.u.cy, z: 1, cave: scope.LawlWorld.CAVE_V });
    const boss = scope.LawlWorld.deepenSave({ x: 5, y: 85, z: 2, bossRet: { x: z.cx + 2, y: z.cy, z: 1 } }, zones);
    expect(boss.bossRet).toEqual({ x: z.u.cx, y: z.u.cy, z: 1 });
    const moved = { x: z.u.cx + 4, y: z.u.cy, z: 1, cave: scope.LawlWorld.CAVE_V };
    expect(scope.LawlWorld.deepenSave({ ...moved }, zones)).toEqual(moved);
    expect(scope.LawlWorld.deepenSave({ x: 30, y: 30, z: 0 }, zones)).toMatchObject({ x: 30, y: 30, z: 0 });
  });
});
