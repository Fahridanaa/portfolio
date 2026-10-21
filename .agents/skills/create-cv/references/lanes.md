# Lanes

A lane is the answer to the CTO's fourth thought, "what area is he claiming". One lane per CV. The facts come from `cv/resume.json`, and a lane only changes which facts lead.

The rule for every lane below: the label must be carried by a title or a shipped artifact. Emphasis without evidence is the exact failure the thread punished.

## Backend (the current build)

- **Summary lead.** Backend engineer, then the proof: Go and Laravel services, then the 336-run benchmark.
- **Experience order.** Multi Spunindo Jaya, then 80&Company. Laravel, MySQL, 200+ employees, and an 8 to 12 day saving is the closest thing to backend production work with a number.
- **Projects order.** LMS Cache Strategy Benchmark first, then Pendekinlink, HRIS, muara, meiro. The benchmark is the strongest artifact in the CV, so it leads.
- **Skills order.** Go, PHP, TypeScript. Laravel, Gin, PostgreSQL, MySQL, Redis. Docker, Azure. k6, Go test, Jest.
- **Cost.** None. This lane is carried by two backend titles and the thesis.

## Frontend

- **Summary lead.** Full-stack developer who owns the interface, then the proof: Next.js and TypeScript, Radix components in Storybook, Jest tests. Do not print "frontend engineer". No held title says that, and the CTO's complaint cuts both ways.
- **Experience order.** 80&Company first, because its second bullet is the only shipped UI work with component ownership. Multi Spunindo second, with the dashboard and Excel/PDF export bullet promoted.
- **Projects order.** HRIS first, for the geofenced attendance and live maps in Next.js, then meiro, then the rest. The LMS benchmark falls to the end.
- **Skills order.** Add a `Frontend` row above `Backend`: Next.js, Radix, Storybook, Jest. Keep the four required labels. Name React only after a bullet says React, because Next.js implies it but the page must still be checkable.
- **Cost.** The evidence is thin. Two bullets and one project carry it, and the strongest artifact, the benchmark, becomes background. Expect a shorter page and a weaker read for a backend-heavy job posting. Report that cost rather than padding the page.
- **Gap to close.** A real frontend artifact with users would change this lane from "leaning" to "claimed". That is work, not wording.

## Fullstack

- **Summary lead.** Full-stack developer, then both ends in one sentence: a Go and Laravel backend on PostgreSQL and Redis, and the Next.js interface in front of it.
- **Experience order.** 80&Company, then Multi Spunindo, or the reverse. Both tell the same story from a different end.
- **Projects order.** HRIS first, because its two bullets show the server owning a payment webhook and the map UI in one entry. Then the benchmark, then the rest.
- **Skills.** The four rows as they are, with TypeScript promoted to the head of `Languages`.
- **Cost.** This is the current page. If nothing changes, do not pretend a lane was applied.

## Campus, ODP, MDP

- **Summary lead.** The degree, the GPA, and the thesis, in that order. These pipelines screen on academic signals before work.
- **Order.** Education first, then experience, then projects.
- **Projects order.** The LMS benchmark leads, because a thesis with 336 runs and a statistical test is the strongest campus signal in the file.
- **Cost and change.** Education-first is not a wording edit. `cv/main.typ` renders Summary, Experience, Education, Projects, Skills in that order, and `scripts/cv-check.mjs` asserts that order in its `HEADINGS` list. A campus build needs both changed, plus a decision about what leaves the page to keep one page. Do that as a deliberate change with the guard updated, not as a silent fork.

## Rule of thumb

The lane changes four things: the first noun, the entry order, the first bullet of each entry, and the row order in Skills. It never adds a claim, a tool, a title, or a project. If the target needs a fact the page does not have, the answer is a gap report, not a sentence.
