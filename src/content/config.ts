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

export const collections = {
    projects: projectCollection,
};
