Branch: bugfixes/tweaks
- Focus: Fix small bugs and add small tweaks for better experience:


1. Add feddback to users (mostly admins) when doing database writes
Examples:
- When clicking the "Neste omgang" button in scoreboard
- When starting a stevne from stevne-info.ts
- When generating new cup-rounds
- When clicking on "Generer neste runde" for NHM (swiss)
- When adding / removing players in stevne-deltakere.ts
- When adding a result to a match + confirm (bekreft)

- Suggestion: Use component LoadingState to add a loading text/icon to the buttons. Recommend suggestions yourself.

2. Make matches (kamper) and resultlist (stilling) in stevne to have separate scrolling
- It's important that resultlist (stilling) stays in place when scrolling the matches so the admin dont lose overview.
- I dont want scrollbars to be visible

3. Scoreboard bug: When using 2 scoreboards at the same time to register scores for the same match
- When you confirm a match on one of the devices, the next match does not load on the other device.

4. Bug: Realtime updates switches view (stevne)
- For stevne, when on smaller screens you can choose to view Kampar or Stilling. When on Stilling and there is a realtime update, it switches back to Kampar. The current view needs to persist on realtime updates (this should be added to claude.md)

Do every step separately. First provide a plan for it and make sugestions. Do not proceed coding without my approval. Create a commit text when finished for each step.

NEW BUGS:

1. When changing results by clicking on the result, the match is not set to er_bekreftet = false. Also, setting a match to 0 - 0 needs to reset the score, not set it to 0 -0 (draw)