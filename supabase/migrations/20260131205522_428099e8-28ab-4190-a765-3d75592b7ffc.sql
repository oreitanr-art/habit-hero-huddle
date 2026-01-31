-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS Policies for user_roles table
-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.is_admin());

-- Users can view their own role
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

-- Only admins can insert roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_admin());

-- Only admins can update roles
CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.is_admin());

-- Only admins can delete roles (but not their own admin role to prevent lockout)
CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.is_admin() AND NOT (user_id = auth.uid() AND role = 'admin'));

-- Add admin SELECT policies to existing tables so admins can view all data
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can view all children"
ON public.children FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can view all child_tasks"
ON public.child_tasks FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can view all child_rewards"
ON public.child_rewards FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can view all child_settings"
ON public.child_settings FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can view all child_daily_progress"
ON public.child_daily_progress FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can view all child_weekly_coins"
ON public.child_weekly_coins FOR SELECT
USING (public.is_admin());

-- Add admin UPDATE policies
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can update all children"
ON public.children FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can update all child_tasks"
ON public.child_tasks FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can update all child_rewards"
ON public.child_rewards FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can update all child_settings"
ON public.child_settings FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can update all child_daily_progress"
ON public.child_daily_progress FOR UPDATE
USING (public.is_admin());

-- Add admin DELETE policies
CREATE POLICY "Admins can delete all profiles"
ON public.profiles FOR DELETE
USING (public.is_admin());

CREATE POLICY "Admins can delete all children"
ON public.children FOR DELETE
USING (public.is_admin());

CREATE POLICY "Admins can delete all child_tasks"
ON public.child_tasks FOR DELETE
USING (public.is_admin());

CREATE POLICY "Admins can delete all child_rewards"
ON public.child_rewards FOR DELETE
USING (public.is_admin());

CREATE POLICY "Admins can delete all child_daily_progress"
ON public.child_daily_progress FOR DELETE
USING (public.is_admin());