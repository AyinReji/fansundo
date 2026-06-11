-- Temporary function to allow resetting all database data for testing
CREATE OR REPLACE FUNCTION public.reset_all_data()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  TRUNCATE public.reports CASCADE;
  TRUNCATE public.moderation_logs CASCADE;
  TRUNCATE public.messages CASCADE;
  TRUNCATE public.users CASCADE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_all_data() TO anon, authenticated;
