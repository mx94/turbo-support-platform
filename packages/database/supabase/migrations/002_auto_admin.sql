-- Migration 002: Auto-assign superadmin role
-- 这个触发器用于自动赋予特定邮箱管理员权限

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.email = 'superadmin@mx' THEN 'admin'::UserRole
      ELSE 'user'::UserRole
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    role = CASE WHEN NEW.email = 'superadmin@mx' THEN 'admin'::UserRole ELSE profiles.role END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 确保触发器在 auth.users 上有效 (假设之前的 migration 已经创建过类似触发器，我们这里直接替换)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
