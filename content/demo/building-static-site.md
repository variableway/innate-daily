---
title: "Why We Chose a Static Site (and How It Works)"
slug: building-static-site
date: 2026-04-14
author: Innate Team
category: article
tags: [static-site, nextjs, performance, deployment, architecture]
status: published
excerpt: "Static sites are fast, cheap, and reliable. Here's how we built one with Next.js that pulls live data from GitHub without needing a server."
---

## Why Static?

Before we wrote a single line of code, we asked: do we need a server?

The answer was no. Our content changes infrequently (a few times a day at most), and we want:

- **Fast page loads** — no server rendering on each request
- **Zero hosting cost** — serve from a CDN or GitHub Pages
- **High reliability** — static HTML doesn't crash
- **Offline capable** — the site works without a backend

A static site gives us all of this.

## Static Generation with Next.js

Next.js supports three rendering modes:

| Mode              | Command                         | When to use                  |
| ----------------- | ------------------------------- | ---------------------------- |
| **Static Export** | `STATIC_EXPORT=true next build` | Pure HTML, host anywhere     |
| **ISR (Server)**  | `SERVER_MODE=true next build`   | HTML + periodic revalidation |
| **Development**   | `next dev`                      | Dynamic rendering with HMR   |

We use **Static Export** for production. Every page is pre-rendered at build time into HTML files:

```bash
# Build the static site
pnpm build:static

# The output goes to apps/web/dist/
# Serve it with any static host:
npx serve dist
```

### How Static Generation Works

Each page uses one of two patterns:

**Pattern 1: Import JSON directly** (for data from scripts)

```typescript
import issuesData from '@/data/issues.json'

export default function IssuesPage() {
  const issues = issuesData.issues
  return <IssueList issues={issues} />
}
```

The JSON is bundled at build time. No `getServerSideProps`, no API calls.

**Pattern 2: Read markdown files at build time** (for blog content)

```typescript
export default async function WritingPage() {
  const posts = await getWritingMeta({ status: 'published' })
  return <WritingList posts={posts} />
}
```

The `getWritingMeta` function reads `.md` files from disk, parses frontmatter, and returns metadata. This runs once at build time.

### Dynamic Routes with Static Params

Some pages use dynamic routes like `/making/issues/[project]/[number]`. Next.js needs to know which paths to pre-render:

```typescript
export function generateStaticParams() {
  return issues.map((issue) => ({
    project: issue.project,
    number: String(issue.number),
  }))
}
```

This generates a static HTML file for every issue at build time.

## The Content System

All long-form content lives as Markdown files:

```
content/
├── posts/          # Feed/blog posts
│   └── example-post.md
├── tutorials/      # Tutorial content
│   └── feeds-collectors-filter.md
└── writing/        # Writing section
    ├── why-we-build-in-open.md
    └── tools-for-thinkers.md
```

Each file has YAML frontmatter:

```yaml
---
title: "Post Title"
slug: post-slug
date: 2026-04-14
author: Innate Team
category: thought # thought | insight | log | article
tags: [tag1, tag2, tag3]
status: published # published | draft | archived
excerpt: Short summary for list views
---
```

### Content Pipeline

The rendering pipeline:

1. **Read** — `fs/promises` reads `.md` files from the `content/` directory
2. **Parse** — `gray-matter` extracts YAML frontmatter from the body
3. **Render** — `@uiw/react-markdown-preview` renders markdown with GitHub-style CSS, syntax highlighting, and dark mode
4. **Cache** — React `cache()` deduplicates reads during SSR

```typescript
// The core reading function
export const readFile = cache(
  async (relativePath: string): Promise<string | null> => {
    const fullPath = path.join(CONTENT_DIR, relativePath)
    return await fs.readFile(fullPath, "utf-8")
  }
)
```

## The Data Layer

Structured data (projects, issues, weekly summaries) is stored as JSON:

```
data/
├── issues.json       # GitHub issues across all repos
├── projects.json     # Repositories with AGENTS.md analysis
├── weekly.json       # Auto-generated weekly summaries
├── insights.json     # Curated reports and learnings
└── repos.json        # Raw repository list
```

These JSON files are updated by Node.js scripts that call the GitHub API, then committed to Git. At build time, Next.js imports them directly.

## The Rendering Decision

One interesting choice: we render markdown **client-side** using `@uiw/react-markdown-preview` rather than pre-rendering to HTML on the server.

Why?

1. **Interactive features** — the viewer needs to be a client component anyway (ToC tracking, tag clicks, theme switching)
2. **Consistent rendering** — the same component renders markdown everywhere (writing, feed, tutorials, insights)
3. **Bundle is acceptable** — the library is dynamically imported, so it doesn't block initial page load

```typescript
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
  loading: () => <Skeleton />,
})
```

The trade-off is that markdown content isn't visible to crawlers that don't execute JavaScript. For us, that's acceptable — the metadata (title, excerpt, tags) is in the HTML, and search engines handle this well.

## Deployment

Since the site is fully static, deployment options are unlimited:

| Platform             | Cost      | Setup                             |
| -------------------- | --------- | --------------------------------- |
| **GitHub Pages**     | Free      | Push `dist/` to `gh-pages` branch |
| **Vercel**           | Free tier | Connect repo, auto-deploys        |
| **Netlify**          | Free tier | Connect repo, auto-deploys        |
| **Cloudflare Pages** | Free      | Connect repo, edge CDN            |
| **Any static host**  | Varies    | Upload `dist/` folder             |

We use GitHub Pages for simplicity — the same repo that holds the code also hosts the built site.

## Performance

Static sites are fast by default. Our metrics:

- **First Contentful Paint**: < 100ms (HTML is pre-rendered)
- **Time to Interactive**: ~200ms (minimal JS for interactive components)
- **Bundle Size**: Dynamic imports keep initial load small
- **CDN Cache Hit**: ~99% (static files cache perfectly)

## What We'd Add Next

- **Search** — client-side full-text search with a pre-built index (Pagefind or similar)
- **RSS Feed** — auto-generate from writing content
- **OG Images** — pre-render social sharing images at build time
- **Webmentions** — static-friendly alternative to comments

> A static site isn't a limitation. It's a commitment to simplicity. Every feature we add has to work without a server — and that constraint leads to better architecture.
