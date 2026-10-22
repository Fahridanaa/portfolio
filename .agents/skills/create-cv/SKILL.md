---
name: create-cv
description: Write, rewrite, or retarget the CV in cv/ with the rules a hiring reader applies. Use when updating the CV, aiming it at a role (backend, frontend, fullstack, campus), or reviewing it after feedback. The rules come from a hiring manager's line-by-line read of a fresh-grad CV, r/karir 1xalunj.
---

# Writing the CV

This skill is about the document. The build is `npm run cv:build`, and it must stay green, but the build is not the subject. Read this before changing a word of `cv/resume.json`.

The rules come from one thread, [r/karir 1xalunj](https://www.reddit.com/r/karir/comments/1xalunj/almost_2_months_unemployed_as_a_swe_fg_what_am_i/). A CTO read the attached CV top to bottom and said what he thought at each line. Engineers in the comments said what made them stop reading. The source is quoted in [references/reader-model.md](references/reader-model.md).

## The reader

A CTO with a folder of CVs, not a reader with time. He opens each one with one question, "let's see what kind of stupidity this guy is trying to hide" (u/botrezkii). His first pass took seconds and went location, length, school, role label, languages, internship, education, then next.

Two filters run before him. An ATS parses the file, then a human skims it. A layout that survives one and not the other is wasted work.

Every rule below answers one of his lines.

## The rules

1. **Name one lane in the first sentence.** "Your opening paragraphs tells me nothing about the kind of programmer you are and what you are actually strong at" (u/SecureCrab). The summary says backend, frontend, or fullstack, and the next clause proves it.
2. **Earn the label with a title or a shipped artifact.** The CTO stopped at "full stack? anda belum merasakan dunia nyata" (u/botrezkii). A label with no role behind it reads as a bluff. This CV may say full-stack because one role and one project carry that title.
3. **Never list more than the bullets can defend.** "Either dia dewa atau dia b aja" (u/botrezkii), "how confident are you in them?" (u/Downtown-Bid-3982). Breadth without depth is the fastest rejection in the thread.
4. **Education goes where the doubt is.** A fresh grad with no paid role puts education first (u/Downtown-Bid-3982), because the reader is checking legitimacy. A CV with a year of work behind it puts experience first and education before projects, because the reader is checking fit.
5. **Every entry carries company, role, location, and dates, most recent first.** "Tulis nama perusahaannya" (u/cynuxtar). An internship with no company name is a rumor. Out-of-order dates read as hiding a gap, which is the first thing the reader looks for.
6. **Two to four bullets per entry.** "Too many points for intern experience, cut down to 3-4 strong bullets" (u/SecureCrab). More bullets do not add depth, they add surface.
7. **Each bullet is an action, an object, and a result.** A number, or a decision with its reason. "cv lu kurang mainin angka ... achievement yang punya metric" (u/Correct_Mud1377). "Why Postgres instead of SQLite, why multiple repos instead of one" (u/rizkiyoist).
8. **Describe the number's basis.** A rate with no run count is a claim the reader cannot check. Keep the count in the same project, and keep the arithmetic behind a saving visible, such as four quarters times two to three days.
9. **Apply the Claude test.** "Ask yourself, can Claude Opus do this in hours? If it can ... drop it" (u/Chemical-Hour-9292). A CRUD endpoint is a line to cut. A 336-run benchmark with ANOVA is not.
10. **Projects get prose, never a bare link.** "Nobody is going to open your github pages" (u/SecureCrab). "Jangan cuma link" (u/cynuxtar). One or two sentences say what it does, what you decided, and what came out.
11. **Skills sit at the bottom, short, all backed.** "Listing out key competencies should be on the very bottom, that's just for farming keywords" (u/UnapologeticFoodie). Every item must appear in a bullet above it.
12. **Two links, maximum.** "Never have more than 2 hyperlinks in your CV, no one will bother to open them" (u/UnapologeticFoodie). Keep LinkedIn and GitHub. Email and site as plain text.
13. **No empty time.** "There is nothing between January 2026 to now which is HUGE" (u/rizkiyoist). An ongoing project covers the gap. Never stretch a date to hide one.
14. **Answer the relocation question.** The CTO's first thought was Surabaya to Jakarta "repot lagi ntar nunggu dia pindah" (u/botrezkii). Put the city you would work in, or write open to relocate when it is true.
15. **Layout stays boring.** "Skip the double columns, it's tacky and messes with the ATS reader", "why tf is the work experience description all bolded" (u/UnapologeticFoodie). A single column, plain paragraphs, no decoration. The one page limit is this repo's own rule, and the layout is a signal of care before a word is read.

## The page

Top to bottom, this is what the current build does and should keep doing.

- **Header.** Name in large type, then one line: city, email, site, LinkedIn, GitHub. Two of those are links.
- **Summary.** Two to three lines. Lane, strongest proof, and the benchmark or the scale of the work. No adjectives that a bullet cannot cash.
- **Experience.** Reverse chronological, two to four bullets each. The first bullet of each entry addresses the lane.
- **Education.** School, degree, dates. Show the GPA when it is a strength, which 3.81 is.
- **Projects.** Two or three that carry the lane. Each has a role and a date, and each earns its place with users, a measurement, or a decision. The current build lists five short ones, which is exactly the breadth the CTO complained about. That is the first place to cut when the page runs out of room.
- **Skills.** Four rows, thirteen items at most. Keyword surface for the ATS, nothing else.

## Retargeting a lane

A lane change moves emphasis, never facts. It changes the summary's first noun, the order of entries, the first bullet of each entry, and the order inside the skills rows. It never adds a claim, and it never relabels a skill as something the bullets cannot show.

Read [references/lanes.md](references/lanes.md) for what each lane leads with on this CV, and for the honest cost of a lane the facts do not support. A thin frontend CV that says frontend is worse than a strong fullstack CV that leads with the interface.

## The workflow

1. **Take the target.** A lane name, a pasted job post, or "update it". With a post, extract the requirements first.
2. **Map each requirement to a fact.** Use `cv/resume.json`, `src/content/experiences/*.mdx`, and `src/content/projects/*.mdx`. Show the gaps before editing anything. A missing fact is a gap, not a line to add.
3. **Draft the edit as a table.** Old line, new line, and the source for every changed claim. Get agreement before writing.
4. **Edit `cv/resume.json`.** Touch `cv/main.typ` only for space or order, never to change a fact.
5. **Build.** `npm run cv:build` rebuilds the PDF and runs the layout guard. Fix a failure by cutting words, never by weakening the guard.
6. **Read the PDF the way the CTO did.** Thirty seconds, top to bottom, then the checklist below. Look at the page, not the JSON.
7. **Report.** What changed and why, what the guard and the page say now, and which gap remains open.

## The checklist

Ask these in order. The first no is the fix.

- Can I name the lane after one sentence?
- Does every skills item appear in a bullet above it?
- Does every bullet carry a number or a decision?
- Is any line something Claude could do in a few hours?
- Does any date stretch, or any month sit empty?
- Are there exactly two links?
- Does the top of the page answer location, role, and school before the reader asks?
- Is it still one page?

## Build and guard

```sh
npm run cv:build   # typst compile, then scripts/cv-check.mjs
npm run cv:apply   # the phone variant, git-ignored
```

`scripts/cv-check.mjs` enforces one page, heading order, the four skills labels, and minimum gaps. Read it before changing the layout. The phone variant stays out of git on purpose.

## Traps

- `cv-check.mjs` asserts the exact labels `Languages:`, `Backend:`, `Infrastructure:`, `Testing:`. Adding a fifth row is safe. Renaming a required row is not, unless the check changes too.
- Typst block margins collapse into their neighbours. Spacing in `main.typ` is explicit `v()` on purpose. Do not restore `block(above/below)`.
- The site is the long-form evidence and the CV is its index. The reader will not open the link, so the strongest sentence from the site has to be on the page.
- The thread's salary, referral, and upskilling advice is real but out of scope. This skill changes the document, not the search.
- A gap in the page is not hidden by a wider margin. The reader compares dates.

## References

- [references/reader-model.md](references/reader-model.md) quotes the CTO's read and the comments behind each rule.
- [references/lanes.md](references/lanes.md) lists what each lane leads with, and what this CV cannot honestly claim yet.
- [references/source-thread.md](references/source-thread.md) keeps the source quotes and their authors, so the rules can be re-derived later.
