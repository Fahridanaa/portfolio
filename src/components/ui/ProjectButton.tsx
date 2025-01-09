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
			<button className="flex items-center justify-center font-semibold px-2 py-1 gap-2 border-1 border-[#8d7e61] bg-[#8d7e61] rounded text-[#ffffff] transition-all duration-300 hover:text-white hover:scale-105 hover:shadow-lg">
				{Icon && (
					<Icon
						size={24}
						className="transition-transform duration-300 hover:rotate-12"
					/>
				)}
				{text}
			</button>
		</a>
	);
};

export default ProjectButton;
