# OSINT Super App

## Overview

This is an OSINT (Open Source Intelligence) web application that allows users to query various intelligence tools across different target categories (Username, Email, Domain, IP). The app provides a unified interface to execute multiple OSINT tools in parallel and display results in a clean, modern UI.

The architecture follows a full-stack TypeScript monorepo pattern with a React frontend, Express backend, and PostgreSQL database. Tools are registered in the database with their integration methods (API or web-based), and the system routes queries to appropriate tools based on the selected category.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for smooth transitions
- **Build Tool**: Vite with hot module replacement

The frontend uses a sidebar-based layout where users select a target category, enter a query, and execute OSINT tools. Results are displayed as animated cards showing tool status, execution time, and returned data.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Validation**: Zod schemas shared between frontend and backend
- **API Design**: RESTful endpoints defined in shared route contracts

Key endpoints:
- `GET /api/tools` - List all registered tools
- `GET /api/categories` - Get unique tool categories
- `POST /api/osint/execute` - Execute tools for a category/query

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with migrations in `./migrations`

The `tools` table stores OSINT tool configurations including name, category, integration method (api/web), URL template with `<query>` placeholder, and optional config for auth tokens.

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Database schemas and Zod validation types
- `routes.ts` - API contract definitions with request/response schemas

This ensures type safety across the full stack.

### Build Configuration
- Development: `tsx` for running TypeScript directly
- Production: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Path aliases: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage (available but not currently used)

### UI Components
- **shadcn/ui**: Full component library (new-york style) with Radix UI primitives
- **Tailwind CSS**: Utility-first styling with custom theme extensions
- **Lucide React**: Icon library

### OSINT Tool Integrations
Tools are configured dynamically in the database. Each tool specifies:
- Integration method: `api` (direct fetch) or `web` (returns URL for manual access)
- URL template: Contains `<query>` placeholder for target substitution
- Optional config: For API keys or authentication headers

The system executes API tools with a 10-second timeout and returns structured results including execution time and status.

### Fonts
- Inter (sans-serif)
- JetBrains Mono (monospace)
- Space Grotesk (display headings)