-- Add birth_date column to children table for tracking child age
ALTER TABLE public.children 
ADD COLUMN birth_date date;

-- Add a comment for documentation
COMMENT ON COLUMN public.children.birth_date IS 'Child birth date for age calculation';