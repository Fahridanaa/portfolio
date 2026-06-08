import { useEffect } from "react";
import Typed from "typed.js";
import { TYPING_STRINGS } from "@/data/site";

export default function TypingAnimation() {
	useEffect(() => {
		const typingElement = document.getElementById("typing");
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		if (typingElement && prefersReducedMotion) {
			typingElement.textContent = TYPING_STRINGS[0] ?? "";
			return;
		}

		const typed = new Typed("#typing", {
			strings: TYPING_STRINGS,
			typeSpeed: 50,
			backSpeed: 50,
			backDelay: 2000,
			loop: true,
		});

		return () => {
			typed.destroy();
		};
	}, []);

	return (
		<p className="text-pretty">
			A&nbsp;
			<span
				id="typing"
				className="ink-underline relative inline-block text-left font-black text-brand-green"
			>
				{TYPING_STRINGS[0]}
			</span>
		</p>
	);
}
