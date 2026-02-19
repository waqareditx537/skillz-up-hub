import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Upload, LogOut, BookOpen, Settings, Megaphone, Shield } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [adSettings, setAdSettings] = useState<any>(null);
  const [adEmbedCode, setAdEmbedCode] = useState("");
  const [adActive, setAdActive] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    image_url: "",
    drive_link: "",
    meta_description: "",
    features: [""],
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
      fetchAdSettings();
    }
  }, [isAdmin]);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCourses(data);
  };

  const fetchAdSettings = async () => {
    const { data } = await supabase
      .from("ad_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setAdSettings(data);
      setAdEmbedCode(data.ad_embed_code || "");
      setAdActive(data.active);
    }
  };

  const addFeature = () => setCourseForm({ ...courseForm, features: [...courseForm.features, ""] });
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...courseForm.features];
    newFeatures[index] = value;
    setCourseForm({ ...courseForm, features: newFeatures });
  };
  const removeFeature = (index: number) => setCourseForm({ ...courseForm, features: courseForm.features.filter((_, i) => i !== index) });

  const handleUploadCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseForm.title.trim()) {
      toast({ title: "Error", description: "Course title is required", variant: "destructive" });
      return;
    }
    if (!courseForm.drive_link.trim()) {
      toast({ title: "Error", description: "Google Drive link is required", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("courses").insert({
        title: courseForm.title.trim(),
        description: courseForm.description.trim() || null,
        image_url: courseForm.image_url.trim() || null,
        drive_link: courseForm.drive_link.trim(),
        meta_description: courseForm.meta_description.trim() || null,
        price: 0,
        mrp: 0,
        features: courseForm.features.filter(f => f.trim() !== ""),
        published: false,
      });

      if (error) throw error;

      toast({ title: "Course uploaded!", description: "Course created successfully. Publish it when ready." });
      setCourseForm({ title: "", description: "", image_url: "", drive_link: "", meta_description: "", features: [""] });
      fetchCourses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleCoursePublish = async (courseId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("courses").update({ published: !currentStatus }).eq("id", courseId);
    if (!error) {
      toast({ title: "Course updated", description: `Course ${!currentStatus ? 'published' : 'unpublished'}` });
      fetchCourses();
    }
  };

  const saveAdSettings = async () => {
    try {
      if (adSettings) {
        const { error } = await supabase
          .from("ad_settings")
          .update({ ad_embed_code: adEmbedCode, active: adActive })
          .eq("id", adSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ad_settings")
          .insert({ ad_name: "rewarded_ad", ad_embed_code: adEmbedCode, active: adActive });
        if (error) throw error;
      }
      toast({ title: "Ad settings saved!" });
      fetchAdSettings();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const grantAdminAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    try {
      const { data, error } = await supabase.functions.invoke("grant-admin-access", {
        body: { email: newAdminEmail.trim() },
      });
      if (error) throw error;
      if (data.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      } else {
        toast({ title: "Success", description: data.message });
        setNewAdminEmail("");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses"><BookOpen className="h-4 w-4 mr-2" />Courses</TabsTrigger>
            <TabsTrigger value="ads"><Megaphone className="h-4 w-4 mr-2" />Ads</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Course</CardTitle>
                <CardDescription>Add a new free course with Google Drive link</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadCourse} className="space-y-4">
                  <div>
                    <Label>Course Title *</Label>
                    <Input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required placeholder="e.g. React.js Complete Guide" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={4} placeholder="Detailed course description..." />
                  </div>
                  <div>
                    <Label>Embed Image URL</Label>
                    <Input value={courseForm.image_url} onChange={(e) => setCourseForm({ ...courseForm, image_url: e.target.value })} placeholder="https://example.com/image.jpg" />
                    {courseForm.image_url && (
                      <img src={courseForm.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded-lg border" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    )}
                  </div>
                  <div>
                    <Label>Google Drive Link *</Label>
                    <Input value={courseForm.drive_link} onChange={(e) => setCourseForm({ ...courseForm, drive_link: e.target.value })} required placeholder="https://drive.google.com/..." />
                  </div>
                  <div>
                    <Label>Meta Search Description (SEO)</Label>
                    <Textarea value={courseForm.meta_description} onChange={(e) => setCourseForm({ ...courseForm, meta_description: e.target.value })} rows={2} placeholder="Short description for search engines (max 160 chars)" maxLength={160} />
                    <p className="text-xs text-muted-foreground mt-1">{courseForm.meta_description.length}/160 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Features / What You'll Learn</Label>
                    {courseForm.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input value={feature} onChange={(e) => updateFeature(index, e.target.value)} placeholder="Feature description" />
                        <Button type="button" variant="outline" onClick={() => removeFeature(index)} disabled={courseForm.features.length === 1}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addFeature}>Add Feature</Button>
                  </div>
                  <Button type="submit" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />Upload Course
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4 flex-1">
                        {course.image_url && (
                          <img src={course.image_url} alt={course.title} className="w-16 h-12 object-cover rounded" />
                        )}
                        <div>
                          <h3 className="font-medium">{course.title}</h3>
                          <p className="text-xs text-muted-foreground truncate max-w-md">{course.drive_link || "No drive link"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={course.published ? "default" : "secondary"}>{course.published ? "Published" : "Draft"}</Badge>
                        <Switch checked={course.published} onCheckedChange={() => toggleCoursePublish(course.id, course.published)} />
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && <p className="text-center text-muted-foreground py-8">No courses yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" />Rewarded Ads Settings</CardTitle>
                <CardDescription>Configure the ad that users see before accessing courses. Paste your ad network embed code below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ads Active</Label>
                  <Switch checked={adActive} onCheckedChange={setAdActive} />
                </div>
                <div>
                  <Label>Ad Embed Code (HTML)</Label>
                  <Textarea 
                    value={adEmbedCode} 
                    onChange={(e) => setAdEmbedCode(e.target.value)} 
                    rows={8} 
                    placeholder='<script>...</script> or <div>...</div> ad embed code from your ad network'
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste the full HTML/JS embed code from your ad provider (Google AdSense, PropellerAds, etc.)
                  </p>
                </div>
                {adEmbedCode && (
                  <div>
                    <Label>Preview</Label>
                    <div className="border rounded-lg p-4 bg-muted min-h-[100px]" dangerouslySetInnerHTML={{ __html: adEmbedCode }} />
                  </div>
                )}
                <Button onClick={saveAdSettings} className="w-full">Save Ad Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Admin Management</CardTitle>
                <CardDescription>Grant admin access to other users</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={grantAdminAccess} className="space-y-4">
                  <div>
                    <Label>User Email Address</Label>
                    <Input type="email" placeholder="user@example.com" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} required />
                    <p className="text-xs text-muted-foreground mt-1">The user must have an account first.</p>
                  </div>
                  <Button type="submit" className="w-full">Grant Admin Access</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
