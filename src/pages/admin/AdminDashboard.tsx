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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, LogOut, BookOpen, Settings, Megaphone, Shield, Pencil, FileText, X, Save } from "lucide-react";

const EMPTY_COURSE_FORM = {
  title: "",
  description: "",
  image_url: "",
  drive_link: "",
  meta_description: "",
  features: [""],
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  const [courses, setCourses] = useState<any[]>([]);
  const [adSettings, setAdSettings] = useState<any>(null);
  const [adEmbedCode, setAdEmbedCode] = useState("");
  const [adActive, setAdActive] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [courseForm, setCourseForm] = useState({ ...EMPTY_COURSE_FORM });

  // Edit course state
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_COURSE_FORM });

  // Pages state
  const [pages, setPages] = useState<Record<string, { title: string; content: string }>>({});
  const [savingPage, setSavingPage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/admin/login");
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
      fetchAdSettings();
      fetchPages();
    }
  }, [isAdmin]);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    if (data) setCourses(data);
  };

  const fetchAdSettings = async () => {
    const { data } = await supabase.from("ad_settings").select("*").limit(1).maybeSingle();
    if (data) { setAdSettings(data); setAdEmbedCode(data.ad_embed_code || ""); setAdActive(data.active); }
  };

  const fetchPages = async () => {
    const { data } = await supabase.from("site_pages").select("page_key,title,content");
    if (data) {
      const map: Record<string, { title: string; content: string }> = {};
      data.forEach((p: any) => { map[p.page_key] = { title: p.title, content: p.content }; });
      setPages(map);
    }
  };

  // Course form helpers
  const addFeature = () => setCourseForm({ ...courseForm, features: [...courseForm.features, ""] });
  const updateFeature = (i: number, v: string) => { const f = [...courseForm.features]; f[i] = v; setCourseForm({ ...courseForm, features: f }); };
  const removeFeature = (i: number) => setCourseForm({ ...courseForm, features: courseForm.features.filter((_, idx) => idx !== i) });

  // Edit form helpers
  const addEditFeature = () => setEditForm({ ...editForm, features: [...editForm.features, ""] });
  const updateEditFeature = (i: number, v: string) => { const f = [...editForm.features]; f[i] = v; setEditForm({ ...editForm, features: f }); };
  const removeEditFeature = (i: number) => setEditForm({ ...editForm, features: editForm.features.filter((_, idx) => idx !== i) });

  const handleUploadCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) { toast({ title: "Error", description: "Course title is required", variant: "destructive" }); return; }
    if (!courseForm.drive_link.trim()) { toast({ title: "Error", description: "Google Drive link is required", variant: "destructive" }); return; }
    try {
      // Generate slug from title
      const slug = courseForm.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const { error } = await supabase.from("courses").insert({
        title: courseForm.title.trim(),
        slug,
        description: courseForm.description.trim() || null,
        image_url: courseForm.image_url.trim() || null,
        drive_link: courseForm.drive_link.trim(),
        meta_description: courseForm.meta_description.trim() || null,
        price: 0, mrp: 0,
        features: courseForm.features.filter(f => f.trim() !== ""),
        published: false,
      });
      if (error) throw error;
      toast({ title: "Course uploaded!", description: "Course created. Publish it when ready." });
      setCourseForm({ ...EMPTY_COURSE_FORM });
      fetchCourses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openEditDialog = (course: any) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title || "",
      description: course.description || "",
      image_url: course.image_url || "",
      drive_link: course.drive_link || "",
      meta_description: course.meta_description || "",
      features: Array.isArray(course.features) && course.features.length > 0 ? course.features : [""],
    });
  };

  const handleEditSave = async () => {
    if (!editingCourse) return;
    try {
      const slug = editForm.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const { error } = await supabase.from("courses").update({
        title: editForm.title.trim(),
        slug,
        description: editForm.description.trim() || null,
        image_url: editForm.image_url.trim() || null,
        drive_link: editForm.drive_link.trim(),
        meta_description: editForm.meta_description.trim() || null,
        features: editForm.features.filter(f => f.trim() !== ""),
      }).eq("id", editingCourse.id);
      if (error) throw error;
      toast({ title: "Course updated!" });
      setEditingCourse(null);
      fetchCourses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleCoursePublish = async (courseId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("courses").update({ published: !currentStatus }).eq("id", courseId);
    if (!error) {
      toast({ title: "Course updated", description: `Course ${!currentStatus ? "published" : "unpublished"}` });
      fetchCourses();
    }
  };

  const saveAdSettings = async () => {
    try {
      if (adSettings) {
        const { error } = await supabase.from("ad_settings").update({ ad_embed_code: adEmbedCode, active: adActive }).eq("id", adSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ad_settings").insert({ ad_name: "rewarded_ad", ad_embed_code: adEmbedCode, active: adActive });
        if (error) throw error;
      }
      toast({ title: "Ad settings saved!" });
      fetchAdSettings();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const savePage = async (pageKey: string) => {
    setSavingPage(pageKey);
    try {
      const { error } = await supabase.from("site_pages").update({ title: pages[pageKey].title, content: pages[pageKey].content }).eq("page_key", pageKey);
      if (error) throw error;
      toast({ title: "Page saved!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSavingPage(null);
    }
  };

  const updatePageField = (key: string, field: "title" | "content", value: string) => {
    setPages(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const grantAdminAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    try {
      const { data, error } = await supabase.functions.invoke("grant-admin-access", { body: { email: newAdminEmail.trim() } });
      if (error) throw error;
      if (data.error) { toast({ title: "Error", description: data.error, variant: "destructive" }); }
      else { toast({ title: "Success", description: data.message }); setNewAdminEmail(""); }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => { await signOut(); navigate("/admin/login"); };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!isAdmin) return null;

  const pageKeys = [
    { key: "about", label: "About Us" },
    { key: "contact", label: "Contact Us" },
    { key: "copyright", label: "Copyright & DMCA" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses"><BookOpen className="h-4 w-4 mr-1" />Courses</TabsTrigger>
            <TabsTrigger value="ads"><Megaphone className="h-4 w-4 mr-1" />Ads</TabsTrigger>
            <TabsTrigger value="pages"><FileText className="h-4 w-4 mr-1" />Pages</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1" />Settings</TabsTrigger>
          </TabsList>

          {/* ── COURSES TAB ── */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Course</CardTitle>
                <CardDescription>Add a free course with embed image, Google Drive link and SEO details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Course Title *</Label>
                      <Input value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} required placeholder="e.g. React.js Complete Guide" />
                      {courseForm.title && <p className="text-xs text-muted-foreground mt-1">Slug: /course/{courseForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}</p>}
                    </div>
                    <div>
                      <Label>Embed Image URL</Label>
                      <Input value={courseForm.image_url} onChange={e => setCourseForm({ ...courseForm, image_url: e.target.value })} placeholder="https://example.com/image.jpg" />
                      {courseForm.image_url && (
                        <img src={courseForm.image_url} alt="Preview" className="mt-2 h-20 object-cover rounded border" onError={e => (e.currentTarget.style.display = "none")} />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} rows={3} placeholder="Detailed course description..." />
                  </div>
                  <div>
                    <Label>Google Drive Link *</Label>
                    <Input value={courseForm.drive_link} onChange={e => setCourseForm({ ...courseForm, drive_link: e.target.value })} required placeholder="https://drive.google.com/..." />
                  </div>
                  <div>
                    <Label>Meta Search Description (SEO) — max 160 chars</Label>
                    <Textarea value={courseForm.meta_description} onChange={e => setCourseForm({ ...courseForm, meta_description: e.target.value })} rows={2} placeholder="Short description for search engines" maxLength={160} />
                    <p className="text-xs text-muted-foreground mt-1">{courseForm.meta_description.length}/160</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Features / What You'll Learn</Label>
                    {courseForm.features.map((f, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={f} onChange={e => updateFeature(i, e.target.value)} placeholder="Feature description" />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeFeature(i)} disabled={courseForm.features.length === 1}><X className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addFeature}>+ Add Feature</Button>
                  </div>
                  <Button type="submit" className="w-full"><Upload className="h-4 w-4 mr-2" />Upload Course (Draft)</Button>
                </form>
              </CardContent>
            </Card>

            {/* Manage Courses */}
            <Card>
              <CardHeader><CardTitle>Manage Courses</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border border-border rounded-lg gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {course.image_url && (
                          <img src={course.image_url} alt={course.title} className="w-16 h-12 object-cover rounded flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">{course.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">{course.drive_link || "No drive link"}</p>
                          {course.slug && <p className="text-xs text-primary truncate">/course/{course.slug}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant={course.published ? "default" : "secondary"}>{course.published ? "Published" : "Draft"}</Badge>
                        <Switch checked={course.published} onCheckedChange={() => toggleCoursePublish(course.id, course.published)} />
                        {/* Edit Dialog */}
                        <Dialog open={editingCourse?.id === course.id} onOpenChange={(open) => { if (!open) setEditingCourse(null); }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(course)}><Pencil className="h-4 w-4" /></Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Edit Course</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Course Title *</Label>
                                  <Input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                                  {editForm.title && <p className="text-xs text-muted-foreground mt-1">Slug: /course/{editForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}</p>}
                                </div>
                                <div>
                                  <Label>Embed Image URL</Label>
                                  <Input value={editForm.image_url} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} placeholder="https://..." />
                                  {editForm.image_url && <img src={editForm.image_url} alt="Preview" className="mt-2 h-16 object-cover rounded border" onError={e => (e.currentTarget.style.display = "none")} />}
                                </div>
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} />
                              </div>
                              <div>
                                <Label>Google Drive Link *</Label>
                                <Input value={editForm.drive_link} onChange={e => setEditForm({ ...editForm, drive_link: e.target.value })} />
                              </div>
                              <div>
                                <Label>Meta Description (SEO)</Label>
                                <Textarea value={editForm.meta_description} onChange={e => setEditForm({ ...editForm, meta_description: e.target.value })} rows={2} maxLength={160} />
                                <p className="text-xs text-muted-foreground mt-1">{editForm.meta_description.length}/160</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Features</Label>
                                {editForm.features.map((f, i) => (
                                  <div key={i} className="flex gap-2">
                                    <Input value={f} onChange={e => updateEditFeature(i, e.target.value)} />
                                    <Button type="button" variant="outline" size="icon" onClick={() => removeEditFeature(i)} disabled={editForm.features.length === 1}><X className="h-4 w-4" /></Button>
                                  </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addEditFeature}>+ Add Feature</Button>
                              </div>
                              <Button className="w-full" onClick={handleEditSave}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && <p className="text-center text-muted-foreground py-8">No courses yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ADS TAB ── */}
          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" />Rewarded Ad Settings</CardTitle>
                <CardDescription>
                  Paste your ad network embed code (Unity Ads, Google AdSense, PropellerAds, etc.). Users must watch the ad before getting the Drive link.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ads Active</Label>
                    <p className="text-xs text-muted-foreground">When off, users can access courses without watching an ad</p>
                  </div>
                  <Switch checked={adActive} onCheckedChange={setAdActive} />
                </div>
                <div>
                  <Label>Ad Embed Code (HTML/JS)</Label>
                  <Textarea
                    value={adEmbedCode}
                    onChange={e => setAdEmbedCode(e.target.value)}
                    rows={10}
                    placeholder={'<script src="..."></script>\n<!-- or Unity Ads / any ad network SDK code -->'}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste the full HTML/JS embed code from Unity Ads, AdSense, PropellerAds, etc.
                  </p>
                </div>
                {adEmbedCode && (
                  <div>
                    <Label>Live Preview</Label>
                    <div className="border rounded-lg p-4 bg-muted min-h-[80px]" dangerouslySetInnerHTML={{ __html: adEmbedCode }} />
                  </div>
                )}
                <Button onClick={saveAdSettings} className="w-full">Save Ad Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PAGES TAB ── */}
          <TabsContent value="pages" className="space-y-6">
            <div className="grid gap-4">
              {pageKeys.map(({ key, label }) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{label}</CardTitle>
                    <CardDescription>Accessible at <code className="text-primary">/{key}</code></CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Page Title</Label>
                      <Input
                        value={pages[key]?.title || ""}
                        onChange={e => updatePageField(key, "title", e.target.value)}
                        placeholder={`${label} page title`}
                      />
                    </div>
                    <div>
                      <Label>Page Content</Label>
                      <Textarea
                        value={pages[key]?.content || ""}
                        onChange={e => updatePageField(key, "content", e.target.value)}
                        rows={6}
                        placeholder={`Write the ${label} content here. Supports plain text with line breaks.`}
                      />
                    </div>
                    <Button
                      onClick={() => savePage(key)}
                      disabled={savingPage === key}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {savingPage === key ? "Saving..." : `Save ${label}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── SETTINGS TAB ── */}
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
                    <Input type="email" placeholder="user@example.com" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} required />
                    <p className="text-xs text-muted-foreground mt-1">The user must have an account first.</p>
                  </div>
                  <Button type="submit" className="w-full">Grant Admin Access</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO & Sitemap</CardTitle>
                <CardDescription>Submit your sitemap to Google Search Console for indexing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  A sitemap is available at <code className="text-primary bg-muted px-1 rounded">/sitemap.xml</code>. Submit this URL to Google Search Console.
                </p>
                <div className="bg-muted rounded-lg p-4 text-sm space-y-2">
                  <p className="font-medium">Google Search Console Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Go to <strong>search.google.com/search-console</strong></li>
                    <li>Add your site property</li>
                    <li>Go to Sitemaps → Add sitemap</li>
                    <li>Enter <code>sitemap.xml</code> and submit</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
