# Source thread

- URL: https://www.reddit.com/r/karir/comments/1xalunj/almost_2_months_unemployed_as_a_swe_fg_what_am_i/
- Title: "almost 2 months unemployed as a SWE FG. what am I doing wrong? (CV attached)"
- Author: u/alivekintsugi, a software engineering graduate of a Malaysian private university, applying in Indonesia with a four month internship and a 3.13 CGPA.
- Read: 53 entries, the post plus its comments. The CV itself was an attached image and was not read. The judgments below are about the text of the replies.

## Fetching it again

The JSON endpoint returns 403 from this host, with or without a user agent. The RSS feed works and carries the full post and comments.

```sh
curl -s -A "Mozilla/5.0" "https://www.reddit.com/r/karir/comments/1xalunj/.rss" -o /tmp/post.rss
```

Each entry has an author, a title, and an HTML content field. Strip the tags, keep the text, and read top to bottom. The order is the thread order, so replies sit next to what they answer.

## The comments the rules come from

| Author | Role | What they judged |
| --- | --- | --- |
| u/botrezkii | says he is a CTO | The line-by-line read: location, length, school, role label, languages, internship, education. The "one question" quote. |
| u/Downtown-Bid-3982 | works in tech | ATS friendliness, education first for a fresh grad, too many skills. |
| u/SecureCrab | backend engineer, same university | Generic opening, breadth over depth, pick two or three, cut internship bullets to three or four, projects need descriptions, Jake's resume format. |
| u/UnapologeticFoodie | blunt reviewer | No bold paragraphs, no double columns, two hyperlinks maximum, short project descriptions, skills at the very bottom. |
| u/cynuxtar | Indonesian developer | Name the company, show the impact, projects need prose, location matters to Jakarta readers. |
| u/Correct_Mud1377 | commented on the CV | Add numbers and metrics. |
| u/Chemical-Hour-9292 | senior developer | The Claude test on every line. |
| u/rizkiyoist | developer | Explain the big decisions, an empty stretch of months is a huge gap. |
| u/trashcan41 | commenter | Asked whether it is normal to leave the internship company unnamed. |

## What was deliberately left out

The thread is mostly about the job search, not the document. These parts are real advice but out of scope for this skill.

- Salary expectations and the 15M, 12M, 10M, 8M sequence.
- Referrals, communities, job portals versus company sites, outsourcing firms, ODP and MDP programs.
- LeetCode, certifications, and the question of leaving software for another field.
- Claims about the market that cannot be checked. They may be true, but they are not rules for a page.

## Known limits

- The CV image was not read, so no rule here is a comment on a specific line of that file. The rules are what the replies say a CV should do.
- One thread, one market, one moment. Treat the rules as a strong prior, not as law. Re-read the source when the advice stops matching the outcomes.
