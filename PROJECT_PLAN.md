# Microgreens Control Center — Project Plan

Personal website for monitoring and maintaining my microgreens grow setup.

---

## Phase 1: Foundation — DONE

- [x] Control Center dashboard with header, live clock, activity log
- [x] Grow light grid (4×4) with individual + master toggle
- [x] Light schedule display (6 AM–midnight, auto on/off tracking)
- [x] Watering schedule tracker (12-hour cycle with overdue alerts)
- [x] Growth stage selector (Germination / Blackout / Growth / Harvest)
- [x] Arduino device hub UI (add, remove, connect/disconnect)
- [x] Activity log with type filtering
- [x] Portfolio Hub layout with tabbed navigation

---

## Phase 2: Live Camera & Screenshot History — DONE

- [x] Embedded live camera feed from local network (192.168.1.181:8080)
- [x] Fullscreen camera panel as the primary dashboard view
- [x] Pause / resume / refresh controls
- [x] Automatic screenshot capture every 4 hours
- [x] Manual screenshot button
- [x] Screenshot history gallery with timestamps and download
- [x] Rolling local storage (last 24 captures)

---

## Phase 3: Arduino Hardware Integration

### Goal
Connect the website to real Arduino hardware so lights and watering are actually controlled from the dashboard, not just simulated.

### Tasks
- [ ] Set up Arduino with relay module for grow lights and water pump
- [ ] Arduino writes sensor data (soil moisture, temperature) to Firebase Realtime DB
- [ ] Website reads sensor values and displays them on the dashboard
- [ ] Light toggle buttons send commands to Firebase → Arduino reads and switches relays
- [ ] "Water Now" button triggers the pump via Firebase command
- [ ] Automated watering: Arduino runs pump on the 12-hour schedule independently
- [ ] Connection heartbeat: detect when Arduino goes offline

### Architecture
```
Website (React) ↔ Firebase Realtime DB ↔ Arduino (WiFi/Serial)
   │                                        │
   ├─ send light/water commands        ├─ read commands, switch relays
   └─ display sensor readings           └─ write sensor data
```

---

## Phase 4: Microgreen Profiles & Smart Scheduling

### Goal
Auto-configure light and watering schedules based on which microgreen variety is currently growing.

### Variety Reference

| Variety        | Light (hrs/day) | Watering        | Soak Time | Blackout | Days to Harvest |
|----------------|-----------------|-----------------|-----------|----------|-----------------|
| Radish         | 12–16           | 2x/day misting  | 4–6 hrs   | 2–3 days | 6–10 days       |
| Wheatgrass     | 12 (indirect)   | 2x/day moist    | 8–12 hrs  | 2–3 days | 9–12 days       |
| Pea            | 12–16           | 2x/day misting  | 8–12 hrs  | 2–3 days | 8–14 days       |
| Sunflower      | 12–16           | 2x/day moderate | 8–12 hrs  | 2–3 days | 8–12 days       |

### Tasks
- [ ] Microgreen profile data model in Firestore (variety, schedules, stages)
- [ ] "New Tray" UI: select variety → auto-set light hours and water interval
- [ ] Track active tray sessions (variety, seed date, current stage, expected harvest)
- [ ] Dashboard shows active tray info prominently
- [ ] Historical grow log: past trays with variety, duration, and notes

---

## Phase 5: Growth Tracking & AI Analysis

### Goal
Use the 4-hour screenshots to track plant growth over time and eventually feed them into AI for stage detection.

### Tasks
- [ ] Side-by-side comparison view: pick two screenshots to compare
- [ ] Timeline scrubber: scroll through all captured screenshots chronologically
- [ ] Auto-detect growth stage from camera screenshots (TensorFlow.js or cloud Vision API)
- [ ] Visual growth timeline / progress bar based on detected stages
- [ ] Flag anomalies (wilting, mold, discoloration) from image analysis

---

## Phase 6: Notifications

### Goal
Get push alerts on your phone for watering times, harvest readiness, and hardware issues.

### Tasks
- [ ] Enable Firebase Cloud Messaging (FCM) in the project
- [ ] Request browser notification permission
- [ ] Cloud Function: send push at each watering time based on active tray schedule
- [ ] Cloud Function: alert if Arduino heartbeat is missing (device offline)
- [ ] Harvest notification when tray reaches expected harvest date
- [ ] Notification settings page (toggle which alerts you want)

---

## Phase 7: Polish & Daily Use

- [ ] Mobile-responsive layout so you can check from your phone
- [ ] Sensor dashboard cards (moisture, temp, humidity) with mini charts
- [ ] Dark/light theme toggle
- [ ] Export grow history as CSV or PDF
- [ ] Clean up unused demo pages if no longer needed (Cookie Clicker, Calculator, etc.)

---

## Execution Priority

| Phase                            | Status    | Next Action                          |
|----------------------------------|-----------|--------------------------------------|
| Phase 1 — Foundation             | **Done**  | —                                    |
| Phase 2 — Camera & Screenshots   | **Done**  | —                                    |
| Phase 3 — Arduino Hardware       | Next      | Set up Arduino + relay + Firebase DB |
| Phase 4 — Profiles & Scheduling  | Planned   | After hardware is connected          |
| Phase 5 — AI Growth Analysis     | Planned   | After screenshot history is robust   |
| Phase 6 — Notifications          | Planned   | After profiles are working           |
| Phase 7 — Polish                 | Ongoing   | As needed                            |
