# MPC Maid Worklog

## Current State

MPC Maid is in a 1.0 stabilization pass. Core social, Porn Career, casino,
daily, profile, relationship, pregnancy, submission, and gift systems are
implemented. New work should prioritize live testing, balance, recovery, and
polish over additional large systems.

`npm run preflight` is the release gate. It validates Node compatibility,
command syntax and uniqueness, configured IDs, JSON content, GIF pools, scene
titles, Daily WYR questions, the gift catalogue, and SQLite schema readiness.

The database is upgraded additively. Do not delete `database.db`; back it up,
then run the bot or preflight to create missing tables.

## Latest: Player Studio Staff

- Added a data-driven abstract NPC roster to `/mystudio`.
- Added a persistent Hired Staff field and private Manage Staff catalogue.
- Added the Personal Agent for 5,000 coins with 750-coin daily upkeep.
- Personal Agent owners can send the normal `/pornscene` request while busy,
  but consent, cooldowns, acceptance, and the one-active-scene rule are
  unchanged.
- Added separate NPC upkeep, suspension, and one-day-cost reactivation without
  accumulated staff debt or automatic studio closure.
- Added a confirmed manual studio-close action that pauses studio and staff
  upkeep until the owner pays the normal reopening cost.
- Replaced Latest Release on studio overviews with previous-day owner income,
  backed by a 12:00 UTC ledger covering every gameplay coin source and casino
  profit without counting refunds or returned wagers.
- Simplified the Hired Staff overview field to staff types only.
- Updated the persistent Commands-channel guide and Porn Career info panel.

## Latest: Permanent Gift System

- Changed the existing commands to `/shop boosters`, `/shop gifts`,
  `/inventory boosters`, and `/inventory gifts`.
- Added `/gift send user:@member` with private selection and confirmation.
- Added a configurable 16-gift catalogue using standard Discord emoji.
- Added persisted personal daily shops with two Common, two Uncommon, one
  Premium, and one Luxury gift, tied to the daily-quest reset.
- Added atomic gift purchasing and sending, duplicate-button protection, and
  expiring confirmations.
- Added sendable inventory, permanent received collections, transaction
  history, and FIFO purchase-price history for collection valuation.
- Added Pillow Talk RP notifications without prices, balances, rewards, or
  public pings.
- Added a four-type gift preview to `/profile` and a private full collection
  viewer.
- Added gift catalogue and database checks to preflight.
- Full preflight passed with 25 database tables.

## Earlier 1.0 Work

- Added Daily Would You Rather with anonymous SQL-backed voting, one-time
  rewards, discussion threads, automatic closing, and archival.
- Added GIF Submit scene-title suggestions with staff approval/rejection and
  preflight validation.
- Added profile likes with duplicate/self-like protection and persistent
  counts.
- Added user-versus-dealer Texas Hold'em with private hole cards, public board
  progression, per-street betting, and real hand evaluation.
- Enforced Porn Career phase caps while preserving scene order: foreplay 2,
  oral 2, sex 3, finale 1.
- Expanded achievement progress for casino play, training, shop purchases, and
  balanced career-stat milestones.
- Improved `/commands`, profiles, leaderboards, shared embed styling, and
  channel routing.
- Routed daily/weekly progression notices to Maid Feed while keeping RP/story
  events in their intended channels.

## Next

- Complete the live-test checklists in `TODO.md`.
- Monitor the economy after gifts become an active coin sink.
- Verify command registration and gift interactions in the live Discord
  environment.
- Keep the three documentation files aligned whenever behavior changes:
  unfinished work in `TODO.md`, completed changes here, and current rules in
  `DESIGN_CONTEXT.md`.
