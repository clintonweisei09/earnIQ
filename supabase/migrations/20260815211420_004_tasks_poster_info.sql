/*
# Add poster info to tasks

## Purpose
Each task in the marketplace should display who posted it and where they're from,
so workers see real requests from people around the world (e.g., "James from
Canada wants to learn Swahili for his trip to Tanzania").

## Changes
### tasks
- Adds `poster_name` (text) — the client's first name, shown on the task card.
- Adds `poster_location` (text) — the client's country, shown on the task card.

Both columns are nullable so existing tasks continue to work; the frontend
falls back to "EarnIQ Team" / "Global" when null.
*/

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS poster_name text;
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS poster_location text;

-- Backfill existing tasks with placeholder poster info
UPDATE tasks SET poster_name = 'EarnIQ Team', poster_location = 'Global'
  WHERE poster_name IS NULL;
