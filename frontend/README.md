# FundaAI frontend

This Next.js app contains the home page, filterable story library, and reading pages for the local FundaAI prototype. The six passages and practice questions in `src/data/passages.ts` are draft sample content awaiting fluent-speaker review.

Run `npm run dev` from this folder, then open http://localhost:3000. The app checks the FastAPI health endpoint at http://localhost:8000 by default. Copy `.env.example` to `.env.local` to use a different API address, then restart the development server.

Run `npm run lint` and `npm run build` to check the frontend. See the [project README](../README.md) for API setup and the current milestone.
