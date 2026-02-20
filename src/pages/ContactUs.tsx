import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const ContactUs = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    supabase.from("site_pages").select("title,content").eq("page_key", "contact").maybeSingle().then(({ data }) => {
      if (data) setPage(data);
    });
    document.title = "Contact Us | SkillzUp";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    (meta as HTMLMetaElement).name = "description";
    (meta as HTMLMetaElement).content = "Get in touch with the SkillzUp team.";
    if (!document.querySelector('meta[name="description"]')) document.head.appendChild(meta);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <article className="prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-6">{page?.title || "Contact Us"}</h1>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">
            {page?.content || "Loading..."}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
};

export default ContactUs;
