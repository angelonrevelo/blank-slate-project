-- Add new columns to eye_examinations table for comprehensive visual acuity and examination data

-- Visual Acuity Near fields
ALTER TABLE eye_examinations
ADD COLUMN IF NOT EXISTS va_near_od text,
ADD COLUMN IF NOT EXISTS va_near_od_bc text,
ADD COLUMN IF NOT EXISTS va_near_od_ph text,
ADD COLUMN IF NOT EXISTS va_near_od_ar text,
ADD COLUMN IF NOT EXISTS va_near_od_k1 text,
ADD COLUMN IF NOT EXISTS va_near_od_k2 text,
ADD COLUMN IF NOT EXISTS va_near_od_axl text,
ADD COLUMN IF NOT EXISTS va_near_os text,
ADD COLUMN IF NOT EXISTS va_near_os_bc text,
ADD COLUMN IF NOT EXISTS va_near_os_ph text,
ADD COLUMN IF NOT EXISTS va_near_os_ar text,
ADD COLUMN IF NOT EXISTS va_near_os_k1 text,
ADD COLUMN IF NOT EXISTS va_near_os_k2 text,
ADD COLUMN IF NOT EXISTS va_near_os_axl text;

-- Visual Acuity Distance fields
ALTER TABLE eye_examinations
ADD COLUMN IF NOT EXISTS va_dist_od text,
ADD COLUMN IF NOT EXISTS va_dist_od_bc text,
ADD COLUMN IF NOT EXISTS va_dist_od_ph text,
ADD COLUMN IF NOT EXISTS va_dist_od_k1 text,
ADD COLUMN IF NOT EXISTS va_dist_od_k2 text,
ADD COLUMN IF NOT EXISTS va_dist_od_axl text,
ADD COLUMN IF NOT EXISTS va_dist_os text,
ADD COLUMN IF NOT EXISTS va_dist_os_bc text,
ADD COLUMN IF NOT EXISTS va_dist_os_ph text,
ADD COLUMN IF NOT EXISTS va_dist_os_k1 text,
ADD COLUMN IF NOT EXISTS va_dist_os_k2 text,
ADD COLUMN IF NOT EXISTS va_dist_os_axl text;

-- Slit Lamp examination fields
ALTER TABLE eye_examinations
ADD COLUMN IF NOT EXISTS slit_lamp_od text,
ADD COLUMN IF NOT EXISTS slit_lamp_os text;

-- Fundus examination fields
ALTER TABLE eye_examinations
ADD COLUMN IF NOT EXISTS fundus_od text,
ADD COLUMN IF NOT EXISTS fundus_os text,
ADD COLUMN IF NOT EXISTS cup_disc_ratio_od text,
ADD COLUMN IF NOT EXISTS cup_disc_ratio_os text;