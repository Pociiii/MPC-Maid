# MPC Maid TODO

This file tracks planned systems and bigger follow-up work. Keep it practical:
write the idea, the first playable version, and anything that must wait until
the database is stable.

## Before Hosting

- Keep testing daily quests, achievements, leaderboard, and versioned embeds.
- Reset the local database as needed during testing.
- Avoid adding new SQL tables until the remaining systems are clearer.
- Keep `.env` private and rotate the Discord bot token before hosting.
- Check cooldowns again after more live testing.

## Booster System

Goal:
- Boosters are consumable scene items that improve one pornscene stat for one
  requested scene.
- `/pornscene` stays clean: users only pick from boosters already owned.
- Booster is consumed when the request is sent.

Current direction:
- One booster per scene max.
- Booster is selected from a dropdown before sending the request.
- Dropdown shows only boosters in the user's inventory.
- Tier 1 boosters can be bought with `/shop`.
- Booster tiers can exist later, but the first shop should stay simple.
- Later downside idea: stronger boosters may increase flop chance.

Needed later:
- Prices and tier balance.
- SQL/inventory structure review before hosting.
- Higher booster tiers, only after Tier 1 feels balanced.

## Shop System

Goal:
- Give coins meaningful sinks beyond training fees.

First shop version:
- Sell Tier 1 Performance, Stamina, and Fame boosters.
- Use buttons instead of long text.
- Keep purchases private/ephemeral.
- Current Tier 1 price: 250 coins.

Possible future items:
- Stat-specific boosters.
- Cosmetic profile/card items.
- Temporary fertility or pregnancy-related items only if the pregnancy system
  needs them later.

Balance notes:
- Training should remain a steady coin sink.
- Shop prices should make users think before buying many boosters.
- Avoid pay-to-win feeling for ranking.

## Pregnancy System

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

First commands:
- `/breed @user` sends a consent request. Live in first version.
- `/pregnancy @user` shows pregnancy state and daily fertility. Live in first version.

Announcement ideas:
- Breed accepted: small rumor post.
- Pregnancy confirmed: special rumor post.
- Day 7 gender reveal: special rumor post.
- Day 30 birth: special rumor post.

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

## Achievements

Current:
- Achievements unlock automatically and post in rumors.
- Achievement points exist and can be shown on leaderboard.
- `/achievements` shows private progress with category buttons.

Future:
- Add milestones for pregnancy only after the first pregnancy version is tested.
- Keep endless milestones for long-term actions, but avoid spammy rewards.

## Daily Quests

Current:
- Users receive daily quests automatically.
- `/daily` shows personal quests privately.
- Rumors channel announces completed quests and full daily set completion.

Future:
- Rebalance rewards after live testing.
- Add or remove quest types based on actual command usage.
- Keep every assigned quest possible for all supported genders.
- Move daily quest completion posts to Maid Feed when channel routing is updated.

## Channel Routing

Current:
- Rumors carries too much bot output.
- Maid Feed channel created: `1518308768335528187`.

Future routing plan:
- Keep Rumors for sexy/story RP moments: pornscene final results, pregnancy
  confirmed, gender reveal, birth, and bigger RP hooks.
- Move game/system spam to Maid Feed: daily quest completions, achievement
  unlocks, GIF approvals, and similar progress notices.
- Keep porn career channel for scene parts only.
- Keep custom scene channel for custom scene parts only.

## Embed And UI Consistency

Current direction:
- Use shared embed helpers where possible.
- Use user avatar thumbnails for user-centered embeds.
- Use versioned footers on command embeds.
- Add clear emoji feedback to buttons and fields.

Future:
- Continue converting older command groups.
- Keep rumor announcements visually consistent.
- Keep command text short because Discord users do not read walls of text.

## Relationship System

Status:
- Leave this for last.
- User wants to rework how it works.

Do not touch unless specifically requested.
