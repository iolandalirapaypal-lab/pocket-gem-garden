<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->


## Project rules
- Imbuements (`public/charging.js`, NPCs Charles apply / Russel cancel) are character-wide like Lawl's Charging: saved as sanitized `p.charging`, values always read from the catalog, at most 8 kept and 4 switched on, time drains only in combat; skills/protections enter through `eqBonus()`, speed through `chargeSpeed()`, and crit/life/mana drain in `hit()` for the player's own hits on monsters. Why: one place for the rules keeps every screen and formula in sync.
- Game database: all game state changes go through protected `lawl_*` database actions; tables stay locked to players. Why: saves, gems and trades must not be forgeable from the browser.
- Database tests load every file in `drizzle/migrations` into PGlite (`src/test/full-schema.test.ts` and siblings). Why: the tests must exercise the exact schema the cloud runs.
- `drizzle/migrations` is split per feature; a later file may redefine an earlier function only if no test selects files by that function's name (market buy, loot drop, PvP attack, sellable save guard, house action/catalog, guild action). Why: the database tests pick migration files by the function names they contain.
