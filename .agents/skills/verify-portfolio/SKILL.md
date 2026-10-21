---
name: verify-portfolio
description: Drive the portfolio site (Astro static site published at fahridanaa.my.id) in a real browser and prove a change works. Use after changing pages, components, content, styles, navigation, or the CV asset, when a build passing is not evidence.
---

# Verify portfolio

The user touches a static Astro site. The home page is a notebook sheet with a hero, experience cards, project scraps, and note cards. `/projects` and `/blog` list entries, each with a detail page. `/art` shows drawings. `/assets/cv.pdf` is the CV. Everything is baked at build time, so the target is `dist/`, served by `astro preview`, not the dev server.

Requires Node 22.12 or newer, `npm install` already run, and `bb` on PATH for the browser steps.

All paths below are repo relative.

## Launch

```sh
node .agents/skills/verify-portfolio/scripts/serve.mjs start
```

- Builds with `npm run build` when `dist/` is missing or older than `src/`, `public/`, `astro.config.mjs`, or `package.json`. The build log is `.verify/build.log`.
- Spawns `node_modules/.bin/astro preview --port 4400 --host 127.0.0.1` detached, records its pid in `.verify/preview.pid`, logs to `.verify/preview.log`.
- Ready when it prints `serving http://127.0.0.1:4400`. It polls `/` for up to 30 seconds and fails loudly with the log path.
- A second `start` while healthy prints `already serving` and changes nothing.
- If port 4400 answers while no pid file exists, it refuses. That server is not ours. Stop it or set `VERIFY_PORT`.
- Override the port with `VERIFY_PORT=4401` on every command, including the browser URLs.

There is no database and no seed step. Content comes from `src/content/**` and is read at build time.

Teardown:

```sh
node .agents/skills/verify-portfolio/scripts/serve.mjs stop
node .agents/skills/verify-portfolio/scripts/serve.mjs status
```

`stop` sends SIGTERM to the recorded pid and SIGKILL only after two seconds. Never stop the server by process name. A dev server the user already runs on 4321 is not this server.

## Doctor

```sh
node .agents/skills/verify-portfolio/scripts/doctor.mjs
```

Read-only, exits 1 on any failure. It checks that the server answers, that eight routes return 200, that the home title is `Fahridana Ahmad Rayyansyah`, that `dist/` is not stale against the sources, and that the served `/assets/cv.pdf` is byte-identical to `dist/assets/cv.pdf`, which is in turn identical to `public/assets/cv.pdf`. Run it first whenever a drive looks wrong. A stale `dist/` is the most common cause.

## Drive

The harness is DevBrowser through the BB browser-automation plugin. `drive.mjs` owns the volatile ids, so recipes never pass a session id by hand.

```sh
node .agents/skills/verify-portfolio/scripts/drive.mjs open
node .agents/skills/verify-portfolio/scripts/drive.mjs run --label home <<'JS'
const p = await browser.getPage("main");
await p.goto("http://127.0.0.1:4400/");
return await p.snapshot();
JS
node .agents/skills/verify-portfolio/scripts/drive.mjs shot home
node .agents/skills/verify-portfolio/scripts/drive.mjs close
```

- `open` reuses a live session from `.verify/session.json` and otherwise opens one desktop tab in the user's BB browser. That backend is the default because this host has no Chrome for the headless backend. Set `VERIFY_BACKEND=local` on a host with Chrome installed.
- `run` reads a DevBrowser script from stdin, executes it with a 90 second timeout, prints the returned text, and copies any `p.shot()` images into `.verify/proofs/`. Pass `--label` to name the artifacts.
- `shot <label>` captures the current viewport.
- `close` closes the session and deletes `.verify/session.json`. Closing is required: a desktop session holds a browser tab.
- The page API used here: `p.goto(url)`, `p.snapshot()`, `p.click("ref/e12")`, `p.evaluate(fn)`, `p.url()`, `p.shot({type:"jpeg",maxEdge:960,quality:70})`.
- Take a fresh snapshot before every click. Refs belong to one snapshot and change after any re-render.
- Return `JSON.stringify({...})` when a recipe needs a machine-checkable result.

## Evidence

- Artifacts go to `.verify/proofs/`. Name them `<feature-id>-<step>`. Redirect snapshot text to a file (`> .verify/proofs/projects-index.snap.txt`), and screenshots are written by `run` or `shot`.
- A proof has three parts: the action, the resulting state, and the side effect. Example: the card ref that was clicked, the URL and heading after it, and the count of cards on the index.
- A screenshot of the final screen is weak proof for behavior that lives in hidden state. Include the ARIA snapshot or a `p.evaluate` value.
- `dist/` is build output. Never edit it to make a check pass. Rebuild with `serve.mjs start` instead.

## Cleanup

```sh
node .agents/skills/verify-portfolio/scripts/drive.mjs close
node .agents/skills/verify-portfolio/scripts/serve.mjs stop
```

Both act only on the ids recorded in `.verify/`. Proofs under `.verify/proofs/` survive teardown, because `drive.mjs` copies them out of the browser's temporary directory before the session closes. `.verify/` is gitignored.

## Traps

- The h1 accessible name is `Fahri dana Ahmad Rayyansyah`, because a span splits the word. Assert the level 1 heading or the `/url`, not the exact name.
- A fresh tab starts on `about:blank`, where `localStorage` throws `SecurityError`. Navigate to the site first, then read or clear storage.
- Site mode persists in `localStorage["site-mode"]` and an inline head script applies it before paint. A leftover `personal` hides Experience, Projects, and the Projects nav link. Reset with `await p.evaluate(() => localStorage.removeItem("site-mode"))` then `p.goto` again.
- The Art bookmark exists in the HTML of every page but is hidden by CSS in work mode. `curl` counts three section links while the browser shows two. Assert on the snapshot, not on the raw HTML.
- Content is baked at build time. An MDX edit without a rebuild changes nothing. Doctor catches it as `dist is current` failing.
- The CV PDF layout is owned by `npm run cv:build` and `scripts/cv-check.mjs`. This harness proves the file is served and current, not that its spacing is right.

## Helpers

- `scripts/serve.mjs start | stop | status` builds when stale and serves `dist/` on 4400.
- `scripts/doctor.mjs` is the read-only health check.
- `scripts/drive.mjs open | run [--label name] | shot <label> | close` wraps the browser session.

Read [features/README.md](features/README.md) before driving. It holds the baseline state, the proof standards, and one file per feature.
