# Site mode

Site mode splits the same home page into a work view and a personal view. The pill at the top right is a switch. It also swaps the section links in the bookmark bar and survives a reload.

## Sub-features

- `mode-baseline` shows Experience, Projects, and the Projects link in work mode.
- `mode-toggle` flips `aria-checked` and the accessible name between `Site mode, work` and `Site mode, personal`.
- `mode-swap` replaces Experience and Projects with Art & Drawings in personal mode.
- `mode-nav` swaps the `Projects` bookmark for the `Art` bookmark. `Notes` stays in both modes.
- `mode-notes` swaps the note cards to personal entries and fills the rest with `Soon` placeholders.
- `mode-persist` keeps the chosen mode across a reload through `localStorage["site-mode"]`.

## How to get to it (user POV)

- Choose the `Work` or `Personal` half of the pill at the top right of any page.
- Reload any page. The chosen mode applies before the page paints.

## Driving it with drive.mjs

Preconditions:

- `doctor.mjs` prints `doctor: healthy, drivable`.
- A session is open from `drive.mjs open`.

- **Baseline work mode.** Reset the stored mode first. Run `drive.mjs run --label mode-reset`: `p.goto("http://127.0.0.1:4400/")`, then `p.evaluate(() => localStorage.removeItem("site-mode"))`, then `p.goto("http://127.0.0.1:4400/")` again, then `return await p.snapshot()`. The first navigation gives the tab a real origin; the second applies the cleared key. The snapshot shows `switch "Site mode, work"` without `[checked]`, an `Experience` heading, a `Projects` heading, and no `Art & Drawings`.
- **Toggle to personal.** Read the switch ref from that snapshot and click it. Expect `switch "Site mode, personal" [checked]`, an `Art & Drawings` heading, and no `Experience` heading.
- **Section links.** In the same snapshot, the `Sections` navigation holds `Art` and `Notes`, and no `Projects`.
- **Note cards.** The same snapshot shows personal titles such as `Just Do It`, `Learn by Doing`, `Reinvent the Wheel`, and `Good will Hunting (1997)`, plus `Soon` placeholders when the personal list is short.
- **Persistence.** Run `p.goto("http://127.0.0.1:4400/")` again, then `p.snapshot()`. The snapshot still shows `[checked]` and `Art & Drawings`. Confirm the stored value with `await p.evaluate(() => localStorage.getItem("site-mode"))`. Expect `personal`.
- **Reset.** From a page on the site, run `p.evaluate(() => localStorage.removeItem("site-mode"))` and navigate again. The page returns to work mode.
- **Proof.** Take `drive.mjs shot mode-personal` while personal mode is active, and save both snapshots to `.verify/proofs/`.

## Gotchas

- Every ref changes after the toggle, because the page re-renders. Take a fresh snapshot before the next click.
- Personal mode hides the Projects bookmark, so a projects run has to reset the mode first or navigate by URL.
- The control is `role="switch"` with `aria-checked`, not a checkbox. Assert on that pair.
- The Art bookmark is in the HTML of every page in both modes, hidden by CSS in work mode. `curl` sees three section links while the browser shows two. Assert on the snapshot.
- The stored key is `site-mode` with the values `work` and `personal`. Any other stored value normalizes to `work`.
- Mode is a client preference. A static HTML fetch always returns work-mode markup, so this feature cannot be verified with `curl`.
- A fresh tab starts on `about:blank`, where `localStorage` throws `SecurityError`. Navigate to the site before any `p.evaluate` that touches storage.
