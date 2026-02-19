import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Zap, Award, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    // SEO meta tags
    document.title = "SkillzUp - Free Online Courses | Learn Programming, Design & More";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Access free online courses on programming, web design, React, JavaScript and more. Watch a short ad and start learning today!");
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = "Access free online courses on programming, web design, React, JavaScript and more. Watch a short ad and start learning today!";
      document.head.appendChild(meta);
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const latestCourses = courses.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">SkillzUp</h1>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="hover:underline font-medium">Home</a>
            <a href="/courses" className="hover:underline">All Courses</a>
            <a href="/help" className="hover:underline">Help</a>
          </nav>
          <Button variant="ghost" size="sm" className="text-primary-foreground md:hidden" onClick={() => navigate("/courses")}>
            All Courses
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Learn For <span className="text-primary">Free</span>
          </h2>
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

      {/* Courses Section */}
      <section className="py-12 bg-muted/30">
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
                  onClick={() => handleCourseClick(course.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">No courses available yet.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <p className="text-lg font-bold text-primary">SkillzUp</p>
          <p className="text-sm text-muted-foreground">Free online courses for everyone. Learn, grow, succeed.</p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <a href="/courses" className="hover:text-primary">Courses</a>
            <a href="/help" className="hover:text-primary">Help</a>
            <a href="/admin/login" className="hover:text-primary">Admin</a>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SkillzUp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
