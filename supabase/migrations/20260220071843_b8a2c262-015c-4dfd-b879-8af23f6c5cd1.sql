
-- Create banners table for homepage promotional slider
CREATE TABLE public.banners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  redirect_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Public can view active banners"
ON public.banners
FOR SELECT
USING (active = true);

-- Only admins can manage banners
CREATE POLICY "Admins can manage banners"
ON public.banners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create categories table for course filtering
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can view categories
CREATE POLICY "Public can view categories"
ON public.categories
FOR SELECT
USING (true);

-- Admins manage categories
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add category column to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category text DEFAULT NULL;

-- Seed some default categories
INSERT INTO public.categories (name, sort_order) VALUES
  ('Programming', 1),
  ('Web Design', 2),
  ('Mobile Development', 3),
  ('Data Science', 4),
  ('Digital Marketing', 5),
  ('Business', 6);

-- Seed a sample banner
INSERT INTO public.banners (title, image_url, redirect_url, sort_order) VALUES
  ('Welcome to SkillzUp', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80', '/courses', 1);
