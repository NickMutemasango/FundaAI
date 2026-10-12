# FundaAI

A reading and comprehension assistant for Shona and Zimbabwean Ndebele.

## Current milestone

The local foundation is running. The home page leads to a filterable story library and shareable reading pages. Learners can choose a language and level, read six original draft passages, check vocabulary definitions, and answer one multiple-choice practice question per passage. FastAPI serves the passage list and individual passages, and the website fetches them from the API. The browser also checks the API health endpoint and displays its connection state.

PostgreSQL storage, versioned migrations, and a draft import command are implemented. Without DATABASE_URL, the prototype uses its backend JSON file. All sample language content requires fluent-speaker review before educational use. The chat panel is a disabled preview; AI tutoring, generated quizzes, AI marking, authentication, saved progress, and voice are not implemented yet. GitHub Pages publishes the bundled draft stories. Reloading resets the quiz and vocabulary selection. The API must be running for stories to load in local development; the GitHub Pages build uses bundled stories.

## Open in VS Code

Open this Shelter folder using **File > Open Folder**. Then open **Terminal > New Terminal**.

## Run FundaAI locally

Requires Node.js 20.9 or newer and Python 3.12 or newer. To install frontend dependencies on another computer:

```powershell
npm.cmd --prefix frontend ci
```

In one terminal, start the API from the Shelter folder:

```powershell
python -m venv backend/.venv
./backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
cd backend
./.venv/Scripts/python.exe -m uvicorn app.main:app --reload
```

The API health check is at http://localhost:8000/health. The draft passage endpoints are `GET /passages` (optional `language` and `level` filters) and `GET /passages/{id}`. Its interactive documentation is at http://localhost:8000/docs.

In a second terminal, from the Shelter folder, start the website:

```powershell
npm.cmd run dev
```

Visit http://localhost:3000 (or the address printed in the terminal if that port is busy). The footer should say **Server connected**. Press Ctrl+C in each terminal to stop. You can also use **Terminal > Run Task > Start FundaAI** in VS Code for the website.

The website uses `http://127.0.0.1:8000` for server-side passage requests and `http://localhost:8000` for the browser health check by default. To change them, copy `frontend/.env.example` to `frontend/.env.local` and edit `API_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL`, then restart the website. For a different website origin, set `FRONTEND_ORIGINS` to a comma-separated list before starting the API.

## Check the website

```powershell
npm.cmd run lint
npm.cmd run build
```

The project uses Next.js, TypeScript, and Tailwind CSS. Setup reference: https://nextjs.org/docs/app/getting-started/installation

## Project layout

```text
Shelter/
  frontend/src/app/        Home, library, reading routes, and styling
  frontend/src/components/ Reading interactions and server status
  frontend/src/lib/        API helpers
  frontend/src/types/      Passage types
  backend/app/            FastAPI endpoints and draft passage data
  .vscode/                Editor tasks and suggested extensions
  README.md               Setup and current status
```

## Next milestones

1. Review the samples with fluent Shona and Zimbabwean Ndebele speakers.
2. Configure a PostgreSQL server and run the implemented migration and draft import.
3. Add server-side AI vocabulary assistance and a passage-based tutor.
4. Add accounts, stored quiz results, and progress tracking.
5. Test voice quality, accessibility, and learner flows before deployment.

Keep secrets in a backend `.env` file (ignored by Git), never in browser code.


## PostgreSQL storage

Install PostgreSQL and create a database named fundaai with a dedicated database user,
or use an existing PostgreSQL server. Copy backend/.env.example to backend/.env
and set DATABASE_URL to its PostgreSQL connection string. Keep the password private.

From the Shelter folder, install the updated dependencies, then run:

~~~powershell
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
cd backend
./.venv/Scripts/python.exe -m app.database migrate
./.venv/Scripts/python.exe -m app.database seed
./.venv/Scripts/python.exe -m uvicorn app.main:app --reload
~~~

Migrations are versioned and transactional. The seed imports the six draft stories
without overwriting existing stories or their review status. The schema includes
passages, learners, and quiz_results; accounts and saving results still need their
own API implementation. Drafts remain visible in this local prototype and still
require fluent-speaker approval.

With DATABASE_URL configured, both passage endpoints read PostgreSQL and /health
checks the passage table. Database failures return HTTP 503 without switching to
JSON. With the URL empty, the original JSON prototype remains available.


## Published website

The public site is https://NickMutemasango.github.io/FundaAI/ after the Publish FundaAI workflow succeeds. GitHub Pages serves a static version with all six draft stories, vocabulary, quizzes, and browser-side library filters. It does not run the Python API or PostgreSQL. Edit backend/app/passages.json and push to main to update the published stories.

The repository contains the frontend/ Next.js app and backend/ FastAPI app. In GitHub Settings > Pages, select GitHub Actions as the publishing source. The workflow builds frontend/out with GITHUB_PAGES=true and deploys it. Local development continues to use the API.

To check the Pages build locally in PowerShell:

```powershell
$env:GITHUB_PAGES = "true"
npm.cmd run build
Remove-Item Env:GITHUB_PAGES
```

## Vercel deployment

Keep the Vercel project Root Directory at the repository root. The root vercel.json installs frontend dependencies, builds the static site with FUNDAAI_STATIC_EXPORT=true, and publishes frontend/out. Vercel serves stories at the domain root; GitHub Pages retains its /FundaAI path. The hosted reading experience uses the bundled draft stories and does not require the local API.
