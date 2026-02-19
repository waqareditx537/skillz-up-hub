
-- Add drive_link and meta_description to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS drive_link text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS meta_description text;

-- Create ad_settings table for admin to manage rewarded ad embed code
CREATE TABLE public.ad_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_name text NOT NULL DEFAULT 'rewarded_ad',
  ad_embed_code text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage ad settings
CREATE POLICY "Admins can manage ad settings"
ON public.ad_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can read active ad settings (needed for public course pages)
CREATE POLICY "Public can view active ad settings"
ON public.ad_settings
FOR SELECT
USING (active = true);

-- Update courses RLS: make published courses viewable by anyone (no auth needed)
DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;
CREATE POLICY "Anyone can view published courses"
ON public.courses
FOR SELECT
USING (published = true OR has_role(auth.uid(), 'admin'::app_role));
