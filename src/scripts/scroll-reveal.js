// Scroll reveal for the home page. Loaded as a classic script in <head>, so
// <html data-reveal> is set before the first paint and nothing flashes before
// it hides.
//
// While data-reveal is set, ScrollReveal.astro hides each [data-reveal-item]
// until it scrolls into view, then plays its entrance. The attribute is set
// only when motion is allowed and IntersectionObserver exists, and it is
// removed again if anything throws, so no JS, reduced motion, and a broken
// script all leave the finished page visible.
(() => {
	const root = document.documentElement;
	try {
		if (
			matchMedia("(prefers-reduced-motion: reduce)").matches ||
			!("IntersectionObserver" in window)
		) {
			return;
		}
		root.dataset.reveal = "";

		document.addEventListener("DOMContentLoaded", () => {
			try {
				// Items inside one list get an index, used for stagger delays.
				document.querySelectorAll("[data-reveal-stagger]").forEach((list) => {
					Array.from(list.children).forEach((child, i) => {
						child.style.setProperty("--i", String(i));
					});
				});

				const io = new IntersectionObserver(
					(entries) => {
						try {
							// Items that arrive in the same frame play one after another,
							// top to bottom. While the hero intro is still writing
							// (it ends near 1.25s), the first ones wait only for the
							// time that is left, never a fixed pause.
							const wait = root.dataset.intro
								? Math.max(0, Math.min(900, 1250 - performance.now()))
								: 0;
							const arriving = entries
								.filter((entry) => entry.isIntersecting)
								.sort(
									(a, b) =>
										a.boundingClientRect.top - b.boundingClientRect.top ||
										a.boundingClientRect.left - b.boundingClientRect.left,
								);
							arriving.forEach((entry, n) => {
								const el = entry.target;
								el.style.setProperty(
									"--reveal-delay",
									`${wait + Math.min(n, 5) * 90}ms`,
								);
								el.classList.add("is-in");
								io.unobserve(el);
							});
						} catch {
							delete root.dataset.reveal;
						}
					},
					{ threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
				);
				document
					.querySelectorAll("[data-reveal-item]")
					.forEach((el) => io.observe(el));
			} catch {
				delete root.dataset.reveal;
			}
		});
	} catch {
		// A plain page is the correct fallback.
		delete root.dataset.reveal;
	}
})();
