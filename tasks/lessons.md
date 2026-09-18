# Lessons

## 2026-09-18 — Never clear the live site's saved data while testing
- The Browser pane's github.io origin holds Maria's real plan (map, list picks, notes, soil ticks).
- Rule: state-changing tests only on localhost, guarded by a hostname check. Live-site checks are read-only.
- Rule: back up live state to `backups/` (git-ignored) before shipping anything that changes the persisted shape.
- Rule: don't front another tab over the one she is working in.
