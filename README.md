# PaySimple: AI-Powered AIA Construction Contract Analysis

## About This Project

**PaySimple is a portfolio project** that demonstrates AI product development skills combined with deep expertise in construction finance and AIA contracts.

The project tackles a real problem: construction contractors manually extract payment terms from AIA contracts, build payment schedules in spreadsheets, and struggle with compliance risks. PaySimple automates this workflow using Claude AI, combining technical product skills with domain knowledge from 5+ years of hands-on AIA contract experience.

---

## What PaySimple Does

**PaySimple** extracts critical payment terms from AIA construction contracts, auto-generates payment schedules, and flags compliance risks—all powered by Claude AI.

### Core Features

- **Contract Upload & Analysis**: Upload AIA construction contracts (docx or PDF). Claude extracts payment terms, key dates, and risk flags in seconds.
- **Payment Schedule Generation**: Auto-generate schedules based on contract terms (progress draws, retainage, lien waivers, prompt payment rules).
- **Compliance Risk Detection**: Flag pay-when-paid vs. pay-if-paid clauses, retainage triggers, substantial completion dependencies, and state-specific prompt payment act violations.
- **Export & Dashboard**: View results in-app, download schedules (Excel/PDF), and manage multiple projects.

### Why AIA-Specific?

Generic construction payment tools exist. But they don't understand AIA nuances:
- Retainage release mechanics tied to substantial completion
- G702/G703 payment application procedures
- Stored materials vs. incorporated materials distinctions
- State prompt payment law variations
- Lien waiver timing and release conditions

PaySimple speaks this language.

---

## Build Plan (8 Weeks, Phased)

This project is built in phases to keep scope manageable, reduce risk, and deliver value incrementally.

### Phase 1: Foundation (Weeks 1–2)
**Goal**: Core AI extraction pipeline, basic UX, upload-to-results flow.

- [ ] Set up Next.js 14 project with TypeScript, Tailwind, shadcn/ui
- [ ] Configure Supabase (auth, file storage, database)
- [ ] Design and build landing page (copy, value prop, upload CTA)
- [ ] Implement Claude API integration (contract analysis prompts)
- [ ] Build basic upload modal and file handling
- [ ] Create extraction preview component (show Claude output)
- [ ] Implement signup gate (view results only after registration)

**Output**: Users can upload contracts, see extracted terms in real-time, and sign up to unlock full results.

---

### Phase 2: Payment Schedule Engine (Weeks 3–4)
**Goal**: Auto-generate payment schedules from extracted terms.

- [ ] Build schedule calculation logic (progress draws, retainage, release conditions)
- [ ] Implement timeline visualization (milestones, draws, retainage release)
- [ ] Design Schedule of Values editor (edit extracted amounts, sequence)
- [ ] Export schedules to Excel (using `xlsx` library)
- [ ] Add PDF export (using `pdf` library with formatting)
- [ ] Create schedule comparison view (original contract vs. simplified schedule)

**Output**: Users can generate, edit, and export payment schedules. Schedules reflect actual contract terms.

---

### Phase 3: Compliance & Risk Flagging (Weeks 5–6)
**Goal**: Deep compliance analysis and risk scoring.

- [ ] Build risk detection logic (pay-when-paid, pay-if-paid, retainage triggers)
- [ ] Implement state-specific prompt payment law checks (50+ states)
- [ ] Design risk dashboard (high/medium/low severity, mitigation suggestions)
- [ ] Add lien waiver tracking (release dates, party requirements)
- [ ] Create compliance export (audit-ready PDF with flagged items)
- [ ] Build Claude-powered risk explanation (why this flag matters)

**Output**: Users see detailed compliance risks with explanations and mitigation steps.

---

### Phase 4: Dashboard & Multi-Project (Weeks 7–8)
**Goal**: Full product experience, project management, persistence.

- [ ] Build project dashboard (list, create, delete, archive)
- [ ] Implement user project history (retrieve past analyses)
- [ ] Add favorites/tagging (organize contracts by project, client, status)
- [ ] Design results summary view (one-page overview of key terms + risks)
- [ ] Add sharing & collaboration scaffolding (future: team features)
- [ ] Polish UX, test flows end-to-end, performance optimization
- [ ] Deploy to Vercel, set up monitoring and error tracking

**Output**: Production-ready product. Users manage multiple contracts, see history, export everything.

---

## Technical Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind, shadcn/ui | Modern, type-safe, fast builds, accessible components out of the box |
| **AI Engine** | Claude 3.5 Sonnet via API | Superior reasoning for legal/financial documents, structured extraction, chain-of-thought |
| **Auth & Backend** | Supabase (PostgreSQL + auth) | Free tier suitable for MVP, built-in RLS, file storage, real-time DB |
| **Document Export** | `docx` (Word), `xlsx` (Excel), PDF (jsPDF) | Standard formats for contractors; Excel for payment scheduling is critical |
| **Deployment** | Vercel | Seamless Next.js integration, preview environments, serverless functions |

---

## Why This Project Signals Product Skills

### 1. **Not a Tutorial Clone**
This isn't a generic chatbot or "AI app template." It solves a specific market problem with domain-informed architecture.

### 2. **Thoughtful UX Decisions**
- **Upload-first, register-to-view**: Product decision that reduces friction (no signup friction) while capturing users (see value before committing).
- **AIA-focused feature set**: Not a catch-all; specificity shows product thinking (who is the user? what do they actually need?).
- **Multi-format export**: Users need Excel for their workflows; we export accordingly.

### 3. **Real API Integration**
Uses Claude API end-to-end, not just a UI wrapper. Demonstrates understanding of prompt engineering, structured outputs, error handling, and cost optimization.

### 4. **Database & Auth**
Real auth, user data persistence, and multi-tenancy scaffolding—not localStorage and in-memory state.

### 5. **Domain Expertise**
5+ years of hands-on AIA contract experience means the feature set, risk flags, and UX are credible. Not generic; genuinely informed by the problem space.

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
│   │   ├── api/             # API routes (Claude, exports, etc.)
│   │   └── auth/            # Supabase auth flows
│   │
│   ├── components/          # Reusable React components
│   │   ├── ui/              # shadcn/ui components
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
│   │   └── exports.ts       # Excel, PDF, Word export functions
│   │
│   ├── types/               # TypeScript interfaces
│   │   ├── contract.ts      # Contract and extraction types
│   │   ├── schedule.ts      # Schedule-related types
│   │   └── risk.ts          # Risk flag types
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

Visit `http://localhost:3000` to upload a contract.

---

## Design Philosophy

- **Scope clarity**: 8-week phased build plan with concrete milestones
- **Technical depth**: Next.js for rapid iteration, Supabase for auth/storage, Claude API for extraction, multi-format exports
- **Domain expertise**: AIA contract knowledge shapes every feature (retainage, lien waivers, compliance risks, prompt payment laws)
- **Product thinking**: Deliberate UX decisions (upload-first, AIA-specific feature set, export flexibility)
- **Full-stack**: Frontend, backend, AI, database, auth, and exports

---

## Future Scope (Post-MVP)

These are intentionally *not* in the 8-week build to keep scope tight:

- Team collaboration (share contracts, assign tasks)
- Contract comparison (side-by-side term diffing)
- Template library (pre-built risk checks for common AIA variants)
- Webhook integration (e.g., notify when retainage release is due)
- Mobile app (iOS/Android native for field-side access)
- Integration with accounting software (QuickBooks, Sage, etc.)

---

## License

This project is a portfolio demonstration. Use freely for learning purposes.