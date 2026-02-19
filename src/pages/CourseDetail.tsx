import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Zap, ExternalLink, Play, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

  // Set SEO meta tags
  useEffect(() => {
    if (course) {
      document.title = `${course.title} - Free Course | SkillzUp`;
      const metaDesc = document.querySelector('meta[name="description"]');
      const content = course.meta_description || course.description || `Free course: ${course.title}. Watch a short ad and access the full course content.`;
      if (metaDesc) {
        metaDesc.setAttribute("content", content);
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = content;
        document.head.appendChild(meta);
      }
    }
  }, [course]);

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .single();

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
      const { data } = await supabase
        .from("ad_settings")
        .select("*")
        .eq("active", true)
        .limit(1)
        .maybeSingle();
      
      setAdSettings(data);
    } catch (error) {
      console.error("Error fetching ad settings:", error);
    }
  };

  const handleWatchAd = () => {
    setShowingAd(true);
  };

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
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-lg">Course not found</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const features = Array.isArray(course.features) ? course.features : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary-hover"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Course Details</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pb-24">
        {/* Course Image */}
        <div className="relative aspect-video">
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
          <div>
            <h3 className="text-lg font-semibold mb-2">About This Course</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.description}</p>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
              <div className="space-y-2">
                {features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ad Section */}
          {showingAd && adSettings?.ad_embed_code ? (
            <Card className="border-2 border-primary">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-center">Sponsored Content</h3>
                <div 
                  className="min-h-[250px] flex items-center justify-center bg-muted rounded-lg"
                  dangerouslySetInnerHTML={{ __html: adSettings.ad_embed_code }}
                />
                <Button 
                  className="w-full bg-success hover:bg-success/90 text-white"
                  onClick={handleAdComplete}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  I've Watched the Ad - Continue
                </Button>
              </CardContent>
            </Card>
          ) : showingAd && !adSettings?.ad_embed_code ? (
            <Card className="border-2 border-primary">
              <CardContent className="p-6 space-y-4 text-center">
                <h3 className="text-lg font-semibold">Loading Ad...</h3>
                <p className="text-sm text-muted-foreground">No ad configured. Access granted!</p>
                <Button 
                  className="w-full bg-success hover:bg-success/90 text-white"
                  onClick={handleAdComplete}
                >
                  Continue to Course
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>

      {/* Sticky Access Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          {adWatched ? (
            <Button 
              size="lg" 
              className="w-full bg-success hover:bg-success/90 text-white"
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

      {/* JSON-LD for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.title,
        "description": course.meta_description || course.description,
        "provider": { "@type": "Organization", "name": "SkillzUp" },
        "isAccessibleForFree": true,
      }) }} />
    </div>
  );
};

export default CourseDetail;
