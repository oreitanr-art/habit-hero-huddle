-- Add submitted_at field to track when the day's tasks were submitted/locked
ALTER TABLE public.child_daily_progress
ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN public.child_daily_progress.submitted_at IS 'When set, the day is locked and only admin/parent can edit';