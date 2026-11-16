export const SITE_NAME = "Fahridana Ahmad Rayyansyah";
export const SITE_TAGLINE = "Full-stack Developer";
export const SITE_DESCRIPTION =
	"Full-stack developer building web apps and keeping the work simple. Projects, open-source contributions, notes, and drawings by Fahridana Ahmad Rayyansyah.";

export const BLOG_FEED_TITLE = `${SITE_NAME} — Blog Notes`;

export const EMAIL = "fahridanaaa@gmail.com";

export const CV_HREF = "/assets/cv.pdf";

export interface TextLink {
	href: string;
	label: string;
}

/** Text links sit next to the two ink buttons in the hero. */
export const SOCIAL_LINKS: TextLink[] = [
	{
		href: "https://github.com/Fahridanaa",
		label: "GitHub",
	},
	{
		href: "https://www.linkedin.com/in/fahridana-ahmad-rayyansyah/",
		label: "LinkedIn",
	},
];
