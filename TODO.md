# MPC Maid TODO

This file tracks planned systems and bigger follow-up work. Keep it practical:
write the idea, the first playable version, and anything that must wait until
the database is stable.

## Server Context

- MPC is a 3DXChat adult production server that also hosts private events.
- Staff/host/organizer commands should focus on production flow, event prep,
  cast coordination, announcements, and tracking. Moderation is handled by
  MEE6.
- Never list admin/staff-only commands in the public `/commands` guide.
- Never add admin/staff-only commands to the public changelog.

## Before Hosting

- Keep testing daily quests, achievements, leaderboard, and versioned embeds.
- Reset the local database as needed during testing.
- Avoid adding more SQL tables unless the feature needs restart-safe state.
- Current new SQL-backed systems include Daily WYR and profile likes.
- Before deployment, batch the remaining planned SQL schema work together so
  migrations, preflight, and database backup/recovery can be tested as one
  pass.
- Do not delete `database.db` to pick up new tables; run the bot or preflight so
  migrations can create missing schema.
- Keep `.env` private and rotate the Discord bot token before hosting.
- Run `npm run preflight` and fix failures before copying the bot to a server.
- Check cooldowns again after more live testing.

## Recently Completed

- Added `npm run preflight` as the main local/server readiness check.
- Daily Would You Rather is implemented in General with anonymous voting,
  one-time vote rewards, a discussion thread, close handling, and SQL state.
- GIF Submit now lets users suggest scene titles for staff review.
- Pornscene extra parts now respect caps while staying in scene order:
  foreplay max 2, oral max 2, sex max 3, finale max 1.
- `/profile` now splits interaction stats into separate fields and supports
  profile likes with Moments announcements.
- `/holdem` is live as a first user-vs-dealer Texas Hold'em game.
- `/commands` overview now uses readable fields for role rules and each
  command category.
- `/drink` and `/firework` now track achievement progress and post successful
  uses to Moments.
- Daily and weekly activity milestone updates now route to Maid Feed instead of
  Moments.
- Porn Career final Moments embeds now use clearer fields for outcome, viewers,
  XP rewards, ranking, critical status, and scene links.
- Added achievement progress for casino plays, training sessions, and shop
  purchases using the existing achievement progress table.

## High Priority

### Pre-Deployment SQL Work

Goal:
- Finish planned systems that truly need restart-safe database state before the
  bot is moved to a live server.
- Keep SQL changes grouped so migrations, preflight checks, and database backup
  behavior can be tested together.

Pending SQL-backed systems before deployment:
- Production Studios:
  - Needs `studios` and likely `studio_productions`.
  - Stores owner, guild, tier, style, generated display name, open/closed
    status, forum thread ID, overview message ID, production totals, upkeep
    timestamps, and production catalog logs.
  - Uses Studio Forum channel `1520732388186128495`.
  - Creates exactly one public forum thread per studio.
  - The first thread post is the Studio Overview embed and should be edited over
    time instead of reposted.
  - Completed Porn Career productions from an open requester studio get posted
    into that studio thread as catalog entries.
  - Live scene parts stay in Porn Career; the studio thread stays a clean
    completed-production catalog.
  - Open requester studios add a small tier-based XP bonus to both scene
    participants.
  - Closed studios keep their catalog but receive no new productions and give no
    XP bonus.
  - Daily upkeep is automatic and silent on success; failed upkeep closes the
    studio and DMs the owner if possible.
  - `/studio` manages purchase, visit, pay upkeep, upgrade tier, and change
    style.
- Reputation:
  - Needs `users.reputation` plus a daily cap table such as `daily_rep_claims`.
  - Optional `reputation_events` can be added if audit/recovery is worth it
    before hosting.
  - Should integrate with profiles, button interactions, daily quests,
    achievements, and Porn Career final rewards.

Already implemented SQL-backed systems:
- Daily quests and weekly streak state.
- Daily WYR sessions/votes.
- Profile likes.
- Achievements/progress.
- Pregnancy profiles/history.
- Relationships and relationship requests.
- Spank Dilli state.

Parked SQL ideas, not required before deployment:
- Private scene history/recovery SQL. First version is still planned as
  in-memory only unless live testing proves it needs persistence.
- Multiplayer Hold'em table SQL. Current user-vs-dealer Hold'em stays
  in-memory like Blackjack.

### 1.0 Live Test Checklist

Goal:
- Get the current feature set stable enough for hosting before adding another
  major system.

Test:
- Run `npm run preflight` before each server move or release candidate.
- Test slash command registration after adding `/holdem`.
- Test Daily WYR post, voting, reward, thread, close, and archive flow.
- Test `/profile` likes in the real Moments channel.
- Test `/holdem` with win, loss, tie, fold, timeout, and low-balance cases.
- Test casino, training, and shop achievement progress across the new milestone
  tracks.
- Test GIF Submit scene title approval and rejection with staff roles.
- Test pornscene extra part ordering across several scenes.
- Check `/commands` on mobile to make sure category fields stay readable.

Balance watch:
- Coin income from Daily WYR and daily quests.
- Coin sinks from `/train`, `/shop`, custom scenes, and casino games.
- `/holdem` pacing and whether per-street betting feels fair.
- Cooldowns for casino, showcase, and scene request commands.

### Daily Would You Rather

Status:
- First version implemented and ready for live testing.
- Future ideas below remain parked until the live version has been tested.

Goal:
- Add a lightweight daily social activity that is completely separate from
  Porn Career.
- Purpose: give members a small reason to check General chat, vote, and talk.
- General channel: `1440755913572090038`.
- Runs once per day at the same time daily quests reset: 12:00 UTC.
- Only one Daily WYR should be active at a time.

First version:
- Store questions in `data/wyr/questions.json`.
- Question shape:
  - `id`
  - `optionA`
  - `optionB`
- Bot picks one random question per day.
- Avoid repeating recent questions; target buffer: last 100 question IDs.
- Post the question in General chat.
- Automatically create a thread attached to the question message.
- Suggested thread name: `Daily WYR - June 25`.
- Voting lasts 24 hours.
- Voting uses exactly two buttons:
  - Option A
  - Option B
- No Open Thread button; Discord already exposes the thread.

Embed shape:
- Title: `Daily Would You Rather`
- Description:
  - Would you rather...
  - Option A
  - OR
  - Option B
  - Vote below, then join the thread and explain why.
  - Voting reward: 30 coins + 15 XP.
  - Voting closes in 24 hours, using Discord timestamps.

Voting rules:
- One vote per user.
- Users may change their vote until voting closes.
- Votes are anonymous.
- Reward is granted only once, the first time a user votes.
- Users do not need to comment to receive the reward.
- Users who only comment without voting receive no reward.

Closing:
- After 24 hours, disable both voting buttons.
- Edit the original embed to show:
  - Voting closed.
  - Option A percentage.
  - Option B percentage.
  - Total votes.
  - Thread replies.
- Archive the thread automatically.

Reward:
- First version reward: 30 coins + 15 XP.
- Reward values should be configurable constants.
- This reward is intentionally small so it supports daily engagement without
  competing with daily quests.

Question writing guidelines:
- Fun, playful, easy English.
- Encourage conversation.
- No obvious correct answer.
- Avoid politics, religion, real-world drama, and divisive topics.
- Fit Midnight Pleasure's community without needing to be explicit.
- Mix funny, flirty, lifestyle, relationships, fashion, gaming, 3DXChat,
  party, food, travel, and random prompts.
- No categories in the first version; keep the daily feed varied.

Data:
- This feature uses SQL because votes/rewards/history must survive restarts.
- Stored state:
  - active WYR message/thread/question
  - question history
  - user votes
  - reward claimed flag
  - close timestamp

Future ideas:
- Community-submitted questions.
- Staff approval queue.
- Monthly most-discussed question.
- Holiday questions.
- Rare bonus reward days.
- WYR stats and achievements.

### Balance And Live Testing

- Rebalance daily quest rewards after live testing.
- Add or remove daily quest types based on actual command usage.
- Keep every assigned daily quest possible for all supported genders.
- Test `/shop` booster prices against live coin income.
- Check cooldowns again after more users play for a few days.
- Keep an eye on pornscene XP now that Performance gives crit chance instead
  of raw XP.

### GIF Submit And Scene Titles

Current:
- GIF Submit supports normal GIF submissions and scene title suggestions.
- Staff can approve or reject suggested scene titles.
- Preflight validates scene title pools.

Future:
- Keep adding approved titles so scene names feel less repetitive.
- Watch whether title suggestion review needs better staff filters or logs.
- Keep title suggestions out of public changelog unless the workflow is visible
  to members.

### Embed And UI Consistency

Current direction:
- Use shared embed helpers where possible.
- Use user avatar thumbnails for user-centered embeds.
- Use versioned footers on command embeds.
- Add clear emoji feedback to buttons and fields.
- If buttons start feeling cramped, use a dropdown menu instead.
- Use fields for readable command/profile categories instead of long stacked
  description lists.
- Keep `/commands` overview as category fields, with exact details behind the
  section menu.

Future:
- Continue converting older command groups.
- Keep moment announcements visually consistent.
- Keep command text short because Discord users do not read walls of text.

### Profile And Social Polish

Current:
- `/profile` shows wallet, stats, career, split interaction fields, and profile
  likes.
- Profile likes are one per liker/target pair, block self-likes, and post first
  likes to Moments.

Future:
- Watch whether profile likes create good social energy or need cooldowns.
- Consider adding relationships or future Reputation to profile only after live
  testing proves the profile stays readable.

### Channel Routing

Current:
- Moments stays focused on sexy/story RP moments.
- Maid Feed carries progress/system notices: `1518308768335528187`.

Current routing plan:
- Keep Moments for sexy/story RP moments: pornscene final results, pregnancy
  confirmed, gender reveal, birth, and bigger RP hooks.
- Move game/system spam to Maid Feed: daily quest completions, achievement
  unlocks, daily/weekly activity milestones, GIF approvals, and similar
  progress notices.
- Keep porn career channel for scene parts only.
- Keep custom scene channel for custom scene parts only.

### Reputation And Moments

Goal:
- Add a social Reputation layer that rewards visible participation and group
  chemistry, without turning showcase commands into solo spam farms.
- Make Moments feel more alive with RP flavor while keeping useful data fields
  so users understand what happened and why stats matter.

Reputation rules:
- Do not award Reputation just for running showcase commands.
- Ignore/remove earlier ideas:
  - `/drop`: +2 Reputation
  - `/wiggle`: +2 Reputation for posting
  - `/flex`: +2 Reputation for posting
  - `/horny`: +2 Reputation for posting
- Showcase/interactions Reputation goes to the user who clicks a valid public
  interaction button, not the original poster.
- Poster still gets the normal command result/GIF.
- Clicker gets +2 Reputation for a valid interaction.
- Clicker cannot gain Reputation by clicking their own post.
- Interaction must pass the existing gender/role validation before Reputation
  is awarded.
- Same clicker should only gain Reputation from the same interaction source a
  limited number of times per day.

Button Reputation sources:
- `/wiggle` Spank button: +2 Reputation, max 5 rewarded clicks/day.
- `/flex` Kiss button: +2 Reputation, max 5 rewarded clicks/day.
- `/flex` Brofist button: +2 Reputation, max 5 rewarded clicks/day.
- `/horny` Help button: +2 Reputation, max 5 rewarded clicks/day.
- Any future public interaction button should follow the same pattern unless
  explicitly designed otherwise.
- Commands/buttons can still be used after the daily Reputation cap, but no
  extra Reputation is awarded.

Initial Reputation rewards:
- Porn Career:
  - Awkward Scene: +4 Reputation
  - Solid Scene: +8 Reputation
  - Hot Scene: +14 Reputation
  - Viral Hit: +25 Reputation
  - Critical Scene bonus: +10 Reputation
- Daily quests:
  - Each completed quest: +3 Reputation
  - Full daily set completed: +10 Reputation
  - Weekly streak completed: +25 Reputation
- Achievements:
  - Normal achievement unlock: +15 Reputation
  - Major milestone achievement: +30 Reputation
  - Endless achievement: +5 Reputation, with anti-spam protection
- Showcase interactions:
  - Button interaction rewards only, using the caps above.
  - No posting rewards for `/drop`, `/wiggle`, `/flex`, or `/horny`.
- Casino:
  - No Reputation for normal wins/losses.
  - Big jackpot/special win: +10 Reputation, if the event is notable enough to
    post.
- Daily Would You Rather:
  - First vote of the day: +2 Reputation.

Data needed:
- Reputation total per user.
- Helper functions:
  - `getReputation(userId)`
  - `addReputation(userId, amount, reason, options?)`
  - `getReputationBadge(reputation)`
- `addReputation` should:
  - ignore zero/negative values unless explicitly allowed
  - update the user row
  - optionally return old/new Reputation
  - detect badge threshold changes
  - return badge changes so callers can post Maid Feed upgrades
- Daily rewarded interaction counts by user and source:
  - `spank`
  - `kiss`
  - `brofist`
  - `horny_help`
- Optional later history table for audit/recovery if needed.
- This belongs in the pre-deployment SQL batch because Reputation should
  survive restarts.
- Suggested SQL:
  - `users.reputation INTEGER NOT NULL DEFAULT 0`
  - optional `reputation_events` for history/audit
  - optional `daily_rep_claims` for daily caps
- `daily_rep_claims` can be used for:
  - showcase interaction Reputation caps
  - WYR vote Reputation cap
  - any future daily Reputation source

Badge config:
- Reputation badges should support external image URLs.
- Do not require local badge image files.
- Badge config shape:
  - `key`
  - `name`
  - `minReputation`
  - `imageUrl`
  - `color`
- Example:
  - `key`: `group_icon`
  - `name`: `Group Icon`
  - `minReputation`: `5000`
  - `imageUrl`: external image URL
  - `color`: `#FF2EF9`

Profile badge display:
- Keep the user avatar as thumbnail when the profile already uses it.
- Show the current Reputation badge image as the main embed image using
  `imageUrl`.
- If no `imageUrl` exists, show only the badge name as text.
- Badge image URLs will be provided later.

Initial badge tiers:
- 0 Reputation: Unknown, key `unknown`
- 250 Reputation: Fresh Face, key `fresh_face`
- 750 Reputation: Local Favorite, key `local_favorite`
- 1500 Reputation: Rising Name, key `rising_name`
- 3000 Reputation: Midnight Regular, key `midnight_regular`
- 5000 Reputation: Group Icon, key `group_icon`
- 8000 Reputation: MPC Star, key `mpc_star`
- 12000 Reputation: Living Legend, key `living_legend`

Badge upgrade announcements:
- When a user crosses into a new Reputation badge tier, post a short public
  notice in Maid Feed, not Moments.
- Example fields:
  - New Badge
  - Reputation
- Badge upgrades are progression/system moments, not story moments.

Profile update:
- Add a Reputation section to `/profile`.
- Keep existing porn career Rank display.
- Rank and Reputation should both show.
- Suggested profile group:
  - Porn Career: rank, scenes, stats
  - Reputation: Reputation number and badge name/image
  - Social: interactions, helps, relationships later if needed

Moments design:
- Moments should not become pure flavor text only.
- Moments should have:
  - Title: moment/event title.
  - Description: short RP flavor text.
  - Fields: actual useful data.
- Useful data stays in Moments for story events; the goal is flavor plus clarity,
  not hiding numbers.

Scene final moment examples:
- Normal:
  - Title: `Studio Buzz`
  - Description: a short release/chemistry flavor line.
  - Fields:
    - Outcome
    - Ranking
    - Revenue
    - XP
    - Reputation
    - Viewers
    - Parts
    - Critical
- Viral critical:
  - Title: `Midnight Headline`
  - Description: special performance flavor.
  - Same fields as normal final, with stronger numbers.

Relationship moments:
- Mostly flavor-only because relationships have no rewards.
- Keep useful fields:
  - Bond
  - Since, when available.
- Example:
  - Title: `Moment`
  - Description: love/group RP flavor.
  - Fields:
    - Bond: Marriage
    - Since: June 25, 2026

Pregnancy moments:
- Keep only RP-safe useful data.
- Pregnancy confirmed:
  - no names
  - no stats
  - no chance values
- Pregnancy reveal fields:
  - Stage: Reveal
  - Day: 7/30
- Birth fields:
  - Stage: Birth
  - Gender: Boy/Girl
  - Journey: 30 days

Other moment field rules:
- Career milestone moments:
  - Milestone
  - Total Scenes
  - Reputation Gained, if applicable
- Casino jackpot moments:
  - Game
  - Win
  - Reputation, if applicable

Moment helper structure:
- Add a shared helper that supports flavor text and stable data fields.
- Suggested call shape:
  - `postMoment(client, { type, title, flavor, fields, color, image, footer })`
  - or `postMoment(client, type, data)`
- Internally support:
  - randomized flavor description
  - stable data fields
  - optional user mentions
  - optional anonymity
  - optional embed color
  - optional image/badge support later
- Supported moment types:
  - `scene_start`
  - `scene_final`
  - `relationship_created`
  - `relationship_broken`
  - `pregnancy_confirmed`
  - `pregnancy_reveal`
  - `birth`
  - `achievement_major`
  - `casino_jackpot`
  - `career_milestone`
- The helper should:
  - post to Moments channel
  - keep messages short
  - use randomized templates
  - avoid feeling like a raw log
  - allow anonymous wording when appropriate
  - avoid exposing private details
  - avoid explicit text beyond the server's existing playful/sexy tone
  - keep the RP industry story vibe

Moment template pool:
- Scene start:
  - `Moment`: A new production just started behind closed doors. Word around the
    studio is that the chemistry already has people watching.
  - `Studio Moment`: Cameras are rolling again. Someone at Midnight Pleasure
    may be filming something worth talking about.
  - `On Set`: Another scene has entered production. The first viewers are
    already gathering.
- Scene final:
  - Awkward Scene: cameras stopped, not every production is a masterpiece, but
    every performer starts somewhere.
  - Solid Scene: another production wrapped successfully, nothing too
    scandalous, studio seems pleased.
  - Hot Scene: a hot release wrapped, chemistry carried the production.
  - Viral Hit: a scene exploded across the studio, fans call it a must-watch.
  - Critical Viral: something special happened on set, people will talk about it.
- Relationship created:
  - Marriage: love is in the air, two familiar faces tied the knot.
  - Dating: someone made things official, the studio is watching.
  - Besties: two regulars are inseparable, everyone has an opinion.
  - Family/adoption: the Midnight Pleasure family grew.
- Relationship broken:
  - Romance: one romance reached its final scene.
  - Besties/family: something shifted quietly inside the circle.
- Pregnancy:
  - Confirmed: a private moment changed, someone may be expecting.
  - Reveal: the moment became real, congratulations are spreading.
  - Birth: a new little troublemaker joined the family.
- Achievement major:
  - A performer crossed a serious career milestone.
- Casino jackpot:
  - Someone walked away from the tables with a lucky win.
- Career milestone:
  - A performer reached a new career milestone; dedication got noticed.

Routing separation:
- Maid Feed:
  - progression notices
  - quest completions
  - badge upgrades
  - achievement unlocks
- Moments:
  - story events with flavor plus useful fields
  - scene starts/finals
  - relationship story beats
  - pregnancy story beats
  - big casino stories
  - career milestones

Activity Moments:
- Track scene, help, spank, kiss, and brofist activity by daily and weekly
  period, with posted milestone guards.
- Scene/help thresholds: daily `3/5/10/20/40`, weekly `10/25/50/100/200`.
- Faster button thresholds: daily `5/10/20/40/80`, weekly
  `25/50/100/200/400`.
- Daily and weekly activity milestones post to Maid Feed as progress updates.
- Lifetime scene/help Moments every 10 actions; faster social button Moments
  every 25 actions and stay in Moments as bigger career/social milestones.

Implementation notes:
- Build Reputation awarding as a small helper called after existing validation
  succeeds in each interaction handler.
- Add daily cap checks before adding Reputation.
- Add Moment helper before refactoring all existing Moment posts, so migration can
  happen one system at a time.
- Start with button Reputation and profile badge display before adding larger
  Reputation leaderboards or achievements.
- Integrate Porn Career final rewards with Reputation:
  - call `addReputation` based on outcome
  - add critical bonus when applicable
  - post badge upgrade to Maid Feed if a threshold is crossed
  - post scene final with the Moment helper
- Integrate daily quest Reputation:
  - completed quest: +3 Reputation
  - all 3 daily quests: +10 Reputation
  - weekly streak: +25 Reputation
  - use Maid Feed, not Moments
- Integrate achievements:
  - normal/major/endless Reputation values above
  - use Maid Feed
- Public `/commands` can mention Reputation briefly later:
  - earned through career activity, daily participation, achievements, and
    public interactions
  - relationships and pregnancy are RP-only and do not give Reputation
- Public changelog, when this goes live:
  - Reputation is live as a long-term prestige value
  - Profiles show Reputation and cosmetic badge tier
  - Major stories appear in Moments with more RP flavor
  - Relationships and pregnancy create better story moments but remain RP-only

## Medium Priority

### Casino Polish

Current:
- `/dice`, `/slots`, `/blackjack`, `/holdem`, and Spank Dilli are playable.
- `/holdem` is intentionally user vs dealer for the first version.
- Hold'em does not use SQL yet because it is a short live session like
  blackjack.

Hold'em live-test notes:
- Watch whether per-street betting is easier to understand than locking the
  full max risk up front.
- Test edge cases: low balance on the next street, fold, tie, timeout, and
  showdown.
- Keep multiplayer tables parked until the user-vs-dealer version feels good.
- If Hold'em becomes popular, consider SQL-backed tables before adding
  multiplayer or all-in/side-pot logic.

Future casino ideas:
- Add notable-win Moments only for rare/special results, not normal wins.
- Add casino Reputation only for notable jackpots if Reputation becomes live.

### Private Scene Threads

Goal:
- Add `/privatescene` as a paid private RP sandbox.
- Users create a temporary private thread for 2 or 3 participants.
- The thread is for free RP and bot GIF commands, not porn career progression.
- No XP, ranking, quests, achievements, or forced scene order in the first
  version.

Privacy rules:
- Thread names must not include usernames.
- Suggested thread name: `private-scene-4217`.
- Only add explicit participants to the private thread as individual members.
- Do not add any role overwrites to the private thread.
- Do not add staff roles, host roles, or broad server roles to the thread.
- Admins may still have server-level access because Discord permissions allow
  that, but the bot should not deliberately add staff role overwrites.
- Moments/Maid Feed posts must never include participant names, thread links,
  GIFs, or message content.

Role rules:
- Use the existing gender and skin roles for GIF selection:
  - Male: `1492022010841141370`
  - Female: `1492022133256224768`
  - White/Light skin: `1495332763698724915`
  - Black/Dark skin: `1495332837849698316`
- Card, status, gang, staff, and host roles do not matter for GIF selection.
- The private scene system should only read gender and skin tone roles.
- Current 2-person scene folders:
  - `wm_wf`
  - `wm_bf`
  - `bm_wf`
  - `bm_bf`
  - `wf_wf`
  - `wf_bf`
  - `bf_bf`
- Missing role data should fail with a friendly message.
- Bot users cannot be invited.
- Maximum room size: creator + 2 invited users.
- A user can only be inside one active private scene at a time.

Cost and duration:
- Couple private scene: 250 coins.
- 3-user private scene: 400 coins.
- Creator pays the full cost when the room is created.
- Pricing reason: this should feel like a premium sandbox and coin sink, close
  to booster pricing, without being more expensive than regular daily play can
  support.
- No refund if the room is closed early.
- Max duration: 1 hour.
- On expiry or manual close, post a closing message inside the thread, post
  anonymous stats to Maid Feed or Moments, then lock/archive the thread.
- Preferred destination for anonymous private-scene stats: Maid Feed unless the
  final vibe feels more like a Moments hook.

Command shape:
- `/privatescene create partner:@user partner2:@user?`
  - Creates the private thread and stores the session.
- `/privatescene close`
  - Ends the active private scene.
  - Usable by scene creator and participants.
  - Admin recovery can be separate if needed.
- `/privatescene stats`
  - Shows current private-scene stats inside the private thread.
- `/privatescene foreplay`
- `/privatescene oral`
- `/privatescene sex`
- `/privatescene finale`
  - Only work inside an active private scene thread.
  - For 2-user rooms, use the existing 2-person folder based on the two users'
    roles.
  - In 3-user rooms, `foreplay`, `sex`, and `finale` can use the 3some folders;
    `oral` should tell users to use `/privatescene threesome` because the 3some
    data does not have a dedicated oral category.
  - No cooldown.
  - No forced order.
  - Oral and sex embeds get a Spank button.
- `/privatescene threesome`
  - Only works when the private room has exactly 3 users.
  - Uses 3some GIF folders only.
  - This command should not fall back to 2-person GIFs.
  - If 3some GIF folders are empty/missing, reply privately that no 3some GIFs
    are ready yet.

3some GIF structure:
- The 3some folders already exist and stay separate from normal 2-person scene
  folders:
  - `data/scenes_mfm`
  - `data/scenes_fmf`
  - `data/scenes_fff`
- Current 3some folders are skin-tone specific:
  - MFM: `bm_bm_bf`, `bm_bm_wf`, `wm_bm_bf`, `wm_bm_wf`, `wm_wm_bf`,
    `wm_wm_wf`
  - FMF: `bm_bf_bf`, `bm_wf_bf`, `bm_wf_wf`, `wm_bf_bf`, `wm_wf_bf`,
    `wm_wf_wf`
  - FFF: `bf_bf_bf`, `wf_bf_bf`, `wf_wf_bf`, `wf_wf_wf`
- Current 3some subcategories are broad because most 3some GIFs mix oral and
  sex:
  - `foreplay`
  - `sex`
  - `finale`
- `/privatescene threesome` can pick a random phase or accept a phase option:
  - `phase: foreplay | sex | finale`
- If no phase option is used, pick from all available 3some GIFs for that cast.

2-person GIF logic:
- For 2-user rooms, map roles the same way `/pornscene` does:
  - one male + one female: `male_female`
  - female + female: `wf_wf`, `wf_bf`, or `bf_bf`
- Use existing scene subcategories:
  - `foreplay`
  - `oral`
  - `sex`
  - `finale`
- The command should post the GIF in the private thread as a normal embed.

Spank interaction:
- Add Spank button only to:
  - `/privatescene oral`
  - `/privatescene sex`
  - `/privatescene threesome` when phase is `sex` or when no phase is chosen
    and the selected GIF comes from sex.
- Use existing `data/gifs/spank.json`.
- Increment private session `spank_count`.
- Tag all other participants if target logic is not worth the complexity.
- No cooldown.

First version state:
- Do not add SQL yet.
- Keep active private scenes in memory first.
- A bot restart can drop active private-scene tracking in the first test
  version.
- Store only the minimum runtime state:
  - `thread_id`
  - `guild_id`
  - `parent_channel_id`
  - `creator_id`
  - participant IDs
  - created timestamp
  - expiry timestamp
  - cost paid
  - GIF counts by category
  - spank count
- Add a real SQL table later only if the feature feels good in live testing.

Anonymous ending embed:
- Participants: 2 or 3
- Duration
- GIFs used
- Foreplay / Oral / Sex / Finale / 3some counts
- Spanks
- Messages
- Most used category
- No names, no links, no GIFs, no content.

Implementation notes:
- No SQL for the first basic version.
- Later, if the feature works well, add a `private_scenes` table for recovery,
  history, and safer cleanup after restarts.
- Add recovery/admin cleanup later if a thread gets stuck.
- Do not list `/privatescene` in `/commands` until it is tested.
- Add to public changelog only when it is actually playable.

### Booster System

Goal:
- Boosters are consumable scene items that improve one pornscene stat for one
  requested scene.
- `/pornscene` stays clean: users only pick from boosters already owned.
- Booster is consumed when the request is sent.

Current direction:
- One booster per scene max.
- Booster is selected from a dropdown before sending the request.
- Dropdown shows only boosters in the user's inventory.
- All 4 booster tiers can be bought with `/shop`.
- `/shop` uses a dropdown menu because 12 booster buttons would be cramped.
- Later downside idea: stronger boosters may increase flop chance.

Needed later:
- Watch tier prices and burnout risk after live testing.
- SQL/inventory structure review before hosting.

### Shop System

Goal:
- Give coins meaningful sinks beyond training fees.

Current shop version:
- Sell Tier 1-4 Performance, Stamina, and Fame boosters.
- Use a dropdown menu instead of crowded buttons.
- Keep purchases private/ephemeral.
- Current prices: T1 120, T2 350, T3 800, T4 1400 coins.
- Boosters are best used to push a combined stat over a 20-point threshold.

Possible future items:
- Cosmetic profile/card items.
- Temporary fertility or pregnancy-related items only if the pregnancy system
  needs them later.

Balance notes:
- Training should remain a steady coin sink.
- Shop prices should make users think before buying many boosters.
- Avoid pay-to-win feeling for ranking.

### Pregnancy System

Goal:
- Standalone long-term RP system, separate from porn career.
- Pregnancy should feel meaningful, not like a collectible child list.

Core rules:
- Full pregnancy lasts 30 days.
- Gender reveal happens after 7 days.
- Birth is automatic at Day 30.
- Pregnancy check happens once per carrier per day.
- Accepted partners are stored in the carrier's daily partner list.
- The same partner can appear only once per carrier per day.
- No cap on total partners.
- For the daily pregnancy check, use the highest impregnating fertility value
  from that day's partner list.
- If pregnancy succeeds and multiple partners share the highest value, pick the
  father randomly from those tied partners.

Valid pairings:
- Any Female can be the carrier.
- Male or Female can be the impregnating partner, to support futa RP.
- Female + Female is valid.
- Male + Male is not part of the first version.

Pregnancy chance:
- Base: 1%
- Carrier daily fertility:
  - Infertile: 0%
  - Low: 2%
  - Medium: 4%
  - High: 6%
  - Peak: 9%
- Partner fertility:
  - Low: 0%
  - Normal: 1%
  - High: 2%
  - Hyper: 3%
- Final chance: base + carrier daily fertility + best partner fertility.

Fertile window:
- Each carrier receives one daily fertility state.
- That state lasts for the whole day.
- Pregnancy only rolls if the carrier has at least one accepted partner that
  day.
- Failed pregnancy rolls are silent.

Current commands:
- `/breed @user` sends a consent request.
- `/pregnancy` shows only your own pregnancy state and daily fertility.
- Pregnancy profiles store simple long-term counters: pregnancies, children
  born, successful breeding partner count, last pregnancy, last birth, opt-in,
  and public announcement preference.

Announcement ideas:
- Breed accepted: small moment post.
- Pregnancy confirmed: special moment post.
- Day 7 gender reveal: special moment post.
- Day 30 birth: special moment post.

Meaningful-history rule:
- Store enough to remember mother, father, gender, conception date, and birth
  date.
- Do not turn the system into a giant child collection.
- Profile can show simple totals and current pregnancy status.
- A future `/family` command can show only recent/important records.

Do not add yet:
- Pregnancy leaderboard.
- Child stats.
- Large family tree.
- Endless child list.

### Achievements

Current:
- Achievements unlock automatically and post in Maid Feed.
- Achievement points exist and can be shown on leaderboard.
- `/achievements` shows private progress with category buttons.
- Training achievements include single-stat milestones and balanced all-three
  milestones when Performance, Stamina, and Fame all reach each 10-point
  threshold.
- Social achievements include drink rounds, fireworks, profile likes, Daily
  WYR votes, and tracked interaction counters.

Future:
- Add milestones for pregnancy only after the first pregnancy version is tested.
- Keep endless milestones for long-term actions, but avoid spammy rewards.

## Low Priority

### Automatic X Repost Watcher

- Staff command to add/remove watched X users.
- Requires `X_BEARER_TOKEN` in `.env`.
- Repost text, creator name, link, and timestamp only by default.
- Avoid scraping or bypassing sensitive-media walls.
