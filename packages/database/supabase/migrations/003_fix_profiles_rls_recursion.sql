-- Migration 003: 修复 profiles 表 Row Level Security (RLS) 的无限递归问题
-- 创建一个具有 SECURITY DEFINER 权限的函数，在检查管理员状态时绕过 RLS 校验

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 删除现有的直接查询 profiles 表的管理员策略，以避免产生无限递归查询死锁
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 使用新创建的特权函数重新建立该策略
CREATE POLICY "Admins can view all profiles" ON profiles 
  FOR SELECT USING ( public.is_admin() );

-- 更新其他表中的管理权限策略以统一使用此函数 (不仅保持代码整洁，还能避免嵌套触发死锁)

DROP POLICY IF EXISTS "Admins can view all tickets" ON tickets;
CREATE POLICY "Admins can view all tickets" ON tickets
  FOR SELECT USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins can update all tickets" ON tickets;
CREATE POLICY "Admins can update all tickets" ON tickets
  FOR UPDATE USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins can manage articles" ON knowledge_base;
CREATE POLICY "Admins can manage articles" ON knowledge_base
  FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins can view all activity" ON activity_log;
CREATE POLICY "Admins can view all activity" ON activity_log
  FOR SELECT USING ( public.is_admin() );
