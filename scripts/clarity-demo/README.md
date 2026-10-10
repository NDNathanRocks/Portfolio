# Clarity demo build

The Clarity project page embeds the real Expo app, exported for the web into `public/demos/clarity`.
Its network layer is swapped for an in-browser mock (`mockApi.ts`), so no server or API key is needed.
AI endpoints are rule-based stand-ins for Claude, except task breakdown, which first tries the site's `/api/clarity/decompose` proxy (Gemini, then Groq) and falls back to the rules.

## What changes in the app

`clarity-demo.patch` is a small diff against the Clarity repo:

- `frontend/app/index.tsx`: when `EXPO_PUBLIC_DEMO=1`, the axios instance uses the mock adapter, the session is
  seeded so the login screen is skipped, and the calendar timeline opens at 7am.
- Also fixes the Active/Completed tab badges (they counted inside an already-filtered list, so the inactive one always read 0).
- `frontend/app.json`: `experiments.baseUrl = "/demos/clarity"` so assets resolve under that path.

`mockApi.ts` is copied to `frontend/demo/mockApi.ts`. It also shims `fetch()` for the add/edit task modals,
which call the API without axios.

## Rebuild

```bash
git clone https://github.com/NDNathanRocks/Clarity-Your-AI-Time-Companion clarity   # use a SHORT path on Windows
cd clarity/frontend
git apply ../../<this-repo>/scripts/clarity-demo/clarity-demo.patch
mkdir demo && cp <this-repo>/scripts/clarity-demo/mockApi.ts demo/
npm install --legacy-peer-deps
EXPO_PUBLIC_DEMO=1 npx expo export --platform web --output-dir dist
# replace public/demos/clarity with dist, then delete dist/components, dist/config.html, dist/_sitemap.html
```
