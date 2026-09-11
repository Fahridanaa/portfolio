export interface SocialLink {
  href: string;
  title: string;
  ariaLabel: string;
  iconSrc: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: "mailto:fahridanaaa@gmail.com",
    title: "email",
    ariaLabel: "email",
    iconSrc: "/assets/icons/gmail.png",
  },
  {
    href: "https://www.linkedin.com/in/fahridana-ahmad-rayyansyah/",
    title: "linkedIn",
    ariaLabel: "linkedIn",
    iconSrc: "/assets/icons/linkedin.png",
  },
  {
    href: "https://github.com/Fahridanaa",
    title: "github",
    ariaLabel: "github",
    iconSrc: "/assets/icons/github.png",
  },
  {
    href: "/assets/cv.pdf",
    title: "cv",
    ariaLabel: "cv",
    iconSrc: "/assets/icons/profile.png",
  },
];
