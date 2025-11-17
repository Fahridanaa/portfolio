// NavbarItem.tsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
	href: string;
	label: string;
}

export default function NavbarItem({ href, label }: Props) {
	const [isActive, setIsActive] = useState(false);
	const sectionId = href.replace("#", "");

	useEffect(() => {
		const section = document.getElementById(sectionId);

		if (!section) {
			console.warn(`Section with ID "${sectionId}" not found`);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsActive(entry.isIntersecting);
			},
			{
				threshold: [0.2, 0.5, 0.8],
				rootMargin: "-20% 0px -20% 0px",
			}
		);

		observer.observe(section);

		return () => {
			observer.unobserve(section);
			observer.disconnect();
		};
	}, [sectionId]);

	return (
		<motion.div
			className="nav-item p-1 lg:px-2 rounded-lg cursor-pointer"
			animate={{
				scale: isActive ? 1.25 : 1,
				opacity: isActive ? 1 : 0.7,
			}}
			whileHover={{
				scale: 1.25,
				opacity: 1,
			}}
			transition={{
				duration: 0.3,
				type: "spring",
				stiffness: 300,
			}}
		>
			<a href={href} className="hidden xl:block">
				{label}
			</a>
		</motion.div>
	);
}
