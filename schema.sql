-- relics-checker-v2 Supabase schema
-- Run this in the Supabase SQL editor.
--
-- The browser no longer writes these tables directly. Reads and writes go
-- through Vercel API routes using SUPABASE_SERVICE_ROLE_KEY, so anon users get
-- no table policies here.

CREATE TABLE IF NOT EXISTS checkins (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT        NOT NULL CHECK (user_id IN ('zuo', 'huang')),
  relic_id   INTEGER     NOT NULL CHECK (relic_id > 0),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  photo_url  TEXT,
  UNIQUE (user_id, relic_id)
);

ALTER TABLE checkins ADD COLUMN IF NOT EXISTS photo_url TEXT;
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins (user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_relic_id ON checkins (relic_id);
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "checkins_select" ON checkins;
DROP POLICY IF EXISTS "checkins_insert" ON checkins;
DROP POLICY IF EXISTS "checkins_delete" ON checkins;
DROP POLICY IF EXISTS "checkins_update" ON checkins;

CREATE TABLE IF NOT EXISTS heritage_checkins (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT        NOT NULL CHECK (user_id IN ('zuo', 'huang')),
  site_id    TEXT        NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  photo_url  TEXT,
  UNIQUE (user_id, site_id)
);

ALTER TABLE heritage_checkins ADD COLUMN IF NOT EXISTS photo_url TEXT;
CREATE INDEX IF NOT EXISTS idx_heritage_checkins_user_id ON heritage_checkins (user_id);
CREATE INDEX IF NOT EXISTS idx_heritage_checkins_site_id ON heritage_checkins (site_id);
ALTER TABLE heritage_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "heritage_checkins_select" ON heritage_checkins;
DROP POLICY IF EXISTS "heritage_checkins_insert" ON heritage_checkins;
DROP POLICY IF EXISTS "heritage_checkins_delete" ON heritage_checkins;
DROP POLICY IF EXISTS "heritage_checkins_update" ON heritage_checkins;

CREATE TABLE IF NOT EXISTS world_checkins (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT        NOT NULL CHECK (user_id IN ('zuo', 'huang')),
  site_id    TEXT        NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, site_id)
);

CREATE INDEX IF NOT EXISTS idx_world_checkins_user_id ON world_checkins (user_id);
CREATE INDEX IF NOT EXISTS idx_world_checkins_site_id ON world_checkins (site_id);
ALTER TABLE world_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "world_checkins_select" ON world_checkins;
DROP POLICY IF EXISTS "world_checkins_insert" ON world_checkins;
DROP POLICY IF EXISTS "world_checkins_delete" ON world_checkins;
DROP POLICY IF EXISTS "world_checkins_update" ON world_checkins;

CREATE TABLE IF NOT EXISTS guobao_checkins (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT        NOT NULL CHECK (user_id IN ('zuo', 'huang')),
  site_id    TEXT        NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  photo_url  TEXT,
  UNIQUE (user_id, site_id)
);

ALTER TABLE guobao_checkins ADD COLUMN IF NOT EXISTS photo_url TEXT;
CREATE INDEX IF NOT EXISTS idx_guobao_checkins_user_id ON guobao_checkins (user_id);
CREATE INDEX IF NOT EXISTS idx_guobao_checkins_site_id ON guobao_checkins (site_id);
ALTER TABLE guobao_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guobao_checkins_select" ON guobao_checkins;
DROP POLICY IF EXISTS "guobao_checkins_insert" ON guobao_checkins;
DROP POLICY IF EXISTS "guobao_checkins_delete" ON guobao_checkins;
DROP POLICY IF EXISTS "guobao_checkins_update" ON guobao_checkins;
