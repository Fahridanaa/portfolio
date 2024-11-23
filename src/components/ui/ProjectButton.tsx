import React from "react";
import type { LucideProps } from "lucide-react";

interface ProjectButtonProps {
	href: string;
	icon?: React.ForwardRefExoticComponent<
		Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
	>;
	text: string;
	isNewTab?: boolean;
}

const ProjectButton: React.FC<ProjectButtonProps> = ({
	href,
	icon: Icon,
	text,
	isNewTab = true,
}) => {
	return (
		<a
			className="flex justify-center items-center"
			href={href}
			target={isNewTab ? "_blank" : ""}
			rel={isNewTab ? "noopener noreferrer" : undefined}
		>
			<button className="flex items-center justify-center font-semibold px-2 py-1 gap-2 border-2 border-[#2E40B8] rounded text-[#2E40B8] transition-all duration-300 hover:bg-[#2E40B8] hover:text-white">
				{Icon && <Icon size={24} />}
				{text}
			</button>
		</a>
	);
};

export default ProjectButton;
