import { FileUserIcon, GithubIcon, LinkedinIcon, MailIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SocialLink {
  href: string;
  title: string;
  ariaLabel: string;
  icon: LucideIcon;
  hrefLabel: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: "mailto:fahridanaaa@gmail.com",
    title: "email",
    ariaLabel: "email",
    icon: MailIcon,
    hrefLabel: "/assets/icons/gmail.png",
  },
  {
    href: "https://www.linkedin.com/in/fahridana-ahmad-rayyansyah/",
    title: "linkedIn",
    ariaLabel: "linkedIn",
    icon: LinkedinIcon,
    hrefLabel: "/assets/icons/linkedin.png",
  },
  {
    href: "https://github.com/Fahridanaa",
    title: "github",
    ariaLabel: "github",
    icon: GithubIcon,
    hrefLabel: "/assets/icons/github.png",
  },
  {
    href: "/assets/cv.pdf",
    title: "cv",
    ariaLabel: "cv",
    icon: FileUserIcon,
    hrefLabel: "/assets/icons/profile.png",
  },
];

export const LANGUAGES = [
  { language: "English", greeting: "Hi" },
  { language: "Spanish", greeting: "Hola" },
  { language: "French", greeting: "Bonjour" },
  { language: "German", greeting: "Hallo" },
  { language: "Japanese", greeting: "こんにちは" },
  { language: "Mandarin", greeting: "你好" },
  { language: "Arabic", greeting: "مرحبا" },
  { language: "Hindi", greeting: "नमस्ते" },
  { language: "Indonesia", greeting: "Halo" },
  { language: "Work In Progress", greeting: "WIP" },
];

export const TYPING_STRINGS = [
  "Software Engineer",
  "Mobile Developer",
  "Full-stack Software Developer",
  "Problem Solver",
];
