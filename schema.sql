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

-- ============================================================
-- world_checkins: 世界遗产 Top100 打卡（无照片，site_id = UNESCO ID 字符串）
-- ============================================================
CREATE TABLE IF NOT EXISTS world_checkins (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT        NOT NULL,   -- 'zuo' | 'huang'
  site_id    TEXT        NOT NULL,   -- UNESCO ID
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, site_id)
);

CREATE INDEX IF NOT EXISTS idx_world_checkins_user_id ON world_checkins (user_id);
CREATE INDEX IF NOT EXISTS idx_world_checkins_site_id ON world_checkins (site_id);

ALTER TABLE world_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "world_checkins_select" ON world_checkins FOR SELECT USING (true);
CREATE POLICY "world_checkins_insert" ON world_checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "world_checkins_delete" ON world_checkins FOR DELETE USING (true);
