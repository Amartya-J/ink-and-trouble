# Ink & Trouble

**A little mayhem in three acts.** An original, single-player cartoon boss-rush for the browser, inspired by vintage animation and precision arcade combat.

Play as Pip, a fountain-pen nib with more courage than common sense. Face Rootsy the Radish in the garden, Baron Bubbles at the harbor, and Madame Moth at the midnight show. Each fight escalates through three phases.

## Run locally

Requires Node.js 22 or newer. No dependencies or installation required.

```sh
npm start
```

Open **http://localhost:4173**. Choose an act and a difficulty, then select **Let's make trouble**.

## Controls

| Action | Keyboard |
| --- | --- |
| Move | Left / Right arrows or A / D |
| Jump | Space, W, or Up arrow; release for a shorter hop |
| Shoot | Hold Z or J; aims toward the boss |
| Dash | X or Shift; briefly invulnerable, with a cooldown |
| Parry | C or K while airborne and touching a pink projectile |
| Special | V or L when all five ink cards are full |
| Pause | Escape or P |
| Retry after defeat | R |

Touch buttons appear on touch devices. Landscape orientation is recommended. Enable sound in the top bar for synthesized music and effects. Motion can be reduced using the adjacent button; the initial setting respects your system preference. Best grades and times save locally, separately for each act and difficulty.

**Gentle:** six hearts and slower attacks. **Regular:** three hearts. All acts are available immediately. Defeat all three on the same difficulty for the curtain-call message.

## Development

```sh
npm run check  # JavaScript syntax checks
npm test       # Native Node engine tests
npm run build  # Static site in dist/
```

Preview the production build with `SERVE_DIST=1 npm start`. The game needs only static hosting; it has no backend, runtime third-party assets, tracking, or API keys.

- `src/engine.js`: deterministic simulation, collision detection, patterns, grading, save validation.
- `src/art.js`: original animated canvas illustrations and scenery.
- `src/main.js`: menus, input, fixed-step game loop, persistence and accessibility labels.
- `src/audio.js`: synthesized effects and original melody.
- `tests/engine.test.js`: core gameplay regression checks.
- [PLAN.md](PLAN.md): design, scope, milestones, acceptance criteria and expansion roadmap.

## GitHub Pages

The repository includes validation CI and an opt-in Pages deployment workflow. To publish the playable website:

1. In **Settings → Pages**, choose **GitHub Actions** as the source.
2. In **Actions → Publish game to Pages**, select **Run workflow**.
3. Use the deployment URL reported by the completed workflow.

The expected project URL is `https://amartya-j.github.io/ink-and-trouble/` once Pages has been enabled and deployment succeeds. Repository publication alone does not enable this URL.

## Scope and asset provenance

This is a complete small browser game, not a recreation of the full commercial Cuphead game. It has three boss arenas; it does not include cooperative multiplayer, gamepad controls, or run-and-gun levels. Characters, scenes, procedural vector artwork, code, and synthesized melody were created for this project. No Cuphead assets, characters, music, or branding are included.

The canvas action requires visual play. Menus use native keyboard-accessible controls, but the combat itself is not screen-reader playable. Touch layout is provided; physical mobile-device playtesting is still recommended.
