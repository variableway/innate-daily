---
title: "Charts & Diagrams with Mermaid"
slug: demo-charts
date: 2026-05-28
author: Blog Team
category: article
tags: [mermaid, diagrams, charts, visualization]
status: published
excerpt: "A demonstration of Mermaid diagram support in our blog. Includes flowcharts, sequence diagrams, and more."
---

## Mermaid Diagrams

Our blog now supports **Mermaid** diagrams directly in Markdown code blocks. Just write:

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix Issues]
    E --> B
    C --> F[Deploy]
```

## Flowchart Example

```mermaid
flowchart LR
    subgraph Frontend
        A[React App]
        B[Next.js]
    end
    subgraph Backend
        C[API Routes]
        D[Database]
    end
    A --> B
    B --> C
    C --> D
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    User->>Browser: Open /writing
    Browser->>Server: GET posts
    Server-->>Browser: JSON data
    Browser->>Browser: Render list
    User->>Browser: Click post
    Browser->>Browser: Show content
```

## Code Highlighting

With **Shiki** (rehype-pretty-code), code blocks look stunning:

```typescript
// Example: Blog post loader
async function getPost(slug: string): Promise<Post | null> {
  const content = await readFile(`writing/${slug}.md`)
  if (!content) return null

  const { meta, body } = parseFrontmatter(content)
  return { meta, content: body }
}
```

## Tables

| Feature         | rehype-highlight | rehype-pretty-code (Shiki) |
| --------------- | ---------------- | -------------------------- |
| Quality         | Good             | Best (VS Code)             |
| Languages       | ~190             | 200+                       |
| Themes          | Few              | VS Code themes             |
| Line numbers    | No               | Yes                        |
| Highlight lines | No               | Yes                        |
| Server render   | Yes              | Yes                        |
