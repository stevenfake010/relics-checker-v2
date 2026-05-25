-- relics-checker-v2 Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable realtime
-- (Supabase dashboard: Database > Replication > enable for checkins table)

-- Checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT        NOT NULL,   -- 'userA' | 'userB'
  relic_id   INTEGER     NOT NULL,   -- 1..195
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, relic_id)
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins (user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_relic_id ON checkins (relic_id);

-- Row-level security (optional - disable if you want open access)
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read all checkins
CREATE POLICY "checkins_select" ON checkins
  FOR SELECT USING (true);

-- Policy: anyone can insert their own checkin
CREATE POLICY "checkins_insert" ON checkins
  FOR INSERT WITH CHECK (true);

-- Policy: anyone can delete their own checkin
CREATE POLICY "checkins_delete" ON checkins
  FOR DELETE USING (true);
