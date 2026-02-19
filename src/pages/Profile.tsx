import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, LogOut, Award } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          {isAdmin && (
            <Badge className="bg-primary text-primary-foreground shadow-md">
              <Shield className="h-3 w-3 mr-1" />
              Administrator
            </Badge>
          )}
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <label className="text-sm text-muted-foreground font-medium">Email Address</label>
              <p className="font-medium text-foreground mt-1">{user.email}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <label className="text-sm text-muted-foreground font-medium">User ID</label>
              <p className="font-mono text-xs text-foreground mt-1">{user.id}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <label className="text-sm text-muted-foreground font-medium">Member Since</label>
              <p className="text-sm text-foreground mt-1">
                {new Date(user.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Shield className="h-5 w-5" />
                Admin Access
              </CardTitle>
              <CardDescription>You have full administrator privileges</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
                onClick={() => navigate("/admin")}
              >
                <Shield className="h-4 w-4 mr-2" />
                Open Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                <p className="text-3xl font-bold text-primary">0</p>
                <p className="text-sm text-muted-foreground mt-1">Courses Enrolled</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
                <p className="text-3xl font-bold text-success">0</p>
                <p className="text-sm text-muted-foreground mt-1">Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-accent"
              onClick={() => navigate("/mycourses")}
            >
              <Award className="h-4 w-4 mr-2" />
              My Courses
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-accent"
              onClick={() => navigate("/courses")}
            >
              Browse Courses
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>
      
      <BottomNav activeTab="profile" onTabChange={(tab) => {
        if (tab === "home") navigate("/home");
        if (tab === "mycourses") navigate("/mycourses");
        if (tab === "help") navigate("/help");
      }} />
    </div>
  );
};

export default Profile;
