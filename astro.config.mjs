// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from "@astrojs/mdx";
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

/** Opens markdown links in a new tab, leaving in-page anchors alone. */
const newTabLinks = {
    name: 'new-tab-links',
    element: {
        filter: ['a'],
        /**
         * @param {import('hast').Element} node
         * @param {import('satteri').HastVisitorContext} ctx
         */
        visit(node, ctx) {
            const href = node.properties?.href;
            if (typeof href !== 'string' || !href || href.startsWith('#')) return;
            ctx.setProperty(node, 'target', '_blank');
            ctx.setProperty(node, 'rel', 'noopener');
        },
    },
};

// https://astro.build/config
export default defineConfig({
    site: 'https://fahridanaa.my.id',
    integrations: [react(), mdx(), sitemap()],
    markdown: {
        processor: satteri({ hastPlugins: [newTabLinks] }),
    },
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'viewport',
    },
    experimental: {
        // Chrome renders a visible link's document in a hidden tab, so the
        // click lands on a page that is already built.
        clientPrerender: true,
    },
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
                // Decoration is painted with inline SVG data URIs, which no
                // other directive covers, so img-src must name data:.
                "img-src 'self' data:",
            ],
            // Shiki emits inline style attributes; allow them only on
            // style-src-attr, keeping style-src at 'self' + hashes.
            styleDirective: {
                resources: [{ resource: "'unsafe-inline'", kind: "attribute" }],
            },
        },
    },
});
