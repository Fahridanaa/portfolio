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
		<motion.a
			href={href}
			aria-current={isActive ? "location" : undefined}
			className={`flex min-h-9 items-center justify-between gap-3 rounded-md px-3 py-2 text-xs font-black uppercase tracking-normal transition-[background-color,color,box-shadow] duration-200 ${
				isActive
					? "depth-control bg-brand-highlighter text-brand-ink"
					: "depth-chip bg-white/45 text-brand-graphite hover:bg-white/80 hover:text-brand-ink"
			}`}
			animate={{
				x: isActive ? -4 : 0,
				opacity: isActive ? 1 : 0.7,
			}}
			whileHover={{
				x: -4,
				opacity: 1,
			}}
			transition={{
				duration: 0.2,
				type: "spring",
				stiffness: 300,
			}}
		>
			<span
				className="h-2 w-2 bg-current shadow-[0_1px_2px_rgba(36,49,42,0.24)]"
				aria-hidden="true"
			/>
			<span>{label}</span>
		</motion.a>
	);
}
