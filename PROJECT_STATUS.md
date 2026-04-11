# Project Status

## Purpose
Personal website for monitoring and maintaining my microgreens grow setup.

## What's Built

### Done
- [x] Portfolio Hub with tabbed navigation across all project pages
- [x] Microgreen Control Center dashboard
- [x] Live camera feed from local network camera (192.168.1.181:8080)
- [x] Automatic camera screenshots every 4 hours, stored in browser with history viewer
- [x] Manual screenshot capture + download
- [x] Grow light grid (4×4) with individual toggle and master on/off
- [x] Light schedule indicator (6 AM – midnight auto on/off)
- [x] Watering schedule tracker (12-hour cycle, overdue alerts)
- [x] Growth stage selector (Germination → Blackout → Growth → Harvest)
- [x] Arduino device hub (add/remove/connect simulated devices)
- [x] Activity log with filtering (water, light, device, connection events)
- [x] Cookie Clicker, Calculator, Arduino Control, Search pages

### In Progress
- [ ] Wire Arduino hardware to actually control lights and water pump via Firebase
- [ ] Screenshot-based growth comparison (AI analysis placeholder)

### Not Started
- [ ] Push notifications (watering reminders, harvest alerts)
- [ ] Microgreen variety profiles (auto-configure schedules per seed type)
- [ ] Growth stage auto-detection from camera feed
- [ ] Historical grow log (past trays, duration, notes)
- [ ] Sensor data integration (soil moisture, temperature, humidity)

## Tech Stack
- React 19 + Vite 7 + Tailwind CSS 4
- Firebase (Auth, Firestore, Hosting)
- Local network camera stream (MJPEG)
- Arduino (planned hardware control)
