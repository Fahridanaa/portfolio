# Home page

The home page is a single notebook sheet: a hero with a name, role, intro, portrait, and four social buttons, then the work sections (Experience, Projects, Latest Note). It is the first page a recruiter sees, so a broken hero or a missing CV link is a lost contact.

## Sub-features

- `home-hero` renders the name as the only h1, the line `Software Developer`, the intro paragraph, and the portrait with alt `Portrait of Fahridana Ahmad Rayyansyah`.
- `home-social` renders four links in a group named `Social links`: `email`, `linkedIn`, `github`, and `cv`.
- `home-experience` renders one expandable button per experience entry, each holding an h3 with the employer.
- `home-projects` renders the five latest projects plus an `All Projects` card.
- `home-notes` renders the work-mode note cards plus an `All Notes` card.
- `home-sticky-tabs` keeps the bookmark bar at the top of the viewport while the page scrolls.

## How to get to it (user POV)

- Open `/` directly.
- Choose the `Fahridana.` brand tag in the bookmark bar from any page.

## Driving it with drive.mjs

Preconditions:

- `doctor.mjs` prints `doctor: healthy, drivable`.
- The site is in work mode, so the snapshot shows `switch "Site mode, work"` without `[checked]`.
- A session is open from `drive.mjs open`.

- **Hero and portrait.** Navigate to `/`. Run `drive.mjs run --label home-hero` with `p.goto("http://127.0.0.1:4400/")` then `return await p.snapshot()`. The snapshot holds one `heading [level=1]`, the paragraph `Software Developer`, and an image with the portrait alt text.
- **Social links.** Read the same snapshot. The group `Social links` holds four links, and `cv` points at `/assets/cv.pdf`. Confirm the target in the terminal with `curl -sI http://127.0.0.1:4400/assets/cv.pdf`. Expect `200` and `content-type: application/pdf`.
- **Experience.** The snapshot lists one button per experience entry and an h3 inside each. Write both employer names down; that is the baseline for the next run.
- **Project preview.** Count the links whose `/url` starts with `/projects/` in the snapshot. Expect five, plus one `All Projects` link that points at `/projects`.
- **Open the index.** Click the `All Projects` ref from the snapshot. The URL becomes `/projects` and the h1 reads `Projects`.
- **Note preview.** The snapshot holds one `All Notes` link to `/blog` and the work-mode note cards. Art & Drawings is absent in work mode, which is correct.
- **Pinned bookmark bar.** Read `document.querySelector("a.bookmark-projects").getBoundingClientRect().top`, then `window.scrollTo(0, 1200)`, then read it again. The scroll offset grows past 900 and the bar's top keeps its first value. The bar is `position: sticky`, so the tabs stay reachable on a long page.
- **Proof.** Save the snapshot to `.verify/proofs/home-hero.snap.txt` and take `drive.mjs shot home-hero`. The image shows the name, the four icons, and the top of Experience.

## Gotchas

- The h1 accessible name is `Fahri dana Ahmad Rayyansyah` because a span splits the first word. Match the level 1 heading or the text, never the exact full name.
- Work mode hides Art & Drawings and hides the personal note cards. Their absence is not proof that content is missing. Switch mode to see them.
- The home project grid is capped at five by design. The index carries every published project, so a 5 against 9 mismatch is expected.
- The social links are icons with lowercase labels: `email`, `linkedIn`, `github`, `cv`. Match that casing.
- The `cv` link opens a PDF. Do not assert on the download behavior; assert the link target and the file's headers.
- The bookmark bar is hidden on project and blog detail pages, which pass `hideNavbar` to the layout. A missing bar there is by design.
- The CV layout itself is owned by `npm run cv:build` and `scripts/cv-check.mjs`. This page only proves the link and the asset it serves.
