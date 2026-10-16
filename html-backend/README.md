# FundaAI backend

Node.js API for a separate local HTML frontend. Requires Node.js 22+; no dependencies or database.

## Render

Deploy this repository as a Blueprint using render.yaml. It configures a free web service, Node 24, API-only routes, and localhost frontend origins on port 5500. Add OPENAI_API_KEY privately in Render's environment settings. Adjust OPENAI_MODEL to an available model for your account if needed.

GET /api/health reports health and whether AI is configured. POST /api/chat accepts JSON with passageId and question and returns answer. The root URL returns 404 intentionally: no frontend is hosted here.

## Local development

Copy .env.example to .env and add your API key privately. Run npm start. Set your local frontend's API_BASE_URL to http://127.0.0.1:3000, or to the actual Render origin after deployment. Serve the frontend at http://localhost:5500. FRONTEND_ORIGINS accepts comma-separated exact allowed origins. Never commit .env or put API keys in the frontend.

Run npm test for seven request-handler tests using simulated AI responses. Live AI calls require your own key and API billing. Translation quality needs fluent-speaker review. Questions and selected story content are sent to OpenAI; this application saves no chat history.

This is a controlled-pilot backend. CORS is not authentication. Before unrestricted public use, add authentication, durable quotas, and provider spending controls. In-memory rate limits reset on restart and apply per instance.
