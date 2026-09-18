# Lessons

## 2026-09-18 — Never clear the live site's saved data while testing
- The Browser pane's github.io origin holds Maria's real plan (map, list picks, notes, soil ticks).
- Rule: state-changing tests only on localhost, guarded by a hostname check. Live-site checks are read-only.
- Rule: back up live state to `backups/` (git-ignored) before shipping anything that changes the persisted shape.
- Rule: don't front another tab over the one she is working in.

## 2026-09-18 — Never test in a tab she might be working in
- She kept working in the localhost tab after her live tab closed; my migration test overwrote its storage and reloaded. ~5 minutes of work lost.
- Rule: test only in a tab I open myself, at http://127.0.0.1:5173 (separate origin, separate localStorage from localhost). Guard every script on hostname === '127.0.0.1'.
- Rule: never navigate, reload or write storage in any tab I didn't open for testing.
