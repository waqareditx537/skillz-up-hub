import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CourseCard from "@/components/CourseCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { BookOpen, Zap, Award } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    fetchCourses();
    document.title = "SkillzUp - Free Online Courses | Learn Programming, Design & More";
    const desc = "Access free online courses on programming, web design, React, JavaScript and more. Watch a short ad and start learning today!";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta") as HTMLMetaElement; meta.name = "description"; document.head.appendChild(meta); }
    meta.content = desc;
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase.from("courses").select("*").eq("published", true).order("created_at", { ascending: false });
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const latestCourses = courses.slice(0, 6);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent py-14 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">
            Learn For <span className="text-primary">Free</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Access premium courses completely free. Just watch a short ad and unlock full course content instantly.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={() => navigate("/courses")}>
            <BookOpen className="h-5 w-5 mr-2" />
            Browse Free Courses
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-background">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-xl border border-border bg-card">
            <Zap className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="text-lg font-semibold mb-2">100% Free Access</h3>
            <p className="text-sm text-muted-foreground">All courses are free. Watch a short rewarded ad to unlock.</p>
          </div>
          <div className="text-center p-6 rounded-xl border border-border bg-card">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Quality Content</h3>
            <p className="text-sm text-muted-foreground">Expert-curated courses on programming, design & more.</p>
          </div>
          <div className="text-center p-6 rounded-xl border border-border bg-card">
            <Award className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Instant Access</h3>
            <p className="text-sm text-muted-foreground">No signup needed. Watch ad, get the Google Drive link.</p>
          </div>
        </div>
      </section>

      {/* Latest Courses */}
      <section className="py-12 bg-muted/30 flex-1">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Latest Courses</h2>
            <Button variant="outline" onClick={() => navigate("/courses")}>View All</Button>
          </div>
          {loadingCourses ? (
            <p className="text-muted-foreground text-center py-12">Loading courses...</p>
          ) : latestCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  image={course.image_url}
                  description={course.description}
                  onClick={() => navigate(`/course/${course.slug || course.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">No courses available yet.</p>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
