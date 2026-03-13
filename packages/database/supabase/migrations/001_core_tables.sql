-- ============================================================
-- Turbo Platform — Core Database Schema
-- Migration 001: tickets, knowledge_base, notifications, activity_log
-- ============================================================

-- ─── ENUM TYPES ───────────────────────────────────────────────
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_type AS ENUM ('ticket_update', 'system', 'feedback_request', 'assignment');

-- ─── TICKETS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  status        ticket_status NOT NULL DEFAULT 'open',
  priority      ticket_priority NOT NULL DEFAULT 'medium',
  category      TEXT DEFAULT 'general',
  assigned_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stream_channel_id TEXT,                         -- 关联 Stream Chat channel
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  rating_comment TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at   TIMESTAMPTZ
);

CREATE INDEX idx_tickets_user     ON tickets(user_id);
CREATE INDEX idx_tickets_status   ON tickets(status);
CREATE INDEX idx_tickets_admin    ON tickets(assigned_admin_id);
CREATE INDEX idx_tickets_created  ON tickets(created_at DESC);

-- ─── KNOWLEDGE BASE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_base (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'general',
  tags          TEXT[] DEFAULT '{}',
  author_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published  BOOLEAN NOT NULL DEFAULT false,
  view_count    INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kb_category   ON knowledge_base(category);
CREATE INDEX idx_kb_published  ON knowledge_base(is_published);
CREATE INDEX idx_kb_search     ON knowledge_base USING gin(to_tsvector('english', title || ' ' || content));

-- ─── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL DEFAULT 'system',
  title       TEXT NOT NULL,
  message     TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_user    ON notifications(user_id);
CREATE INDEX idx_notif_unread  ON notifications(user_id, is_read) WHERE is_read = false;

-- ─── ACTIVITY LOG ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,                    -- e.g. 'ticket.created', 'ticket.resolved'
  resource_type TEXT NOT NULL,                    -- e.g. 'ticket', 'knowledge_base'
  resource_id   UUID,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_user    ON activity_log(user_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- ─── AUTO-UPDATE updated_at TRIGGER ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER kb_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

-- Profiles: 用户只能看到和编辑自己的资料
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"     ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"   ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Tickets: 用户看自己的工单，管理员看所有
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tickets"     ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets"       ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can rate own tickets"     ON tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tickets"    ON tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all tickets"  ON tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Knowledge Base: 已发布的文章任何人可读，管理员可 CRUD
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published articles" ON knowledge_base FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage articles"         ON knowledge_base FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications: 用户只能看自己的通知
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications"   ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications"    ON notifications FOR INSERT WITH CHECK (true);

-- Activity Log: 用户看自己的日志，管理员看所有
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity"        ON activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity"         ON activity_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all activity"       ON activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
