import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MyCourses = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMyCourses();
    }
  }, [user]);

  const fetchMyCourses = async () => {
    try {
      // Fetch paid courses
      const { data: paidPurchases, error: paidError } = await supabase
        .from('purchases')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'paid');

      if (paidError) throw paidError;

      // Fetch pending courses
      const { data: pendingPurchases, error: pendingError } = await supabase
        .from('purchases')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      setMyCourses(paidPurchases || []);
      setPendingCourses(pendingPurchases || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleContinueCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">My Courses</h1>
          <p className="text-muted-foreground">
            {loadingCourses 
              ? "Loading..." 
              : `${myCourses.length} course${myCourses.length === 1 ? '' : 's'} enrolled${pendingCourses.length > 0 ? `, ${pendingCourses.length} pending` : ''}`
            }
          </p>
        </div>

        {loadingCourses ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your courses...</p>
          </div>
        ) : myCourses.length === 0 && pendingCourses.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your learning journey by purchasing a course
              </p>
              <Button onClick={() => navigate("/courses")}>
                Browse Courses
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Courses */}
            {pendingCourses.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Pending Approval</h2>
                <div className="space-y-4">
                  {pendingCourses.map((purchase) => {
                    const course = purchase.courses;
                    if (!course) return null;

                    return (
                      <Card key={purchase.id} className="overflow-hidden border-yellow-200 dark:border-yellow-900">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            <div className="sm:w-48 h-32 sm:h-auto">
                              <img
                                src={course.image_url || '/placeholder.svg'}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 p-4 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-lg">{course.title}</h3>
                                  <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    Pending
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {course.description}
                                </p>
                              </div>

                              <div className="text-sm text-muted-foreground">
                                Submitted: {new Date(purchase.created_at).toLocaleDateString()}
                                <p className="text-xs mt-1">Waiting for admin approval</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Purchased Courses */}
            {myCourses.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">My Courses</h2>
                <div className="space-y-4">
                  {myCourses.map((purchase) => {
                    const course = purchase.courses;
                    if (!course) return null;

                    return (
                      <Card key={purchase.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            <div className="sm:w-48 h-32 sm:h-auto">
                              <img
                                src={course.image_url || '/placeholder.svg'}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 p-4 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-lg">{course.title}</h3>
                                  <Badge variant="outline" className="ml-2">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Purchased
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {course.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                  Purchased: {new Date(purchase.created_at).toLocaleDateString()}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleContinueCourse(course.id)}
                                >
                                  View Course
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <BottomNav activeTab="mycourses" onTabChange={() => {}} />
    </div>
  );
};

export default MyCourses;