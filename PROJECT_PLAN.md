# PROJECT_PLAN.md - SOCIAL X-RAY Implementation Plan

## 1. Stack & Architecture Overview
- **Core Framework:** Next.js 15+ (App Router) + React 19 + TypeScript (Strict)
- **Styling:** Tailwind CSS + custom forensic theme tokens (Cyber Slate, Forensic Cyan, Spectral Amber, Friction Red)
- **Icons:** `lucide-react`
- **Text Extraction:**
  - `tesseract.js`: Client-side OCR with progress tracking worker
  - `pdfjs-dist`: Client-side structured text extraction from PDFs
- **AI Processing:** Server-side Route Handler `/api/analyze` using `openai` SDK with strict JSON output schema and goal-aware forensic prompting.

---

## 2. Phased Implementation Roadmap

### Phase 1: Project Setup & Core Configuration
1. Initialize Next.js 15 project with TypeScript, Tailwind CSS, and ESLint.
2. Install minimal production dependencies:
   - `lucide-react`
   - `tesseract.js`
   - `pdfjs-dist`
   - `openai`
   - `clsx` & `tailwind-merge`
3. Configure `tailwind.config.ts` and `globals.css` with dark forensic laboratory palette (carbon backgrounds, telemetry borders, glowing accents, grid background).
4. Configure `.env.example` and `.gitignore` to guarantee zero secrets in source control.

### Phase 2: Type Contracts & Schemas
1. Create `types/analysis.ts` defining:
   - `ForensicMetrics` (10 core metrics: Hook, Clarity, Cognitive Load, Emotional Impact, Curiosity, Conversation, Shareability, CTA, Value, Friction).
   - `FrictionPoint` (quote, character/line offset, severity, cause, repair).
   - `PostAutopsy` (primary weakness, secondary issue, hidden strength, clinical treatment).
   - `ConversationDNA` (encouraged action, conversational index, predicted audience reaction, high-conversion replacement question).
   - `RepairSuggestion` (original text, repaired text, explanation).
   - `PlatformVariants` (LinkedIn, Instagram, TikTok adapted versions).
   - `GoalType` ('conversation' | 'shares' | 'saves' | 'clicks' | 'followers' | 'awareness').
   - `AnalysisResult` (complete structured report payload).

### Phase 3: Extraction Engines
1. Implement `lib/extractors/pdfExtractor.ts`:
   - Uses `pdfjs-dist` to parse all pages of uploaded PDF.
   - Preserves logical paragraphs and line breaks.
2. Implement `lib/extractors/ocrExtractor.ts`:
   - Uses `tesseract.js` in a browser worker.
   - Provides live progress callback (0% - 100%) for smooth UI progress bar.
3. Add robust file validation utils (`lib/utils/fileValidation.ts`) checking MIME types, file extensions, and max file size (<10MB).

### Phase 4: Upload & Extraction Review UI
1. Build `components/upload/FileDropzone.tsx`:
   - Drag-and-drop zone with animated scanning border and file picker.
   - Live file preview (thumbnail for images, document badge for PDFs).
   - Clear validation error alerts for invalid types or oversize files.
2. Build `components/upload/GoalSelector.tsx`:
   - Interactive goal selection pills (Conversation, Shares, Saves, Clicks, Followers, Awareness).
3. Build `components/upload/ExtractionPreview.tsx`:
   - Shows extracted text in an editable laboratory textarea.
   - Allows users to review, format, and edit before initiating AI analysis.
   - Disables scanning if extracted text is empty with descriptive feedback.

### Phase 5: AI Forensic Analysis API
1. Build `app/api/analyze/route.ts`:
   - Validates input text and target goal.
   - Crafts a rigorous forensic prompt diagnosing where audience attention drops.
   - Enforces structured JSON output matching `AnalysisResult`.
   - Reads `OPENAI_API_KEY` securely from server environment, or accepts a client-provided key in headers if configured.
   - Implements error handling and rate-limit handling.

### Phase 6: Forensic Laboratory UI Components
1. Build `components/forensics/ScanningHUD.tsx`:
   - Animated forensic radar scan effect, spectrogram wave, and status telemetry.
2. Build `components/forensics/MetricsGrid.tsx`:
   - 10-metric telemetry cards with color-coded gauge bars and diagnostic badges.
3. Build `components/forensics/FrictionMap.tsx`:
   - Heatmap / attention drop timeline with severity tags (Critical, Moderate, Minor) and inline repairs.
4. Build `components/forensics/PostAutopsy.tsx`:
   - 4-quadrant diagnostic dossier (Primary weakness, Secondary issue, Hidden strength, Treatment).
5. Build `components/forensics/ConversationDNA.tsx`:
   - Deep conversational psychology breakdown and high-conversion replacement question.
6. Build `components/forensics/RepairDiff.tsx`:
   - Side-by-side / diff view of Original vs. Repaired post with one-click copy and rationale.
7. Build `components/forensics/PlatformVariants.tsx`:
   - Tabbed platform adaptation studio for LinkedIn, Instagram, and TikTok with copy buttons.

### Phase 7: Polish, Verification & Documentation
1. Integrate all modules into `app/page.tsx` with smooth transitions between Upload -> Extract -> Scan -> Forensic Report.
2. Test responsive layouts across mobile, tablet, and widescreen displays.
3. Verify production build (`npm run build`).
4. Write comprehensive `README.md` with features, setup guide, architecture breakdown, and screenshots/diagrams.
