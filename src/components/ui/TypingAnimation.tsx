import { useEffect } from "react";
import Typed from "typed.js";
import { TYPING_STRINGS } from "@/data/site";

export default function TypingAnimation() {
	useEffect(() => {
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
		<p>
			A&nbsp;
			<span
				id="typing"
				className="inline-block relative text-left text-brand-green font-semibold"
			></span>
		</p>
	);
}
