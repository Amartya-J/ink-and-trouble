# Verification — first release

## Automated
- `npm run check`: all four runtime modules pass syntax checks.
- `npm test`: 17 passing engine tests, including intro gating, movement bounds, variable jump, dash cooldown/protection, hit invulnerability, defeat, airborne parry, special charge, projectile hits, three boss phases, final-hit priority, pause, save validation, and grades.
- All three bosses can be defeated through normal projectile collisions in simulation. The reachability test grants player invulnerability; it is not a substitute for human difficulty balancing.
- `npm run build`: produces a dependency-free static distribution.

## Browser smoke checks
- Desktop: game renders original canvas scenery and animated characters without console warnings/errors.
- Start fight → pause using Escape → return to act selection.
- Switch between all three act cards; selected stage title and boss update.
- Gentle mode starts Madame Moth with six hearts; enemy damage updates the HUD.
- Instructions open and close using native dialog controls.
- Sound toggles on successfully without browser errors. Perceptual audio quality has not been independently evaluated.
- At 390px viewport width: document has no horizontal overflow, and the complete menu fits inside the stage after the mobile spacing fix (menu about 166px high, stage about 205px).

## Remaining practical playtesting
Physical touch-device testing, extended human difficulty balancing, browser/device audio quality, and full combat using assistive technologies have not been validated. Keyboard desktop play is the primary target. This release has no gamepad or cooperative mode.
