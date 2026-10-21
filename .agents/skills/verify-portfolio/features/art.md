# Art

The art page shows drawings from outside work hours as a grid of captioned images. It is the smallest route and the easiest to break when the image pipeline or the asset folder changes.

## Sub-features

- `art-grid` renders one image per drawing, each with alt text and a caption.
- `art-entry` reaches the page through the `Art` bookmark in personal mode, or by URL in either mode.
- `art-active` marks the `Art` bookmark active on this route.

## How to get to it (user POV)

- Choose the `Art` bookmark, which is visible in personal mode.
- Open `/art` directly.

## Driving it with drive.mjs

Preconditions:

- `doctor.mjs` prints `doctor: healthy, drivable`.
- A session is open from `drive.mjs open`.

- **Grid.** Run `p.goto("http://127.0.0.1:4400/art")`, then `return await p.snapshot()`. The h1 reads `Art`. The snapshot holds five images with the alt texts `box`, `neko neko`, `planet`, `profile`, and `rusa`.
- **Active bookmark.** The `Art` link in the `Sections` navigation carries the active state on this route. In work mode that link is hidden, so assert on the URL and the h1 instead.
- **Reachability in work mode.** Reset to work mode, then navigate to `/art`. The page still renders. Only the bookmark is hidden.
- **Proof.** Save the snapshot to `.verify/proofs/art-grid.snap.txt` and take `drive.mjs shot art-grid`.

## Gotchas

- Clicking a drawing does nothing. There is no lightbox, so do not wait for a dialog.
- Images are optimized by Astro at build time, so the src differs from the file name in `public/`. Assert the count and the alt text, not the src.
- The count follows the assets, so this page fails when a drawing is added and the expected list is not updated. Update this file with the new alt text.
- The grid on the home page caps at five drawings. This page is the full list, and today both are five.
