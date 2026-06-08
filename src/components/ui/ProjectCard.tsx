import React from "react";
import { AppWindow, Code } from "lucide-react";
import ProjectButton from "@/components/ui/ProjectButton";
import { slugify } from "@/utils/helpers";
import type { ProjectMeta } from "@/models/project";

interface ProjectCardProps {
	project: ProjectMeta;
	href: string;
	isReverse?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
	project: {
		title,
		type,
		description,
		sourceClient,
		sourceServer,
		stack,
		demo,
	},
	href,
	isReverse = false,
}) => {
	const visibleTech = stack.slice(0, 4);
	const hiddenTechCount = stack.length - visibleTech.length;
	const tiltClass = isReverse ? "scrap-right" : "scrap-left";

	return (
		<article className="my-6">
			<div
				className={`paper-scrap paper-lift ${tiltClass} grid gap-4 p-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-start sm:p-5 lg:grid-cols-[9.5rem_minmax(0,1fr)_auto]`}
			>
				<a
					href={`/projects/${slugify(title)}`}
					className="camera-print camera-print-tight group block bg-brand-paper"
				>
					<span className="camera-pin" aria-hidden="true"></span>
					<img
						src={href}
						alt={title}
						width={320}
						height={200}
						className="aspect-[16/10] h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
						loading="lazy"
					/>
				</a>

				<div className="min-w-0 space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<p className="sketch-label text-[0.64rem]">{type}</p>
						<span className="break-words font-mono text-xs font-bold uppercase tracking-normal text-brand-graphite">
							#{slugify(title)}
						</span>
					</div>
					<div>
						<h3 className="text-pretty text-xl font-black leading-tight text-brand-ink sm:text-2xl">
							{title}
						</h3>
						<p className="compact-copy mt-2 max-w-[62ch] break-words text-sm leading-relaxed text-brand-graphite">
							{description}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						{visibleTech.map((tech) => (
							<span
								key={tech}
								className="depth-chip rounded-sm bg-brand-paper/80 px-2 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-normal text-brand-ink"
							>
								{tech}
							</span>
						))}
						{hiddenTechCount > 0 && (
							<span className="depth-chip rounded-sm bg-brand-green-soft px-2 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-normal text-brand-ink">
								+{hiddenTechCount}
							</span>
						)}
					</div>
				</div>

				<div className="flex flex-wrap gap-2 lg:max-w-28 lg:flex-col lg:items-stretch">
					{demo && <ProjectButton href={demo} icon={AppWindow} text="Live" />}
					{sourceClient && (
						<ProjectButton href={sourceClient} icon={Code} text="Code" />
					)}
					{sourceServer && (
						<ProjectButton href={sourceServer} icon={Code} text="API" />
					)}
					<ProjectButton
						href={`/projects/${slugify(title)}`}
						text="Note"
						isNewTab={false}
					/>
				</div>
			</div>
		</article>
	);
};

export default ProjectCard;
