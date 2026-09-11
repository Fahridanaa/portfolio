// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from "@astrojs/mdx";
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://fahridanaa.my.id',
    integrations: [react(), mdx(), sitemap()],
    vite: {
        plugins: [tailwindcss()],
    },
    security: {
        csp: {
            directives: [
                "default-src 'self'",
                "base-uri 'self'",
                "object-src 'none'",
                "form-action 'self'",
            ],
            // Shiki emits inline style attributes; allow them only on
            // style-src-attr, keeping style-src at 'self' + hashes.
            styleDirective: {
                resources: [{ resource: "'unsafe-inline'", kind: "attribute" }],
            },
        },
    },
});
