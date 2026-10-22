# Lanes

A lane is the answer to the CTO's fourth thought, "what area is he claiming". One lane per CV. The facts come from `cv/resume.json`, and a lane only changes which facts lead.

The rule for every lane below: the label must be carried by a title or a shipped artifact. Emphasis without evidence is the exact failure the thread punished.

## Backend (the current build)

- **Summary lead.** Backend engineer, then two outcomes in one line: 8 to 12 days a year saved for 200+ employees, and a Go service that bills seats through Midtrans. The benchmark's numbers are left to the bullets that carry them.
- **Experience order.** Multi Spunindo Jaya, then 80&Company. Laravel, MySQL, 200+ employees, and an 8 to 12 day saving is the closest thing to backend production work with a number. 80&Company keeps the pipeline bullet and the 01:00 cron over Postgres and Prisma; the Next.js and Storybook bullet is interface work, so it stays out of this lane.
- **Projects order.** LMS Cache Strategy Benchmark first, then Pendekinlink, HRIS, muara, meiro. The benchmark is the strongest artifact in the CV, so it leads.
- **Skills order.** Go, PHP, TypeScript. Laravel, Gin, PostgreSQL, MySQL, Redis. Docker, Azure. k6, Go test, Jest.
- **Cost.** None. This lane is carried by two backend titles and the thesis.

## Frontend

- **Summary lead.** Frontend-focused full-stack developer, then the proof: most of the frontend on a five-person Next.js build, 549 of its 965 commits, and the shared table, form and map components. Say "focused", never "frontend engineer". No held title says that, and the CTO's complaint cuts both ways.
- **Experience order.** Multi Spunindo first, then 80&Company, because reverse chronological is not negotiable. The lane survives it as long as Multi Spunindo leads with the period screens and Excel/PDF export bullet, which is real interface work. 80&Company keeps the Next.js interface bullet and `library`, the Storybook and Jest ownership. Its `pipeline` and `schedule` points stay out, because a video pipeline is backend work on a frontend page.
- **Projects order.** HRIS first, for 31 routes, the record tables and the geofence map in Next.js, then Portfolio, then the Ideas Browser, which carries the accessibility suite. The LMS benchmark stays out: it has no interface story, and its dates are covered by Portfolio running to the present.
- **Skills order.** The `Frontend` row above `Backend`: Next.js, React, Radix, TanStack Query, TanStack Table, Storybook, Tailwind. Keep the four required labels. Storybook is here because a bullet names it, and Docker and Azure stay in `Infrastructure` because the deploy bullet backs them.
- **Cost.** The evidence is thin at the top. The most recent paid role is an internship in Laravel, so the first bullet a reader meets is not React. The React evidence sits in the projects. Expect a weaker read for a backend-heavy posting.
- **Gap to close.** A frontend title, or a React artifact with users, would change this lane from "focused" to "claimed". That is work, not wording.

## Fullstack

- **Summary lead.** The lane noun, then both halves in one sentence: the Go service that bills seats through Midtrans, and the screens HR uses for records, leave, overtime and attendance. No count of routes, tables or forms. A route count measures code volume, and the reader learns nothing about what HR can do from it.
- **Experience order.** Multi Spunindo first, then 80&Company. The internship is the more recent of the two, and 80&Company now carries both `pipeline` and `interface`, so a Full-stack title has both ends on the page.
- **Projects order.** HRIS first with four bullets: the seat billing and its webhook, the proration rule, the clock-in radius, and the record screens. Then the LMS with three, because `domain` gives its line to `proration`. Then Pendekinlink and Portfolio.
- **Skills.** `Testing` carries k6 alone. Jest has no bullet on this page, and `scripts/cv-check.mjs` requires the row, not the item.
- **Wording.** `attendance` states the clock-in rule instead of saying "geofenced attendance". The Go usecase in `SukaMajuu/hris2` still has a TODO for location validation, so only the client refuses an out-of-range clock-in.
- **Cost.** This page is the site default at `/assets/cv.pdf`. The HRIS block is four bullets, so the LMS gives up `domain`, its most technical line.

## Campus, ODP, MDP

- **Summary lead.** The degree, the GPA, and the thesis, in that order. These pipelines screen on academic signals before work.
- **Order.** Education first, then experience, then projects.
- **Projects order.** The LMS benchmark leads, because a thesis with 336 runs and a statistical test is the strongest campus signal in the file.
- **Cost and change.** Education-first is not a wording edit. `cv/main.typ` renders Summary, Experience, Education, Projects, Skills in that order, and `scripts/cv-check.mjs` asserts that order in its `HEADINGS` list. A campus build needs both changed, plus a decision about what leaves the page to keep one page. Do that as a deliberate change with the guard updated, not as a silent fork.

## Rule of thumb

The lane changes four things: the first noun, the entry order, the first bullet of each entry, and the row order in Skills. It never adds a claim, a tool, a title, or a project. If the target needs a fact the page does not have, the answer is a gap report, not a sentence.
