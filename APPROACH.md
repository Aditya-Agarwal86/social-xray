# Social X-Ray: Engineering Approach

**Social X-Ray** is a content forensics platform designed to diagnose why social posts lose audience engagement and prescribe actionable repairs. Instead of outputting arbitrary vanity metrics, it evaluates copy across structural and cognitive dimensions like hook velocity, cognitive drag, and conversation potential.

### Architecture & Implementation
1. **Client-Side Extraction**: Ingests PDFs and images locally using `pdfjs-dist` and in-browser `tesseract.js` Web Workers. This eliminates server storage costs, safeguards privacy, and allows users to review/edit extracted text before analysis.
2. **Secure AI Engine**: Next.js App Router (`/api/analyze`) securely queries Google Gemini (`gemini-2.5-flash`) via the official `@google/genai` SDK using a strict JSON schema. API keys remain strictly server-side.
3. **Forensic UI Dashboard**: Built with Next.js 15, React 19, TypeScript, and Tailwind CSS. Features an interactive Engagement Friction Map, Post Autopsy, Conversation DNA, Before/After Repair Diff, and tailored variants for LinkedIn, Instagram, and TikTok.

### Design Principles
We adhered to a minimalist dependency footprint—zero databases, zero auth overhead, and zero social scrapers. Diagnostics focus on grounded copywriting psychology rather than predictive engagement guarantees, delivering transparent, reproducible repairs in an accessible, dark forensic laboratory interface.
