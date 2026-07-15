#set page(paper: "a4", margin: (x: 0.5in, y: 0.4in))
#set text(font: "Liberation Serif", size: 10pt)
#set par(justify: true)

#let cv = json("resume.json")
#let show_phone = sys.inputs.at("show_phone", default: "false") == "true"

// --- HELPERS ---

#let section(title) = {
  v(0.05em)
  text(size: 11pt, weight: "bold", upper(title))
  v(-0.8em)
  line(length: 100%, stroke: 0.5pt)
  v(-0.3em)
}

#let two-col(left, right) = grid(
  columns: (1fr, auto),
  left, right,
)

#let entry(title, organization, location, date, body) = {
  two-col([*#organization*], location)
  v(-0.3em)
  two-col(emph(title), date)
  v(-0.1em)
  if type(body) == array and body.len() > 0 {
    for point in body [- #point]
  } else if type(body) == str and body != "" {
    body
  }
  v(0.05em)
}

#let exp-entry(title, organization, location, date, body, tech-stack: (), status: none) = {
  let org-display = if status != none [*#organization* · #status] else [*#organization*]
  entry(title, org-display, location, date, body)
  if tech-stack.len() > 0 {
    v(-0.2em)
    [*Stack*: #tech-stack.join(", ")#h(1fr)]
  }
}

// --- HEADER ---

#let header-items = (
  cv.basics.location,
  if show_phone { link("tel:" + cv.basics.phone)[#cv.basics.phone] },
  link("mailto:" + cv.basics.email)[#cv.basics.email],
  link("https://" + cv.basics.url)[fahridanaa.my.id],
  link("https://" + cv.basics.profiles.linkedin)[in/fahridana-ahmad-rayyansyah],
  link("https://" + cv.basics.profiles.github)[github/Fahridanaa],
).filter(x => x != none)

#align(center)[
  #text(size: 16pt, weight: "bold")[#cv.basics.name]
  #v(-0.8em)
  #{ header-items.join(" | ") }
]

// --- SUMMARY ---

#section("Summary")
#cv.basics.summary

// --- EXPERIENCE ---

#section("Experience")
#for job in cv.experience {
  exp-entry(
    job.role,
    job.company,
    job.location,
    job.date,
    job.points,
    tech-stack: job.at("stack", default: ()),
    status: job.at("status", default: none),
  )
}

// --- EDUCATION ---

#section("Education")
#for edu in cv.education {
  entry(
    edu.degree,
    edu.school,
    edu.location,
    edu.date,
    edu.at("details", default: ()),
  )
}

// --- PROJECTS ---

#section("Projects")
#for proj in cv.projects {
  entry(
    proj.role,
    proj.name,
    "",
    proj.date,
    proj.points,
  )
}

// --- SKILLS ---

#section("Skills")
#for skill in cv.skills {
  [*#skill.category*: #skill.items.join(", ")]
  linebreak()
}
