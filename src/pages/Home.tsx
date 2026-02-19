import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import BannerSlider from "@/components/BannerSlider";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const latestCourses = courses.slice(0, 3);
  const topCourses = courses.slice(3, 6);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="space-y-6">
        <BannerSlider />
        
        {/* Latest Courses Section */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Latest Courses</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => window.location.href = "/courses"}
            >
              See All
            </Button>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {loadingCourses ? (
              <p className="text-muted-foreground">Loading courses...</p>
            ) : latestCourses.length > 0 ? (
              latestCourses.map((course) => (
                <div key={course.id} className="flex-shrink-0 w-72">
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    image={course.image_url}
                    price={course.price}
                    mrp={course.mrp}
                    description={course.description}
                    onClick={() => handleCourseClick(course.id)}
                  />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No courses available yet.</p>
            )}
          </div>
        </section>
        
        {/* Top Courses Section */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Top Courses</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => window.location.href = "/courses"}
            >
              See All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingCourses ? (
              <p className="text-muted-foreground">Loading courses...</p>
            ) : topCourses.length > 0 ? (
              topCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  image={course.image_url}
                  price={course.price}
                  mrp={course.mrp}
                  description={course.description}
                  onClick={() => handleCourseClick(course.id)}
                />
              ))
            ) : (
              <p className="text-muted-foreground">No courses available yet.</p>
            )}
          </div>
        </section>
      </main>
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Home;