import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  // Get the base URL from request
  const url = new URL(req.url);
  // Use referer or origin to figure out the site domain
  const origin = req.headers.get("origin") || req.headers.get("referer") || "https://skillzup.com";
  const baseUrl = origin.replace(/\/$/, "");

  // Fetch all published courses
  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, updated_at")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/courses", priority: "0.9", changefreq: "daily" },
    { url: "/about", priority: "0.6", changefreq: "monthly" },
    { url: "/contact", priority: "0.6", changefreq: "monthly" },
    { url: "/copyright", priority: "0.5", changefreq: "monthly" },
    { url: "/help", priority: "0.5", changefreq: "monthly" },
  ];

  const courseUrls = (courses || []).map((course: any) => ({
    url: `/course/${course.slug || course.id}`,
    lastmod: course.updated_at ? course.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
    priority: "0.8",
    changefreq: "weekly",
  }));

  const allUrls = [
    ...staticPages.map(p => ({
      ...p,
      lastmod: new Date().toISOString().split("T")[0],
    })),
    ...courseUrls,
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (entry) => `  <url>
    <loc>${baseUrl}${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
