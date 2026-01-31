-- Create profiles table for parents
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create children table
CREATE TABLE public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    child_name TEXT NOT NULL,
    wallet_coins INTEGER NOT NULL DEFAULT 0,
    streak_current INTEGER NOT NULL DEFAULT 0,
    streak_last_all_done_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table for each child
CREATE TABLE public.child_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    coins INTEGER NOT NULL DEFAULT 1,
    icon TEXT NOT NULL DEFAULT '✅',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rewards table for each child
CREATE TABLE public.child_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    cost INTEGER NOT NULL,
    icon TEXT NOT NULL DEFAULT '🎁',
    requires_perfect_week BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily progress table
CREATE TABLE public.child_daily_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    completed_task_ids UUID[] NOT NULL DEFAULT '{}',
    all_done_bonus_applied BOOLEAN NOT NULL DEFAULT false,
    penalty_applied BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(child_id, date)
);

-- Create settings table for each child
CREATE TABLE public.child_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL UNIQUE,
    pin TEXT NOT NULL DEFAULT '1234',
    bonus_all_done INTEGER NOT NULL DEFAULT 5,
    bonus_three_day_streak INTEGER NOT NULL DEFAULT 10,
    bonus_perfect_week INTEGER NOT NULL DEFAULT 20,
    penalty_zero_tasks INTEGER NOT NULL DEFAULT -10,
    penalty_one_to_four INTEGER NOT NULL DEFAULT -5,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly coins tracking table
CREATE TABLE public.child_weekly_coins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
    week_key TEXT NOT NULL,
    coins INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(child_id, week_key)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_weekly_coins ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user owns a child
CREATE OR REPLACE FUNCTION public.is_own_child(child_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.children c
    JOIN public.profiles p ON c.parent_id = p.id
    WHERE c.id = child_id AND p.user_id = auth.uid()
  )
$$;

-- Helper function to count children for current user
CREATE OR REPLACE FUNCTION public.count_my_children()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.children c
  JOIN public.profiles p ON c.parent_id = p.id
  WHERE p.user_id = auth.uid()
$$;

-- Helper function to get current user's profile id
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for children
CREATE POLICY "Users can view own children" ON public.children
    FOR SELECT USING (parent_id = public.get_my_profile_id());

CREATE POLICY "Users can insert children (max 3)" ON public.children
    FOR INSERT WITH CHECK (
        parent_id = public.get_my_profile_id() 
        AND public.count_my_children() < 3
    );

CREATE POLICY "Users can update own children" ON public.children
    FOR UPDATE USING (parent_id = public.get_my_profile_id());

CREATE POLICY "Users can delete own children" ON public.children
    FOR DELETE USING (parent_id = public.get_my_profile_id());

-- RLS Policies for child_tasks
CREATE POLICY "Users can view own children tasks" ON public.child_tasks
    FOR SELECT USING (public.is_own_child(child_id));

CREATE POLICY "Users can insert own children tasks" ON public.child_tasks
    FOR INSERT WITH CHECK (public.is_own_child(child_id));

CREATE POLICY "Users can update own children tasks" ON public.child_tasks
    FOR UPDATE USING (public.is_own_child(child_id));

CREATE POLICY "Users can delete own children tasks" ON public.child_tasks
    FOR DELETE USING (public.is_own_child(child_id));

-- RLS Policies for child_rewards
CREATE POLICY "Users can view own children rewards" ON public.child_rewards
    FOR SELECT USING (public.is_own_child(child_id));

CREATE POLICY "Users can insert own children rewards" ON public.child_rewards
    FOR INSERT WITH CHECK (public.is_own_child(child_id));

CREATE POLICY "Users can update own children rewards" ON public.child_rewards
    FOR UPDATE USING (public.is_own_child(child_id));

CREATE POLICY "Users can delete own children rewards" ON public.child_rewards
    FOR DELETE USING (public.is_own_child(child_id));

-- RLS Policies for child_daily_progress
CREATE POLICY "Users can view own children progress" ON public.child_daily_progress
    FOR SELECT USING (public.is_own_child(child_id));

CREATE POLICY "Users can insert own children progress" ON public.child_daily_progress
    FOR INSERT WITH CHECK (public.is_own_child(child_id));

CREATE POLICY "Users can update own children progress" ON public.child_daily_progress
    FOR UPDATE USING (public.is_own_child(child_id));

CREATE POLICY "Users can delete own children progress" ON public.child_daily_progress
    FOR DELETE USING (public.is_own_child(child_id));

-- RLS Policies for child_settings
CREATE POLICY "Users can view own children settings" ON public.child_settings
    FOR SELECT USING (public.is_own_child(child_id));

CREATE POLICY "Users can insert own children settings" ON public.child_settings
    FOR INSERT WITH CHECK (public.is_own_child(child_id));

CREATE POLICY "Users can update own children settings" ON public.child_settings
    FOR UPDATE USING (public.is_own_child(child_id));

-- RLS Policies for child_weekly_coins
CREATE POLICY "Users can view own children weekly coins" ON public.child_weekly_coins
    FOR SELECT USING (public.is_own_child(child_id));

CREATE POLICY "Users can insert own children weekly coins" ON public.child_weekly_coins
    FOR INSERT WITH CHECK (public.is_own_child(child_id));

CREATE POLICY "Users can update own children weekly coins" ON public.child_weekly_coins
    FOR UPDATE USING (public.is_own_child(child_id));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at
    BEFORE UPDATE ON public.children
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_child_settings_updated_at
    BEFORE UPDATE ON public.child_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-create settings when child is created
CREATE OR REPLACE FUNCTION public.create_child_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.child_settings (child_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_child_created
    AFTER INSERT ON public.children
    FOR EACH ROW EXECUTE FUNCTION public.create_child_settings();

-- Trigger to auto-create default tasks when child is created
CREATE OR REPLACE FUNCTION public.create_default_tasks()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.child_tasks (child_id, title, coins, icon, sort_order) VALUES
        (NEW.id, 'התעוררתי בזמן', 2, '⏰', 1),
        (NEW.id, 'התלבשתי לבד', 2, '👕', 2),
        (NEW.id, 'צחצחתי שיניים', 2, '🪥', 3),
        (NEW.id, 'אכלתי ארוחת בוקר', 2, '🥣', 4),
        (NEW.id, 'סידרתי את החדר', 2, '🛏️', 5),
        (NEW.id, 'הכנתי תיק לגן/בית ספר', 2, '🎒', 6);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_child_created_tasks
    AFTER INSERT ON public.children
    FOR EACH ROW EXECUTE FUNCTION public.create_default_tasks();

-- Trigger to auto-create default rewards when child is created
CREATE OR REPLACE FUNCTION public.create_default_rewards()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.child_rewards (child_id, title, cost, icon, requires_perfect_week, sort_order) VALUES
        (NEW.id, 'זמן מסך - 15 דקות', 10, '📱', false, 1),
        (NEW.id, 'בחירת קינוח', 15, '🍪', false, 2),
        (NEW.id, 'משחק עם ההורה', 20, '🎮', false, 3),
        (NEW.id, 'טיול לפארק', 30, '🌳', false, 4),
        (NEW.id, 'צעצוע קטן', 50, '🧸', true, 5);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_child_created_rewards
    AFTER INSERT ON public.children
    FOR EACH ROW EXECUTE FUNCTION public.create_default_rewards();