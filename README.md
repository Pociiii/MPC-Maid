# MPC Maid

Custom Discord bot for MPC.

## Requirements

- Node.js 22 or newer, below 25.
- Discord bot token and channel/role configuration in `.env`.
- SQLite database file: `database.db`.

## Main Scripts

```bash
npm install
npm run check
npm run preflight
npm start
```

`npm run preflight` is the main readiness check before hosting. It checks
syntax, JSON data, command registration, GIF pools, scene title data, Daily WYR
questions, and the SQLite schema.

## Current Systems

- Public command guide with readable category fields and dropdown details.
- Profile embeds with wallet, stats, career, split interaction fields, and
  profile likes.
- Daily quests, achievements, leaderboards, training, boosters, shop, and
  inventory.
- Porn Career scenes, custom scenes, scene scheduling, scene titles, and Moments
  posts.
- GIF Submit with scene title suggestions for staff review.
- Daily Would You Rather in General with anonymous voting, rewards, and a
  discussion thread.
- Casino games: `/dice`, `/slots`, `/blackjack`, `/holdem`, and Spank Dilli.
- RP systems: relationships, pregnancy, breed requests, matchme, drink, and
  firework.

## Hosting Notes

- Run `npm run preflight` and fix failures before copying the bot to a server.
- Stop the local bot before copying `database.db`.
- Do not delete `database.db` just because new tables were added; schemas and
  migrations create missing tables.
- Keep `.env`, `database.db`, `node_modules`, and `backups` out of git.
- Rotate the Discord bot token before final hosting.
