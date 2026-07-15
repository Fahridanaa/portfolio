import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ExperienceMeta } from "@/models/experience";

interface ExperienceProps {
  experience: ExperienceMeta;
}

export default function ExperienceCard({ experience }: ExperienceProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`experience-entry ${isOpen ? "is-open" : ""}`}>
      <button
        className="experience-row"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <div className="experience-year-cell">
          <time className="experience-year" dateTime={experience.date.toISOString()}>
            {experience.startDate}
          </time>
        </div>

        <img
          src={experience.logo}
          alt={`${experience.company} logo`}
          width={44}
          height={44}
          className="depth-media h-11 w-11 shrink-0 rounded-md bg-white p-1.5 object-contain"
        />

        <div className="flex items-center justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-black leading-tight text-brand-ink sm:text-lg">
                {experience.company}
              </h3>
              <span className="shrink-0 rounded-sm bg-brand-green-soft/80 px-2 py-0.5 font-mono text-[0.68rem] font-bold uppercase tracking-normal text-brand-green">
                {experience.type}
              </span>
              <span className="shrink-0 rounded-sm bg-white/60 px-2 py-0.5 font-mono text-[0.68rem] font-bold uppercase tracking-normal text-brand-graphite ring-1 ring-brand-green/10">
                {experience.isRemote ? "Remote" : "OnSite"}
              </span>
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-brand-graphite">
              <span className="text-brand-green">{experience.role}</span>
              <span className="mx-1.5">•</span>
              {experience.location}
            </p>
          </div>
          <span className="shrink-0 text-center text-sm font-semibold text-brand-graphite">
            {experience.startDate} - {experience.endDate}
          </span>
        </div>

        <span className="experience-cue" aria-hidden="true">
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      <div className="experience-note">
        <div aria-hidden="true" />
        <div aria-hidden="true" className="w-11" />
        <div className="flex flex-col gap-6">
          <ul className="min-w-0 list-inside list-disc space-y-1 text-base leading-relaxed text-brand-graphite">
            {experience.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>

          {experience.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {experience.techStack.map((tech) => (
                <span
                  key={tech}
                  className="depth-chip rounded-sm bg-brand-paper/80 px-2 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-normal text-brand-ink"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
