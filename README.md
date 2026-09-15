# PaySimple: AI-Powered Construction Contract Analysis & Pay Applications

## About This Project

**PaySimple is a portfolio project** that demonstrates AI product development skills combined with deep expertise in construction finance and construction contracts.

The project tackles real problems: construction contractors manually extract payment terms from contracts, build payment schedules in spreadsheets, struggle with compliance risks, and manage complex pay application workflows. PaySimple automates these workflows using Claude AI, combining technical product skills with domain knowledge from 5+ years of hands-on construction contract experience.

---

## What PaySimple Does

**PaySimple** extracts critical payment terms from construction contracts, auto-generates payment schedules, and flags compliance risks—all powered by Claude AI.

### Core Features

- **Contract Upload & Analysis**: Upload construction contracts (docx or PDF). Claude extracts payment terms, key dates, and risk flags in seconds.
- **Payment Schedule Generation**: Auto-generate schedules based on contract terms (progress draws, retainage, lien waivers, prompt payment rules).
- **Compliance Risk Detection**: Flag pay-when-paid vs. pay-if-paid clauses, retainage triggers, substantial completion dependencies, and state-specific prompt payment act violations.
- **Pay Application Management**: Complete pay application workflow with 6-step wizard, line item management, and automated calculations.
- **Database Integration**: Full PostgreSQL integration with Supabase for persistent storage, user management, and data security.
- **History & Corrections**: Complete audit trail with history views, corrected draft creation, and finalization workflows.
- **Export & Dashboard**: View results in-app, download schedules (Excel/PDF), manage multiple projects, and track payment application status.

### Why Construction-Specific?

Generic construction payment tools exist. But they don't understand construction contract nuances:
- Retainage release mechanics tied to substantial completion
- Construction payment application procedures
- Stored materials vs. incorporated materials distinctions
- State prompt payment law variations
- Lien waiver timing and release conditions

PaySimple speaks this language.

---

## Build Status

### ✅ **Completed Features**

#### **Pay Applications System (Production Ready)**
- **6-Step Wizard**: Consolidated from 12 steps for better UX
  - Step 1: Application Setup (merged Basics + Billing Format)
  - Step 2: Billing Settings (merged Retainage + Change Orders + Materials)
  - Step 3: Schedule of Values (merged SOV Method + Import + Manual)
  - Step 4: Workspace (full-screen line item management)
  - Step 5: Review & Submit (merged Summary + Checks + Checklist)
  - Step 6: Sign & Finalize (with certification and snapshot)
- **Database Integration**: Full PostgreSQL with Supabase
  - Server actions for CRUD operations
  - Row Level Security (RLS) policies
  - Optimistic updates with error handling
  - Type-safe data mapping
- **History Management**: Complete audit trail
  - History list with search and filtering
  - Detailed history views with payment summary calculations
  - Corrected draft creation from finalized apps
  - Finalization workflows with immutable snapshots
- **State Management**: Zustand store with TypeScript
  - Optimistic updates and rollback
  - Server action integration
  - Type safety throughout
  - Performance optimizations

#### **Core Infrastructure**
- **Next.js 14** with App Router and TypeScript
- **Supabase** for auth, database, and file storage
- **Tailwind CSS** with shadcn/ui components
- **Zustand** for state management
- **Responsive Design** with mobile support

### 🚧 **In Progress**

#### **Contract Analysis System**
- **Phase 1**: Foundation setup completed
- **Phase 2**: Payment schedule engine (in development)
- **Phase 3**: Compliance & risk flagging (planned)
- **Phase 4**: Dashboard & multi-project (planned)

---

## Technical Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind, shadcn/ui | Modern, type-safe, fast builds, accessible components out of the box |
| **AI Engine** | Claude 3.5 Sonnet via API | Superior reasoning for legal/financial documents, structured extraction, chain-of-thought |
| **Auth & Backend** | Supabase (PostgreSQL + auth) | Free tier suitable for MVP, built-in RLS, file storage, real-time DB |
| **State Management** | Zustand with TypeScript | Optimistic updates, server action integration, type safety |
| **Document Export** | `docx` (Word), `xlsx` (Excel), PDF (jsPDF) | Standard formats for contractors; Excel for payment scheduling is critical |
| **Deployment** | Vercel | Seamless Next.js integration, preview environments, serverless functions |

---

## Why This Project Signals Product Skills

### 1. **Not a Tutorial Clone**
This isn't a generic chatbot or "AI app template." It solves a specific market problem with domain-informed architecture.

### 2. **Thoughtful UX Decisions**
- **Upload-first, register-to-view**: Product decision that reduces friction (no signup friction) while capturing users (see value before committing).
- **Construction-focused feature set**: Not a catch-all; specificity shows product thinking (who is the user? what do they actually need?).
- **Multi-format export**: Users need Excel for their workflows; we export accordingly.

### 3. **Real API Integration**
Uses Claude API end-to-end, not just a UI wrapper. Demonstrates understanding of prompt engineering, structured outputs, error handling, and cost optimization.

### 4. **Database & Auth**
Real auth, user data persistence, and multi-tenancy with PostgreSQL and Supabase—not localStorage and in-memory state.

### 5. **Domain Expertise**
5+ years of hands-on construction contract experience means the feature set, risk flags, UX, and pay application workflows are credible. Not generic; genuinely informed by the problem space.

### 6. **Full-Stack Implementation**
Complete pay application system with database integration, state management, and production-ready architecture—not just UI mockups.

---



## Repository Structure

```
paysimple/
├── README.md                 # This file
├── PRODUCT_SPEC.md          # 20+ page spec (market, tech, UX, design)
├── build-plan.md            # Phased build timeline and milestones
├── next.config.js           # Next.js configuration
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts       # Tailwind setup
│
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   ├── upload/          # Upload flow
│   │   ├── dashboard/       # User dashboard (protected)
│   │   ├── pay-applications/ # Pay application system
│   │   │   ├── page.tsx     # Pay apps landing
│   │   │   ├── new/         # Entry choice
│   │   │   ├── history/     # History list/detail
│   │   │   ├── [id]/        # Dynamic pay app routes
│   │   │   │   ├── setup/   # Step 1: Application Setup
│   │   │   │   ├── billing-settings/ # Step 2: Billing Settings
│   │   │   │   ├── sov/     # Step 3: Schedule of Values
│   │   │   │   ├── workspace/ # Step 4: Line item management
│   │   │   │   ├── review/  # Step 5: Review & Submit
│   │   │   │   ├── sign/    # Step 6: Sign & Finalize
│   │   │   │   ├── complete/ # Success screen
│   │   │   │   └── corrected-draft/ # Correction workflow
│   │   │   ├── actions.ts   # Server actions
│   │   │   ├── store.ts     # Zustand store
│   │   │   ├── types.ts     # TypeScript types
│   │   │   └── calculations.ts # Pay app calculations
│   │   ├── api/             # API routes (Claude, exports, etc.)
│   │   └── auth/            # Supabase auth flows
│   │
│   ├── components/          # Reusable React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── pay-applications/ # Pay app specific components
│   │   │   ├── PayAppStepper.tsx
│   │   │   ├── WizardActionBar.tsx
│   │   │   └── ...
│   │   ├── UploadBox.tsx    # File upload widget
│   │   ├── ExtractionPreview.tsx
│   │   ├── PaymentSchedule.tsx
│   │   ├── RiskDashboard.tsx
│   │   └── ...
│   │
│   ├── lib/                 # Utilities and helpers
│   │   ├── claude.ts        # Claude API client
│   │   ├── supabase.ts      # Supabase client
│   │   ├── extraction.ts    # Payment term parsing logic
│   │   ├── schedule.ts      # Schedule calculation logic
│   │   ├── compliance.ts    # Risk detection logic
│   │   ├── exports.ts       # Excel, PDF, Word export functions
│   │   └── pdf/             # PDF processing utilities
│   │
│   ├── types/               # TypeScript interfaces
│   │   ├── contract.ts      # Contract and extraction types
│   │   ├── schedule.ts      # Schedule-related types
│   │   ├── risk.ts          # Risk flag types
│   │   └── pay-applications/ # Pay app types
│   │
│   └── styles/              # Global CSS
│       └── globals.css
│
├── public/                  # Static assets (logos, icons, etc.)
├── supabase/                # Supabase migrations and config
└── .env.example             # Environment variables template
```

---

## Getting Started (For Reviewers)

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic API key
- Supabase project (free tier)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd paysimple
npm install

# Configure environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_KEY, ANTHROPIC_API_KEY

# Run database migrations
npx supabase migration up

# Start dev server
npm run dev
```

Visit `http://localhost:3000` to:
- Upload contracts for analysis
- Create and manage pay applications
- View history and corrected drafts

### Key Features to Explore

1. **Pay Applications**: Navigate to `/pay-applications` to see the complete system
2. **6-Step Wizard**: Create a new pay app to experience the consolidated workflow
3. **History Management**: View past applications and create corrected drafts
4. **Database Integration**: All data persists in PostgreSQL with real-time updates

---

## Design Philosophy

- **Scope clarity**: Phased build with completed pay application system
- **Technical depth**: Next.js, Supabase, Zustand, TypeScript, full-stack architecture
- **Domain expertise**: construction contract knowledge shapes every feature (retainage, pay applications, compliance)
- **Product thinking**: Deliberate UX decisions (6-step consolidation, specific feature set, export flexibility)
- **Production-ready**: Complete implementation with database integration, not just mockups

---

## Future Scope (Post-MVP)

These are intentionally *not* in the current scope to keep focus tight:

### Contract Analysis Enhancements
- Team collaboration (share contracts, assign tasks)
- Contract comparison (side-by-side term diffing)
- Template library (pre-built risk checks for common contract variants)
- Webhook integration (e.g., notify when retainage release is due)

### Pay Application Extensions
- Integration with accounting software (QuickBooks, Sage, etc.)
- Mobile app (iOS/Android native for field-side access)
- Advanced reporting and analytics
- Multi-company support with role-based access

### AI & Automation
- Automated compliance checking across state lines
- AI-powered payment recommendations
- Predictive cash flow forecasting
- Smart document generation

---

## Current Status

**PaySimple is actively developed** with a production-ready Pay Applications system and ongoing contract analysis features. The project demonstrates:

- ✅ **Full-stack development** with database integration
- ✅ **Domain expertise** in construction contracts and construction finance
- ✅ **Product thinking** with user-centered design
- ✅ **Technical excellence** with TypeScript, modern React patterns, and scalable architecture

---

## License

This project is a portfolio demonstration. Use freely for learning purposes.