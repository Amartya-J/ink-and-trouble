# Ink & Trouble — The Inkwell Isles

An original vintage-cartoon action campaign: **15 stages, three islands, six weapons, and one very determined little pen.**

Travel through Bramble Borough, Brinewater Bay, and Midnight Midway. Follow branching trails on the world map, tackle nine ground bosses and three aerial bosses, and collect coins in three scrolling run-and-gun stages. Each boss escalates through three attack phases.

## Ink Relay multiplayer

The original boss engine now powers **Ink Relay**, a live cooperative game for 2–6 people on separate devices. Each player gets a 35-second turn against one shared boss. The other players watch the same fight and can send one shield, heart, or super assist per turn. The team wins by defeating the boss within three turns per player. Boss health scales with the cast so the fight usually needs more than one turn.

Play the public version at **https://ink-relay-picture-show.amar12356.chatgpt.site/**. Share a room link or six-character code; no account or installation is needed. The multiplayer entry point is `relay.html`, with `relay.css` and `relay.js`. The hosted room API and D1 migration are preserved under `multiplayer-backend/`; the deployable Sites checkout is in the sibling `Handshake Project/multiplayer-game` directory. Running this repository's static server alone supports the original solo campaign but does not supply the multiplayer API.

## Play locally

Requires Node.js 22 or newer. No package installation needed.

```sh
npm start
```

Open **http://localhost:4173**. Select a map node, choose Gentle or Regular, and enter the stage. The two starting weapons are Inkshot and Scatter; you start with four coins to spend at **Ink & Co.**

## Controls

| Action | Keyboard |
| --- | --- |
| Move / fly | Arrow keys or WASD (W/S aim vertically in flight) |
| Jump | Space; release early for a short hop |
| Aim up / diagonally | Hold Up or W; combine with Left/Right |
| Shoot | Hold Z or J; Pressure Pen fires on release |
| Switch equipped weapon | Q or E |
| Dash | X or Shift; brief protection and a cooldown |
| Parry pink projectiles | C or K while airborne, or while flying |
| Weapon EX attack | F; costs one ink card |
| Equipped super | V or L; costs five ink cards |
| Pause | Escape or P |
| Retry after defeat | R |
| Map selection | Click a node, or use arrows and Enter |

In boss fights, horizontal shots face the boss. In run-and-gun stages they follow your facing direction. Parrying and hitting enemies build ink. Touch devices get simultaneous-action buttons; landscape is recommended. Fullscreen, sound, and reduced-motion controls are available.

## Weapons, equipment, and rewards

Equip **two weapons**, **one charm**, and **one super** in Loadout. Changes apply when entering or restarting a stage; switching with Q/E during a fight swaps the two weapons you brought.

| Weapon | Behavior | Cost |
| --- | --- | --- |
| Inkshot | Fast, reliable long-range shots | Starter |
| Scatter | Five strong close-range pellets | Starter |
| Firefly | Lower-damage homing sparks | 4 coins |
| Blot Bomb | Heavy arcing, bouncing ink bombs | 4 coins |
| Roundabout | Shots reverse and return | 4 coins |
| Pressure Pen | Hold, charge, and release a heavy blast | 5 coins |

Every weapon also has a distinct one-card EX variant. Charms offer an extra heart with a damage tradeoff, passive ink recharge, or faster dash recovery. The first super is a piercing beam; clearing islands I and II unlocks an invulnerability super and a homing inkstorm.

First clears award **two coins**. Run-and-gun stages contain **five additional coins each**, banked only when you reach the exit. Collected coins and first-clear rewards cannot be farmed by replaying stages or changing difficulty.

Clear the four opening stages on an island to unlock its gate boss. Defeat the gate boss to open the next island. Gentle has six hearts and slower boss projectiles; Regular has three. Either difficulty advances the campaign; grades and times are tracked separately.

## The campaign

| Island | Stage | Type |
| --- | --- | --- |
| Bramble Borough | The Root of All Trouble — Rootsy the Radish | Boss |
| | Bramble Scramble | Run & gun |
| | Out of the Woods — Tick Tock Timber | Boss |
| | Clouds of Doubt — Captain Cumulus | Flight |
| | A Royal Ribbit — King Croak | Gate boss |
| Brinewater Bay | A Fishy Business — Baron Bubbles | Boss |
| | Pier Pressure | Run & gun |
| | Claws for Concern — Clack the Crustacean | Boss |
| | Flight of the Fancy — Admiral Albatross | Flight |
| | Deep Sea Encore — Maestro Inktopus | Gate boss |
| Midnight Midway | The Midnight Flutter — Madame Moth | Boss |
| | Backlot Dash | Run & gun |
| | Burning the Midnight Oil — Cinderwick | Boss |
| | Moonlight Mischief — Luna the Lantern | Flight |
| | The Final Cut — The Projectionist | Final boss |

Progress, coins, purchases, equipment, and best grades save to this browser. Existing v1 boss scores migrate automatically; the old save is retained. Saves belong to the current browser origin: localhost and a hosted site do not share progress.

## Development

```sh
npm run check  # Syntax-check all runtime modules
npm test       # Engine and campaign tests
npm run build  # Static site in dist/
```

Use `SERVE_DIST=1 npm start` to preview the build. There are no runtime dependencies, external assets, trackers, backend services, or API keys.

- `src/content.js`: worlds, stages, weapons, charms, super definitions.
- `src/campaign.js`: progression, shop, equipment, save validation and migration.
- `src/engine.js`: deterministic combat, flight, platforms, enemies, collisions and grading.
- `src/art.js`: original animated canvas art and world maps.
- `src/main.js`: menus, input, fixed-step loop, persistence and HUD.
- `src/audio.js`: synthesized effects and original melody.
- [PLAN.md](PLAN.md): milestones and scope.
- [Testing report](docs/TESTING.md): evidence and verification limits.

## GitHub Pages

Source publication does not activate web hosting. An opt-in deployment workflow is included:

1. In **Settings → Pages**, select **GitHub Actions** as the source.
2. In **Actions → Publish game to Pages**, run the workflow.
3. Open the URL reported by the successful deployment.

## Scope and provenance

This is an expanded original browser game inspired by precision action and vintage animation. It does **not** reproduce Cuphead’s exact levels, characters, music, or assets, and it is not feature-for-feature parity with that commercial game. This release is single-player with keyboard/touch controls; cooperative play and gamepad support are not included. Artwork is procedural vector animation rather than frame-by-frame cel animation.

Native controls support keyboard navigation, but visual combat is not screen-reader playable. Automated completion checks establish stage reachability with player invulnerability; broader human difficulty balancing and physical-device testing remain useful.

### Precision controls
Hold Down/S to duck on the ground. Hold Ctrl (AIM on touch) to stop moving and aim in eight directions. Press Jump again in the air to parry pink shots. Boss phase changes clear existing bullets and briefly delay attacks.

Vercel configuration is included: `npm run build`, output `dist`. Deployment awaits account/team access.
