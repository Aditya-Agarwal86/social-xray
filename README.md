# Social X-Ray

> **AI Social Content Forensics**  
> *"Find the moment your audience stops caring."*

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-Forensic_Theme-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat&logo=google)](https://aistudio.google.com/)
[![Zero Secrets](https://img.shields.io/badge/Secrets-Zero_Committed-emerald)](#environment-variables)

---

## Overview

### The Problem
Traditional social-media analytics tools often provide superficial, generic vanity scores (such as *"Engagement Score: 74/100"* or *"Great readability!"*). These numbers tell creators that a post underperformed, but fail to explain **where**, **why**, or **how** audience attention was lost.

### The Solution
**Social X-Ray** functions as a digital content forensics laboratory. Rather than predicting future algorithmic reach, it performs a structural and psychological autopsy on social copy to pinpoint attention friction, identify cognitive drag, diagnose weak conversation triggers, and prescribe surgical text repairs.

---

## Features

- **PDF Upload**: Accepts PDF carousel documents and multi-page text assets.
- **Image Upload**: Supports PNG, JPG/JPEG, and WEBP screenshot or graphic uploads.
- **Drag-and-Drop & File Picker**: Intuitive ingestion dropzone with keyboard accessibility (`Space`/`Enter` support).
- **Client-Side PDF Extraction**: In-browser text parsing preserving paragraph breaks and page counts via `pdfjs-dist`.
- **In-Browser OCR**: Optical character recognition running directly in browser Web Workers via `tesseract.js` with live multi-stage progress telemetry (0%–100%).
- **AI Analysis Engine**: Structured forensic analysis powered by the official Google Gemini SDK (`@google/genai`).
- **Engagement Friction Map**: Highlights specific dropoff sentences, classifies friction severity (*Critical*, *Moderate*, *Minor*), and details psychological disengagement causes.
- **Post Autopsy Dossier**: Clinical 4-quadrant breakdown containing Primary Cause of Weakness, Secondary Bottleneck, Hidden Core Strength, and Recommended Treatment Protocol.
- **Conversation DNA**: Diagrams the psychological reaction sequence (*Post Delivered $\rightarrow$ Audience Reaction $\rightarrow$ Induced Action $\rightarrow$ Conversation Opportunity $\rightarrow$ High-Conversion Question*).
- **Surgical Repair Diff**: Side-by-side comparison between the original copy and an improved high-retention version with forensic rationales.
- **Platform Variants**: Generates tailored copy adaptations for LinkedIn, Instagram, and TikTok with 1-click copy buttons.
- **Goal-Based Recommendations**: Dynamic strategic adjustments calibrated to the creator's target objective (*Conversation*, *Shares*, *Saves*, *Clicks*, *Followers*, or *Awareness*).
- **Try a Demo Post**: Built-in benchmark weak post for 1-click end-to-end testing without requiring a file upload.

---

## Architecture

Social X-Ray processes all files locally in the browser, keeping client credentials secure and eliminating server-side file hoarding.

```
Browser (User Upload: PDF / Image / Direct Text / Demo)
  │
  ▼
Client Extraction Pipeline (pdfjs-dist / Tesseract.js Web Worker)
  │
  ▼
Normalized Content (Structure parsing, length checks & editable review panel)
  │
  ▼
Secure Server Route (POST /api/analyze with validation & sanitization)
  │
  ▼
Google Gemini API (Deterministic structured schema generation)
  │
  ▼
Analysis Normalizer & Validator (Dual-pass parser & fallback protection)
  │
  ▼
Forensic Results Dashboard (Metrics Grid, Friction Map, Autopsy & Variants)
```

---

## Technology

This application intentionally avoids bloated component libraries and scrapers, using only essential, modern technologies:

- **Framework**: Next.js 15+ (App Router), React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with custom forensic design tokens
- **AI SDK**: `@google/genai` (Official Google Gemini JavaScript SDK)
- **PDF Extraction**: `pdfjs-dist` (Client-side)
- **OCR Engine**: `tesseract.js` (Client-side Web Worker)
- **Icons**: `lucide-react`
- **Class Utilities**: `clsx`, `tailwind-merge`

---

## Local Development

### Prerequisites
- Node.js `18.18.0` or higher (tested on Node `22.x`)
- npm `9.x` or higher

### 1. Clone & Install
```bash
git clone https://github.com/your-username/social-xray.git
cd social-xray
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Google Gemini API key to `.env.local`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
```
*(Note: You can also leave `.env.local` blank and enter a client API key directly in the web UI via "Configure API Key").*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Yes* | Google Gemini API key for server-side AI execution. Obtain at [Google AI Studio](https://aistudio.google.com/app/apikey). |
| `GEMINI_MODEL` | No | Optional model override (defaults to `gemini-3.5-flash`). |

*\* Can also be provided dynamically in the client via UI settings (stored only in the user's browser `localStorage`).*

**Security Guarantee**: No secrets or credentials are hardcoded or committed to version control.

---

## AI Analysis & Scoring Philosophy

Social X-Ray evaluates post copy using cognitive and structural dimensions:

1. **Hook Velocity**: Ability of the first 3 lines to disrupt feed momentum.
2. **Signal Clarity**: Absence of throat-clearing, fluff, and unnecessary corporate jargon.
3. **Cognitive Ease**: Pacing, paragraph structure, and mental parsing effort.
4. **Emotional Tension**: Reader stakes, empathy, or intellectual intrigue.
5. **Curiosity Gap**: Open loops that compel the reader to continue.
6. **Conversation Catalyst**: Whether the post prompts debate versus delivering a passive lecture.
7. **Social Currency**: Likelihood that sharing enhances the reader's professional standing.
8. **CTA Sharpness**: Urgency and simplicity of the closing call-to-action.
9. **Audience Utility**: Actionable reference frameworks and save-worthy takeaways.

> [!IMPORTANT]
> **Non-Predictive Disclaimer**: Social X-Ray provides structural, content-based forensic analysis and copywriting repair suggestions. It does not scrape platform feeds, track private user accounts, or guarantee future algorithm impressions or viral engagement results.

---

## Error Handling

The application provides transparent error recovery across all failure modes:

- **Unsupported Files**: Enforces valid MIME types and extensions (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`).
- **Oversized Files**: Rejects uploads exceeding the 10MB threshold.
- **Corrupted / Scanned PDFs**: Detects unreadable or empty PDFs and offers OCR recovery guidance.
- **Unreadable Images**: Handles non-text graphics with explicit `OCR_NO_TEXT` alerts.
- **Missing API Key**: Returns HTTP 401 with `AUTH_KEY_MISSING` and opens an in-app key modal.
- **Rate Limits & Failures**: Maps Gemini HTTP 429 and 500 statuses into clear, actionable retry prompts.
- **Timeouts**: Client fetch aborts gracefully after 45 seconds if upstream networks stall.

---

## Deployment

### Deploying on Vercel
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. In Project Settings $\rightarrow$ Environment Variables, add:
   - `GEMINI_API_KEY` = `your_gemini_api_key`
4. Deploy.

### Production Node.js Build
```bash
npm run build
npm run start
```

---

## Project Structure

```text
social-xray/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # Server-side Gemini API route handler
│   ├── favicon.ico
│   ├── globals.css               # Forensic theme & X-ray animations
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Complete single-page forensic workbench
├── components/
│   ├── forensics/
│   │   ├── ConversationDNA.tsx   # Psychological cascade & catalyst question
│   │   ├── DiagnosticReport.tsx  # Coordinated full report & print/export
│   │   ├── FrictionMap.tsx       # Interactive dropoff inspection map
│   │   ├── GoalAdaptiveCard.tsx  # Objective alignment insights
│   │   ├── MetricsGrid.tsx       # Overall score & 9 Signal Cards
│   │   ├── PlatformVariants.tsx  # LinkedIn, Instagram & TikTok mutations
│   │   ├── PostAutopsy.tsx       # Cause of death & clinical quadrants
│   │   ├── RepairDiff.tsx        # Original vs. Repaired comparative diff
│   │   └── ScanningHUD.tsx       # 6-stage animated analysis sequence
│   ├── ui/
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Header.tsx
│   │   ├── ScoreCountUp.tsx      # Smooth score count-up component
│   │   └── XRayScanOverlay.tsx   # Hairline reticles & scanning beam
│   └── upload/
│       ├── ApiKeyModal.tsx       # Client Gemini API key configuration
│       ├── ExtractionPreview.tsx # Editable extracted copy preview panel
│       ├── FileDropzone.tsx      # Multi-format drag-and-drop dropzone
│       └── GoalSelector.tsx      # Target engagement objective selector
├── lib/
│   ├── analysis/
│   │   ├── geminiService.ts      # Server-side @google/genai engine
│   │   ├── index.ts
│   │   ├── prompt.ts             # Forensic system & user prompt builder
│   │   ├── types.ts              # Analysis schema type definitions
│   │   └── validator.ts          # Schema validation & fallback recovery
│   ├── extraction/
│   │   ├── index.ts
│   │   ├── ocr.ts                # Client-side Tesseract.js worker
│   │   ├── pdf.ts                # Client-side pdfjs-dist worker
│   │   └── types.ts              # Extraction normalization schemas
│   └── utils/
│       ├── cn.ts                 # Classname merge utility
│       ├── fileValidation.ts     # MIME & file size guardrails
│       └── formatters.ts         # Reading time, score colors & formatting
├── scripts/
│   └── test-validation.ts        # Unit & integration test specifications
├── .env.example                  # Environment variable template
├── AGENTS.md                     # Architectural rules & constraints
├── APPROACH.md                   # Concise 200-word design approach
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Testing

Run the automated test suite covering file validation, extraction errors, prompt construction, and schema normalization:

```bash
# Run unit & schema integration tests
npm test

# Run Next.js and ESLint code checks
npm run lint

# Run strict TypeScript validation
npx tsc --noEmit

# Test production build compilation
npm run build
```

---

## Limitations

- **Content-Based Heuristics**: Social X-Ray evaluates post copy and structure. It cannot account for account follower count, posting time, platform algorithmic volatility, or external creator authority.
- **OCR Quality**: Client-side OCR accuracy depends on image resolution, typography clarity, and background contrast.
- **No Direct Social Platform Integrations**: The application intentionally does not connect to external social network APIs or scrape personal accounts.
- **Non-Guaranteed Reach**: High forensic scores do not guarantee viral engagement or specific view counts.

---

## License

MIT License. Built for creators, founders, and content engineers.
