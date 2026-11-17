import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

type Tap = (o: { mode: string; mark?: string; attacker?: boolean; canHit: boolean }) => "walk" | "attack" | "profile";
const scope = {} as { LawlSkulls: { tapAction: Tap } };
runInNewContext(readFileSync("public/skulls.js", "utf8"), scope);
const tap = scope.LawlSkulls.tapAction;

describe("tapping another player follows the attack mode", () => {
  it("'Não atacar' opens the profile, even for skulled players", () => {
    expect(tap({ mode: "none", canHit: true })).toBe("profile");
    expect(tap({ mode: "none", mark: "white", canHit: true })).toBe("profile");
  });
  it("'Ignorar' lets the tap walk, but an attacker can still be answered", () => {
    expect(tap({ mode: "ignore", canHit: true })).toBe("walk");
    expect(tap({ mode: "ignore", attacker: true, canHit: true })).toBe("attack");
  });
  it("'Atacar marcados' attacks only skulled players or attackers", () => {
    expect(tap({ mode: "marked", canHit: true })).toBe("profile");
    expect(tap({ mode: "marked", mark: "red", canHit: true })).toBe("attack");
    expect(tap({ mode: "marked", attacker: true, canHit: true })).toBe("attack");
  });
  it("'Atacar todos' attacks anyone", () => {
    expect(tap({ mode: "all", canHit: true })).toBe("attack");
  });
  it("in a protection zone (or on the current target) the tap always opens the profile", () => {
    expect(tap({ mode: "all", canHit: false })).toBe("profile");
    expect(tap({ mode: "marked", mark: "black", canHit: false })).toBe("profile");
  });
});
