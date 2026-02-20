
-- Create site_pages table to store editable static page content
CREATE TABLE public.site_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Seed default pages
INSERT INTO public.site_pages (page_key, title, content) VALUES
  ('about', 'About Us', 'Welcome to SkillzUp! We provide free online courses for everyone.'),
  ('contact', 'Contact Us', 'Email us at: admin@skillzup.com'),
  ('copyright', 'Copyright & DMCA Policy', 'If you believe your copyrighted content has been shared without permission, please contact us with full details and we will take appropriate action within 48 hours.');

-- Enable RLS
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can read pages
CREATE POLICY "Public can view site pages"
ON public.site_pages
FOR SELECT
USING (true);

-- Only admins can manage pages
CREATE POLICY "Admins can manage site pages"
ON public.site_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_site_pages_updated_at
BEFORE UPDATE ON public.site_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
