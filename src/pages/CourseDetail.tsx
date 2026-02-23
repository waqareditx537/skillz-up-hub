import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Zap, ExternalLink, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [adSettings, setAdSettings] = useState<any>(null);
  const [adWatched, setAdWatched] = useState(false);
  const [showingAd, setShowingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [loadingCourse, setLoadingCourse] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      fetchAdSettings();
    }
  }, [id]);

  useEffect(() => {
    if (course) {
      document.title = `${course.title} - Free Course | SkillzUp`;
      const content = course.meta_description || course.description || `Free course: ${course.title}. Watch a short ad and access the full course content.`;
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!meta) { meta = document.createElement("meta") as HTMLMetaElement; meta.name = "description"; document.head.appendChild(meta); }
      meta.content = content;

      const setOg = (prop: string, val: string) => {
        let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement;
        if (!el) { el = document.createElement("meta") as HTMLMetaElement; el.setAttribute("property", prop); document.head.appendChild(el); }
        el.content = val;
      };
      setOg("og:title", `${course.title} - Free Course | SkillzUp`);
      setOg("og:description", content);
      if (course.image_url) setOg("og:image", course.image_url);
      setOg("og:type", "article");
    }
  }, [course]);

  const fetchCourseDetails = async () => {
    try {
      let query = supabase.from("courses").select("*").eq("published", true);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(id!)) {
        query = query.eq("id", id!);
      } else {
        query = query.eq("slug", id!);
      }
      const { data, error } = await query.single();
      if (error) throw error;
      setCourse(data);
    } catch (error: any) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoadingCourse(false);
    }
  };

  const fetchAdSettings = async () => {
    try {
      const { data } = await supabase.from("ad_settings").select("*").eq("active", true).limit(1).maybeSingle();
      setAdSettings(data);
    } catch (error) {
      console.error("Error fetching ad settings:", error);
    }
  };

  const AD_DURATION = 15; // seconds

  const handleWatchAd = () => {
    setShowingAd(true);
    setAdCountdown(AD_DURATION);
  };

  useEffect(() => {
    if (!showingAd || adCountdown <= 0) {
      if (showingAd && adCountdown <= 0) {
        setAdWatched(true);
        setShowingAd(false);
        toast.success("Ad complete! You can now access the course.");
      }
      return;
    }
    const timer = setTimeout(() => setAdCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showingAd, adCountdown]);
  const handleAccessCourse = () => {
    if (course?.drive_link) {
      window.open(course.drive_link, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Course link not available yet.");
    }
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 px-4">
          <p className="text-lg">Course not found</p>
          <Button onClick={() => navigate("/courses")} className="min-h-[44px]">Browse Courses</Button>
        </div>
      </div>
    );
  }

  const features = Array.isArray(course.features) ? course.features : [];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      <SiteHeader />

      <main className="max-w-4xl mx-auto w-full pb-24 sm:pb-28 flex-1">
        <div className="px-3 sm:px-4 pt-3 sm:pt-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground min-h-[40px]" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <div className="relative aspect-video mt-2">
          <img
            src={course.image_url || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-success text-success-foreground text-sm sm:text-lg px-3 sm:px-4 py-1">
            FREE
          </Badge>
        </div>

        <div className="p-3 sm:p-4 md:p-8 space-y-5 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">{course.title}</h1>
            {course.meta_description && (
              <p className="text-sm text-muted-foreground italic mb-4">{course.meta_description}</p>
            )}
          </div>

          {course.description && (
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-2">About This Course</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.description}</p>
            </div>
          )}

          {features.length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3">What You'll Learn</h2>
              <div className="space-y-2">
                {features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fullscreen ad overlay rendered via portal-style fixed positioning */}
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-3 sm:p-4 z-40 safe-area-bottom">
        <div className="max-w-4xl mx-auto">
          {adWatched ? (
            <Button
              size="lg"
              className="w-full bg-success hover:bg-success/90 text-success-foreground min-h-[48px] text-base"
              onClick={handleAccessCourse}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Access Course on Google Drive
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground min-h-[48px] text-base"
              onClick={handleWatchAd}
              disabled={showingAd}
            >
              <Zap className="h-5 w-5 mr-2" />
              {showingAd ? "Watching Ad..." : "Watch Ad to Access Course"}
            </Button>
          )}
        </div>
      </div>

      {/* Fullscreen Ad Overlay */}
      {showingAd && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <div className="absolute top-4 right-4 bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold backdrop-blur-sm">
            {adCountdown}
          </div>
          <div className="flex-1 w-full flex items-center justify-center p-4">
            {adSettings?.ad_embed_code ? (
              <div
                className="w-full h-full max-w-3xl flex items-center justify-center overflow-hidden"
                dangerouslySetInnerHTML={{ __html: adSettings.ad_embed_code }}
              />
            ) : (
              <div className="text-center space-y-4">
                <p className="text-white/80 text-lg">📣 Sponsored Content</p>
                <p className="text-white/50 text-sm">Ad is playing... Please wait {adCountdown}s</p>
              </div>
            )}
          </div>
          <div className="w-full px-4 pb-6">
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((AD_DURATION - adCountdown) / AD_DURATION) * 100}%` }}
              />
            </div>
            <p className="text-white/60 text-center text-xs mt-2">Course will unlock automatically</p>
          </div>
        </div>
      )}

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.title,
        "description": course.meta_description || course.description,
        "provider": { "@type": "Organization", "name": "SkillzUp", "url": window.location.origin },
        "isAccessibleForFree": true,
        "url": window.location.href,
        ...(course.image_url ? { "image": course.image_url } : {}),
      }) }} />
    </div>
  );
};

export default CourseDetail;
