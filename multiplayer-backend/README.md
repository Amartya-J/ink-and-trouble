# Ink Relay room service

`route.ts` is the API used by the published Site at `/api/relay`. `schema.sql` creates its three D1 tables. The full deployable application, including its Drizzle schema, app shell, and Sites configuration, is in `../Handshake Project/multiplayer-game` relative to the VideoGame directory. `relay.js` calls `/api/relay` on the same origin, so multiplayer play requires deployment with this service. The solo campaign remains runnable with this repository's dependency-free local server.
