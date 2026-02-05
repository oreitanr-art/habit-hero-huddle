-- Create purchase history table
CREATE TABLE public.reward_purchases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    reward_title TEXT NOT NULL,
    reward_icon TEXT NOT NULL DEFAULT '🎁',
    cost INTEGER NOT NULL,
    week_key TEXT NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for fast queries
CREATE INDEX idx_reward_purchases_child_id ON public.reward_purchases(child_id);
CREATE INDEX idx_reward_purchases_week_key ON public.reward_purchases(week_key);

-- Enable Row Level Security
ALTER TABLE public.reward_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own children purchases"
ON public.reward_purchases FOR SELECT
USING (is_own_child(child_id));

CREATE POLICY "Users can insert own children purchases"
ON public.reward_purchases FOR INSERT
WITH CHECK (is_own_child(child_id));

-- RLS Policies for admins
CREATE POLICY "Admins can view all purchases"
ON public.reward_purchases FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can delete all purchases"
ON public.reward_purchases FOR DELETE
USING (is_admin());

CREATE POLICY "Admins can update all purchases"
ON public.reward_purchases FOR UPDATE
USING (is_admin());