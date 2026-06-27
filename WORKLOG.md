# MPC Maid Worklog

## Current State

- The bot is in a 1.0 preparation pass: core systems are implemented enough to
  test together, and the next work should favor live testing, balance, and
  polish over new large systems.
- `npm run preflight` is the readiness gate before hosting. It checks command
  syntax, JSON data, GIF pools, scene title data, Daily WYR prompts, and the
  SQLite schema.
- New SQL tables are now part of the current build for systems that need
  restart-safe state. Do not delete `database.db`; run the bot or preflight so
  migrations can create missing tables.

## Recently Completed

- Added a preflight script and `npm run preflight`.
- Cleaned dependency resolution so packages load from the project folder.
- Added Daily Would You Rather:
  - posts daily in General at reset time
  - anonymous voting
  - one reward per voter
  - discussion thread
  - SQL-backed sessions/votes
  - 40 starter questions
- Added GIF Submit scene title suggestions:
  - users can suggest scene titles
  - staff can approve or reject them
  - title pools are validated by preflight
- Updated pornscene extra-part selection:
  - foreplay max 2
  - oral max 2
  - sex max 3
  - finale max 1
  - extras are still placed in the correct scene order
- Improved `/profile`:
  - split interaction stats into separate readable fields
  - added profile likes
  - first likes post a Moments embed
  - duplicate likes and self-likes are blocked
  - profile likes use SQL so counts survive restarts
- Added `/holdem`:
  - user vs dealer Texas Hold'em
  - private Peek for hole cards
  - public board progression
  - pay per street
  - real 5-card poker hand evaluation from 7 cards
- Updated `/commands`:
  - overview uses separate fields per category
  - role-based GIF rules are their own field
  - `/holdem` appears under Casino
- Kept command guide, changelog, deployment notes, and TODO aligned with the
  current build.

## Next

- Live test the 1.0 feature set in a small group before server hosting.
- Watch coin economy pressure from Daily WYR, quests, training, shop, and
  casino games.
- Test `/holdem` pacing and payouts; decide later whether it deserves SQL or
  multiplayer tables.
- Test Daily WYR timing, thread creation, close handling, and vote rewards.
- Test profile likes in the live Moments channel.
- Keep adding scene titles and GIFs where preflight warns about parked empty
  threesome folders.
- Continue the embed consistency pass only when touching related commands.
- Defer new large systems, especially Reputation and `/privatescene`, until the
  current build has real usage data.
