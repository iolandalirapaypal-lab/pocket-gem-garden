import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/* Mercado do Depot: ofertas de compra/venda entre jogadores, taxa e entregas no depot. */
const scope: any = {};
runInNewContext(readFileSync("public/depot-market.js", "utf8"), scope);
const M = scope.LawlDepotMarket;

function marketSql(): string {
  if (process.env["DMARKET_SQL"]) return readFileSync(process.env["DMARKET_SQL"], "utf8");
  const dir = "drizzle/migrations";
  const f = readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()
    .map((x) => readFileSync(`${dir}/${x}`, "utf8")).filter((s) => s.includes("FUNCTION public.lawl_depot_market(")).pop();
  if (!f) throw new Error("depot market migration not found");
  return f;
}

const alice = "22222222-2222-4222-8222-222222222222", bob = "33333333-3333-4333-8333-333333333333";
let db: PGlite, n = 0;
const rid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;
const as = (id: string) => db.query("select set_config('test.uid',$1,false)", [id]);
const act = async (action: string, data: unknown = {}, slot = 1) =>
  (await db.query<{ r: any }>("select public.lawl_depot_market($1,$2,$3) r", [action, slot, data])).rows[0]!.r;
const pending = async () => (await act("pending")).deliveries as any[];

describe("depot market rules", () => {
  it("creation tax is 2% of the total, at least 20 and at most 1,000,000 gold", () => {
    expect(M.fee(100)).toBe(20);
    expect(M.fee(10000)).toBe(200);
    expect(M.fee(1001)).toBe(21);
    expect(M.fee(100000000)).toBe(1000000);
  });
  it("a buy offer locks the total plus the tax; a sell offer pays only the tax", () => {
    expect(M.check({ side: "buy", kind: "loot", item: "Teia", amount: 10, price: 50 })).toMatchObject({ total: 500, fee: 20, cost: 520 });
    expect(M.check({ side: "sell", kind: "loot", item: "Teia", amount: 10, price: 5000 })).toMatchObject({ total: 50000, fee: 1000, cost: 1000 });
  });
  it("stackables go up to 2000 per offer and equipment one per offer", () => {
    expect(M.check({ side: "sell", kind: "loot", item: "Teia", amount: 2000, price: 1 }).ok).toBe(true);
    expect(M.check({ side: "sell", kind: "loot", item: "Teia", amount: 2001, price: 1 }).ok).toBe(false);
    expect(M.check({ side: "sell", kind: "gear", item: "Sword|knight", amount: 2, price: 1 }).ok).toBe(false);
  });
  it("selling takes items from the depot and deliveries land in the depot", () => {
    const key = (e: any) => e.name + "|" + e.voc[0];
    const p: any = { gold: 0, depot: { items: [{ name: "Boots", voc: ["knight"], charge: 7 }], loot: { Teia: 5 } } };
    expect(M.take(p.depot, "loot", "Teia", 6, key)).toBeNull();
    expect(M.take(p.depot, "loot", "Teia", 5, key)).toEqual({ charge: null });
    expect(p.depot.loot).toEqual({});
    expect(M.take(p.depot, "gear", "Boots|knight", 1, key)).toEqual({ charge: 7 });
    M.give(p, { kind: "loot", item: "Teia", amount: 3, gold: 150 }, () => null, () => true);
    M.give(p, { kind: "gear", item: "Boots|knight", amount: 1, gold: 0, charge: 7 }, () => ({ name: "Boots", voc: ["knight"] }), () => true);
    expect(p.gold).toBe(150);
    expect(p.depot.loot.Teia).toBe(3);
    expect(p.depot.items).toEqual([{ name: "Boots", voc: ["knight"], charge: 7 }]);
  });
});

describe("depot market database", () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth;
      create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
      create table public.game_saves(user_id uuid primary key, data jsonb not null default '{}', updated_at timestamptz not null default now(), character_slot integer not null default 1);
      create table public.lawl_moderation(user_id uuid primary key, muted_until timestamptz, suspended_until timestamptz, reason text not null default '', updated_at timestamptz not null default now());
      create function public.lawl_jnum(v jsonb) returns numeric language sql immutable as $$ SELECT CASE WHEN jsonb_typeof(v)='number' THEN (v#>>'{}')::numeric END $$;
      create function public.lawl_jint(v jsonb, lo bigint, hi bigint) returns boolean language sql immutable as $$ SELECT coalesce(public.lawl_jnum(v)=trunc(public.lawl_jnum(v)) AND public.lawl_jnum(v) BETWEEN lo AND hi,false) $$;`);
    await db.exec(marketSql());
    await db.query("insert into game_saves(user_id,data,character_slot) values($1,$2,1),($3,$4,1)", [alice, { name: "Alice" }, bob, { name: "Bob" }]);
  }, 30000);
  afterAll(async () => { await db?.close(); });

  it("server tax matches the browser rule", async () => {
    for (const t of [0, 100, 1001, 10000, 100000000]) {
      const r = (await db.query<{ f: string }>("select public.lawl_depot_market_fee($1)::text f", [t])).rows[0]!.f;
      expect(Number(r)).toBe(M.fee(t));
    }
  });

  it("a sell offer can be bought in part; buyer gets items, seller gets gold", async () => {
    await as(alice);
    const offer = rid();
    const c = await act("create", { id: offer, side: "sell", kind: "loot", item: "Teia", amount: 10, price: 50 });
    expect(c).toMatchObject({ ok: true, fee: 20 });
    expect(await act("create", { id: offer, side: "sell", kind: "loot", item: "Teia", amount: 10, price: 50 })).toMatchObject({ ok: true, repeat: true });
    await as(bob);
    const list = (await act("list")).offers;
    expect(list.find((o: any) => o.id === offer)).toMatchObject({ name: "Alice", amount: 10, mine: false });
    const deal = rid();
    expect(await act("accept", { id: deal, offer, amount: 4, price: 50 })).toMatchObject({ ok: true, total: 200 });
    expect(await act("accept", { id: deal, offer, amount: 4, price: 50 })).toMatchObject({ ok: true, repeat: true });
    const mineB = await pending();
    expect(mineB).toEqual([expect.objectContaining({ reason: "bought", item: "Teia", amount: 4, gold: 0, partner: "Alice" })]);
    await as(alice);
    expect(await pending()).toEqual([expect.objectContaining({ reason: "sold", item: "Teia", amount: 0, gold: 200, partner: "Bob" })]);
    expect((await act("mine")).offers[0]).toMatchObject({ id: offer, amount: 6 });
    await as(bob);
    expect(await act("accept", { id: rid(), offer, amount: 7, price: 50 })).toMatchObject({ ok: false });
  });

  it("a buy offer can be filled by another player; buyer gets items, seller gets gold", async () => {
    await as(bob);
    const offer = rid();
    expect(await act("create", { id: offer, side: "buy", kind: "gear", item: "Plate Armor|knight", amount: 1, price: 5000, anonymous: true })).toMatchObject({ ok: true, fee: 100 });
    await as(alice);
    expect((await act("list")).offers.find((o: any) => o.id === offer)).toMatchObject({ name: "", side: "buy" });
    await act("ack", { ids: (await pending()).map((d) => d.id) });
    expect(await act("accept", { id: rid(), offer, amount: 1, price: 5000, charge: 3 })).toMatchObject({ ok: true });
    expect(await pending()).toEqual([expect.objectContaining({ reason: "sold", gold: 5000, partner: "" })]);
    await as(bob);
    await act("ack", { ids: (await pending()).filter((d) => d.reason !== "bought" || d.item !== "Plate Armor|knight").map((d) => d.id) });
    expect(await pending()).toEqual([expect.objectContaining({ reason: "bought", kind: "gear", item: "Plate Armor|knight", amount: 1, charge: 3, partner: "Alice" })]);
  });

  it("players cannot accept their own offers", async () => {
    await as(alice);
    const offer = rid();
    await act("create", { id: offer, side: "sell", kind: "loot", item: "Osso Antigo", amount: 1, price: 10 });
    expect(await act("accept", { id: rid(), offer, amount: 1, price: 10 })).toMatchObject({ ok: false });
  });

  it("cancelling returns what is left but keeps the tax", async () => {
    await as(bob);
    await act("ack", { ids: (await pending()).map((d) => d.id) });
    const offer = rid();
    await act("create", { id: offer, side: "buy", kind: "loot", item: "Teia", amount: 20, price: 30 });
    expect(await act("cancel", { offer })).toMatchObject({ ok: true });
    expect(await pending()).toEqual([expect.objectContaining({ reason: "cancelled", amount: 0, gold: 600 })]);
    await as(alice);
    expect(await act("cancel", { offer })).toMatchObject({ ok: false });
  });

  it("offers expire after 30 days and return to the owner", async () => {
    await as(alice);
    await act("ack", { ids: (await pending()).map((d) => d.id) });
    const offer = rid();
    await act("create", { id: offer, side: "sell", kind: "loot", item: "Pata de Lobo", amount: 3, price: 10 });
    const exp = (await db.query<{ d: number }>("select extract(day from expires_at-created_at)::int d from lawl_depot_market_offers where id=$1", [offer])).rows[0]!.d;
    expect(exp).toBe(30);
    await db.query("update lawl_depot_market_offers set expires_at=now()-interval '1 second' where id=$1", [offer]);
    expect(await pending()).toEqual([expect.objectContaining({ reason: "expired", item: "Pata de Lobo", amount: 3 })]);
  });

  it("limits: 2000 stackables, one equipment and 100 active offers per character", async () => {
    await as(alice);
    expect(await act("create", { id: rid(), side: "sell", kind: "loot", item: "Teia", amount: 2001, price: 1 })).toMatchObject({ ok: false });
    expect(await act("create", { id: rid(), side: "sell", kind: "gear", item: "Sword|knight", amount: 2, price: 1 })).toMatchObject({ ok: false });
    await db.exec("delete from lawl_depot_market_deals; delete from lawl_depot_market_offers");
    for (let i = 0; i < 100; i++) expect((await act("create", { id: rid(), side: "sell", kind: "loot", item: "Teia", amount: 1, price: 1 })).ok).toBe(true);
    expect(await act("create", { id: rid(), side: "sell", kind: "loot", item: "Teia", amount: 1, price: 1 })).toMatchObject({ ok: false });
  });

  it("only the selected character can use the market", async () => {
    await as(alice);
    await expect(act("list", {}, 2)).rejects.toThrow("selecionado");
  });
});
