import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Play, Lock, Star, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<'none' | 'pending' | 'paid'>('none');
  const [loadingCourse, setLoadingCourse] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchCourseDetails();
      checkPurchaseStatus();
    }
  }, [id, user]);

  const fetchCourseDetails = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch lessons for this course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('sort_order', { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
    } catch (error: any) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course details');
    } finally {
      setLoadingCourse(false);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user?.id)
        .eq('course_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setPurchaseStatus(data.status as 'pending' | 'paid');
        setHasPurchased(data.status === 'paid');
      } else {
        setPurchaseStatus('none');
        setHasPurchased(false);
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };

  const discount = course?.mrp && course?.price 
    ? Math.round(((course.mrp - course.price) / course.mrp) * 100) 
    : 0;

  const handleBuyNow = () => {
    navigate(`/buy/${id}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading || loadingCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Course not found</p>
      </div>
    );
  }

  const features = Array.isArray(course.features) ? course.features : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary-hover"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Course Details</h1>
        </div>
      </header>

      <main className="pb-24">
        {/* Course Image */}
        <div className="relative aspect-video">
          <img
            src={course.image_url || '/placeholder.svg'}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          {!hasPurchased && discount > 0 && (
            <Badge className="absolute top-4 right-4 bg-discount text-discount-foreground">
              {discount}% OFF
            </Badge>
          )}
        </div>

        {/* Course Info */}
        <div className="p-4 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{course.title}</h1>
            
            {(course.rating || course.students || course.duration) && (
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                {course.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                )}
                {course.students && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                )}
                {course.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl font-bold text-success">Rs {course.price}</span>
              {course.mrp > course.price && (
                <span className="text-lg text-course-mrp line-through">Rs {course.mrp}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{course.description}</p>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">What you'll get</h3>
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

          {/* Course Content */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Course Content</h3>
            {lessons.length > 0 ? (
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const isAccessible = hasPurchased || lesson.preview;
                  const content = (
                    <Card key={lesson.id} className={isAccessible && lesson.content_url ? "cursor-pointer hover:shadow-md transition-shadow" : ""}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{lesson.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {lesson.duration_seconds 
                                ? `${Math.floor(lesson.duration_seconds / 60)} mins`
                                : 'Click to watch'
                              }
                            </p>
                          </div>
                          {!isAccessible ? (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Play className="w-4 h-4 text-success" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );

                  return isAccessible && lesson.content_url ? (
                    <a 
                      key={lesson.id}
                      href={lesson.content_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {content}
                    </a>
                  ) : content;
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No lessons available yet.</p>
            )}
          </div>
        </div>
      </main>

      {/* Sticky Buy/Access Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        {purchaseStatus === 'paid' ? (
          <Button 
            size="lg" 
            className="w-full bg-success hover:bg-success/90 text-white"
            onClick={() => navigate(`/mycourses`)}
          >
            Go to My Courses
          </Button>
        ) : purchaseStatus === 'pending' ? (
          <div className="space-y-2">
            <Button 
              size="lg" 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled
            >
              Payment Pending Approval
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Admin will verify your payment shortly
            </p>
          </div>
        ) : (
          <Button 
            size="lg" 
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
            onClick={handleBuyNow}
          >
            Buy Now - Rs {course.price}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;