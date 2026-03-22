-- Migration: Add internal notes to tickets

-- 为 Admin 专属的内部备注保留字段
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- 这个字段的读写不需要额外的 RLS，因为它与该表已有的 policy 共进退
-- (Admins has full access to tickets, profiles etc.)
