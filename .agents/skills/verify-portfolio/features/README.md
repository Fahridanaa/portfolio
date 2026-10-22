# Portfolio verification map

This directory is the maintained source for verifying the user-facing behavior of the portfolio site. Read this index first, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `node .agents/skills/verify-portfolio/scripts/serve.mjs start`, which serves `dist/` at `http://127.0.0.1:4400`. Read [../SKILL.md](../SKILL.md) for the full launch, doctor, and cleanup contract.
- Run `node .agents/skills/verify-portfolio/scripts/doctor.mjs` and require `doctor: healthy, drivable` before any drive. It proves the served build is current and the CV assets are the source ones.
- Open one browser session with `drive.mjs open` and close it when the run ends.
- Start in work mode. The baseline snapshot shows `switch "Site mode, work"` without `[checked]`. If it shows `[checked]`, the previous run left personal mode behind. Reset it as [site-mode.md](site-mode.md) says.
- Never drive a browser or a server that this run did not open.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions say otherwise.
- Navigate with `p.goto` and the route named in the recipe. Use a click only when the click is the behavior under test.
- Take a snapshot, read the ref, then click it. Refs do not survive a re-render or a navigation.
- Run one script per step through `drive.mjs run --label <feature-id>-<step>`.
- Return `JSON.stringify({...})` from a script when the recipe needs an exact value.
- Keep quoted text and labels exactly as written. The snapshot shows the accessible name, which is what a screen reader reads.

## Proof and skip reporting

- Capture the action and the resulting state. A final screenshot alone is not proof.
- Every artifact carries the feature id and the step in its file name, in `.verify/proofs/`.
- UI proof is a JPEG from `p.shot()` or `drive.mjs shot` plus the ARIA snapshot text that names the elements.
- A hidden-state claim (site mode, storage, scroll position) needs a `p.evaluate` value next to the visual.
- Report an unreachable path with the command that failed and the unmet precondition. Do not report a skipped entry point as verified through a different route.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph of user-visible behavior, then uses exactly four H2 sections in this order.

1. `Sub-features` lists short ids, one line each.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with drive.mjs` starts with `Preconditions:` and pairs each user action with the exact command and the observable result.
4. `Gotchas` lists traps that waste or invalidate a run.

## Features

- [Home page](./home.md) covers the hero, the four social links, the experience cards, the project preview, and the note preview.
- [Site mode](./site-mode.md) covers the work and personal switch, the section links it swaps, and its persistence.
- [Projects](./projects.md) covers the index, a project detail, the back paths, and the pinned bookmark bar.
- [Blog](./blog.md) covers the note index, a post, its table of contents, and tags.
- [Art](./art.md) covers the drawing grid and how it is reached.
