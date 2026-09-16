export interface NavigationIntent {
	href: string | null;
	target: string | null;
	download: string | null;
	button: number;
	metaKey: boolean;
	ctrlKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
}

/** True when the click loads a different document in this tab, so the wait is visible. */
export function shouldTrackNavigation(
	intent: NavigationIntent,
	currentHref: string
) {
	if (intent.button !== 0) return false;
	if (intent.metaKey || intent.ctrlKey || intent.shiftKey || intent.altKey) {
		return false;
	}
	if (intent.target || intent.download !== null || !intent.href) {
		return false;
	}
	const current = new URL(currentHref);
	const next = new URL(intent.href, currentHref);
	if (next.origin !== current.origin) return false;
	return next.pathname !== current.pathname || next.search !== current.search;
}
