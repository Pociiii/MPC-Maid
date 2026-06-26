# MPC Maid Design Context

Use this file as the quick context handoff when discussing bot design in
ChatGPT or another planning thread. Keep it updated when major systems,
balance rules, channels, or design principles change.

Current bot version: `0.14.0`

## Server Context

- MPC is a 3DXChat adult production server.
- The server also hosts private events.
- The bot is for user agency, RP flavor, game loops, GIF interaction, and
  production-server identity.
- Moderation is handled by MEE6, so MPC Maid does not need moderation systems.
- Staff/host/organizer tools should focus on events, cast flow, announcements,
  and production support.
- Admin/staff commands must not be listed in the public `/commands` guide.
- Admin/staff commands must not be included in the public changelog.

## Design Meaning

The bot should make users feel involved and part of the group, not just served
by commands. The main goal is to make the server feel alive around them.

Prefer improving existing systems before adding new ones:

- Make user actions visible in the right public spaces when it creates social
  energy: Moments for story moments, Maid Feed for progress moments.
- Make posts feel like something happened in the shared room, not like a plain
  bot log.
- Give users recognition through names, avatars, titles, ranks, milestones,
  scene links, and clean outcome fields.
- User display names should prefer the server nickname first. Only fall back to
  the global Discord display name or username when the guild member cannot be
  resolved.
- Turn solo actions into social hooks where possible: buttons, helpers,
  partner choices, shared scenes, public results, and lightweight story hooks.
- Keep useful data visible so users understand why stats, quests, training,
  relationships, and choices matter.
- Use timestamps for waiting, cooldowns, resets, pregnancy checks, and future
  events so users can plan instead of guessing.
- Avoid feature clutter. If the same feeling can be created by better embeds,
  better routing, better flavor text, or better feedback, do that first.
- Repeated public posts should use flavor text arrays with enough variety so
  the bot feels alive without becoming wordy.
- Every major loop should answer: "Why should users care, talk about it, or
  come back tomorrow?"

## Design Style

- Discord users do not read walls of text, so embeds should stay short.
- Use fields, emoji, buttons, and dropdown menus for visual feedback.
- For gender/skin category labels in buttons and menus, prefer compact symbols:
  `⚪♂️`, `⚪♀️`, `⚫♂️`, `⚫♀️`.
- In embeds, emoji belong in field titles, buttons, menus, and rare top-level
  titles where they help scanning. Field values and embed descriptions should
  stay clean text with no decorative emoji. Exceptions are only when the emoji
  is the actual content, such as slot reels, cards, or cast symbols in menus.
- Embed field titles should always carry a useful emoji or bot emoji unless the
  title itself is already a compact symbol label, such as cast category labels.
- When a field value contains a list, every list item should start with `- `.
  Avoid bare stacked lines for lists.
- If buttons get cramped, use a dropdown menu.
- `/commands` should stay as a compact public directory. Exact command details
  belong in private dropdown replies, with separate info buttons for big
  systems.
- Use user avatars as thumbnails for user-centered embeds.
- Use consistent command footers with the bot version where applicable.
- Keep Moments sexy/story-focused.
- Keep Maid Feed for progress/system notices.
- Maid Feed posts should be embed-first: user/avatar when user-centered, one
  short flavor line, clean useful fields, and no duplicate plain-text content
  unless the post intentionally pings the user.
- Moments should be flavor plus useful fields, not flavor-only. Keep key data
  such as outcome, ranking, XP, Reputation, viewers, parts, and critical state
  where it helps users understand the event.
- Avoid making the bot feel like a generic economy bot. Systems should feel
  like they belong to Midnight Pleasure / After Dinner Productions.

## Key Channels

- Commands: `1495316822646325268`
- General: `1440755913572090038`
- Updates: `1518153153860730981`
- Moments: `1504424543865929888`
- Maid Feed: `1518308768335528187`
- Porn Career: `1493483825869754440`
- Custom Scene: `1517485570656571462`
- Showcase: `1495980074586083368`
- Titty Drop: `1518478547067342999`
- Casino: `1503674706505764915`
- Spank Dilli: `1506733030629183498`
- GIF Submission: `1511804100604334330`
- Inbox Forum: `1515930617068392448`
- Log Post: `1516017240472813598`
- Role Request Post: `1515932488223031357`
- Feedback Post: `1518005640205701362`
- Game Chat: `1499291222228078715`

## Core Roles

These are used for GIF category logic:

- Male: `1492022010841141370`
- Female: `1492022133256224768`
- White/Light skin: `1495332763698724915`
- Black/Dark skin: `1495332837849698316`

Card/status roles exist, but they should not affect scene GIF selection.
For scene systems, use only gender and skin tone unless explicitly designing a
different feature.

## Current Public Command Groups

General:

- `/profile` shows a user profile, stats, social counters, help counters, and
  can compare career stats with another user.
- `/daily` shows personal daily quests.
- `/leaderboard` shows ladders through a dropdown menu.
- `/achievements` shows private achievement progress.

Porn Career:

- `/pornscene` requests a shared career scene with another user.
- `/customscene` builds a solo custom scene.
- `/train` spends XP and coins to raise Performance, Stamina, and Fame.
- `/shop` buys boosters.
- `/inventory` shows owned boosters.

Showcase:

- `/drop` posts in the titty drop channel.
- `/wiggle` posts a wiggle GIF with gendered spank buttons.
- `/flex` posts a flex GIF with a female-only Kiss button and a male-only
  Brofist button.
- `/horny` posts a solo horny GIF with a Help button.

Social / RP:

- `/matchme` publicly matches the user with an opposite-gender member.
- `/relationship` manages consent-based RP relationship links.
- `/breed` sends a pregnancy RP consent request.
- `/pregnancy` privately shows the user their own pregnancy/fertility state.

Casino:

- `/dice`
- `/slots`
- `/blackjack`
- Spank Dilli is a fixed casino-style button panel in its own channel.

## Porn Career System

The porn career is the main progression minigame.

Scene request flow:

- User runs `/pornscene partner:@user`.
- Bot checks roles and category compatibility.
- Requester chooses no booster or one owned booster.
- Booster is consumed when the request is sent.
- Partner receives a DM request.
- Busy status starts only after the partner accepts.
- Accepted scenes post parts in the Porn Career channel.
- Start and final notices post in Moments.
- Scene parts show live viewer counts to make the posts feel like an ongoing
  recording.
- Live scene part embeds should stay immersive: flavor in the description, only
  Cast and Viewers fields, and Cast should show only the two users with no
  gender/color/category labels.
- Do not show scene part or progress fields on live scene part embeds.
- Final result includes outcome, revenue, XP, ranking, and links to parts.

Scene pacing:

- Scene lasts up to about 1 hour.
- Parts post every 8-12 minutes, adjusted by total part count.
- Minimum parts: 4.
- Maximum parts: 8.

Scene stats:

- Performance improves scene score and critical scene chance.
- Stamina increases total scene parts, score, and gives a small XP bonus for
  extra parts.
- Fame increases viewers, revenue, and score.
- Partner stats are combined.
- Every stat adds a score bonus every 10 combined points.
- Performance adds critical chance every 10 combined points, capped at 15%.
- Stamina adds scene parts every 10 combined points, capped at 8 parts.
- Each stamina-created extra part gives +2 XP each.
- Fame gives bigger viewer/revenue value every 10 combined points.
- Ranking can go negative.

Outcomes:

- Awkward Scene
- Solid Scene
- Hot Scene
- Viral Hit

XP by outcome:

- Awkward: 10 XP
- Solid: 20 XP
- Hot: 35 XP
- Viral: 55 XP
- Critical scenes add +10 XP.
- Stamina adds +2 XP per extra scene part above 4.
- The user who starts `/pornscene` gets +5 XP when the accepted scene
  completes.

Colors:

- `/pornscene` public embeds now use one deterministic color for the same pair.
- Color is based on the two user IDs sorted together.
- Rank should stay in text/title areas, not control the embed color.

## Reputation And Moments Planned

Reputation is planned as a social participation layer, not a solo command spam
reward.

Core rule:

- Porn Career remains the main gameplay/progression system.
- Relationships remain pure RP flavor.
- Pregnancy remains pure RP flavor.
- Relationships and pregnancy must never give coins, XP, Reputation, rank,
  achievements, or gameplay advantages.
- Moments is the RP story/newspaper layer.
- Maid Feed is the progression/system notice layer.

Reputation is separate from:

- Porn career rank
- XP
- Coins
- Fame
- Achievement points

Initial Reputation reward targets:

- Porn Career outcomes:
  - Awkward: +4
  - Solid: +8
  - Hot: +14
  - Viral: +25
  - Critical bonus: +10
- Daily quests:
  - completed quest: +3
  - full daily set: +10
  - weekly streak: +25
- Achievements:
  - normal: +15
  - major: +30
  - endless: +5 with anti-spam protection
- Casino:
  - no normal win/loss Reputation
  - notable jackpot/special win: +10
- Daily WYR later:
  - first vote of the day: +2

Showcase interaction Reputation:

- Do not award Reputation just for running `/drop`, `/wiggle`, `/flex`, or
  `/horny`.
- Award Reputation to the user who clicks a valid public interaction button.
- Valid button clicks give +2 Reputation to the clicker.
- The clicker cannot earn Reputation from their own post.
- Existing gender/role validation must pass first.
- Daily rewarded click caps by source:
  - Spank: 5/day
  - Kiss: 5/day
  - Brofist: 5/day
  - Horny Help: 5/day
- The button can still be used after the cap, but no more Reputation is awarded.

Badge display:

- Reputation badges should support external image URLs.
- Badge config should include `key`, `name`, `minReputation`, `imageUrl`, and
  `color`.
- Initial badge tiers:
  - Unknown: 0
  - Fresh Face: 250
  - Local Favorite: 750
  - Rising Name: 1500
  - Midnight Regular: 3000
  - Group Icon: 5000
  - MPC Star: 8000
  - Living Legend: 12000
- Profile embeds should keep the user avatar as thumbnail.
- The current Reputation badge image should use the profile embed's main image
  slot when an `imageUrl` exists.
- If no `imageUrl` exists, show only the badge name as text.
- Badge upgrade announcements go to Maid Feed, not Moments.

Moments:

- Moments should feel alive with short RP flavor text, but keep useful fields.
- Avoid generic venue wording in flavor text. Prefer warmer community language
  such as room, group, crowd, studio, shared space, or Moments board.
- Use title + flavor description + data fields.
- Add a shared Moment helper before refactoring current Moments posts.
- The helper should support randomized flavor, stable data fields, optional
  mentions, optional anonymity, embed color, and optional image support.
- Scene final Moments should keep fields such as Outcome, Ranking, Revenue, XP,
  Reputation, Viewers, Parts, and Critical.
- Porn scene start/final Moments should use the same shape as scene embeds:
  flavor in the description, Cast in a field, and setup/outcome data in fields.
- Relationship Moments stay mostly flavor because relationships have no rewards,
  but can keep fields such as Bond and Since.
- Pregnancy Moments must remain RP-safe:
  - pregnancy moments: no names, stats, or chance values
  - reveal: Stage and Day
  - birth: Stage, Gender, and Journey
- Career milestones and big casino stories can include Reputation fields when
  applicable.

Routing:

- Maid Feed is for progression notices, quest completions, badge upgrades, and
  achievement unlocks.
- Moments is for story events: scene starts/finals, relationship beats,
  pregnancy beats, big casino stories, and career milestones.

Activity Moments:

- Scene, help, spank, kiss, and brofist activity is tracked daily, weekly, and
  across career totals.
- Weekly Activity Moment counters start on Monday at the same boundary as daily
  quests: 12:00 UTC, which is 14:00 in Rome during summer time and 13:00 during
  winter time.
- Daily/weekly counters live in `user_activity_period_stats`; posted milestones
  are guarded by `user_activity_moment_posts` so restarts do not duplicate
  Moments.
- Scene/help thresholds should reach farther than early use: daily
  `3/5/10/20/40`, weekly `10/25/50/100/200`.
- Fast button actions use wider thresholds: daily `5/10/20/40/80`, weekly
  `25/50/100/200/400`.
- Lifetime scene/help Moments post every 10 career actions. Faster social
  buttons post every 25 career actions.
- A single completed action should post at most one milestone Moment for the
  acting user. Priority is lifetime, then weekly, then daily.
- Activity Moment embeds should follow normal user-centered styling: actor name
  as author, user avatar as thumbnail, short flavor description, and emoji-led
  field names.

## Boosters

Boosters are one-use items for `/pornscene`.

Rules:

- One booster per scene max.
- Booster is selected before the DM request is sent.
- Booster is consumed immediately when the request is sent.
- Booster is not refunded if the partner declines.
- Booster applies only to the requester side of the combined scene stat.
- Boosters are best used to push a combined stat over a 10-point threshold.
- Stronger boosters add more burnout/flop risk.

Current tiers:

- T1: +2 stat, 120 coins, +1% burnout
- T2: +4 stat, 350 coins, +3% burnout
- T3: +6 stat, 800 coins, +6% burnout
- T4: +8 stat, 1400 coins, +10% burnout

Shop:

- `/shop` sells all 4 tiers for Performance, Stamina, and Fame.
- `/shop` uses a dropdown menu because 12 buttons would be too cramped.
- `/inventory` shows owned boosters.

## Training

Stats:

- Performance
- Stamina
- Fame

Training costs:

- Training costs XP and coins.
- Costs rise with stat level.
- Costs rise much harder after stat 40.
- Stats keep counting after 40.
- Current soft-cap design: reaching 40 in all 3 stats should take months for
  active users, not years.
- Current cost target from stat 1:
  - One stat to 40: about 20,885 XP and 18,600 coins.
  - All 3 stats to 40: about 62,655 XP and 55,800 coins.
  - One stat to 80: about 342,395 XP and 220,700 coins.
  - All 3 stats to 80: about 1,027,185 XP and 662,100 coins.
- This encourages cooperation because combined stats matter more than one user
  solo-carrying every scene.

## Daily Quests

Daily quests are personal and reset daily.

Current design:

- Users get 3 daily quests.
- `/daily` shows personal progress privately.
- `/daily` shows weekly streak progress.
- Quest completion posts to Maid Feed.
- User mention is only used when all 3 quests are completed.
- Assigned quests must be possible for all supported genders.
- Removed from quest pool: custom scene, matchme, train stat.
- No GIF submit quests.
- Blackjack is included in daily quests.

Examples:

- Be part of 1/2/3 porn scenes.
- Help someone horny 1/2/3 times.
- Use showcase commands 1/2/3 times.
- Give or receive interactions.
- Play dice/slots/blackjack.

Rewards:

- Easy: 40 coins + 20 XP.
- Medium: 75 coins + 35 XP.
- Hard: 120 coins + 60 XP.
- Full daily set bonus: 100 coins + 50 XP.
- Each completed quest has a 5% chance to drop 1 random T1 booster.
- Weekly streak reward: complete all 3 daily quests for 7 consecutive quest
  days to receive 1 random T2/T3 booster.

## Daily Would You Rather Planned

Daily WYR is a lightweight community discussion feature, completely separate
from Porn Career.

Goal:

- Encourage daily General chat activity.
- Give users a simple vote-and-discuss social ritual.
- Give a small reward for voting.
- Avoid controversy; the point is conversation, not drama.

Schedule:

- Runs once per day at daily quest reset time: 12:00 UTC.
- Posts in General: `1440755913572090038`.
- Only one Daily WYR should be active at a time.

Question source:

- Store questions in `data/wyr/questions.json`.
- Question shape:
  - `id`
  - `optionA`
  - `optionB`
- Avoid repeating recent questions.
- Target recent-history buffer: last 100 questions.
- No categories in the first version.
- Mix funny, flirty, lifestyle, relationships, fashion, gaming, 3DXChat,
  party, food, travel, and random prompts.

Post flow:

- Bot posts an embed titled `Daily Would You Rather`.
- Embed shows Option A and Option B.
- Embed tells users to vote, then join the thread and explain why.
- Bot creates a thread attached to the message.
- Suggested thread name: `Daily WYR - June 25`.
- Voting lasts 24 hours.
- No Open Thread button; Discord already exposes the thread.

Voting:

- Two buttons only: Option A and Option B.
- One vote per user.
- Users can change vote until close.
- Votes are anonymous.
- Reward is granted only once, on first vote.
- Users who only comment get no reward.

Reward:

- First version reward: 30 coins + 15 XP.
- Reward should be configurable.
- Reward is intentionally smaller than daily quests.

Closing:

- After 24 hours, disable both buttons.
- Edit the embed to show:
  - Voting closed.
  - Option A percentage.
  - Option B percentage.
  - Total votes.
  - Thread replies.
- Archive the thread.

Implementation note:

- Unlike some planned systems, Daily WYR should use SQL from the first version
  because active vote state, reward claims, and question history need to survive
  restarts.

## Achievements

Current:

- Achievements unlock automatically.
- Unlock posts go to Maid Feed.
- Achievement points exist.
- Achievement leaderboard exists.
- `/achievements` shows progress privately.

Achievement categories include:

- Porn scenes completed.
- Stats trained by 10-point thresholds.
- Combined scene stat thresholds.
- Combined scene 2-stat thresholds.
- Combined scene all-3-stat thresholds.
- Showcase command usage.
- Button interactions.
- GIF submissions.

Endless achievements are allowed for long-term actions, but reward spam should
be watched.

## Leaderboards

`/leaderboard` uses a dropdown menu.

Current ladders include:

- Ranking
- Total scenes
- Coins
- Spanks
- Kisses
- Horny Help
- Achievement points

Design notes:

- Ranking can be mixed regardless of gender.
- Help leaderboard should split male/female where useful.
- Kisses and spanks need gender logic because interaction direction is not
  symmetrical.

## Relationship System

Relationships are RP flavor only. They do not give coins, XP, quests, ranking,
or achievements.

Current rules:

- Relationship creation uses consent requests with Accept and Decline buttons.
- Removal commands remove only the exact selected link.
- No removal cascades into other relationship types.
- Family-style links:
  - Mother
  - Father
  - Children
  - Siblings
- Two users can only have one family-style link displayed between them. A pair
  cannot be parent/child and siblings at the same time.
- Romantic links remain separate and can still exist between the same users.
- A user can have max 1 Mother and max 1 Father.
- Children and siblings are unlimited.
- Sibling links are stored directly, not calculated dynamically.
- When adoption is accepted, existing children of that parent become direct
  siblings with the new child.
- Romantic links:
  - Marriage, shown as Husband or Wife based on the other user's gender role.
  - Dating, shown as Boyfriend or Girlfriend based on the other user's gender role.
- A user can have max 1 spouse total.
- Dating partners are unlimited.
- Being married does not block dating other users. This is intentional for
  swinger/open-RP use.
- Romantic links store a start date. Family and Bestie links do not.
- Social links:
  - Besties
  - Max 3 Besties per user.
- Gender validation uses the existing Male/Female roles and requires exactly
  one clear gender role where the command needs gender.
- `/relationship view` is private and uses the user's avatar as thumbnail.
- Accepted relationship requests post a compact embed in Moments so public RP
  links feel visible without adding rewards or progression pressure.
- Broken relationship links also post a compact Moments embed, but only after
  the removal actually succeeds.

## Pregnancy System

Pregnancy is standalone RP, separate from porn career.

Core rules:

- Full pregnancy lasts 30 days.
- Gender reveal happens after 7 days.
- Birth happens automatically at Day 30.
- Pregnancy check happens once per carrier per day.
- Failed pregnancy rolls are silent.
- `/pregnancy` is self-only to avoid users shopping for high fertility partners.
- `/breed` sends a consent request.
- Any Female can be carrier.
- Male or Female can be impregnating partner to support futa RP.
- Female + Female is valid.
- Male + Male is not part of the first version.

Daily partner list:

- Accepted partners are added to the carrier's daily partner list.
- The same partner can appear only once per carrier per day.
- There is no cap on total partners.
- For the daily check, use the highest partner fertility value in the list.
- If pregnancy succeeds and multiple partners tie for highest fertility, choose
  randomly from those tied partners.

Chance:

- Base: 1%.
- Carrier fertility:
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
- Final chance = base + carrier daily fertility + best partner fertility.

Design goal:

- Pregnancy should feel meaningful, not like a giant child collection.
- Store enough history to remember carrier, partner, gender, conception date,
  and birth date.
- Avoid child stats, big family trees, or endless child lists for now.

## GIF Structure

Two-person scenes:

- Root: `data/scenes`
- Folders:
  - `wm_wf`
  - `wm_bf`
  - `bm_wf`
  - `bm_bf`
  - `wf_wf`
  - `wf_bf`
  - `bf_bf`
- Subcategories:
  - `foreplay`
  - `oral`
  - `sex`
  - `finale`

Three-person scenes:

- Roots:
  - `data/scenes_mfm`
  - `data/scenes_fmf`
  - `data/scenes_fff`
- Subcategories:
  - `foreplay`
  - `sex`
  - `finale`
- No dedicated 3some oral category because most 3some GIFs mix sex/oral.

Interactions:

- `data/gifs/wiggle.json`
- `data/gifs/flex_w.json`
- `data/gifs/flex_b.json`
- `data/gifs/titty_drop.json`
- `data/gifs/spank.json`
- `data/gifs/blowkiss.json`
- `data/gifs/brofist.json`
- Horny GIFs are split under `data/gifs/horny`.

GIF randomness:

- Random GIF picks use an in-memory shuffle bag per category/file.
- Every GIF in a category should appear once before that bag repeats.
- The picker also keeps a small in-memory recent history per user.
- Current recent history target: last 30 GIF URLs per user.
- For small folders, the effective recent-history check scales down so folders
  with fewer than 30 GIFs still rotate naturally.
- When possible, the picker avoids GIFs recently seen by any involved user.
- If a category is too small and every option is recent, it falls back to the
  next bag item instead of failing.
- This is intentionally in-memory only for now; bot restarts clear bags and
  recent history.
- `/pornscene` uses both partners for history.
- `/customscene` uses the creator.
- Button interactions use both clicker and target.
- Auto posts without a user still benefit from the global shuffle bag.

## Custom Scene

`/customscene` lets users build a solo custom scene.

Current direction:

- User chooses cast with a dropdown menu.
- User chooses up to 8 parts.
- Custom scenes cost 20 coins per selected part, paid only when Finish succeeds.
- Parts are spread across the 30-minute cooldown instead of posted all at once.
- Posts go to Custom Scene channel.
- Embed thumbnail uses the user's avatar.

## Private Scene Threads Planned

Goal:

- `/privatescene` creates a paid private RP sandbox thread.
- Supports 2 or 3 users.
- First version is not porn career progression.
- No XP, ranking, quests, achievements, or forced order at first.
- No SQL in the first basic version.

Rules:

- Creator pays.
- Couple private scene: 250 coins.
- 3-user private scene: 400 coins.
- Max duration: 1 hour.
- No refund for early close.
- Only explicitly invited users are added to the thread.
- Do not add staff roles, host roles, or broad role overwrites.
- Thread names must not include usernames.
- Suggested thread name: `private-scene-4217`.
- A user can only be in one active private scene at a time.

Commands planned:

- `/privatescene create partner:@user partner2:@user?`
- `/privatescene close`
- `/privatescene stats`
- `/privatescene foreplay`
- `/privatescene oral`
- `/privatescene sex`
- `/privatescene finale`
- `/privatescene threesome`

3-user logic:

- `/privatescene threesome` only works in 3-user rooms.
- It uses only the 3some folders.
- It should not fall back to 2-person GIFs.
- `oral` should be treated as two-person-only unless a future 3some oral
  category is created.

Anonymous end stats:

- Participants: 2 or 3.
- Duration.
- GIFs used.
- Category counts.
- Spanks.
- Messages.
- Most-used category.
- No names, no links, no GIFs, no message content.

## Casino

Casino commands are coin-based and should use the same embed style as the rest
of the bot.

Current:

- `/dice`: max 50 coins.
- `/slots`: max 25 coins per spin, 1-minute opener cooldown, then Spin Again
  and Leave buttons control the slot session.
- `/blackjack`: max 100 coins, uses one standard deck.
- Blackjack card display uses suit emoji.
- Spank Dilli has a fixed embed in its own channel and public GIF replies.
- Spank Dilli uses a hosted GIF URL instead of a local asset attachment so
  button clicks feel faster.
- Spank Dilli winner announcements go to Maid Feed.

## Member Cards

Card generator uses role priority:

1. MPC Crew
2. Stiletto Gang / Tailored Few
3. Midnight Circle
4. Member

Design notes:

- Cards are generated when users press the member card panel button.
- The user name is written on the card.
- User avatar was tested and removed because it did not look good.
- Member card panel embed should explain that card style depends on role.

## Current Changelog Draft

Next update currently includes:

- `/profile` now shows horny Help given and received.
- Porn career titles now fit male and female roles better.
- Pornscene request DMs now remind users that `/train` helps scene outcomes.
- Boosters are fully live: `/shop` now sells all 4 tiers with better prices,
  and `/pornscene` lets you spend one before sending a request.
- `/train` is less brutal before stat 40, so active players can actually grow
  their pornstar stats.
- `/pornscene` posts now keep one consistent color for the same pair.
- `/flex` now has a male-only Brofist button, and `/gifsubmit` accepts Brofist GIFs.
- New porn career achievements unlock when 2 combined scene stats, or all 3,
  hit 10-point thresholds.
- GIF picks now use shuffle bags and recent-user history to reduce repeats.
- Daily Would You Rather is planned for General chat as a daily social vote
  with a discussion thread.

## Current Open Design Topics

- Live test booster prices and burnout risk.
- Live test daily quest rewards.
- Design and implement Daily Would You Rather for General chat.
- Continue embed/UI consistency cleanup.
- Decide when to implement `/privatescene`.
- Decide whether private scene end stats should go to Maid Feed or Moments.
- Keep pregnancy meaningful without turning it into a child-list bot.
- Low-priority future idea: X/Twitter watcher using `X_BEARER_TOKEN`, text/link
  only, no scraping or bypassing adult-media walls.
