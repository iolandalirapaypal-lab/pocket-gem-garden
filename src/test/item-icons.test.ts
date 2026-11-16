import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const scope: any = {};
runInNewContext(readFileSync("public/item-icons.js", "utf8"), scope);
runInNewContext(readFileSync("public/items.js", "utf8"), scope);
runInNewContext(readFileSync("public/mounts.js", "utf8"), scope);
const I = scope.LawlIcons, L = scope.LawlItems;

describe("item pictures", () => {
  it("every item the game uses has a picture in the item sheet", () => {
    const names = new Set<string>();
    for (const k of ["SHIELDS", "MELEE", "DISTANCE", "WANDS", "BACKPACKS", "HELMETS", "ARMORS", "LEGS", "BOOTS", "AMULETS", "RINGS"])
      for (const e of L[k] || []) names.add(Array.isArray(e) ? e[0] : e.name);
    for (const c of L.CONSUMABLES) if (!c.retired) names.add(c.nm);
    for (const x of L.LOOT_ITEMS) names.add(x.name);
    for (const M of scope.LawlMounts.catalog) names.add(M.item);
    expect(names.size).toBeGreaterThan(780);
    expect([...names].filter((n) => !I.has(n))).toEqual([]);
  });

  it("game-only drops, food, gold and the ground bag have their own pictures", () => {
    for (const n of ["Rabo de Rato", "Cabeça de Hydra", "Pão", "Presunto", "Pergaminho do Templo", "Prison Key", "@gold", "@bag"]) expect(I.has(n)).toBe(true);
  });

  it("menus show the sprite for known items and keep the emoji otherwise", () => {
    expect(L.icon(L.byId("hp"))).toContain("item-spr");
    expect(I.html("Black Armor", "🥋")).toContain("item-spr");
    expect(I.html("Item que não existe", "🥋")).toBe("🥋");
  });
});
