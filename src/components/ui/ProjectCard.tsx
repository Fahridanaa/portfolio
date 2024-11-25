import React from "react";
import { AppWindow, Code } from "lucide-react";
import TechStackIcon from "@/components/ui/TechStackIcon";
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
	return (
		<div
			className={`relative flex flex-col gap-8 my-8 lg:my-14 items-center ${
				isReverse ? "lg:flex-row-reverse" : "lg:flex-row"
			}`}
		>
			<div style={{ opacity: 1, transform: "none", willChange: "auto" }}>
				<div className="flex gap-2 relative group rounded-xl overflow-hidden duration-500 hover:scale-[0.97]">
					<span>
						<img
							src={href}
							alt={title}
							width={900}
							height={450}
							className="lg:w-[500px] xl:w-[600px] rounded-xl group-hover:blur-sm duration-500 group-hover:scale-[1.1]"
							loading="lazy"
						/>
					</span>
					<div className="transition-all absolute flex flex-wrap w-full h-full justify-center items-center content-center gap-2 opacity-0 group-hover:opacity-100 group-hover:dark:bg-[#f5f5f570] group-hover:bg-[#17171770] duration-500 rounded-xl">
						{stack.map((tech: string, index: number) => (
							<TechStackIcon key={index} iconName={tech} />
						))}
						<div className="w-full flex justify-center gap-2">
							{sourceClient && (
								<ProjectButton
									href={sourceClient}
									icon={Code}
									text="Client"
								/>
							)}
							{sourceServer && (
								<ProjectButton
									href={sourceServer}
									icon={Code}
									text="API"
								/>
							)}
						</div>
					</div>
				</div>
			</div>
			<div
				className={`flex flex-col items-center gap-4 ${
					isReverse ? "lg:items-end" : "lg:items-start"
				}`}
			>
				<div
					className={`flex flex-col items-center ${
						isReverse ? "lg:items-end" : "lg:items-start"
					}`}
					style={{ opacity: 1, willChange: "auto" }}
				>
					<h2 className="text-2xl font-semibold">{title}</h2>
					<p className="text-xl font-semibold text-[#594C40]">
						{type}
					</p>
				</div>

				<p
					className={`transition-all lg:w-[280px] xl:w-[350px] text-center ${
						isReverse ? "lg:text-end" : "lg:text-start"
					}`}
					style={{ opacity: 1, willChange: "auto" }}
				>
					{description}
				</p>

				<div className="flex flex-col gap-2">
					{demo && (
						<ProjectButton
							href={demo}
							icon={AppWindow}
							text="Live Preview"
						/>
					)}

					<ProjectButton
						href={`/projects/${slugify(title)}`}
						text={`Learn more about ${title}`}
						isNewTab={false}
					/>
				</div>
			</div>
		</div>
	);
};

export default ProjectCard;
