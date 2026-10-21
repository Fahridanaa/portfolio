#set page(paper: "a4", margin: (x: 0.42in, y: 0.4in))
#set text(font: "Liberation Serif", size: 10pt, hyphenate: false)
#set par(justify: false, leading: 0.6em, spacing: 0pt)

#let cv = json("resume.json")
#let show_phone = sys.inputs.at("show_phone", default: "false") == "true"

// --- SCALE ---
// Gaps climb with what they separate, so the eye groups first and reads second.
// As measured on the page: an entry's own header pair 1.5pt (s0), the items of
// one list 4.5pt (s1), skill rows 7pt (sLi, which are single lines with no
// bullet to mark them), a heading to its body 8pt (sh), one entry to the next
// 9pt (s2), one section to the next 13pt (s3). A heading hugs its rule (sk) and
// its body closer than any of those, so the rule belongs to the title, not to
// the page. Every gap is an explicit v() or a stack spacing: block above/below
// collapse into their neighbour, which is how spacing vanished before. Measured
// gaps read about 2.5pt smaller than the v() they come from, because a word box
// is taller than its glyphs.
#let s0 = 0.41em
#let s1 = 0.7em
#let sLi = 0.95em
#let s2 = 1.15em
#let s3 = 1.55em
#let sk = 0.32em
#let sh = 0.76em

#let section(title, body) = block(above: s3, width: 100%)[
  #text(size: 11pt, weight: "bold", upper(title))
  #v(sk)
  #line(length: 100%, stroke: 0.55pt)
  #v(sh)
  #body
]

#let row(left, right) = block(width: 100%)[#left#h(1fr)#right]

#let bullets(items) = stack(
  spacing: s1,
  ..items.map(point => block(width: 100%)[
    #set par(hanging-indent: 1.05em)
    • #h(0.4em) #point
  ]),
)

#let entry(org, place, role, date, points) = block(width: 100%)[
  #row([#text(weight: "bold")[#org]], place)
  #if role != none and role != "" [
    #v(s0)
    #row(emph(role), date)
  ]
  #if points.len() > 0 [
    #v(s1)
    #bullets(points)
  ]
]

// --- HEADER ---

#let header-items = (
  cv.basics.location,
  if show_phone { link("tel:" + cv.basics.phone)[#cv.basics.phone] },
  cv.basics.email,
  cv.basics.url,
  link("https://" + cv.basics.profiles.linkedin)[in/fahridana-ahmad-rayyansyah],
  link("https://" + cv.basics.profiles.github)[github/Fahridanaa],
).filter(x => x != none)

#block(width: 100%)[#align(center)[#text(size: 18pt, weight: "bold")[#cv.basics.name]]]
#v(1.05em)
#block(width: 100%)[
  #align(center)[#text(size: 9.5pt)[#header-items.join("  |  ")]]
]

// --- SUMMARY ---

#section("Summary", [#cv.basics.summary])

// --- EXPERIENCE ---

#section(
  "Experience",
  stack(
    spacing: s2,
    ..cv.experience.map(job => entry(
      job.company,
      job.location,
      job.role,
      job.date,
      job.points,
    )),
  ),
)

// --- EDUCATION ---

#section(
  "Education",
  stack(
    spacing: s2,
    ..cv.education.map(edu => {
      let detail = edu.at("details", default: ())
      entry(
        edu.school,
        edu.location,
        ((edu.degree,) + detail).join("  ·  "),
        edu.date,
        (),
      )
    }),
  ),
)

// --- PROJECTS ---

#section(
  "Projects",
  stack(
    spacing: s2,
    ..cv.projects.map(proj => entry(
      proj.name,
      "",
      proj.at("role", default: none),
      proj.date,
      proj.points,
    )),
  ),
)

// --- SKILLS ---

#section(
  "Skills",
  stack(
    spacing: sLi,
    ..cv.skills.map(skill => block(width: 100%)[
      #text(weight: "bold")[#skill.category:] #skill.items.join(", ")
    ]),
  ),
)
