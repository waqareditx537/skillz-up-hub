import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "@/components/CourseCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Grid, List, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Courses = () => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("latest");
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    document.title = "All Free Courses | SkillzUp";
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase.from("courses").select("*").eq("published", true).order("created_at", { ascending: false });
      if (error) throw error;
      setAllCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const filteredCourses = [...allCourses].sort((a, b) => {
    if (sortBy === "title-asc") return a.title.localeCompare(b.title);
    if (sortBy === "title-desc") return b.title.localeCompare(a.title);
    return 0;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 flex-1 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">All Free Courses</h1>
            <p className="text-sm text-muted-foreground mt-1">Browse all available free courses. Watch an ad to access.</p>
          </div>
          <Badge variant="secondary">
            {loadingCourses ? "Loading..." : `${filteredCourses.length} free courses`}
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border border-border rounded-md">
            <Button variant={viewType === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewType("grid")} className="border-0 rounded-r-none">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewType === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewType("list")} className="border-0 rounded-l-none">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Courses */}
        {loadingCourses ? (
          <div className="text-center py-12"><p className="text-muted-foreground">Loading courses...</p></div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground">No published courses available yet</p>
          </div>
        ) : (
          <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                image={course.image_url}
                description={course.description}
                onClick={() => navigate(`/course/${course.slug || course.id}`)}
                variant={viewType}
              />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Courses;
