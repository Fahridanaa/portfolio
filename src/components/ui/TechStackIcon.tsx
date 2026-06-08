import React from "react";
import { iconPath } from "@/utils/icons";

interface TechStackIconProps {
	iconName: string;
}

const TechStackIcon: React.FC<TechStackIconProps> = ({ iconName }) => {
	return (
		<div className="depth-chip flex items-center justify-center rounded-md bg-white/85 p-2">
			<img
				src={iconPath(iconName)}
				alt={`${iconName}`}
				width={24}
				height={24}
				loading="lazy"
				className="h-8 w-8"
			/>
		</div>
	);
};

export default TechStackIcon;
