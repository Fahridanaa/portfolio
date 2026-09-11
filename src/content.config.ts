import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { MODES } from "./utils/mode";

const assetPath = z.string().regex(/^\/assets\//, "must be a path under /assets/");

const projectCollection = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
    schema: z.object({
        title: z.string(),
        type: z.string(),
        hasImage: z.boolean().default(true),
        date: z.coerce.date(),
        description: z.string(),
        demo: z.url().nullable().default(null),
        sourceClient: z.url().nullable().default(null),
        sourceServer: z.url().nullable().default(null),
        stack: z.array(z.string()),
    }),
});

const experienceCollection = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/experiences" }),
    schema: z.object({
        company: z.string(),
        role: z.string(),
        type: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        date: z.coerce.date(),
        location: z.string(),
        isRemote: z.boolean(),
        bullets: z.array(z.string()),
        techStack: z.array(z.string()),
        logo: assetPath,
    }),
});

const blogCollection = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        description: z.string(),
        tags: z.array(z.string()).default([]),
        banner: assetPath.nullable().default(null),
        draft: z.boolean().default(false),
        mode: z.enum(MODES).default("personal"),
    }),
});

export const collections = {
    projects: projectCollection,
    experiences: experienceCollection,
    blog: blogCollection,
};
