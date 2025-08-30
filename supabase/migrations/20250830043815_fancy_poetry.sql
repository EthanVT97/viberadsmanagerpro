/*
  # Create automatic profile creation trigger

  1. Functions
    - `handle_new_user()` - Automatically creates a profile when a new user signs up
  
  2. Triggers
    - Trigger on auth.users insert to create profile
  
  3. Security
    - Function runs with security definer privileges
    - Ensures every new user gets a profile record
*/

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, business_name, contact_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();