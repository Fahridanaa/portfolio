# Blog

The blog index groups notes by year. Each note opens a post with its date, read time, prose, a table of contents, and tags.

## Sub-features

- `blog-index` renders the h1 `Blog Notes`, one h2 per year, and one card per post with a date and a read time.
- `blog-post` renders the title as the h1, then the date, the read time, and the prose.
- `blog-toc` renders a `Table of contents` navigation whose anchors jump to the post headings.
- `blog-tags` renders a `Blog tags` navigation with the post's tags.
- `blog-entry` reaches a post from the index card, the home Latest Note card, and a tag link.

## How to get to it (user POV)

- Choose the `Notes` bookmark.
- Choose the `All Notes` card at the end of the home note grid.
- Choose any note card on the home page.
- Open `/blog/<slug>` directly. Some slugs are Indonesian.

## Driving it with drive.mjs

Preconditions:

- `doctor.mjs` prints `doctor: healthy, drivable`.
- A session is open from `drive.mjs open`. Mode does not matter on `/blog`, but the home preview cards change with it.

- **Index.** Run `p.goto("http://127.0.0.1:4400/blog")`, then `return await p.snapshot()`. The h1 reads `Blog Notes`, the year `2026` appears as an h2, and each card link carries a date and a read time.
- **Count.** Compare the number of links whose `/url` starts with `/blog/` against `ls src/content/blog/*.mdx | wc -l`. The two numbers match.
- **Post.** Read the ref for the `Mengapa React membuat arsitektur baru bernama Fiber?` card and click it. The h1 equals the card title and the URL is `/blog/mengapa-react-membuat-arsitektur-baru-bernama-fiber`.
- **Table of contents.** The same snapshot holds a navigation named `Table of contents` with an anchor link such as `#referensi`.
- **Tags.** The same snapshot holds a navigation named `Blog tags`.
- **Proof.** Save the index snapshot to `.verify/proofs/blog-index.snap.txt`, take `drive.mjs shot blog-index`, then save the post snapshot and take `drive.mjs shot blog-post`.

## Gotchas

- Titles are not all English. Take the ref from the card; do not retype the title into a selector.
- Read time is computed at build, so it changes when a post body changes. Assert that it exists, not its value.
- The table of contents appears only when the post has headings. A post without an h2 has no TOC.
- The post body is styled by the prose plugin. A missing style is a CSS problem, not a content problem.
- `/blog` has no mode-dependent content, so a failure there is not explained by site mode.
