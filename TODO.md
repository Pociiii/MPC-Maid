# MPC Maid TODO

This file contains only unfinished work. Implemented behavior belongs in
`DESIGN_CONTEXT.md`; completed work belongs in `WORKLOG.md`.

## Release Readiness

- Run `npm run preflight` before every release or server move.
- Back up `database.db` before deploying schema changes. Never delete the live
  database to create new tables; startup and preflight apply additive schemas.
- Rotate the Discord token before production hosting.
- Re-register slash commands after command definitions change.
- Live-test mobile readability and every private interaction flow.

### Gift System Live Test

- Verify `/shop boosters` and `/inventory boosters` retain their previous
  behavior.
- Test personal `/shop gifts` rotations across users and across the 12:00 UTC
  reset boundary.
- Test gift purchases with exact balance, insufficient balance, double-clicks,
  expired confirmations, and restarts.
- Test `/gift send` for valid members, self-targets, bots, members leaving during
  confirmation, duplicate submissions, and Pillow Talk delivery failures.
- Confirm received collection totals and historical values remain correct after
  gift prices change.
- Check the four-item `/profile` gift preview and full private collection on
  desktop and mobile.

### Existing Systems Live Test

- Daily WYR: posting, voting, one-time rewards, changing votes, thread closing,
  percentages, reply counts, and archival.
- Daily quests: reset timing, quest completion, weekly streaks, lucky boosters,
  and Maid Feed routing.
- Porn Career: request flow, booster consumption, phase ordering, burnout,
  final rewards, and Moments posts.
- Profile likes and relationship notifications in Pillow Talk/Moments as
  configured by the current code.
- Casino: win/loss/tie/fold/timeout/low-balance cases, especially Hold'em
  pacing and per-street costs.
- GIF submission and scene-title approval/rejection with staff roles.

### Balance Watch

- Compare coin income from daily quests and Daily WYR with sinks from training,
  boosters, gifts, custom scenes, drinks, fireworks, and casino games.
- Watch the 65% lottery jackpot contribution to confirm that removing 35% of
  ticket sales controls inflation without making the game feel unrewarding.
- Revisit gift and booster prices after real usage data exists.
- Review showcase, casino, and scene-request cooldowns after several active
  days.
- Watch achievement progress and endless milestones for notification spam.

## Planned Major Systems

These are not required by the current database or command set.

### Reputation

- Add persistent reputation totals and daily reward caps.
- Reward valid social interaction clicks rather than showcase posting.
- Define badge tiers in configuration, with optional external badge images.
- Add a compact profile section and route badge upgrades to Maid Feed.
- Integrate only after reward sources, daily caps, and recovery/audit needs are
  finalized.
- Do not retroactively grant Reputation from gifts; gifts are social
  collectibles with no progression rewards.

### Production Studios

- Live-test the MVP specified in `PORN_CAREER_STUDIO_DESIGN.md`.
- Verify purchase, forum provisioning/refund recovery, daily upkeep, closure,
  reopening, mirror recovery, and exactly-once completion statistics.
- Use one forum post/thread per studio, with an editable overview first message.
- Catalog completed Porn Career productions without moving live scene parts out
  of the Porn Career channel.
- Keep studios cosmetic: do not add passive stat, ranking, XP, or coin bonuses.
- Tune the 10,000 purchase, 500 upkeep, and 1,000 reopen costs after measuring
  the live coin economy.

### Private Scene Threads

- First version: paid private thread for two or three invited users, one active
  room per participant, one-hour maximum, and no career progression.
- Keep creator-paid prices configurable.
- Do not expose usernames in thread names or add broad staff/role overwrites.
- Three-person actions must use only three-person GIF pools.
- Decide whether anonymous end statistics are useful and where they should be
  posted.
- Start in memory; add SQL only if restart recovery proves necessary.

## Smaller Follow-ups

- Continue adding approved scene titles and filling parked three-person GIF
  pools that preflight reports as empty.
- Continue embed/UI consistency cleanup when related commands are touched.
- Decide whether Hold'em should remain user-versus-dealer and in memory before
  considering multiplayer, all-in, side-pot, or SQL table state.
- Keep pregnancy meaningful without adding child stats or large family trees.
- Consider better staff filters/logging for GIF and title review only if the
  current workflow becomes difficult to manage.
- Low priority: evaluate an official-API-only X/Twitter text/link watcher. Do
  not scrape or bypass media restrictions.

## Explicitly Out of Scope

- Gift trading, selling, refunds, anonymous sends, custom messages, wishlists,
  leaderboards, achievements, quests, expiration, or gameplay bonuses.
- Moderation features already handled by MEE6.
- Public documentation of staff-only commands or workflows.
