# MPC Maid Design Context

Use this file as the quick context handoff when discussing bot design in
ChatGPT or another planning thread. Keep it updated when major systems,
balance rules, channels, or design principles change.

Current bot version: `0.13.0`

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

## Design Style

- Discord users do not read walls of text, so embeds should stay short.
- Use fields, emoji, buttons, and dropdown menus for visual feedback.
- If buttons get cramped, use a dropdown menu.
- Use user avatars as thumbnails for user-centered embeds.
- Use consistent command footers with the bot version where applicable.
- Keep Rumors sexy/story-focused.
- Keep Maid Feed for progress/system notices.
- Avoid making the bot feel like a generic economy bot. Systems should feel
  like they belong to Midnight Pleasure Club / After Dinner Productions.

## Key Channels

- Commands: `1495316822646325268`
- General: `1440755913572090038`
- Updates: `1518153153860730981`
- Rumors: `1504424543865929888`
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

Card/club/status roles exist, but they should not affect scene GIF selection.
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
- Start and final notices post in Rumors.
- Final result includes outcome, viewers, revenue, XP, ranking, and links to
  parts.

Scene pacing:

- Scene lasts up to about 1 hour.
- Parts post every 8-12 minutes, adjusted by total part count.
- Minimum parts: 4.
- Maximum parts: 8.

Scene stats:

- Performance improves scene score and critical scene chance.
- Stamina increases total scene parts and score.
- Fame increases viewers, revenue, and score.
- Partner stats are combined.
- Every stat adds a score bonus every 10 combined points.
- Performance adds critical chance every 10 combined points, capped at 15%.
- Stamina adds scene parts every 10 combined points, capped at 8 parts.
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

Colors:

- `/pornscene` public embeds now use one deterministic color for the same pair.
- Color is based on the two user IDs sorted together.
- Rank should stay in text/title areas, not control the embed color.

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
- `/slots`: max 75 coins.
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
- Decide whether private scene end stats should go to Maid Feed or Rumors.
- Keep pregnancy meaningful without turning it into a child-list bot.
- Rework relationships later; leave it for last.
- Low-priority future idea: X/Twitter watcher using `X_BEARER_TOKEN`, text/link
  only, no scraping or bypassing adult-media walls.
