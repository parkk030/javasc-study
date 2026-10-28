-- =============================================================================
-- PatchRadar (게임 패치노트 요약 및 실시간 알림 서비스)
-- Serverless PostgreSQL / Supabase Schema + Indexes + RLS Policies
-- =============================================================================

-- 1. games (지원 게임 목록)
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  genre TEXT NOT NULL CHECK (genre IN ('MOBA', 'FPS', 'MMORPG', 'BattleRoyale')),
  icon_url TEXT,
  official_url TEXT NOT NULL,
  current_version TEXT NOT NULL,
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  patch_cycle_label TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  last_patched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. patches (패치노트 및 구조화된 버프/너프 변경 내역)
CREATE TABLE IF NOT EXISTS public.patches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  game_slug TEXT NOT NULL,
  game_name TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('regular', 'hotfix', 'balance', 'maintenance')),
  tldr TEXT[] NOT NULL DEFAULT '{}',
  changes JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_url TEXT NOT NULL,
  maintenance_window TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patches_game_slug_published
  ON public.patches (game_slug, published_at DESC);

-- 3. subscriptions (사용자별 관심 게임 구독 및 맞춤 키워드)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  game_slug TEXT NOT NULL REFERENCES public.games(slug) ON DELETE CASCADE,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  notify_hotfix_only BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_slug)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_game_slug ON public.subscriptions (game_slug);

-- 4. notification_channels (사용자별 Discord 웹훅 및 알림 채널 설정)
CREATE TABLE IF NOT EXISTS public.notification_channels (
  user_id UUID PRIMARY KEY,
  discord_webhook_url TEXT,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  web_push_enabled BOOLEAN NOT NULL DEFAULT true,
  only_keyword_match BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. notifications (인앱 알림 발송 내역)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patch_id UUID REFERENCES public.patches(id) ON DELETE CASCADE,
  game_slug TEXT NOT NULL,
  game_name TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  matched_keywords TEXT[] NOT NULL DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, is_read, created_at DESC);

-- =============================================================================
-- Row-Level Security (RLS) Policies
-- =============================================================================
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public read access for games and patches
CREATE POLICY "games_public_read" ON public.games
  FOR SELECT USING (true);

CREATE POLICY "patches_public_read" ON public.patches
  FOR SELECT USING (true);

-- User-isolated access for subscriptions, channels, and notifications
CREATE POLICY "subscriptions_owner_all" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "channels_owner_all" ON public.notification_channels
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_owner_all" ON public.notifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
