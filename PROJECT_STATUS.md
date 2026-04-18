# Project Status — Aminaa Studio

**Stack:** React 19 + Vite 7, React Router v6, Firebase v12 (Auth + Hosting), Tailwind CSS (partial)

---

## Completed Features

### Science / Biology Section

#### `/science` — Human Anatomy Hub (`SciencePage.jsx`)
- Dark navy background (`#0d1b2a`), standard site header (brand + nav + `NavUser`) and footer
- `<h1>` title: **"Human Anatomy"** with subtitle: *"Click any organ label to learn more."*
- **Central image:** `main.png` — a full human torso illustration, max-width 700px, rounded corners, drop-shadow
- **9 interactive hotspots** overlaid on `main.png` using absolute `%`-based positioning:

  | Organ | Position (top / left) | Size |
  |---|---|---|
  | Brain | 5% / 1% | 21% × 14% |
  | Heart | 10% / 70% | 28% × 14% |
  | Lungs | 32% / 1% | 21% × 13% |
  | Liver | 32% / 69% | 28% × 13% |
  | Kidneys | 50% / 1% | 21% × 13% |
  | Stomach | 49% / 69% | 28% × 14% |
  | Pancreas | 66% / 1% | 22% × 12% |
  | Intestines | 65% / 65% | 33% × 14% |
  | Bladder | 80% / 1% | 21% × 13% |

- **Hotspot behavior:** each box has a light-blue (`#4fc3f7`) label, semi-transparent blue border/background at rest; on hover, border and background intensify (full `#4fc3f7`); clicking navigates to `/science/<slug>`

#### `/science/:organ` — Individual Organ Pages (`OrganPage.jsx`)
- Same dark shell (header, footer, navy background)
- **`← Back` button** (top-left, blue outline) returns to `/science`
- **Detail card** (max-width 750px, dark card `#1a2c3d`, rounded, shadow, flex row):
  - **Organ image** (220px wide, rounded, shadow) — dedicated `.png` per organ:
    - `Brain.png`, `Heart.png`, `lungs.png`, `Liver.png`, `Kidneys.png`, `stomach.png`, `pancreas.png`, `intestines.png`, `bladder.png`
  - **Organ name** (`<h1>`) in `#4fc3f7` blue
  - **Description field** — currently shows *"Description coming soon..."* in italic grey for all 9 organs (no written content yet)
- **404 fallback:** invalid slug (e.g. `/science/xyz`) shows "Organ not found." with a `← Back to Science` button

### Authentication
- Google Sign-In (popup) via Firebase Auth — fully working
- `AuthContext` provides `user`, `signInWithGoogle`, and `signOut` across the app
- `NavUser` shows avatar + first name when signed in, "Sign In" link when not
- Redirect to home after successful sign-in

### Home Page (`/`)
- Branded "Aminaa Studio" header with nav links (Science, About, Contact)
- Animated CSS balloon hero scene
- 3 service cards: Brand Identity, Web Development, Growth Strategy
- Footer: © 2026 Aminaa Studio

### Calculator (`/calculator`)
- Scientific calculator with memory (MC, MR, M−, M+), √, %, π, power, and standard operators
- LCD-style display with solar-panel aesthetic

### Contact Page (`/contact`)
- Form with Name, Email, and Message fields
- Shows confirmation UI after submit (no backend — data is not saved)

### Sign-In Page (`/signin`)
- Centered card with "Sign in with Google" button; auto-redirects on success

### Search Page (`/search`)
- Redirects the query to Google in a new tab (no internal search index)

---

## Known Gaps / In Progress

| Area | Status | Notes |
|---|---|---|
| Contact form backend | Not implemented | Submissions are not saved or emailed anywhere |
| Arduino control (`/arduino`) | UI stub only | Simulates connect/LED/PWM with `setTimeout` + `console.log`; Web Serial API not wired up |
| Internal search | Not implemented | Currently just a Google redirect |
| `index.html` title | Wrong | Still shows `"firebase"` instead of `"Aminaa Studio"` |
| Homepage nav | Incomplete | Calculator, Arduino, and Search pages have no links from the homepage |
| Firestore / database | Not configured | No persistent data storage for any feature |
| Unused assets | Cleanup needed | `react.svg`, `Screenshot (3).png`, and `Turkey Power Walk.json` (root) are not used |

---

## Next Steps + Bucket List

- Add a real backend to the contact form (Firebase Firestore write or EmailJS)
- Implement Web Serial API in ArduinoControl for real hardware communication
- Fix `index.html` page title to "Aminaa Studio"
- Add homepage or nav links to Calculator, Search, and Arduino pages
- Consider expanding biology content: more organs, quiz/review mode, or labeled diagrams
- [ ] Replace old/low-quality organ images with better ones
- [ ] Add written descriptions to each organ that already has an image
- [ ] Add more organ routes (expand beyond current 9)
- [ ] Build additional Home pages (multiple themed or sectioned homepages)

---

## End Goal

A complete, polished biology study platform and personal tools suite integrated into Aminaa Studio — where users can navigate the human body interactively, read accurate organ descriptions, use built-in tools (calculator, search), and rely on the site as a biology review resource.
