# Projects

The projects index lists every published project as a paper scrap. Each scrap opens a detail page with a description, external links, a stack, and the write-up. Detail pages hide the site header, so the way out is the `Back` link or the URL.

## Sub-features

- `projects-index` renders one card per published project, with a title, a type, a date, a description, and stack chips.
- `project-detail` renders the title as the h1, the description under it, a `links` group, a `stack` group, and the MDX body.
- `project-back` provides `Back` to `/projects` and `Home` to `/`.
- `projects-count` keeps the card count equal to the number of files in `src/content/projects/`.

## How to get to it (user POV)

- Choose the `Projects` bookmark in work mode.
- Choose the `All Projects` card at the end of the home project grid.
- Choose any card on `/projects`.
- Open `/projects/<slug>` directly.

## Driving it with drive.mjs

Preconditions:

- `doctor.mjs` prints `doctor: healthy, drivable`.
- The site is in work mode. The `Sections` navigation shows `Projects`.
- A session is open from `drive.mjs open`.

- **Index.** Run `p.goto("http://127.0.0.1:4400/projects")`, then `return await p.snapshot()`. The h1 reads `Projects`. Count the links whose `/url` starts with `/projects/` and compare with `ls src/content/projects/*.mdx | wc -l`. The two numbers match. Cards carry a type, a date, a description, and stack chips.
- **Detail through a card.** Start from the index with `p.goto("http://127.0.0.1:4400/projects")`, snapshot, read the ref on the line for the `HRIS` card link, then click it. The URL becomes `/projects/hris`, the h1 reads `HRIS`, and the snapshot holds `link "Back"` to `/projects` and `link "Home"` to `/`.
- **Links and stack.** In the same snapshot, a paragraph reads `links` and holds a `Client` link to `https://github.com/SukaMajuu/hris2`. A paragraph reads `stack`, then one generic label per stack slug, such as `nextjs`, `typescript`, and `go`. Assert `Demo` only for projects whose frontmatter has one.
- **Back path.** Click `Back`. The URL becomes `/projects` and the index h1 returns.
- **Proof.** Save the index snapshot to `.verify/proofs/projects-index.snap.txt`, take `drive.mjs shot projects-index`, then save the detail snapshot and take `drive.mjs shot project-hris`.

## Gotchas

- MDX headings render as h3, so a detail page has one h1 and h3s. Do not wait for an h2.
- The card accessible name is the whole card text, so match a title prefix and take the ref from the snapshot.
- A naive count of `href` values includes the absolute canonical URL `https://fahridanaa.my.id/projects/<slug>/`. Count only hrefs that start with `/projects/`.
- Not every project has a demo, a source link, or a stack. Assert per project, not across the index.
- Detail pages pass `hideNavbar`, so the bookmark bar and the site-mode switch are absent. Navigate out with `Back` or the URL, not with a bookmark.
