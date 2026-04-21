# Tempus Sales Copilot

AI-powered sales support for Tempus oncology reps.

## Three core capabilities

### 1. Rank
Territory dashboard with transparent opportunity scoring. Drag formula weights to re-rank live. Five-factor model: Volume Signal (35%) + Testing Gap (25%) + Engagement Recency (15%) + Expansion Potential (15%) + Decision-Maker Access (10%).

### 2. Prep
Physician-specific meeting scripts and grounded objection responses. Auto-generated from CRM notes and a Tempus product knowledge base. Standalone workbench lets you test objections against any physician before calls.

### 3. Coach
Live coaching overlay during calls. Captures objections via Web Speech API or text input, streams grounded responses in real-time, and writes CRM-ready summaries on session end.

## Tech Stack

Next.js 16 with App Router and server components. TypeScript. Tailwind v4 with CSS theme variables. Cerebras Chat API (models: qwen-3-235b for prep, llama3.1-8b for coaching). Web Speech API for transcription. Local JSON and Markdown data files.

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Paste your Cerebras API key if you have one
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app works fully offline with stub data if you skip the API key.

### Environment Variables

- `CEREBRAS_API_KEY` (optional): API key for live LLM completions. Without it, all responses are deterministic stubs.
- `CEREBRAS_STUB=1` (optional): Force stub mode even with a key present.                        |

## Project Layout

```
src/
├── app/
│   ├── page.tsx                   # Dashboard with editable scoring formula
│   ├── provider/[id]/page.tsx     # Provider detail view
│   ├── objections/page.tsx        # Standalone objection workbench
│   └── api/                       # Server-only LLM routes
│       ├── meeting-script/        # Generate prep for a physician
│       ├── objection/             # Generate grounded response
│       ├── objection-stream/      # Stream response for coaching (SSE)
│       ├── summary/               # Generate session summary
│       └── crm/                   # Atomic append to crm-notes.json
│
├── components/
│   ├── ui/                        # Base: Button, Card, Badge, Popover, ScoreBadge
│   ├── dashboard/                 # RankedDashboard, FormulaBar, ProviderTable, ScoreBreakdown
│   ├── provider/                  # PhysicianSelect, MeetingScript, ObjectionHandler, ProviderStats
│   ├── coaching/                  # CoachingPanel, TranscriptCapture, ResponseCard, SessionSummary
│   └── objections/                # ObjectionWorkbench
│
├── lib/
│   ├── cerebras.ts                # Completions, streaming, stub mode
│   ├── scoring.ts                 # Opportunity scoring with live weight edits
│   ├── status.ts                  # Account status (New/Active/At Risk)
│   ├── prompts.ts                 # System prompts for meeting script, objection, summary
│   ├── data.ts                    # Server loaders and atomic CRM writes
│   └── types.ts
│
└── data/
    ├── market-intelligence.json   # 5 providers, 10 physicians
    ├── crm-notes.json             # Interaction history
    └── product-knowledge.md       # Tempus test portfolio and specs
```

## Scoring Model

Opportunity scores (0 to 100) combine five weighted factors:

| Component             | Weight | What it measures |
|-----------------------|-------:|-------------|
| Volume signal         | 35%    | Patient population size vs your territory max |
| Testing gap           | 25%    | Untapped NGS ordering potential (low adoption = high gap) |
| Engagement recency    | 15%    | How warm the lead is (days since last contact) |
| Expansion potential   | 15%    | Available tests not yet adopted at the account |
| Decision-maker access | 10%    | Whether a key physician can move the deal |

Click any score badge on the dashboard to see the live breakdown. Drag the formula weights above the table to re-rank in real time.

## Features by View

**Dashboard (/)**
- Territory rank of 5 providers
- Editable formula weights with instant re-ranking
- Click any score to see component breakdown
- Territory stats: active, at-risk, new, average score

**Provider Detail (/provider/:id)**
- Physician selector for the account
- Chronological CRM interaction history
- Auto-generated meeting script
- Grounded objection handler (pre-populated from CRM notes)
- Account statistics and expansion potential
- "Start Coaching Session" entry point

**Objection Workbench (/objections)**
- Standalone form: pick any physician, enter any objection
- Five quick-pick objections for rehearsal
- Physician context sidebar
- Grounded response generation

**Coaching Overlay**
- Dark-themed modal, slides up from bottom
- Physician context (name, specialty, known objections)
- Speech recognition (mic button) or text input
- Streamed responses appear as cards in real-time
- Response includes acknowledgment, data point, reframe, and next step
- "End Session" generates summary, "Save to CRM" appends to crm-notes.json

## Verification

Run these to verify the full flow:

```bash
npm run dev          # Start dev server at localhost:3000
npx playwright test  # All 10 E2E tests pass
npm run build        # Production build succeeds
npx tsc --noEmit     # No TypeScript errors
```

Quick manual test:
1. Open dashboard. See 5 providers ranked.
2. Drag a weight slider. Ranking updates live.
3. Click a score. Breakdown popover appears.
4. Click a row. Land on provider detail.
5. Select a physician. Script and objection handler populate.
6. Click "Start Coaching Session". Overlay appears.
7. Type or speak an objection. Response streams in.
8. Click "End Session". Click "Save to CRM". New entry in crm-notes.json.

## Design Notes

This is a prototype with several intentional tradeoffs:

1. **Mock data**: Providers and CRM notes are local JSON. Production would integrate Salesforce, IQVIA, and internal product databases.
2. **Cerebras models**: Chosen for latency. Production might use larger models for prep quality and Cerebras only for real-time coaching.
3. **Web Speech API**: Chrome only. Production would use Deepgram or AssemblyAI for broader browser support.
4. **Single user**: No authentication. Production would support multi-rep territories and permission scoping.
5. **Fixed weights**: Scoring formula reflects prior beliefs. Production would calibrate against conversion data.
6. **Static product KB**: Tempus test portfolio lives in product-knowledge.md. Production would keep it current via nightly scraper.
