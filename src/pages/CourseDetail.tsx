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

      // Open Graph tags
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
      // Try by slug first, then by id
      let query = supabase.from("courses").select("*").eq("published", true);
      // id param could be either slug or uuid
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

  const handleWatchAd = () => setShowingAd(true);

  const handleAdComplete = () => {
    setAdWatched(true);
    setShowingAd(false);
    toast.success("Ad complete! You can now access the course.");
  };

  const handleAccessCourse = () => {
    if (course?.drive_link) {
      window.open(course.drive_link, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Course link not available yet.");
    }
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-lg">Course not found</p>
          <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  const features = Array.isArray(course.features) ? course.features : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="max-w-4xl mx-auto w-full pb-28 flex-1">
        {/* Back Button */}
        <div className="px-4 pt-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        {/* Course Image */}
        <div className="relative aspect-video mt-2">
          <img
            src={course.image_url || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-4 right-4 bg-success text-success-foreground text-lg px-4 py-1">
            FREE
          </Badge>
        </div>

        {/* Course Info */}
        <div className="p-4 md:p-8 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{course.title}</h1>
            {course.meta_description && (
              <p className="text-sm text-muted-foreground italic mb-4">{course.meta_description}</p>
            )}
          </div>

          {/* Description */}
          {course.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">About This Course</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.description}</p>
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">What You'll Learn</h2>
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

          {/* Ad Section */}
          {showingAd && (
            <Card className="border-2 border-primary">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-center">📣 Sponsored Content</h3>
                {adSettings?.ad_embed_code ? (
                  <div
                    className="min-h-[250px] flex items-center justify-center bg-muted rounded-lg overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: adSettings.ad_embed_code }}
                  />
                ) : (
                  <div className="min-h-[150px] flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Ad loading... (No ad configured)</p>
                  </div>
                )}
                <Button
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  onClick={handleAdComplete}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  I've Watched the Ad — Continue
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
        <div className="max-w-4xl mx-auto">
          {adWatched ? (
            <Button
              size="lg"
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
              onClick={handleAccessCourse}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Access Course on Google Drive
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={handleWatchAd}
              disabled={showingAd}
            >
              <Zap className="h-5 w-5 mr-2" />
              {showingAd ? "Watching Ad..." : "Watch Ad to Access Course"}
            </Button>
          )}
        </div>
      </div>

      {/* JSON-LD Structured Data */}
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
