# Campaign architecture

## Content and progression

`content.js` contains stable stage and equipment identifiers. Each island has five stages: two initial branches, a follow-up on each branch, and a gate requiring all four. Gate clears unlock the next island and a super. `campaign.js` is independent of the DOM and handles purchases, two-slot equipment, first-clear rewards, coin deduplication, per-difficulty grades, and validated save loading.

Version 2 saves use a new storage key. Original boss scores map to their new stage IDs and receive one-time clear credits during migration; the v1 save remains untouched. Migration does not invent clears for the intervening new stages. Storage failures leave the in-memory campaign playable.

## Simulation

The simulation runs at 60 fixed steps per second. Browser input has a one-step latch so brief taps are not lost between frames. Pause freezes gameplay; losing focus pauses automatically. Intro, playing, paused, defeat, and victory are explicit states. Equipment is copied at stage creation so shop changes do not mutate an active fight.

`createLevelGame` builds a boss arena, aerial arena, or scrolling level. Run stages have distinct authored floor segments, one-way platforms, five coins, walkers, turrets, hoppers, and an exit. The camera follows the player and clamps to world bounds. Falls cost a heart and return the player to their last safe position. Coins are banked only on victory.

Flight uses four-direction movement with no gravity. Boss arenas use jump/gravity physics and a fixed floor. Boss attacks use independent pattern families and three health phases, with warnings and delayed transitions. Projectile counts and lifetimes are bounded.

## Weapons

Both slots share a firing cooldown, so rapid switching cannot bypass fire rates. Scatter creates short-lived angled pellets, Firefly steers toward targets, Blot Bomb integrates gravity and bounce, Roundabout reverses velocity, and Pressure Pen accumulates charge until release. EX attacks spend one card; supers spend five. Piercing projectiles remember targets already hit, preventing damage every simulation frame.

Hurtboxes are smaller than the artwork; parry range is more generous. Dashes and post-hit invulnerability prevent stacked damage. A final successful boss shot wins over same-frame contact damage.

## Rendering and UI

The world map combines canvas scenery with native accessible buttons for nodes, island tabs, and shop entry. The loadout/shop uses a modal dialog. `art.js` draws all characters, scenery, aircraft, map geography, particles and projectiles locally. No asset fetches occur at runtime. Web Audio starts only after a user gesture.

Tests import the simulation and progression modules directly. Browser smoke checks validate the DOM-facing flows separately. Completion bots grant invulnerability to isolate stage reachability; they are not a claim of human difficulty balance.
