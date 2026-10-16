# FundaAI backend

POST /api/stories/generate accepts language (shona or ndebele) and level (beginner, intermediate, advanced). Returns a generated story with a server ID, paragraphs, and three vocabulary items. Strict word caps are 60/85/110 respectively. Overlong or invalid AI outputs are rejected. Temporary generated stories are held in a bounded server cache (200 stories, one-hour expiry, reset on restart). Both quiz and chat accept the returned passage ID and resolve the authoritative story from that cache. No arbitrary browser-supplied passage text is trusted. Twelve backend tests cover the original functionality plus generated-story quiz/chat integration and word caps at all levels.

Node.js API for a separate local HTML frontend. Requires Node.js 22+; no dependencies or database.

## Render

Deploy this repository as a Blueprint using render.yaml. It configures a free web service, Node 24, API-only routes, and localhost frontend origins on port 5500. Add OPENAI_API_KEY privately in Render's environment settings. Adjust OPENAI_MODEL to an available model for your account if needed.

GET /api/health reports health and whether AI is configured. POST /api/chat accepts JSON with passageId and question and returns answer. POST /api/quiz accepts passageId to generate the first question; POST /api/quiz/answer accepts token and answer (zero-based option index). An incorrect answer returns correct:false; a correct answer returns the next question or complete:true after five. The answer key and explanation are encrypted in a server-authenticated token, not exposed as readable frontend fields. Tokens expire in an hour and become invalid on server restart. Generation failures leave the previous token usable for retry. The root URL returns 404 intentionally: no frontend is hosted here.

## Local development

Copy .env.example to .env and add your API key privately. Run npm start. Set your local frontend's API_BASE_URL to http://127.0.0.1:3000, or to the actual Render origin after deployment. Serve the frontend at http://localhost:5500. FRONTEND_ORIGINS accepts comma-separated exact allowed origins. Never commit .env or put API keys in the frontend.

Run npm test for ten request-handler tests using simulated AI responses. Live AI calls require your own key and API billing. Translation and AI answer-key quality need fluent-speaker review. Questions and selected story content are sent to OpenAI; this application saves no chat history. Allow the literal origin null in FRONTEND_ORIGINS for the direct-file submission frontend; it cannot identify a particular local file.

This is a controlled-pilot backend. CORS is not authentication. Before unrestricted public use, add authentication, durable quotas, and provider spending controls. In-memory rate limits reset on restart and apply per instance.
