// Pre-paint site-mode bootstrap. Loaded synchronously from <head> so the
// correct mode is applied before first paint. Runs as a classic script so the
// CSP can stay at `script-src 'self'` (no inline script, no hash to maintain).
// Literals mirror src/utils/mode.ts: this file cannot import modules.
(function () {
	function applySiteMode() {
		try {
			var mode = localStorage.getItem("site-mode") || "work";
			if (mode !== "personal") mode = "work";
			localStorage.setItem("site-mode", mode);
			document.documentElement.dataset.mode = mode;
		} catch (e) {
			document.documentElement.dataset.mode = "work";
		}
	}

	try {
		if (location.search.indexOf("mode=") !== -1) {
			var url = new URL(location.href);
			url.searchParams.delete("mode");
			history.replaceState(null, "", url);
		}
	} catch (e) {}

	applySiteMode();
	document.addEventListener("astro:after-swap", applySiteMode);
})();
