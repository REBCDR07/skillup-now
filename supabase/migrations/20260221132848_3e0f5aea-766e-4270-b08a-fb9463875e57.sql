
CREATE OR REPLACE FUNCTION public.increment_points(p_user_id UUID, p_points INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET points = points + p_points WHERE user_id = p_user_id;
END;
$$;
