// First-visit gate for the entry animation. Loaded as a classic script in
// <head> so it decides before the body is parsed and the first frame paints.
//
// ?intro=1|2|3 previews a variant; ?intro=0 turns the intro off. A normal first
// visit in a tab plays the ink reveal, then stays quiet for that session.
(() => {
	try {
		if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const key = "portfolio:entry-intro:ink";
		const forced = new URLSearchParams(location.search).get("intro");
		if (forced === "0" || forced === "off") return;

		const variant = forced ?? (sessionStorage.getItem(key) ? null : "2");
		if (!["1", "2", "3"].includes(variant)) return;

		document.documentElement.dataset.intro = variant;
		sessionStorage.setItem(key, variant);
	} catch {
		// Storage or matchMedia can be unavailable. A plain page is correct.
	}
})();
