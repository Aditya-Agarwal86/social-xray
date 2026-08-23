# REQUIREMENTS.md - Requirements to Implementation Matrix

## 1. Overview
This document maps every requirement specified for **SOCIAL X-RAY (AI Social Content Forensics)** to its architectural component, technical implementation, and verification criteria.

---

## 2. Technical Assessment Requirements Matrix

| # | Requirement | Implementation Strategy | Key Module / Component | Verification Criteria |
|---|---|---|---|---|
| **1** | **PDF Upload** | File input & drag-and-drop listener filtering for `application/pdf`. Validates extension & MIME type. | `components/upload/FileDropzone.tsx` | Uploading a `.pdf` file passes validation and transitions to PDF text extraction. |
| **2** | **Image Upload** | Multi-format image loader supporting `.png`, `.jpg`, `.jpeg`, `.webp`. | `components/upload/FileDropzone.tsx` | PNG, JPG, WEBP files load preview thumbnail and initiate OCR extraction. |
| **3** | **Drag-and-Drop** | Native HTML5 drag/drop API with visual dropzone border state and overlay cues. | `components/upload/FileDropzone.tsx` | Dragging files over the zone highlights the drop target; dropping triggers processing. |
| **4** | **File Picker Upload** | Hidden native file input triggered via styled interactive button or zone click. | `components/upload/FileDropzone.tsx` | Clicking the zone opens the native OS file picker dialog. |
| **5** | **PDF Text Extraction** | Client-side `pdfjs-dist` reading PDF text content line-by-line and preserving paragraph structure. | `lib/extractors/pdfExtractor.ts` | Extracted text appears in preview panel with formatted line breaks. |
| **6** | **Image OCR** | Client-side `tesseract.js` worker performing optical character recognition with progress callbacks. | `lib/extractors/ocrExtractor.ts` | Scanned image/screenshot text is parsed and rendered in text preview with progress bar. |
| **7** | **Loading States** | Granular multi-stage feedback: extraction progress (0-100%) and forensic X-ray radar scanning HUD. | `components/forensics/ScanningHUD.tsx` | Progress bar updates during OCR; animated scanning reticle displays during AI analysis. |
| **8** | **Error Handling** | Type-safe error boundary and validation alerts for invalid format, oversize files (>10MB), empty text, and API faults. | `components/ui/Alert.tsx`, `components/upload/ExtractionPreview.tsx` | Rejection of non-supported files, oversized files, and empty OCR outputs with corrective instructions. |
| **9** | **Production-Quality Code** | Modular TypeScript strict architecture, ESLint configuration, explicit type contracts, zero `any` usage. | `types/analysis.ts`, `app/api/analyze/route.ts` | Clean builds with `npm run build`, full type safety, and decoupled logic. |
| **10** | **Responsive UX** | Tailwind CSS mobile-first grid, adaptive cards, responsive navigation, and collapsible forensic panels. | `app/page.tsx`, `components/forensics/*` | Flawless rendering on mobile (375px), tablet (768px), and desktop (1280px+). |
| **11** | **Documentation** | Complete `README.md`, `AGENTS.md`, `PROJECT_PLAN.md`, `REQUIREMENTS.md`, and inline docstrings. | Root directory docs | Comprehensive setup instructions, feature overview, and troubleshooting steps. |
| **12** | **Deployable Build** | Next.js App Router with standalone server/serverless output; zero custom native binaries. | `next.config.mjs`, `package.json` | `npm run build` succeeds cleanly and passes static verification. |
| **13** | **Public GitHub Ready** | Complete repository layout, permissive license, clean `.gitignore`, clear setup scripts. | `.gitignore`, `README.md` | Ready to push directly to a public GitHub repository. |
| **14** | **Minimal Dependencies** | Zero bloated UI libraries; standard Next.js, React, Tailwind, Lucide, Tesseract, PDF.js, OpenAI. | `package.json` | Minimalist bundle size, fast install times, and zero unused dependencies. |
| **15** | **Zero Secrets Policy** | Server-side environment variable handling (`OPENAI_API_KEY`), `.env.example` template, strict `.gitignore`. | `.env.example`, `.gitignore`, `app/api/analyze/route.ts` | No secrets committed to source control; client can supply custom key if unconfigured. |

---

## 3. Core Feature Requirements Matrix

| Feature Area | Specification | Implementation Detail | Target UI Component |
|---|---|---|---|
| **A. Post Upload** | Drag & drop, file picker, PDF/PNG/JPG/WEBP, size (<10MB) & type validation. | React drag events + MIME checks + visual state indicators. | `components/upload/FileDropzone.tsx` |
| **B. Content Extraction** | PDF text parsing + Tesseract OCR + editable text preview before scan. Prevent empty submission. | `pdfExtractor.ts`, `ocrExtractor.ts`, interactive textarea with word/character count. | `components/upload/ExtractionPreview.tsx` |
| **C. AI Analysis** | 10 Forensic Metrics (Hook, Clarity, Cognitive Load, Emotion, Curiosity, Conversation, Shareability, CTA, Value, Friction). | Structured JSON inference via `/api/analyze` with standardized 0-100 scoring and qualitative analysis. | `components/forensics/MetricsGrid.tsx` |
| **D. Friction Map** | Breakdown of where attention drops, root causes, severity tags (Critical/Moderate/Minor), and specific fixes. | Interactive timeline / highlighted text fragments with tooltip or expandable forensic cards. | `components/forensics/FrictionMap.tsx` |
| **E. Post Autopsy** | Primary weakness, secondary issue, hidden strength, and recommended clinical treatment. | 4-quadrant diagnostic dossier card with severity indicators. | `components/forensics/PostAutopsy.tsx` |
| **F. Conversation DNA** | Action encouraged, conversational index, predicted audience reaction, high-conversion replacement question. | Forensic DNA breakdown card with audience psychological response analysis. | `components/forensics/ConversationDNA.tsx` |
| **G. Repair Engine** | Side-by-side / diff comparison of problematic original text vs. high-performing repaired version with rationale. | Interactive Before/After diff card with copy-to-clipboard functionality. | `components/forensics/RepairDiff.tsx` |
| **H. Platform Variants** | Customized adaptations for LinkedIn (professional storytelling), Instagram (visual hook & caption), TikTok (spoken script & hook). | Tabbed platform cards with tailored formatting, character counts, and hashtags. | `components/forensics/PlatformVariants.tsx` |
| **I. Goal-Based Analysis** | Selector: *Conversation, Shares, Saves, Clicks, Followers, Awareness*. Prompt tunes scoring & repairs accordingly. | Goal selector pill bar triggering dynamic prompt modifier and tailored recommendations. | `components/upload/GoalSelector.tsx` |

---

## 4. Design & Visual Requirements
- **Theme:** Forensic Laboratory Dark Theme (`#090B10` background, `#121620` card surfaces, `#1E2638` borders).
- **Accent:** Precision Cyan (`#00F0FF` / `#06B6D4`) + Spectral Warning Amber (`#F59E0B`) + Friction Red (`#EF4444`).
- **Typography:** Sans-serif headers/body (Inter) paired with monospace telemetry data (JetBrains Mono / monospace).
- **Visuals:** Grid line overlay, pulse scan radar, glowing telemetry tags, zero generic illustration blobs.
