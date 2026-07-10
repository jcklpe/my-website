# Misc Inbox
Live inbox for loose observations. Use `skills/triage-project-misc/SKILL.md` for routing workflow.

Use this file only for genuinely new unclustered notes. Once a note has a clear home, move it into the relevant spike doc and delete it from here. Keep only the latest routing session as a short handoff; replace it on the next review.

## Unrouted Items
- we've got a bug with the wide downloadable file block, where it doesn't have it's white background or it's left hand side bar, probably due to us adding the cream negative space matte. That should be fixed. Probably similar fix to what we did with the block quote stuff.
- Related to that probably, the wide accordion interior is matte and should be offwhite. Probably same issue as the wide file block and the block quote stuff. Also it looks like the accordion has lost it's block shadow, that should be fixed too. If there's a different way to do the cream negative space matte so we don't have this problem we should look at it.
- I just noticed that the cream matte thing is also appearing in the WP editor and it shouldn't. The cream matte is just there to help with the TOC which obviously doesn't apepar in the editor.
- I think we need to make the TOC autohide rule more robust. Namely, I think it matters if the thing is blocked by something really big even if that thing blocking it is just one thing. Like let's say it's blocked by a wide embed that takes up 70 percent of the screen. Its only one intrusion, but it's blocking like a full half of the TOC easily. I'm a little fuzzy on current rules for it, but I think the issue is if it's only with multiple intrusions. But I think if you've got one big intrusion that should also probably make it auto hide.
- and actually we could maybe further improve this by moving the TOC over the the left by just another 25px. Then it will mostly be out of the main rail of content.
- I just did a static generation and push to CDN and the loop nav on case studies isn't showing up, probably due to some kind of lazy loading related bug with generation or something?
- are there any lessons we can take from this to improve performance? https://dev.to/svsharma/the-surprising-tech-behind-mcmaster-carrs-blazing-fast-website-speed-bfc
- at some point I need to add some kind of LLM.txt to the website, also probably robots.txt, that sort of thing.
-

## Latest Routing Session
Reviewed 2026-06-30.

- Created [`editor-polish.md`](editor-polish.md) for CMS/editor-side readability
  issues. Moved the inline-code visibility note and the CMS footnote-link
  styling note there with authoring-context details preserved.
- Added the video-caption consistency note to
  [`embed-media-support.md`](../archive/embed-media-support.md), preserving the requirement
  that video captions share the same root caption recipe as other figure-like
  blocks.
- Created [`mobile-polish.md`](../archive/mobile-polish.md) for concrete mobile layout bugs.
  Moved the case-study bodyplate top-margin note and the mobile case-study card
  border clipping note there with the Chrome-tools observations preserved.
- Deleted the dangling blank bullet from the inbox.
