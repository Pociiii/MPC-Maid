# MPC Maid Updates

## Next Update

- Removed unused empty scaffolding files and old helper modules that were no
  longer referenced by the bot.
- Rebuilt local dependencies cleanly so the bot resolves packages from the
  project folder instead of falling back to a parent `node_modules`.
- Embed author icons now use the MPC logo consistently, while user-centered
  thumbnails stay focused on the command runner or featured user.
- `/leaderboard` pages now include a runner-specific "Your Position" section
  so the user can see their rank even when they are outside the visible top 10.
- `npm run preflight` now checks commands, JSON data, GIF pools, scene titles,
  Daily WYR questions, and the database schema before hosting.
- Daily Would You Rather now posts in General with anonymous voting, a
  discussion thread, and a small one-time voting reward.
- GIF Submit now lets members suggest scene titles for staff review.
- `/profile` now splits interaction stats by type and supports profile likes
  with Moments announcements.
- Added `/holdem`, a first playable Texas Hold'em table against the dealer.
- `/commands` now uses clearer fields for role rules and command categories.
- Pornscene extra parts now respect phase caps while staying in the correct
  scene order.
- Achievements now include balanced trained-stat milestones when Performance,
  Stamina, and Fame all reach 10, then every 10 after that.
- `/drink` and `/firework` now have achievement progress and post social
  notices to Moments when they succeed.
