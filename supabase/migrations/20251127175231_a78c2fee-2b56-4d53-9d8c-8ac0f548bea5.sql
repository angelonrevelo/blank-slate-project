-- Fix security warnings: Add search_path to functions

-- Update calculate_age function with proper search_path
CREATE OR REPLACE FUNCTION calculate_age(birthdate date)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate))::integer;
$$;

-- Update update_patient_age trigger function with proper search_path
CREATE OR REPLACE FUNCTION update_patient_age()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.age := calculate_age(NEW.birthdate);
  RETURN NEW;
END;
$$;