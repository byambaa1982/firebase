# Microgreens Control Center — Project Plan

---

## Phase 1: Cleanup & Foundation

- Delete Cookie Clicker page (`HomePage.jsx`) and all related routes/links
- Remove cookie clicker references from `App.jsx` and the nav button in `ControlCenter.jsx`
- Clean up unused Firebase cloud save functions tied to the cookie game
- Verify the Control Center remains fully functional as the landing page

---

## Phase 2: Microgreen Profiles & Selection UI

### Research — Optimal Conditions Per Variety

| Variety        | Light (hrs/day)       | Light Intensity | Watering Frequency   | Soak Time  | Blackout Period | Days to Harvest |
| -------------- | --------------------- | --------------- | -------------------- | ---------- | --------------- | --------------- |
| **Radish**     | 12–16 hrs             | Medium-High     | 2x/day misting       | 4–6 hrs    | 2–3 days        | 6–10 days       |
| **Wheatgrass** | 12 hrs (indirect OK)  | Low-Medium      | 2x/day, keep moist   | 8–12 hrs   | 2–3 days        | 9–12 days       |
| **Pea**        | 12–16 hrs             | Medium          | 2x/day misting       | 8–12 hrs   | 2–3 days        | 8–14 days       |
| **Sunflower**  | 12–16 hrs             | Medium-High     | 2x/day, moderate     | 8–12 hrs   | 2–3 days        | 8–12 days       |

### Implementation

- Create a microgreen profile data model (stored in Firebase Firestore) with the above parameters
- Build a "New Tray" / seed selection UI where you pick which microgreen you're growing
- Auto-configure the light schedule and watering intervals on the Arduino based on selection
- Store active tray sessions in Firestore (variety, seed date, current stage, expected harvest)

---

## Phase 3: Growth Stage Recognition

### Stages to Track

1. **Soaking** — seeds soaking before planting
2. **Blackout** — seeds planted, dome/cover on, no light
3. **Germination** — first roots/shoots visible
4. **Growing** — greens developing under light
5. **Ready to Harvest** — target height/day reached

### Implementation Options (pick during development)

- **Timer-based tracking** — Calculate expected stage from seed date + variety profile (simplest, most reliable)
- **Camera-based recognition** — Use the existing webcam feed + a lightweight image classification model (TensorFlow.js or a cloud Vision API) to visually identify growth stage
- **Hybrid** — Timer-based as default, camera as confirmation/override
- Display current stage prominently in the Control Center with a visual timeline/progress bar

---

## Phase 4: Push Notifications via Firebase Cloud Messaging (FCM)

### Setup

- Enable Firebase Cloud Messaging in your Firebase project console
- Add FCM SDK to the web app and request notification permission from the browser
- Create a Firebase Cloud Function (Node.js) that runs on a schedule or is triggered by Firestore changes
- Register your phone's browser (or a lightweight wrapper app) to receive push notifications

### Notification Triggers

- **Manual watering reminders** — Based on the variety's watering schedule, send a push at each watering time
- **Arduino issues** — If the Arduino stops sending data to Firebase (heartbeat timeout) or reports sensor errors, trigger an alert
- **Harvest time** — When the tray's expected harvest date arrives, send a "Ready to harvest!" notification
- **Optional: Stage transitions** — Notify when it's time to remove the blackout dome, adjust lights, etc.

### Architecture

```
Arduino → Firebase Realtime DB → Cloud Function (monitors data) → FCM → Phone browser notification
                                      ↓
                              Firestore (tray schedules) → Scheduled Cloud Function → FCM
```

---

## Phase 5: Integration & Polish

- Wire the microgreen selection to actually control Arduino light/watering schedules via Firebase Realtime DB
- Dashboard showing all active trays, their variety, current stage, and next action
- Notification settings page (toggle which alerts you want)
- Historical log of past grows (variety, duration, notes)
- Testing end-to-end: seed a tray → receive notifications → track stages → harvest alert

---

## Suggested Order of Execution

| Phase                        | Effort      | Dependencies             |
| ---------------------------- | ----------- | ------------------------ |
| Phase 1 (Cleanup)            | ~1 hour     | None                     |
| Phase 2 (Profiles & Selection) | ~1–2 days | Phase 1                  |
| Phase 3 (Growth Stages)      | ~1–2 days   | Phase 2                  |
| Phase 4 (Notifications)      | ~2–3 days   | Phase 2 (Phase 3 optional) |
| Phase 5 (Integration)        | ~1–2 days   | All above                |
