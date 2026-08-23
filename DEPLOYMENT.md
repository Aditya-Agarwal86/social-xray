# Social X-Ray: Production Deployment Guide

This guide provides step-by-step instructions for deploying **Social X-Ray** to **Vercel** or any production Node.js hosting platform.

---

## 1. Target Platform: Vercel (Recommended)

Next.js 15+ App Router is optimized for zero-configuration deployment on Vercel.

### Prerequisites
- A [GitHub](https://github.com) account.
- A [Vercel](https://vercel.com) account.
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### One-Click Deployment via Vercel Dashboard
1. Push your repository to GitHub (ensure `.env*` files are ignored).
2. Log in to Vercel and click **Add New... $\rightarrow$ Project**.
3. Select your `social-xray` GitHub repository.
4. Keep the default build settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` or `next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
5. Expand the **Environment Variables** section and configure:
   - `GEMINI_API_KEY`: `your_gemini_api_key_here` (Required)
   - `GEMINI_MODEL`: `gemini-3.5-flash` (Optional, defaults to `gemini-3.5-flash`)
6. Click **Deploy**.

---

## 2. Environment Variables Specification

| Environment Variable | Required | Default | Scope | Description |
| :--- | :---: | :---: | :---: | :--- |
| `GEMINI_API_KEY` | **Yes** | *None* | Server-only | Secret API key for Google Gemini LLM analysis. Never exposed to browser bundles. |
| `GEMINI_MODEL` | No | `gemini-3.5-flash` | Server-only | Google Gemini model identifier. |

> [!IMPORTANT]
> **Client-Side Key Override Support**: If `GEMINI_API_KEY` is omitted from server environment variables, the application displays a prominent configuration prompt in the UI allowing users to provide their own temporary client key stored in browser `localStorage`.

---

## 3. Node.js Self-Hosted / Docker Deployment

If deploying to a self-hosted Node.js server (e.g. AWS EC2, DigitalOcean, Railway, Render):

### 1. Build and Run
```bash
# Clone and install dependencies
git clone https://github.com/your-username/social-xray.git
cd social-xray
npm ci --production=false

# Configure environment variables
export GEMINI_API_KEY="your_gemini_api_key_here"
export GEMINI_MODEL="gemini-3.5-flash"
export NODE_ENV="production"
export PORT="3000"

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 4. Production Verification Checklist

Before opening to public traffic, verify the following:

- [x] **Production Build**: Verified with `npm run build` (0 compile errors, clean static & dynamic routes).
- [x] **Zero Secrets in Git**: Audited with `scripts/audit-submission.ts` (zero API keys or credentials in source).
- [x] **Server-Side API Isolation**: `/api/analyze` runs purely on the server and does not expose `GEMINI_API_KEY` to client payloads.
- [x] **Client-Side Workers**: `tesseract.js` and `pdfjs-dist` load in-browser without server CPU overhead.
- [x] **Responsive Viewports**: Mobile, tablet, and desktop layouts verified.
- [x] **Error Boundaries**: Dedicated `app/error.tsx` and `app/not-found.tsx` deployed.
- [x] **Network Resilience**: 45-second timeout controller with graceful retry mechanisms.
