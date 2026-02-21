import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CourseCard from "@/components/CourseCard";
import BannerSlider from "@/components/BannerSlider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    document.title = "SkillzUp - Free Online Courses | Learn Programming, Design & More";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta") as HTMLMetaElement; meta.name = "description"; document.head.appendChild(meta); }
    meta.content = "Access free online courses on programming, web design, React, JavaScript and more. Watch a short ad and start learning today!";
    fetchCourses();
    fetchCategories();
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("name").order("sort_order");
    if (data) setCategories(data.map((c: any) => c.name));
  };

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        !search.trim() ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        activeCategory === "All" || c.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [courses, search, activeCategory]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      <SiteHeader />

      {/* Search + Categories bar */}
      <div className="bg-card border-b border-border sticky top-[52px] sm:top-[56px] z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-background h-10 text-base"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search courses"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {["All", ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 min-h-[36px] active:scale-95 ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auto-scroll Banner */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 w-full">
        <BannerSlider />
      </div>

      {/* Courses Section */}
      <main className="flex-1 max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8 w-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              {activeCategory === "All" ? "All Free Courses" : activeCategory}
            </h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            {loadingCourses ? "..." : `${filtered.length} course${filtered.length !== 1 ? "s" : ""}`}
          </Badge>
        </div>

        {loadingCourses ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                image={course.image_url}
                description={course.description}
                category={course.category}
                onClick={() => navigate(`/course/${course.slug || course.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20">
            <Search className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-1">No courses found</h3>
            <p className="text-muted-foreground text-sm">
              {search ? `No results for "${search}"` : "No courses in this category yet."}
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
