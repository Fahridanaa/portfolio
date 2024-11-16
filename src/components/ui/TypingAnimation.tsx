import { useEffect } from "react";
import Typed from "typed.js";

export default function TypingAnimation() {
	useEffect(() => {
		const typed = new Typed("#typing", {
			strings: ["Software Engineer", "Coffee Addict", "Gamer"],
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
		<span
			id="typing"
			className="z-10 inline-block relative text-left text-[#8DDEFC] font-semibold px-2"
		></span>
	);
}
