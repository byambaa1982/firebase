# Project Status — Aminaa Studio

**Stack:** React 19 + Vite 7, React Router v6, Firebase v12 (Auth + Hosting), Tailwind CSS (partial)

---

## Completed Features

### Science / Biology Section
- **Interactive anatomy map** (`/science`) — clickable hotspot overlay on a full torso illustration; 9 organs mapped with hover highlight and label
- **All 9 organ pages** fully implemented with name, image, and written description:
  - Brain, Heart, Lungs, Liver, Kidneys, Stomach, Pancreas, Intestines, Bladder
- Invalid organ slug shows a "Organ not found" fallback with a back button

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

## Next Steps (Bucket List)

- [ ] Replace old/low-quality organ images with better ones
- [ ] Add written descriptions to each organ that already has an image
- [ ] Add more organ routes (expand beyond current 9)
- [ ] Build additional Home pages (multiple themed or sectioned homepages)

---

## End Goal

A complete, polished biology study platform and personal tools suite integrated into Aminaa Studio — where users can navigate the human body interactively, read accurate organ descriptions, use built-in tools (calculator, search), and rely on the site as a biology review resource.
