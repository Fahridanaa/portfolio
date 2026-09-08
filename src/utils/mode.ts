// Single source for site mode values. Import this anywhere logic runs.
// Markup (data-attributes, CSS selectors) and the inline head script in
// Layout.astro keep plain literals: they cannot import modules.
export type SiteMode = "work" | "personal";

export const MODES: [SiteMode, ...SiteMode[]] = ["work", "personal"];

export const DEFAULT_MODE: SiteMode = "work";

export const MODE_STORAGE_KEY = "site-mode";

export function normalizeMode(value: unknown): SiteMode {
	return value === "personal" ? "personal" : "work";
}
