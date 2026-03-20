# PaySimple - AI-Powered Construction Payment Scheduling

PaySimple lets construction contractors upload AIA contract documents (PDF/DOCX), uses Claude AI to extract payment terms, auto-generates a payment schedule with retainage calculations, flags compliance risks, and lets users export as PDF/CSV.

## Tech Stack

- **Framework**: Next.js 14+ with App Router, TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4+ with custom brand colors
- **Component library**: shadcn/ui (New York style, slate color, CSS variables)
- **Database & auth**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Anthropic Claude API via `@anthropic-ai/sdk` 
- **PDF parsing**: `pdf-parse` for text extraction from uploaded contracts
- **PDF generation**: `@react-pdf/renderer` for export
- **CSV export**: `papaparse` 
- **State management**: React Server Components + Server Actions
- **Validation**: `zod` for all schemas
- **Package manager**: pnpm

## Getting Started

1. **Install dependencies**:
```bash
pnpm install
```

2. **Set up environment variables**:
```bash
cp .env.local.example .env.local
# Fill in your Supabase and Anthropic API keys
```

3. **Set up Supabase**:
- Create a new Supabase project
- Run the migration file: `supabase/migrations/001_initial_schema.sql`
- Copy your Supabase URL and keys to `.env.local`

4. **Run the development server**:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
paysimple/
├── app/
│   ├── (auth)/                    # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── layout.tsx            # Dashboard shell with sidebar
│   │   ├── page.tsx              # Project dashboard
│   │   └── projects/[id]/        # Individual project pages
│   │       ├── page.tsx          # Project overview
│   │       ├── review/page.tsx   # AI extraction review
│   │       ├── schedule/page.tsx # Payment schedule table
│   │       ├── compliance/page.tsx # Compliance flags
│   │       └── export/page.tsx   # Export & share
│   ├── api/                      # API routes
│   │   └── projects/             # Project CRUD operations
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Tailwind styles
├── components/
│   ├── ui/                       # shadcn components
│   ├── layout/                   # Layout components
│   └── [feature]/                # Feature-specific components
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client setup
│   ├── ai/                       # Claude AI integration
│   ├── pdf/                      # PDF processing
│   ├── schedule/                 # Payment calculations
│   └── compliance/               # Compliance checking
├── types/                        # TypeScript definitions
└── supabase/migrations/          # Database schema
```

## Brand Colors

The app uses a custom color palette:
- **Navy** (`#1B4F72`): Primary brand, headers, nav, primary buttons
- **Steel** (`#2E86C1`): Interactive elements, links, hover states
- **Concrete** (`#F2F4F5`): Page backgrounds
- **Slate** (`#2C3E50`): Body text
- **Warm White** (`#FAFBFC`): Card backgrounds
- **Success** (`#27AE60`): Success states
- **Warning** (`#F39C12`): Warning states
- **Danger** (`#E74C3C`): Error states
- **Gold** (`#D4A843`): Accent color

## Features

### Current Status: ✅ Scaffold Complete

The project scaffold is complete with:
- ✅ Full project structure and routing
- ✅ Tailwind CSS configured with brand colors
- ✅ shadcn/ui components integrated
- ✅ Supabase client setup (browser + server + middleware)
- ✅ Authentication middleware protecting dashboard routes
- ✅ Landing page with hero section and CTAs
- ✅ Dashboard layout with sidebar navigation
- ✅ Step-bar component for project workflow
- ✅ All project route pages (review, schedule, compliance, export)
- ✅ Database schema with RLS policies
- ✅ TypeScript types for all data models
- ✅ Zero TypeScript compilation errors

### Next Steps

The scaffold is ready for feature implementation:
1. **AI Integration**: Set up Claude API for contract analysis
2. **PDF Processing**: Implement text extraction and generation
3. **Database Operations**: Connect frontend to Supabase
4. **Authentication**: Implement login/signup flows
5. **File Upload**: Handle contract document uploads
6. **Business Logic**: Payment calculations and compliance checking

## Deployment

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
