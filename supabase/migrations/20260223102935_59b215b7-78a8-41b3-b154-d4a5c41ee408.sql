
-- Add unique constraint on user_module_progress for upsert
ALTER TABLE public.user_module_progress 
ADD CONSTRAINT user_module_progress_user_module_unique UNIQUE (user_id, module_id);
