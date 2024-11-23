import React from "react";

interface TechStackIconProps {
	iconName: string;
}

const TechStackIcon: React.FC<TechStackIconProps> = ({ iconName }) => {
	return (
		<div className="shadow-md p-2 rounded-lg flex justify-center items-center bg-white/10 backdrop-blur-sm hover:scale-110 transition-transform duration-300">
			<img
				src={`/assets/icons/${iconName.toLowerCase()}.svg`}
				alt={`${iconName}`}
				width={24}
				height={24}
				loading="lazy"
				className="w-8 h-8"
			/>
		</div>
	);
};

export default TechStackIcon;
