# MPC Maid Design Context

This is the authoritative summary of behavior implemented in the current code.
Future plans belong in `TODO.md`.

## Product Context

MPC Maid serves Midnight Pleasure Club, a 3DXChat adult production and private
events community. Its tone is playful and RP-friendly, while commands should
remain concise and easy to use on mobile.

- Production and event workflows belong in this bot.
- General moderation is handled by MEE6.
- Staff-only commands and workflows must not appear in the public command
  guide or public changelog.
- Social flavor must not accidentally create progression rewards.

## Shared Conventions

- User-facing errors and sensitive flows use private replies.
- User-centered embeds use server nicknames before global display names and
  normally show the user's avatar as thumbnail.
- Shared embed, color, MPC logo, footer, version, database, and error helpers
  should be reused.
- Dropdowns are preferred when several equivalent buttons would be cramped.
- Interaction handlers revalidate state at confirmation time.
- SQL-backed state must survive restarts and use safe conditional updates or
  transactions for spend/consume operations.
- Do not delete `database.db` for schema updates. Startup and preflight execute
  additive `CREATE TABLE IF NOT EXISTS` schemas and migrations.

## Channel Responsibilities

- General: community chat and Daily WYR.
- Porn Career: live Porn Career scene parts.
- Custom Scene: custom scene output.
- Showcase: wiggle, flex, horny, and related public interactions.
- Casino: normal casino play.
- Maid Feed: progression and system notices, including quest/activity updates,
  achievement unlocks, and Spank Dilli winners.
- Moments: major story/RP moments where currently configured.
- Pillow Talk: relationship-oriented RP and successful gift notifications.
- Commands: command discovery and guidance.
- Member Card: persistent panel for generating private MPC membership cards.
- GIF Submission: persistent panel for GIF and scene-title contributions.

Channel IDs are defined centrally in `data/constants.js`; command code must not
hardcode them.

## Public Commands

Current public command families include:

- General: `/profile`, `/daily`, `/leaderboard`, `/achievements`, `/mpcopen`.
- Porn Career: `/pornscene`, `/mystudio`, `/studios`, `/customscene`, `/train`,
  `/shop boosters`, `/inventory boosters`.
- Gifts: `/shop gifts`, `/inventory gifts`, `/gift send`.
- Social/RP: `/relationship`, `/breed`, `/pregnancy`, `/matchme`, `/drink`,
  `/firework`.
- Showcase and interactions: `/drop`, `/wiggle`, `/flex`, `/horny` and their
  interaction buttons.
- Casino: `/dice`, `/slots`, `/blackjack`, `/holdem`, `/lottery`; Spank Dilli
  uses its persistent channel panel.
- Member contribution: the persistent GIF submission panel exposed by the
  current command guide.

The command definitions in `commands/` and the persistent command guide are the
final source for exact options and channel descriptions. The guide is refreshed
automatically in the Commands channel when the bot starts.

`/mpcopen` posts a public room-opening announcement with the host's server
display name and profile image, required room name and message text, optional
image/GIF media, and controlled Stiletto Gang, Tailored Few, Events, and `@here`
mentions. Command access is managed through Discord rather than code-level
default permissions.

## Economy and Progression

- Users have coins, XP, Porn Career stats, ranking, scene counts, and social
  interaction counters.
- Training spends both XP and coins; costs rise with stat level and increase
  sharply after stat 40. Coin costs use a 1.5 multiplier with a 50-coin
  minimum.
- Performance, Stamina, and Fame combine between scene partners.
- Achievements track configured milestones and contribute achievement points.
- Leaderboards include ranking, scenes, coins, social interactions, and
  achievement points as defined in the current leaderboard configuration.
- Gifts and relationships are RP/social systems only. They never award XP,
  ranking, Reputation, career stats, quests, achievements, or gameplay bonuses.
- Gift catalogue prices use the configurable `1.5` economy multiplier and round
  up to the nearest five coins.

## Daily Reset

Daily quests reset at 12:00 UTC. Weekly activity periods begin Monday at the
same boundary. Gift shops use the same daily date and next-reset helpers, so
their persisted rotation changes at exactly the same boundary.

## Daily Quests

- Each user receives three personal daily quests.
- Titty Drop quests reimburse their required 50-coin posts and award 25 net
  coins, so completing one is never a coin loss.
- `/daily` is private and includes quest and weekly-streak progress.
- Assigned quests must be possible for all supported genders.
- Individual completion and full-set rewards use configured coin/XP values.
- Each completed quest has a small chance to award a T1 booster.
- Seven consecutive completed quest days award a random T2/T3 booster.
- Progress and completion notices route to Maid Feed.

## Daily Would You Rather

- One SQL-backed question is active at a time in General.
- Questions come from `data/wyr/questions.json` and recent questions are
  avoided.
- Voting is anonymous; users may change their choice until close.
- Coins and XP are awarded only on the user's first vote for that session.
- A discussion thread is created and archived when voting closes.
- The closed post shows percentages, total votes, and thread replies.

## Porn Career

- `/pornscene` is a consent-based two-user production flow.
- Player Studios cost 10,000 coins, charge 500 coins at the 12:00 UTC daily
  reset, and cost 1,000 coins to reopen after an upkeep closure.
- An open requester's studio mirrors their Porn Career production live into its
  persistent forum thread. Productions attached while open finish and count
  once across closure or bot restarts.
- Scene parts are selected from role/cast-compatible GIF pools.
- Maximum phase counts are foreplay 2, oral 2, sex 3, and finale 1.
- Performance affects score/critical behavior, Stamina affects scene length,
  and Fame affects viewers/revenue according to current scene math.
- Final scenes update persistent career values and post through the configured
  RP/progression routes.

### Boosters

- Boosters are purchased through `/shop boosters` and viewed through
  `/inventory boosters`.
- One booster may be selected per requested scene.
- It applies to the requester's side of the selected combined stat.
- It is consumed when the request is sent and is not refunded if declined.
- Stronger tiers provide a larger stat increase and greater burnout risk.
- Tier values and prices are defined in the booster utilities/configuration.

### Training and Custom Scenes

- `/train` spends XP and coins to improve Performance, Stamina, or Fame.
- `/customscene` builds a solo scene with cast and part selections.
- Custom scenes charge per selected part only when Finish succeeds and spread
  posts across the command cooldown.
- Custom scenes do not use the shared two-user Porn Career request flow.

## Permanent Gift System

Gifts are a coin sink and RP collectible system with no progression effects.

### Catalogue and Daily Shop

- Definitions live in `data/gifts/gifts.js` with key, name, standard emoji,
  category, and configurable price.
- Categories are Common, Uncommon, Premium, and Luxury.
- `/shop gifts` privately displays a persisted personal daily rotation:
  two Common, two Uncommon, one Premium, and one Luxury gift.
- Rotations contain no duplicate entries, vary deterministically by user, remain
  stable for the reset period, and survive restarts.
- Purchasing places one copy into sendable inventory; it does not send it.
- Coin deduction, inventory increment, and purchase-price history are atomic.
- Gifts cannot be sold, traded, refunded, or converted back into coins.

### Inventory and Sending

- `/inventory gifts` privately groups positive owned quantities by category.
- `/gift send user:@member` rejects self-targets, bots, and non-members.
- Selection menus contain only gifts with positive owned quantity.
- Confirmation rechecks membership and inventory, expires after a short window,
  and is protected from duplicate submission.
- A successful send atomically consumes one inventory item, increments the
  receiver's permanent collection, consumes the oldest recorded purchase lot,
  and records sender, receiver, gift, historical price, and timestamp.
- Only after the transaction succeeds does the bot post an RP notification in
  Pillow Talk.

### Received Collections

- Received gifts are permanent and cannot be consumed by normal commands.
- `/profile` shows at most four gift types, ordered by rarity, configured price,
  then quantity, plus total gifts received.
- `View Gift Collection` privately shows the full grouped collection, total
  quantity, unique types, and historical collection value.
- Historical value is accumulated from the price paid for sent items rather
  than recalculated from current catalogue prices.

### Gift Persistence

- `user_gift_inventory`: unsent owned quantities.
- `user_received_gifts`: permanent received totals and historical value.
- `gift_purchases`: purchase lots and remaining quantities.
- `gift_transactions`: completed sends and price paid.
- `user_daily_gift_shop`: persisted per-user rotations.

Preflight rejects duplicate keys, missing names/emoji, invalid categories,
invalid prices, and insufficient catalogue entries for a daily rotation.

## Profiles and Social Systems

### Profiles

- `/profile` is private and requires a target user.
- It shows wallet, Porn Career stats, career summary, social interaction
  counters, profile likes, and a compact received-gift summary.
- Optional comparison shows the two users' career stats and combined scene
  effects.
- Profile likes are persistent, one per liker/target pair, and reject self or
  duplicate likes.

### Relationships

- Relationships are consent-based RP links with no rewards.
- Supported links include parent/child, siblings, extended family, marriage,
  dating, and Besties.
- A user may have at most one mother, one father, one spouse, and three Besties;
  dating partners and children follow the current relationship rules.
- Exact removal commands remove only the selected relationship type.
- Server gender roles are used where a relationship label requires them.
- Successful public notices use the configured RP channel and existing shared
  helpers.

### Pregnancy

- Pregnancy is standalone RP and separate from Porn Career progression.
- `/breed` uses consent; `/pregnancy` is self-only.
- Female members may be carriers; supported partner combinations follow the
  current gender-role validation.
- Checks occur once per carrier per day using configured carrier and best-partner
  fertility values.
- A pregnancy lasts 30 days, reveals at day 7, and gives birth at day 30.
- Persistent state retains enough conception, partner, reveal, and birth history
  to survive restarts without exposing private chance details publicly.

## Activity, Achievements, and Notifications

- Activity statistics are stored for daily, weekly, and career periods.
- Posted milestone guards prevent restart-driven duplicate announcements.
- Daily/weekly activity progress routes to Maid Feed; larger lifetime social/RP
  moments follow current channel routing.
- Achievements unlock automatically, persist progress, and post configured
  notices to Maid Feed.
- Gift actions deliberately do not call quest, achievement, activity, XP,
  ranking, or Reputation helpers.
- Community productions can award a bonus booster, gift, or free ticket for the
  active weekly lottery. Lottery ticket bonuses are skipped when the member has
  reached that lottery's 20-ticket limit and do not add ticket revenue.

## Casino

- `/dice`, `/slots`, `/blackjack`, and `/holdem` are coin games with configured
  limits and cooldowns.
- Slots supports an interactive spin-again session.
- Blackjack and current Hold'em sessions are in memory.
- Hold'em is user-versus-dealer, reveals hole cards privately, advances a public
  board, charges by street, and evaluates the best five-card hand from seven.
- Spank Dilli maintains persistent shared state, refreshes or repairs its panel
  in the dedicated channel at startup, and posts winner announcements to Maid
  Feed.

## GIF Data and Submission

- Two-person scene pools are under `data/scenes`; three-person pools are under
  `data/scenes_mfm`, `data/scenes_fmf`, and `data/scenes_fff`.
- Interaction GIFs are under `data/gifs`, with horny pools split by cast.
- Random selection uses in-memory shuffle bags and recent-user history; restart
  persistence is intentionally unnecessary.
- Member GIF submissions and scene-title suggestions use staff review flows.
- Approved titles feed `data/scenes/sceneNamesByCast.json`.
- Preflight validates content structure and reports intentionally parked empty
  three-person pools as warnings.

## Operational Safety

- Keep `.env` private and rotate production credentials when required.
- Back up `database.db` before migrations or server moves.
- Run `npm run preflight`; a successful report is required before deployment.
- Preserve unrelated working-tree changes when editing the project.
- Update this document whenever implemented rules change, but keep planned
  designs and speculative schemas in `TODO.md`.
