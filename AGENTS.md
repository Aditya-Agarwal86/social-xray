# AGENTS.md - SOCIAL X-RAY Architecture & Development Rules

## 1. Project Mission & Identity
**SOCIAL X-RAY** is an AI-powered social content forensics platform. Its core purpose is not to output vanity scores, but to diagnose **where audience attention and engagement break down** and prescribe specific repairs.

- **Brand:** SOCIAL X-RAY
- **Tagline:** "Find the moment your audience stops caring."
- **Aesthetic:** High-precision AI Forensic Laboratory (dark carbon `#090B10`, restrained spectral accents, monospace telemetry typography, scanning reticles, zero decorative AI blobs/stock illustrations).

---

## 2. Core Architecture Rules

### 2.1 Minimalist Dependency Stack
- **Framework:** Next.js 15+ (App Router), TypeScript (strict mode), React 19.
- **Styling:** Tailwind CSS with custom forensic design tokens (no bulky component suites).
- **Icons:** `lucide-react`.
- **Extraction:**
  - Client-side Image OCR: `tesseract.js` (runs in browser Web Workers for zero server load and instant progress metrics).
  - Client-side PDF Extraction: `pdfjs-dist` (direct in-browser text extraction preserving lines and structure).
- **AI Backend:** Next.js Route Handlers (`/api/analyze`) using official SDK (`openai`), reading `OPENAI_API_KEY` from server environment, with optional client key override support.
- **No Unnecessary Infrastructure:** No database, no auth, no social media scrapers, no analytics bloatware.

### 2.2 Security & Secrets Policy
- **ZERO SECRETS IN CODE OR GIT:** Never hardcode API keys, tokens, or credentials anywhere in the repository.
- Use `.env.local` for local secrets (strictly added to `.gitignore`).
- Provide `.env.example` with blank keys and clear documentation.
- The `/api/analyze` route must safely validate request bodies and securely query the AI provider without leaking secrets to the client.

### 2.3 Zero Mocking & Real-World Reliability
- **No fake APIs or simulated fake backend functions.** The backend `/api/analyze` must be a genuine, functioning LLM endpoint with structured JSON schema outputs.
- If an API key is missing or an error occurs, provide transparent, informative forensic error states with actionable user guidance and client-side key configuration options.

### 2.4 Content Extraction Integrity
- Always display extracted text in a review/edit panel before running AI diagnostics.
- Never silently process empty or unextractable files.
- Provide explicit file validation:
  - Allowed types: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`.
  - Max file size: 10MB.
  - Granular error alerts for corrupt files or non-text images.

### 2.5 Diagnostic Output Schema
The AI forensic analysis must return strict structured JSON matching the core product components:
1. **Executive Metrics:** Hook Strength, Clarity, Cognitive Load, Emotional Impact, Curiosity, Conversation Potential, Shareability, CTA Quality, Audience Value, Friction Score.
2. **Engagement Friction Map:** Ordered array of specific text fragments where attention drops, severity (`critical` | `moderate` | `minor`), root cause, and immediate repair.
3. **Post Autopsy:** Primary cause of weakness, secondary issue, hidden strength, recommended treatment.
4. **Conversation DNA:** Action encouraged, conversational quality, predicted audience reaction, high-conversion replacement question.
5. **Repair Diff:** Line-by-line / section-by-section comparison (Original vs. Repaired) with rationale.
6. **Platform Variants:** Tailored adaptations for LinkedIn, Instagram, and TikTok.
7. **Goal-Adaptive Insights:** Dynamic recommendations tuned to the user's selected objective (Conversation, Shares, Saves, Clicks, Followers, Awareness).

---

## 3. Code Quality Standards
- **TypeScript:** Strict types everywhere; define shared schemas in `types/analysis.ts`.
- **Component Architecture:** Single-responsibility components separated into UI building blocks (`components/ui/`), forensic diagnostic panels (`components/forensics/`), and upload/extraction modules (`components/upload/`).
- **Responsive Design:** Mobile-first, fully tested across desktop, tablet, and mobile viewports.
- **Error Boundaries & Loading States:** Dedicated scanning radar animations, OCR progress bars, and resilient try/catch error boundaries.
