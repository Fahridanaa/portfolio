import { defineCollection, z } from "astro:content";

const projectCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        type: z.string(),
        hasImage: z.boolean().default(true),
        date: z.coerce.date(),
        description: z.string(),
        demo: z.string().url().nullable().default(null),
        sourceClient: z.string().url().nullable().default(null),
        sourceServer: z.string().url().nullable().default(null),
        stack: z.array(z.string()),
    }),
});

const experienceCollection = defineCollection({
    schema: z.object({
        company: z.string(),
        role: z.string(),
        type: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        date: z.coerce.date(),
        location: z.string(),
        isRemote: z.boolean(),
        summary: z.string(),
        techStack: z.array(z.string()),
        logo: z.string(),
    }),
});

const blogCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        description: z.string(),
        tags: z.array(z.string()).default([]),
        banner: z.string().nullable().default(null),
        draft: z.boolean().default(false),
    }),
});

export const collections = {
    projects: projectCollection,
    experiences: experienceCollection,
    blog: blogCollection,
};
