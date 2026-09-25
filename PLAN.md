# Ink & Trouble — development plan

## Direction
An original, single-player browser boss-rush inspired by the precision action and rubber-hose animation of 1930s cartoons. No Cuphead characters, music, levels, logos, or extracted assets. Our hero is Pip, a plucky fountain-pen nib, fighting the misbehaving stars of a traveling picture show.

## First playable release (this project)
1. **Foundation:** dependency-free ES modules, fixed-step simulation, responsive 960×540 canvas, keyboard and touch controls, safe local progress storage.
2. **Combat:** running, variable-height jumping, invulnerable dash with cooldown, held-fire shots, airborne parries on pink projectiles, and a charged special. Clear hit feedback and brief invulnerability after damage.
3. **Three acts:** Rootsy the Radish (garden / seed volleys), Baron Bubbles (harbor / bouncing bubbles), and Madame Moth (moonlit theater / falling stars). Each gets three escalating phases with visible attack warnings.
4. **Presentation:** original procedural vector artwork, animated characters, paper texture, theatrical menus, synthesized sound effects and an original looping melody. Reduced-motion and mute controls.
5. **Game loop:** act selection, gentle/regular difficulty, countdown, pause, retry, victory grade, next act, saved best results, and final curtain call.
6. **Verification:** deterministic engine tests for movement, collisions, cooldowns, parries, victory/defeat, boss patterns, and save validation; real-browser smoke and visual review.
7. **Delivery:** README, controls, architecture and expansion notes, CI, static build, GitHub repository and Pages workflow. Publishing requires an authenticated account with repository creation access; never mark it complete without a verified remote.

## Acceptance criteria
- All three acts are selectable and beatable; no softlock after pause, defeat, or victory.
- Frame rate does not change simulation speed; backgrounding pauses the action.
- New players can discover every action from the visible instructions.
- Layout works on desktop and narrow screens; touch controls support simultaneous actions.
- No runtime network requests, asset downloads, or paid services are necessary to play.
- Automated tests pass and generated build contains only runtime files.

## Architecture
`src/engine.js` owns deterministic simulation and collision logic without DOM access. `src/art.js` owns canvas illustration. `src/main.js` bridges input, sound, persistence, menus, and rendering. `src/audio.js` synthesizes audio after a user gesture. Native Node test runner exercises the engine. A small Node server serves development files; the static build copies runtime files into `dist/`.

## Scope beyond this release
This is a small complete browser game, not the scale of the commercial Cuphead game. Expansion order: player feedback and balancing → more hand-drawn animation frames → controller support and rebinding → run-and-gun stages → local cooperative play → additional worlds. Co-op requires explicit camera, input, revive, and difficulty design and is not included in this release.

## Risks and mitigations
- Procedural art can look rigid: animate limbs, squash/stretch, eyes, and background layers.
- Unfair patterns: telegraph attacks, keep projectile lanes traversable, offer gentle difficulty.
- Touch precision: large buttons and landscape recommendation; keep keyboard as the primary experience.
- Audio/browser storage restrictions: start audio on interaction and allow the game to continue if storage or audio is unavailable.
- GitHub access: build and validate locally while repository setup is pending.

## Campaign expansion — version 2

The expansion replaces the three-act selector with a persistent island campaign. It contains 15 original stages, not copies of the commercial game's levels.

1. **Content and progress:** three islands, five nodes per island, branching prerequisites, gate bosses, permanent coin rewards, completion grades by difficulty, and migration of v1 scores.
2. **Arsenal:** six mechanically different weapons; two equipped slots; Q/E to switch in combat; one-card EX attacks; three five-card supers; three purchasable charms with explicit tradeoffs.
3. **World navigation:** illustrated maps, keyboard/click selection, locked-route explanations, island tabs, completion flags, shop and loadout dialogs.
4. **Stage variety:** nine ground bosses, three aerial bosses with four-direction flight, and three scrolling run-and-gun stages with platforms, enemies, pits, five coins, and an exit.
5. **Presentation:** original boss silhouettes and phase changes, map scenery, aircraft, enemy variants, weapon colors, readable HUD and responsive controls.
6. **Verification:** regression coverage plus weapon behavior, purchase/equip rules, one-time rewards, save migration/validation, route unlocks, flying movement, platform/pit collision, and all-level reachability. Browser-check the actual map → shop → loadout → level → pause flow.
7. **Publish:** push the verified expansion and updated documentation to the existing GitHub repository. GitHub Pages deployment remains outside this change unless its pending authorization is granted.

Completion requires real game logic for every listed stage, not placeholder level buttons. Full commercial-game parity, local cooperative play, and hand-drawn frame-by-frame animation are outside this release.
