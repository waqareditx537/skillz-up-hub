import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const CopyrightPolicy = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    supabase.from("site_pages").select("title,content").eq("page_key", "copyright").maybeSingle().then(({ data }) => {
      if (data) setPage(data);
    });
    document.title = "Copyright & DMCA Policy | SkillzUp";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    (meta as HTMLMetaElement).name = "description";
    (meta as HTMLMetaElement).content = "SkillzUp copyright and DMCA takedown policy. Report infringing content here.";
    if (!document.querySelector('meta[name="description"]')) document.head.appendChild(meta);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-bold text-foreground">{page?.title || "Copyright & DMCA Policy"}</h1>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-destructive font-medium">
            ⚠️ DMCA Notice: We take copyright infringement seriously. Valid takedown requests are processed within 48 hours.
          </p>
        </div>
        <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">
          {page?.content || "Loading..."}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default CopyrightPolicy;
