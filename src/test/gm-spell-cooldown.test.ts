import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

/* Runs the game's real castById with a minimal world: one attack spell with a 2s cooldown. */
function caster(gm: boolean) {
  const game = readFileSync("public/reinos.html", "utf8");
  const start = game.indexOf("function castById("), src = game.slice(start, game.indexOf("\n}\n", start) + 3);
  const said: string[] = [];
  let casts = 0;
  const sp = { w: "exori test", n: "Test", k: "hit", mp: 0, lv: 1, v: ["knight"], ic: "*" };
  const g: any = {
    SPELLS: [sp], p: { voc: "knight", level: 1, mp: 100, x: 0, y: 0, z: 0 }, SFX: {}, groupCd: {}, spellCd: {},
    sNow: () => 10, isGM: () => gm, say: (t: string) => said.push(t), pop: () => {}, addSkill: () => {}, renderUI: () => {},
    SPELL_COST: {}, SPELL_RUN: { hit: () => { casts++; } }, modalKind: null, window: {}, $: () => null,
    LawlSpells: { cooldownsFor: () => [{ key: "s:exori test", sec: 2 }, { key: "g:attack", sec: 2 }], cooldownSec: () => 2 },
  };
  runInNewContext(src, g);
  return { cast: () => g.castById(sp.w, ""), casts: () => casts, said, g };
}

describe("GameMaster spells", () => {
  it("GameMaster can cast the same spell again right away (no cooldown)", () => {
    const c = caster(true);
    c.cast(); c.cast(); c.cast();
    expect(c.casts()).toBe(3);
    expect(c.said).not.toContain("Você está exausto.");
  });
  it("normal players still wait for the cooldown", () => {
    const c = caster(false);
    c.cast(); c.cast();
    expect(c.casts()).toBe(1);
    expect(c.said).toContain("Você está exausto.");
  });
});
