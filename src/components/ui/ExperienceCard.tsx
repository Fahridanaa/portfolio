import { Calendar, ChevronDown, MapPin } from "lucide-react";
import type { ExperienceMeta } from "@/models/experience";

interface ExperienceProps {
  experience: ExperienceMeta;
  index: number;
}

export default function ExperienceCard({ experience, index }: ExperienceProps) {
  const noteTilt = index % 2 === 0 ? "note-left" : "note-right";
  const previewTech = experience.techStack.slice(0, 2);
  const hiddenPreviewCount = experience.techStack.length - previewTech.length;

  return (
    <details className={`experience-entry ${noteTilt}`}>
      <summary className="experience-row">
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

        <div className="min-w-0">
          <h3 className="truncate text-base font-black leading-tight text-brand-ink sm:text-lg">
            {experience.role}
          </h3>
          <p className="mt-1 truncate text-sm font-bold text-brand-green">
            {experience.company}
          </p>
        </div>

        <div className="experience-stack-preview">
          {previewTech.map((tech) => (
            <span
              key={tech}
              className="depth-chip rounded-sm bg-brand-paper/80 px-2 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-normal text-brand-ink"
            >
              {tech}
            </span>
          ))}
          {hiddenPreviewCount > 0 && (
            <span className="depth-chip rounded-sm bg-brand-green-soft px-2 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-normal text-brand-ink">
              +{hiddenPreviewCount}
            </span>
          )}
        </div>

        <span className="experience-cue" aria-hidden="true">
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>

      <div className="experience-note">
        <div className="experience-note-pin" aria-hidden="true"></div>
        <div className="experience-note-content">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-brand-graphite">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {experience.startDate} - {experience.endDate}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {experience.location}
              {experience.isRemote && " / Remote"}
            </span>
            <span className="font-bold text-brand-green">{experience.type}</span>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
            <p className="break-words text-sm leading-relaxed text-brand-graphite">
              {experience.summary}
            </p>

            {experience.techStack.length > 0 && (
              <div className="flex max-w-sm flex-wrap gap-2 md:justify-end">
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
    </details>
  );
}
