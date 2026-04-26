# Portfolio Frontend

Next.js 16 frontend for the full-stack portfolio platform. This app renders all public pages and the private admin login page, while consuming API data through proxy-based routes.

## Highlights

- App Router architecture with server and client components.
- Rich homepage layout with portfolio stats and admin portal notice.
- Projects page supports server-rendered SEO content with client-side Tech Stack and Language filters.
- Blogs and diary pages are server-rendered for crawlable HTML output.
- Dynamic `robots.txt` and `sitemap.xml` routes for search engine discovery.
- Admin login with forgot-password workflow.
- Animated interactions (cursor, magnetic button, terminal mode).

## Recent Changes

- Added SEO-friendly server rendering for blog, project, and diary routes.
- Added structured metadata and route handlers for `sitemap.xml` and `robots.txt`.
- Introduced shared URL config helper for consistent backend/frontend env handling.
- Updated custom cursor to keep native cursor behavior with subtle visual accent.
- Added UI support for admin forgot-password flow.
- Projects page no longer uses text search; now focuses on stack and language filters.
- Applied visual redesign updates in global styles, navbar, footer, and shared page atmosphere.
- Added support in skill displays for custom details entered under Other category.
- Expanded homepage with featured projects, latest writing section, capability highlights, and stronger narrative content.
- Download CV links now normalize external URLs and open in a new tab for Drive-based resumes.

## Environment Variables

Create a `.env` file in this folder:

```env
INTERNAL_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Optional fallback used by metadata/site URL logic:

```env
FRONTEND_URL=http://localhost:3000
```

## Local Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Then open http://localhost:3000.

### SEO Endpoints

- http://localhost:3000/robots.txt
- http://localhost:3000/sitemap.xml

## Key Paths

- `src/app/page.js` - Homepage
- `src/app/projects/page.js` - Projects SEO wrapper (server-rendered)
- `src/components/ProjectsClient.js` - Projects interactive client UI
- `src/app/blogs/page.js` - Blogs listing (server-rendered)
- `src/app/blogs/[slug]/page.js` - Blog details + structured metadata
- `src/app/diary/page.js` - Diary timeline (server-rendered)
- `src/app/sitemap.xml/route.js` - XML sitemap route
- `src/app/robots.txt/route.js` - Robots route
- `src/lib/siteConfig.js` - Shared site/API URL resolution
- `src/app/admin/page.js` - Admin login and forgot-password form
- `src/components/admin/` - Admin dashboard modules
- `src/app/globals.css` - Global visual theme
