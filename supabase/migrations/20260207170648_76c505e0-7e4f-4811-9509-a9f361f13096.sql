
-- Add task_period column to child_tasks
ALTER TABLE public.child_tasks 
ADD COLUMN task_period text NOT NULL DEFAULT 'morning';

-- Add evening tracking columns to child_daily_progress
ALTER TABLE public.child_daily_progress 
ADD COLUMN completed_evening_task_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
ADD COLUMN evening_submitted_at timestamp with time zone,
ADD COLUMN evening_all_done_bonus_applied boolean NOT NULL DEFAULT false,
ADD COLUMN evening_penalty_applied boolean NOT NULL DEFAULT false;

-- Update default tasks trigger to include evening tasks
CREATE OR REPLACE FUNCTION public.create_default_tasks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Morning tasks
    INSERT INTO public.child_tasks (child_id, title, coins, icon, sort_order, task_period) VALUES
        (NEW.id, 'התעוררתי בזמן', 2, '⏰', 1, 'morning'),
        (NEW.id, 'התלבשתי לבד', 2, '👕', 2, 'morning'),
        (NEW.id, 'צחצחתי שיניים', 2, '🪥', 3, 'morning'),
        (NEW.id, 'אכלתי ארוחת בוקר', 2, '🥣', 4, 'morning'),
        (NEW.id, 'סידרתי את החדר', 2, '🛏️', 5, 'morning'),
        (NEW.id, 'הכנתי תיק לגן/בית ספר', 2, '🎒', 6, 'morning');
    
    -- Evening tasks
    INSERT INTO public.child_tasks (child_id, title, coins, icon, sort_order, task_period) VALUES
        (NEW.id, 'עשיתי שיעורי בית', 3, '📚', 1, 'evening'),
        (NEW.id, 'התקלחתי', 2, '🛁', 2, 'evening'),
        (NEW.id, 'עזרתי לפנות אחרי ארוחה', 2, '🍽️', 3, 'evening'),
        (NEW.id, 'צחצחתי שיניים לפני שינה', 2, '🪥', 4, 'evening'),
        (NEW.id, 'נכנסתי למיטה בזמן', 3, '🌙', 5, 'evening');
    RETURN NEW;
END;
$function$;

-- Insert default evening tasks for ALL existing children
INSERT INTO public.child_tasks (child_id, title, coins, icon, sort_order, task_period)
SELECT c.id, t.title, t.coins, t.icon, t.sort_order, 'evening'
FROM public.children c
CROSS JOIN (
    VALUES 
        ('עשיתי שיעורי בית', 3, '📚', 1),
        ('התקלחתי', 2, '🛁', 2),
        ('עזרתי לפנות אחרי ארוחה', 2, '🍽️', 3),
        ('צחצחתי שיניים לפני שינה', 2, '🪥', 4),
        ('נכנסתי למיטה בזמן', 3, '🌙', 5)
) AS t(title, coins, icon, sort_order);
