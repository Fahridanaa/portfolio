import React from "react";
import type { LucideProps } from "lucide-react";

interface ProjectButtonProps {
  href: string;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  text: string;
  isNewTab?: boolean;
}

const ProjectButton: React.FC<ProjectButtonProps> = ({
  href,
  icon: Icon,
  text,
  isNewTab = true,
}) => {
  return (
    <a
      className="ink-button inline-flex min-h-9 items-center justify-center gap-2 rounded-sm bg-brand-green px-3 py-1.5 text-xs font-black uppercase tracking-normal text-white transition-[transform,box-shadow,background-color] duration-150"
      href={href}
      target={isNewTab ? "_blank" : undefined}
      rel={isNewTab ? "noopener noreferrer" : undefined}
    >
      {Icon && <Icon size={16} strokeWidth={2} aria-hidden="true" />}
      <span className="break-words text-center leading-tight">{text}</span>
    </a>
  );
};

export default ProjectButton;
