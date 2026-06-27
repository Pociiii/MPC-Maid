# MPC Maid Updates

## Next Update

- Spank Dilli jackpot wins now announce only through the Maid Feed embed, and
  that feed post pings the winner directly.
- Added `/drink` and `/firework` as 24-hour social coin sinks with their own
  random GIF pools.
  - `/drink` costs 250 coins and gives everyone online a tiny +3 XP toast.
  - `/firework` costs 1000 coins, gives no XP, and exists purely as a public
    flex.
- `/pornscene` combined-stat scene bonuses now trigger every 20 combined stat
  points instead of every 10, slowing early snowballing and making combined 80
  the full 8-part scene target.
  - Before: combined Stamina 40 already reached the 8-part cap.
  - Now: combined 20 gives 5 parts, combined 40 gives 6 parts, combined 60
    gives 7 parts, and combined 80 gives the full 8 parts.
  - Performance crit chance, Fame viewer/revenue bumps, and scene score bonuses
    use the same 20-point combined-stat pacing, so one high-stat user carries
    less of the whole scene alone.
- Embed field titles now use emoji more consistently across commands, Moments,
  Maid Feed posts, leaderboards, GIF review cards, and bot warning/error logs.
- Activity Moment embeds now use the acting user's avatar and emoji-led fields
  so they match the usual MPC embed style.
- `/pornscene` live part embeds now show only Cast and Viewers, with Cast kept
  to the two users only.
- `/pornscene` now gives the requester a small +5 XP starter bonus when the
  accepted scene completes.
- Public user display names now prefer the server nickname before falling back
  to the global Discord display name.
- Weekly Activity Moment counters now explicitly start on Monday at the same
  reset time as daily quests.
- `/customscene` now costs 20 coins per selected part, paid when the scene is
  finished, giving the economy another small coin sink.
- Global flavor text pools now have more variety and use warmer group/room
  wording instead of generic venue language.
- Server hosting prep added: real npm start/check scripts, declared bot
  dependencies, a clean npm lockfile, and a Linux systemd deployment guide.
