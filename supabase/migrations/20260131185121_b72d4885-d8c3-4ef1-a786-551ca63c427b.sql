-- Fix search_path for trigger functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.create_child_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.child_settings (child_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;