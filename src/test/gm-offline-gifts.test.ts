import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// GM rewards reach any character (any slot, online or offline) and each gift is applied once.
const gm = "11111111-1111-4111-8111-111111111111";
const bob = "33333333-3333-4333-8333-333333333333";
type Ev = { id: number; action: string; payload: Record<string, unknown> };
type P = { gems?: number; gmGemCursor?: number; gmGiftCursor?: number; premiumUntil?: number; level?: number; skills?: Record<string, number> };
const scope = {} as { LawlGameMaster: {
  takeGift: (p: P, e: unknown, uid: string, slot: number) => Record<string, unknown> | null;
  applyGiftStats: (p: P, d: Record<string, unknown>, now?: number) => unknown;
  applyGems: (p: P, e: unknown, uid: string, slot?: number) => boolean;
  validate: (a: string, d: unknown) => unknown;
  parseCommand: (t: string) => Record<string, unknown> | null;
} };
runInNewContext(readFileSync("public/gamemaster.js", "utf8"), scope);
const L = scope.LawlGameMaster;
let db: PGlite;
const as = (id: string) => db.query("SELECT set_config('test.uid',$1,false)", [id]);
const one = async <T>(sql: string, params: unknown[] = []) => (await db.query<T>(sql, params)).rows[0] as T;

describe("GM gifts to offline characters", () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
      CREATE TABLE public.game_saves(user_id uuid PRIMARY KEY, character_slot int, data jsonb NOT NULL, updated_at timestamptz DEFAULT now());
      CREATE TABLE public.lawl_characters(user_id uuid, slot int, data jsonb, updated_at timestamptz, PRIMARY KEY(user_id,slot));
      CREATE TABLE public.lawl_gm_events(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_id uuid, action text, payload jsonb, created_at timestamptz DEFAULT now());
      CREATE TABLE public.lawl_gem_sellable(user_id uuid, slot int, amount bigint, updated_at timestamptz, PRIMARY KEY(user_id,slot));
      CREATE FUNCTION public.lawl_is_gm() RETURNS boolean LANGUAGE sql AS $$ SELECT auth.uid()='${gm}'::uuid $$;
      CREATE FUNCTION public.lawl_jnum(v jsonb) RETURNS numeric LANGUAGE sql AS $$ SELECT CASE WHEN jsonb_typeof(v)='number' THEN (v#>>'{}')::numeric END $$;
      CREATE FUNCTION public.lawl_jint(v jsonb, lo bigint, hi bigint) RETURNS boolean LANGUAGE sql AS $$ SELECT coalesce(public.lawl_jnum(v)=trunc(public.lawl_jnum(v)) AND public.lawl_jnum(v) BETWEEN lo AND hi,false) $$;
      CREATE FUNCTION public.lawl_sellable_add(p_user uuid, p_slot int, p_delta bigint) RETURNS bigint LANGUAGE sql AS $$
        INSERT INTO public.lawl_gem_sellable VALUES(p_user,p_slot,p_delta,now()) ON CONFLICT(user_id,slot) DO UPDATE SET amount=public.lawl_gem_sellable.amount+p_delta RETURNING amount $$;
      INSERT INTO public.game_saves VALUES('${gm}',1,'{"name":"GameMaster","gems":0}'),('${bob}',1,'{"name":"Bob","gems":5}');
      INSERT INTO public.lawl_characters VALUES('${gm}',1,'{"name":"GameMaster","gems":0}',now()),('${bob}',1,'{"name":"Bob","gems":5}',now()),('${bob}',2,'{"name":"Bobby","gems":1}',now());`);
    await db.exec(readFileSync("drizzle/migrations/0000_gm_offline_gifts.sql", "utf8"));
    await as(gm);
  }, 30000);
  afterAll(async () => { await db.close(); });

  it("gives gems to a character that is not the account's active one", async () => {
    await db.query("SELECT public.lawl_gm_gems('bobby',40)");
    expect((await one<{ g: number }>(`SELECT (data->>'gems')::int g FROM public.lawl_characters WHERE user_id='${bob}' AND slot=2`)).g).toBe(41);
    expect((await one<{ g: number }>(`SELECT (data->>'gems')::int g FROM public.game_saves WHERE user_id='${bob}'`)).g).toBe(5);
    expect((await one<{ a: number }>(`SELECT amount::int a FROM public.lawl_gem_sellable WHERE user_id='${bob}' AND slot=2`)).a).toBe(40);
  });

  it("queues item, Premium and level gifts for exactly that character", async () => {
    await db.query("SELECT public.lawl_gm_gift('Bobby',$1)", [{ kind: "item", type: "loot", name: "Bone", quantity: 3 }]);
    await db.query("SELECT public.lawl_gm_gift('Bobby',$1)", [{ kind: "premium", days: 30 }]);
    await db.query("SELECT public.lawl_gm_gift('Bob',$1)", [{ kind: "grant", levels: 2, skill: "sword", amount: 0 }]);
    await as(bob);
    const slot2 = (await one<{ r: Ev[] }>("SELECT public.lawl_gm_inbox(2,0) r")).r;
    expect(slot2.map(e => e.payload["kind"])).toEqual(["item", "premium"]);
    const slot1 = (await one<{ r: Ev[] }>("SELECT public.lawl_gm_inbox(1,0) r")).r;
    expect(slot1.map(e => e.payload["kind"])).toEqual(["grant"]);
    expect((await one<{ r: Ev[] }>("SELECT public.lawl_gm_inbox(2,$1) r", [slot2[1]!.id])).r).toEqual([]);
    await as(gm);
  });

  it("only lets the GameMaster send gifts and rejects bad gifts or unknown names", async () => {
    await as(bob);
    await expect(db.query("SELECT public.lawl_gm_gift('Bob',$1)", [{ kind: "premium", days: 1 }])).rejects.toThrow("Forbidden");
    await as(gm);
    await expect(db.query("SELECT public.lawl_gm_gift('Ninguem',$1)", [{ kind: "premium", days: 1 }])).rejects.toThrow("Player not found");
    for (const bad of [{ kind: "premium", days: 0 }, { kind: "item", type: "gold", quantity: 0 }, { kind: "item", type: "equip", index: 1, quantity: 21 }, { kind: "hack" }])
      await expect(db.query("SELECT public.lawl_gm_gift('Bob',$1)", [bad])).rejects.toThrow("Invalid gift");
  });

  it("applies each gift once, only on its own character, and adds Premium days", () => {
    const now = Date.UTC(2026, 10, 16);
    const e = { id: 7, action: "gift", payload: { target: bob, slot: 2, kind: "premium", days: 30 } };
    const p: P = { premiumUntil: 0 };
    expect(L.takeGift(p, e, bob, 1)).toBeNull();
    const d = L.takeGift(p, e, bob, 2)!;
    L.applyGiftStats(p, d, now);
    expect(p.premiumUntil).toBe(now + 30 * 864e5);
    expect(L.takeGift(p, e, bob, 2)).toBeNull();
    const lv: P = { level: 5, skills: { sword: 10 } };
    L.applyGiftStats(lv, { kind: "grant", levels: 2, skill: "sword", amount: 3 });
    expect(lv.level).toBe(7); expect(lv.skills!["sword"]).toBe(13);
  });

  it("does not add gems meant for another character of the same account", () => {
    const p: P = { gems: 0 };
    expect(L.applyGems(p, { id: 9, action: "gems", payload: { target: bob, slot: 2, amount: 10 } }, bob, 1)).toBe(false);
    expect(L.applyGems(p, { id: 9, action: "gems", payload: { target: bob, slot: 2, amount: 10 } }, bob, 2)).toBe(true);
    expect(p.gems).toBe(10);
  });

  it("parses /premium and /dar", () => {
    expect(L.parseCommand("/premium Bob 30")).toMatchObject({ cmd: "premium", name: "Bob", amount: 30 });
    expect(L.parseCommand("/dar Bob Grande, Magic Plate Armor, 2")).toMatchObject({ cmd: "dar", name: "Bob Grande", item: "Magic Plate Armor", quantity: 2 });
    expect(() => L.validate("gift", { target: "Bob", kind: "item", type: "equip", index: 3, quantity: 1 })).not.toThrow();
    expect(() => L.validate("gift", { target: "Bob", kind: "premium", days: 0 })).toThrow();
  });
});
