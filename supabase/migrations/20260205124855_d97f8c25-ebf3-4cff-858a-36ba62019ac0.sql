-- Add fulfilled_at column to track when parent fulfilled the reward
ALTER TABLE public.reward_purchases
ADD COLUMN fulfilled_at timestamp with time zone DEFAULT NULL;

-- Add index for quick filtering of unfulfilled rewards
CREATE INDEX idx_reward_purchases_unfulfilled ON public.reward_purchases (child_id, fulfilled_at) WHERE fulfilled_at IS NULL;

-- Allow users to update their own children's purchases (to mark as fulfilled)
CREATE POLICY "Users can update own children purchases"
ON public.reward_purchases
FOR UPDATE
USING (is_own_child(child_id));