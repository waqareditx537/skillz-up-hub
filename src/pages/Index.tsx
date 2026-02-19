import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Award, Play } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/home");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">SkillzUp</h1>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/login")}>
              Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-8">
        <div className="space-y-4 max-w-md">
          <h2 className="text-3xl font-bold text-foreground">
            Master New Skills
          </h2>
          <p className="text-lg text-muted-foreground">
            Learn programming, design, and technology skills with our comprehensive courses
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          <Card>
            <CardHeader className="text-center pb-3">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">Expert-Led Courses</CardTitle>
              <CardDescription>Learn from industry professionals</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center pb-3">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">Active Community</CardTitle>
              <CardDescription>Join thousands of learners</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center pb-3">
              <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">Certified Learning</CardTitle>
              <CardDescription>Earn valuable certificates</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-3 w-full max-w-md">
          <Button 
            size="lg" 
            className="w-full bg-primary hover:bg-primary-hover"
            onClick={() => navigate("/login")}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Learning Today
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-primary hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;