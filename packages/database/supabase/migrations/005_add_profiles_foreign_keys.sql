-- ============================================================
-- Turbo Platform — Fix Foreign Keys
-- Migration 005: Add foreign keys pointing to public.profiles
-- ============================================================

-- 为 tickets 增加指向 profiles 的外键约束
ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_user_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 为 knowledge_base 的作者增加指向 profiles 的外键约束
ALTER TABLE public.knowledge_base
  ADD CONSTRAINT kb_author_profile_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 为 notifications 增加指向 profiles 的外键约束
ALTER TABLE public.notifications
  ADD CONSTRAINT notif_user_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 为 activity_log 增加指向 profiles 的外键约束
ALTER TABLE public.activity_log
  ADD CONSTRAINT activity_user_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
