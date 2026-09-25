# Verification — campaign edition

## Automated checks

- Syntax checks cover all six runtime modules.
- 44 engine and campaign tests currently pass.
- Coverage includes v1 movement/parry/dash/pause regression cases, six weapon mechanics, switching cooldowns, EX attacks, all three supers, charm effects, purchases, equipment ownership, save validation, v1 migration, island prerequisites, separate difficulty grades, and non-repeatable coin rewards.
- All twelve boss stages can be defeated with starter shots in deterministic simulation.
- All three run-and-gun exits can be reached using horizontal movement and timed jumps, with a following camera.
- Platform landings, pit damage/recovery, coin collection, and aerial bounds are tested separately.
- Completion tests grant invulnerability to isolate reachability; they do not establish human difficulty balance.

## Browser checks

- Existing v1 boss results migrated to the new campaign without erasing the original save.
- Shop purchase and equip flow verified using an isolated browser origin, leaving the player's save unchanged.
- Buying Firefly spent four coins, disabled unaffordable purchases, and allowed equipping it in slot B.
- Reload preserved the test purchase, balance, and loadout.
- Starting a stage and pressing Q changed the active HUD weapon from Inkshot to Firefly, including during the intro.
- Escape pauses the game and exposes resume, restart, and world-map controls.
- Bramble Scramble starts with the run-and-gun progress/coin HUD, platforms, enemies, and coins.

- Reloading a saved run-and-gun selection is now regression-tested after a browser check caught an invalid coin-data argument.
- At a 390px viewport, the map has no horizontal overflow, stage cards fit inside the arena, and the shop dialog fits the viewport.
- The development art gallery renders all 15 stages across all three phases without browser errors.

## Practical limits

Extended human difficulty balancing, physical mobile-device playtesting, and gamepad/co-op support are not covered. Combat is visual and is not screen-reader playable. The game's art is original procedural illustration, not cel animation. GitHub Pages deployment is independent of local/source verification.
