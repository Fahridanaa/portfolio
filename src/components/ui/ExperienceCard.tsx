import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MapPin, Calendar } from "lucide-react";
import type { ExperienceMeta } from "@/models/experience";

interface ExperienceProps {
  experience: ExperienceMeta;
  index: number;
}

export default function ExperienceCard({ experience, index }: ExperienceProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isReverse = index % 2 !== 0;

  // Get tech stack icons for decoration (max 2)
  const decorativeIcons = experience.techStack
    .slice(0, 2)
    .map((tech) => {
      // Convert tech name to lowercase and handle special cases
      let techName = tech.toLowerCase();

      // Handle special mappings
      const mappings: Record<string, string> = {
        'next.js': 'nextjs',
        'nextjs': 'nextjs',
        'prisma orm': 'prisma',
        'google cloud platform (gcp)': 'docker', // fallback
        'firebase': 'docker', // fallback
        'html': 'javascript', // fallback
        'css': 'javascript', // fallback
      };

      techName = mappings[techName] || techName.replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      return `/assets/icons/${techName}.svg`;
    })
    .filter((icon, index, self) => self.indexOf(icon) === index); // Remove duplicates

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const cardVariants = {
    hidden: {
      opacity: 0,
      x: isReverse ? 50 : -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div ref={cardRef} className="relative flex items-center gap-8 mb-12">
      {/* Timeline line and dot - only show on desktop */}
      <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-[#8d7e61] border-4 border-[#f7f6ef] z-10 mt-6"></div>
        <div className="w-[2px] h-full bg-[#b39c72]"></div>
      </div>

      {/* Mobile timeline dot (left side) */}
      <div className="md:hidden absolute left-0 top-6">
        <div className="w-3 h-3 rounded-full bg-[#8d7e61] border-2 border-[#f7f6ef]"></div>
      </div>

      {/* Decorative tech stack icons on opposite side - only show on desktop */}
      <div
        className={`hidden md:flex absolute ${
          isReverse ? "left-0" : "right-0"
        } top-1/2 -translate-y-1/2 ${
          isReverse ? "justify-start" : "justify-end"
        } w-[calc(50%-2rem)] pointer-events-none`}
      >
        <div className="relative w-full h-96">
          {decorativeIcons.map((icon, idx) => (
            <img
              key={idx}
              src={icon}
              alt=""
              className={`absolute w-48 h-48 object-contain opacity-[0.08] ${
                idx === 0 ? "animate-spin-slow top-0 right-0" : "animate-spin-slower bottom-0 left-0"
              }`}
              style={{
                animationDirection: idx % 2 === 0 ? "normal" : "reverse",
              }}
            />
          ))}
        </div>
      </div>

      {/* Card container */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <div
          className={`md:w-[calc(50%-2rem)] ${
            isReverse ? "md:ml-auto" : "md:mr-auto"
          } ml-6 md:ml-0`}
        >
          <div className="group/card relative bg-[#f9f5ec] border-2 border-[#b39c72] rounded-md p-6 hover:shadow-lg transition-all duration-300">
          {/* Company logo and header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              <img
                src={experience.logo}
                alt={`${experience.company} logo`}
                className="w-16 h-16 rounded-lg object-contain bg-white p-2 border border-[#b39c72]"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#594C40] mb-1">
                {experience.role}
              </h3>
              <p className="text-[#8d7e61] font-semibold mb-1">
                {experience.company}
              </p>
              <p className="text-sm text-[#72674e]">{experience.type}</p>
            </div>
          </div>

          {/* Meta information */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-[#72674e]">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {experience.startDate} - {experience.endDate}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>
                {experience.location}
                {experience.isRemote && " · Remote"}
              </span>
            </div>
          </div>

          {/* Summary */}
          <p className="text-[#594C40] leading-relaxed mb-4">
            {experience.summary}
          </p>

          {/* Tech stack */}
          {experience.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {experience.techStack.map((tech) => (
                <div
                  key={tech}
                  className="px-3 py-1 bg-white border border-[#b39c72] rounded-full text-xs font-semibold text-[#8d7e61]"
                >
                  {tech}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
