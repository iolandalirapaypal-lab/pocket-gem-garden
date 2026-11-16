import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

type Look = { id: string; head: number; body: number; legs: number; feet: number; cape: boolean; ornament: boolean; hat?: boolean };
type Player = { voc: string; outfit?: Look; hp: number; mp: number; level: number; gold: number; gems: number; skills: { sword: number }; equip: Record<string, unknown> };
const scope = {} as { LawlOutfits: { normalize: (value: unknown, voc: string) => Look; apply: (player: Player, draft: unknown) => Look } };
runInNewContext(readFileSync("public/outfits.js", "utf8"), scope);
const outfits = scope.LawlOutfits;

describe("cosmetic outfits", () => {
  it("applies an outfit without changing combat stats or currencies", () => {
    const player = { voc: "knight", hp: 150, mp: 50, level: 1, gold: 20, gems: 10, skills: { sword: 10 }, equip: {} };
    const before = JSON.parse(JSON.stringify(player));
    outfits.apply(player, { id: "mage", head: 3, body: 8, legs: 6, feet: 0, cape: true, ornament: true });
    expect(JSON.parse(JSON.stringify(player))).toEqual({ ...before, outfit: { id: "mage", head: 3, body: 8, legs: 6, feet: 0, cape: true, ornament: true } });
    expect([player.hp, player.mp, player.level, player.gold, player.gems, player.skills.sword]).toEqual([150, 50, 1, 20, 10, 10]);
    expect(player.equip).toEqual({});
  });
  it("restores the selected look from a saved character", () => {
    const look = { id: "hunter", head: 3, body: 8, legs: 6, feet: 0, cape: true, ornament: false };
    expect(outfits.normalize(JSON.parse(JSON.stringify(look)), "knight")).toEqual(look);
  });
  it("gives older characters a vocation-appropriate default and rejects invalid colors", () => {
    expect(outfits.normalize(undefined, "druid").id).toBe("druid");
    expect(outfits.normalize({ id: "invalid", head: -1, body: 99 }, "knight")).toMatchObject({ id: "knight", head: 1, body: 1 });
  });
});
describe("mage hat toggle", () => {
  it("keeps the hat by default and remembers when it is removed", () => {
    expect(outfits.normalize({ id: "mage" }, "sorcerer")).not.toHaveProperty("hat");
    expect(outfits.normalize({ id: "mage", hat: false }, "sorcerer").hat).toBe(false);
    expect(outfits.normalize({ id: "knight", hat: false }, "knight")).not.toHaveProperty("hat");
  });
});
describe("Lawl MMORPG outfits", () => {
  const cat = (scope as unknown as { LawlOutfits: { catalog: { id: string; name: string; addons?: string[] }[] } }).LawlOutfits.catalog;
  it("offers the 14 Lawl outfits, each with two addons", () => {
    const lawl = cat.filter(c => c.addons);
    expect(lawl.map(c => c.name)).toEqual(["Villager", "Knight", "Paladin", "Wizard", "Amazon", "Summoner", "Slayer", "Primal", "Warlock", "Sensei", "Hunter", "Hitman", "Voyager", "Sublime"]);
    expect(lawl.every(c => c.addons!.length === 2)).toBe(true);
  });
  it("keeps the original 8 outfits so old saves still load", () => {
    expect(cat.slice(0, 8).map(c => c.id)).toEqual(["citizen", "knight", "hunter", "mage", "druid", "assassin", "noble", "barbarian"]);
  });
  it("saves a Lawl outfit with both addons switched on", () => {
    const look = { id: "warlock", head: 3, body: 0, legs: 3, feet: 0, cape: true, ornament: true };
    expect(outfits.normalize(look, "sorcerer")).toEqual(look);
  });
});
