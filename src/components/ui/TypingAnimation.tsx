import { useEffect } from "react";
import Typed from "typed.js";

export default function TypingAnimation() {
	useEffect(() => {
		const typed = new Typed("#typing", {
			strings: [
				"Software Engineer",
				"FullStack Developer",
				"Project Manager",
				"Game Developer",
			],
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
		<p>
			A&nbsp;
			<span
				id="typing"
				className="inline-block relative text-left text-[#2E5C37] font-semibold"
			></span>
		</p>
	);
}
