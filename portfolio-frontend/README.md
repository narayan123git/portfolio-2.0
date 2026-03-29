# Portfolio Frontend

Next.js 16 frontend for the full-stack portfolio platform. This app renders all public pages and the private admin login page, while consuming API data through proxy-based routes.

## Highlights

- App Router architecture with server and client components.
- Rich homepage layout with portfolio stats and admin portal notice.
- Projects page filtering by Tech Stack and Language.
- Admin login with forgot-password workflow.
- Animated interactions (cursor, magnetic button, terminal mode).

## Recent Changes

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

## Key Paths

- `src/app/page.js` - Homepage
- `src/app/projects/page.js` - Projects listing and filters
- `src/app/admin/page.js` - Admin login and forgot-password form
- `src/components/admin/` - Admin dashboard modules
- `src/app/globals.css` - Global visual theme
