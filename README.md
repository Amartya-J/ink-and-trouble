# Ink & Trouble

A cartoon action game about a fountain-pen hero and a cast of troublesome performers. Play a 15-stage solo campaign, or pass the pen between friends in **Ink Relay**, the cooperative mode.

[Play hosted Ink Relay](https://ink-relay-picture-show.amar12356.chatgpt.site/ink-relay/relay) · [Solo campaign guide](docs/SOLO_CAMPAIGN.md) · [Development plan](PLAN.md)

> The illustrated redesign is live at the hosted link above. GitHub stores the source; updating the hosted Sites edition requires a separate deployment.

## Pick a game

| | Ink & Trouble | Ink Relay |
| --- | --- | --- |
| Players | 1 | 2–8, on separate devices |
| Goal | Clear three islands and their gate bosses | Defeat one boss before the team runs out of turns |
| Stages | 9 ground bosses, 3 aerial bosses, 3 run-and-gun stages | 3 selectable bosses |
| Progress | Browser saves, coins, shop, equipment and grades | Shared boss health, turn order and player damage scores |
| Requirements | A browser; no backend | Room API and Cloudflare D1 |

## Run the solo game

Install Node.js 22 or newer, then run:

```sh
git clone https://github.com/Amartya-J/ink-and-trouble.git
cd ink-and-trouble
npm start
```

Open **http://localhost:4173/**. The solo game has no package dependencies. Your browser stores progress for that origin; a different browser or host starts with a separate save.

### Controls

| Action | Key |
| --- | --- |
| Move / aim | Arrow keys or WASD |
| Jump | Space; release early for a short hop |
| Fire | Hold Z or J |
| Duck | Down or S on the ground |
| Hold position and aim | Ctrl + direction |
| Dash | X or Shift |
| Parry pink projectiles | C, K, or press Jump again in the air |
| Switch equipped weapons | Q or E |
| Weapon EX attack | F; costs one ink card |
| Super | V or L; costs five cards |
| Pause / retry after defeat | Escape or P / R |

Choose two weapons in Loadout. First clears and run-stage coins pay for purchases. Gentle mode gives six hearts and slower projectiles; Regular gives three. Touch controls appear on small screens. The menus include sound and reduced-motion options.

## Play Ink Relay with friends

Open the hosted link, enter a name, and create a room. Share its invite link or six-character code. The host starts with at least two players.

Each player gets a 35-second turn. Everyone attacks the same boss, and damage carries over. Waiting players can send one shield, heart, or super-meter assist per turn. The team has three turns per player to win.

The local static server also serves **/relay.html**, but room creation requires **/api/relay** on the same origin. Static hosting alone does not provide multiplayer. Use `multiplayer-backend/route.ts` with the D1 tables in `multiplayer-backend/schema.sql`.

## Check and build

```sh
npm run check   # JavaScript syntax
npm test        # Combat, campaign, equipment and precision-control regressions
npm run build   # Copy solo and relay browser files into dist/
```

Serve `dist/` with a static host for solo play. `vercel.json` sets the build command and output directory; it does not provision the relay backend. This repository has no confirmed Vercel deployment.

For a running relay server:

```sh
RELAY_BASE_URL=https://your-host.example node multiplayer-backend/smoke.mjs
```

That test creates rooms and exercises capacity, assists, turns, rematches and host handoff. Use a test deployment.

## Source map

| Path | Contents |
| --- | --- |
| `src/engine.js` | Fixed-step movement, attacks, collisions and boss phases |
| `src/art.js` | Canvas scenery, characters and maps |
| `src/content.js`, `src/campaign.js` | Stages, equipment, unlocks and saves |
| `src/main.js`, `src/audio.js` | Browser UI, input, game loop and synthesized audio |
| `index.html`, `style.css` | Solo screen and menus |
| `relay.html`, `relay.css`, `relay.js` | Cooperative client |
| `multiplayer-backend/` | Room API, schema and API smoke test |
| `tests/` | Deterministic gameplay tests |

The visual direction uses vintage cartoons and picture-show typography. The characters, maps and audio are original. Combat requires sight; screen-reader gameplay and extensive physical-device testing remain unfinished.
