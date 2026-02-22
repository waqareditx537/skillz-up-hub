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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Upload, LogOut, BookOpen, Settings, Megaphone, Shield,
  Pencil, FileText, X, Save, ImagePlay, Tag, PlusCircle, Trash2
} from "lucide-react";

const EMPTY_COURSE = { title: "", description: "", image_url: "", drive_link: "", meta_description: "", features: [""], category: "" };

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  // Data states
  const [courses, setCourses] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [adSettings, setAdSettings] = useState<any>(null);
  const [adEmbedCode, setAdEmbedCode] = useState("");
  const [adActive, setAdActive] = useState(true);
  const [pages, setPages] = useState<Record<string, { title: string; content: string }>>({});
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [savingPage, setSavingPage] = useState<string | null>(null);

  // Course form
  const [courseForm, setCourseForm] = useState({ ...EMPTY_COURSE });
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_COURSE });

  // Banner form
  const [bannerForm, setBannerForm] = useState({ title: "", image_url: "", redirect_url: "", sort_order: 0 });
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [bannerHeight, setBannerHeight] = useState("200");

  // Category form
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/admin/login");
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) { fetchAll(); }
  }, [isAdmin]);

  const fetchAll = () => {
    fetchCourses(); fetchAdSettings(); fetchPages(); fetchBanners(); fetchCategories(); fetchBannerHeight();
  };

  const fetchBannerHeight = async () => {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "banner_height").maybeSingle();
    if (data?.value) setBannerHeight(data.value);
  };

  const saveBannerHeight = async () => {
    const { error } = await supabase.from("site_settings").upsert({ key: "banner_height", value: bannerHeight, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (!error) toast({ title: "Banner height saved!" });
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    if (data) setCourses(data);
  };

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    if (data) setBanners(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    if (data) setCategories(data);
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

  // ── Course helpers ──
  const toSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const addFeat = (form: any, set: any) => set({ ...form, features: [...form.features, ""] });
  const updFeat = (form: any, set: any, i: number, v: string) => {
    const f = [...form.features]; f[i] = v; set({ ...form, features: f });
  };
  const remFeat = (form: any, set: any, i: number) =>
    set({ ...form, features: form.features.filter((_: any, idx: number) => idx !== i) });

  const handleUploadCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) { toast({ title: "Error", description: "Title required", variant: "destructive" }); return; }
    if (!courseForm.drive_link.trim()) { toast({ title: "Error", description: "Drive link required", variant: "destructive" }); return; }
    try {
      const { error } = await supabase.from("courses").insert({
        title: courseForm.title.trim(), slug: toSlug(courseForm.title),
        description: courseForm.description.trim() || null,
        image_url: courseForm.image_url.trim() || null,
        drive_link: courseForm.drive_link.trim(),
        meta_description: courseForm.meta_description.trim() || null,
        category: courseForm.category || null,
        price: 0, mrp: 0,
        features: courseForm.features.filter(f => f.trim()),
        published: false,
      });
      if (error) throw error;
      toast({ title: "Course uploaded!", description: "Set to Draft. Publish when ready." });
      setCourseForm({ ...EMPTY_COURSE });
      fetchCourses();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const openEdit = (course: any) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title || "", description: course.description || "",
      image_url: course.image_url || "", drive_link: course.drive_link || "",
      meta_description: course.meta_description || "", category: course.category || "",
      features: Array.isArray(course.features) && course.features.length ? course.features : [""],
    });
  };

  const handleEditSave = async () => {
    if (!editingCourse) return;
    try {
      const { error } = await supabase.from("courses").update({
        title: editForm.title.trim(), slug: toSlug(editForm.title),
        description: editForm.description.trim() || null,
        image_url: editForm.image_url.trim() || null,
        drive_link: editForm.drive_link.trim(),
        meta_description: editForm.meta_description.trim() || null,
        category: editForm.category || null,
        features: editForm.features.filter(f => f.trim()),
      }).eq("id", editingCourse.id);
      if (error) throw error;
      toast({ title: "Course updated!" });
      setEditingCourse(null);
      fetchCourses();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const togglePublish = async (id: string, cur: boolean) => {
    const { error } = await supabase.from("courses").update({ published: !cur }).eq("id", id);
    if (!error) { toast({ title: `Course ${!cur ? "published" : "unpublished"}` }); fetchCourses(); }
  };

  // ── Banner helpers ──
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.image_url.trim()) { toast({ title: "Error", description: "Image URL required", variant: "destructive" }); return; }
    try {
      const { error } = await supabase.from("banners").insert({
        title: bannerForm.title.trim(),
        image_url: bannerForm.image_url.trim(),
        redirect_url: bannerForm.redirect_url.trim() || "/courses",
        sort_order: bannerForm.sort_order,
        active: true,
      });
      if (error) throw error;
      toast({ title: "Banner added!" });
      setBannerForm({ title: "", image_url: "", redirect_url: "", sort_order: 0 });
      fetchBanners();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const saveBannerEdit = async () => {
    if (!editingBanner) return;
    const { error } = await supabase.from("banners").update({
      title: editingBanner.title, image_url: editingBanner.image_url,
      redirect_url: editingBanner.redirect_url, sort_order: editingBanner.sort_order,
    }).eq("id", editingBanner.id);
    if (!error) { toast({ title: "Banner updated!" }); setEditingBanner(null); fetchBanners(); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const toggleBanner = async (id: string, cur: boolean) => {
    const { error } = await supabase.from("banners").update({ active: !cur }).eq("id", id);
    if (!error) { toast({ title: `Banner ${!cur ? "activated" : "deactivated"}` }); fetchBanners(); }
  };

  const deleteBanner = async (id: string) => {
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (!error) { toast({ title: "Banner deleted" }); fetchBanners(); }
  };

  // ── Category helpers ──
  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const { error } = await supabase.from("categories").insert({ name: newCategory.trim(), sort_order: categories.length + 1 });
    if (!error) { toast({ title: "Category added!" }); setNewCategory(""); fetchCategories(); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) { toast({ title: "Category removed" }); fetchCategories(); }
  };

  // ── Ad helpers ──
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
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  // ── Pages helpers ──
  const savePage = async (pageKey: string) => {
    setSavingPage(pageKey);
    try {
      const { error } = await supabase.from("site_pages").update({ title: pages[pageKey].title, content: pages[pageKey].content }).eq("page_key", pageKey);
      if (error) throw error;
      toast({ title: "Page saved!" });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setSavingPage(null); }
  };

  const updPage = (key: string, field: "title" | "content", val: string) =>
    setPages(p => ({ ...p, [key]: { ...p[key], [field]: val } }));

  // ── Admin helpers ──
  const grantAdminAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    try {
      const { data, error } = await supabase.functions.invoke("grant-admin-access", { body: { email: newAdminEmail.trim() } });
      if (error) throw error;
      if (data.error) toast({ title: "Error", description: data.error, variant: "destructive" });
      else { toast({ title: "Success", description: data.message }); setNewAdminEmail(""); }
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!isAdmin) return null;

  const pageKeys = [
    { key: "about", label: "About Us" },
    { key: "contact", label: "Contact Us" },
    { key: "copyright", label: "Copyright & DMCA" },
  ];

  const catNames = categories.map((c: any) => c.name);

  const CourseFormFields = ({ form, setForm, isEdit = false }: { form: any; setForm: any; isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Course Title *</Label>
          <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. React.js Complete Guide" required />
          {form.title && <p className="text-xs text-muted-foreground mt-1">URL: /course/{toSlug(form.title)}</p>}
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category || "none"} onValueChange={v => setForm({ ...form, category: v === "none" ? "" : v })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {catNames.map((n: string) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Embed Image URL</Label>
        <Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://example.com/image.jpg" />
        {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-20 object-cover rounded border" onError={e => (e.currentTarget.style.display = "none")} />}
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Detailed course description..." />
      </div>
      <div>
        <Label>Google Drive Link *</Label>
        <Input value={form.drive_link} onChange={e => setForm({ ...form, drive_link: e.target.value })} placeholder="https://drive.google.com/..." required />
      </div>
      <div>
        <Label>Meta Description (SEO) — max 160 chars</Label>
        <Textarea value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })} rows={2} maxLength={160} placeholder="Short description for search engines" />
        <p className="text-xs text-muted-foreground mt-1">{(form.meta_description || "").length}/160</p>
      </div>
      <div className="space-y-2">
        <Label>What You'll Learn</Label>
        {form.features.map((f: string, i: number) => (
          <div key={i} className="flex gap-2">
            <Input value={f} onChange={e => updFeat(form, setForm, i, e.target.value)} placeholder="Feature / lesson point" />
            <Button type="button" variant="outline" size="icon" onClick={() => remFeat(form, setForm, i)} disabled={form.features.length === 1}><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addFeat(form, setForm)}>+ Add Feature</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">⚙️ Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/admin/login"); }}>
            <LogOut className="h-4 w-4 mr-2" />Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="courses" className="text-xs"><BookOpen className="h-3.5 w-3.5 mr-1" />Courses</TabsTrigger>
            <TabsTrigger value="banners" className="text-xs"><ImagePlay className="h-3.5 w-3.5 mr-1" />Banners</TabsTrigger>
            <TabsTrigger value="ads" className="text-xs"><Megaphone className="h-3.5 w-3.5 mr-1" />Ads</TabsTrigger>
            <TabsTrigger value="pages" className="text-xs"><FileText className="h-3.5 w-3.5 mr-1" />Pages</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs"><Settings className="h-3.5 w-3.5 mr-1" />Settings</TabsTrigger>
          </TabsList>

          {/* ── COURSES ── */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Course</CardTitle>
                <CardDescription>Fills in image, Drive link, SEO and features. Saved as Draft until published.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadCourse} className="space-y-4">
                  <CourseFormFields form={courseForm} setForm={setCourseForm} />
                  <Button type="submit" className="w-full"><Upload className="h-4 w-4 mr-2" />Upload Course (Draft)</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Manage Courses ({courses.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      {course.image_url && (
                        <img src={course.image_url} alt={course.title} className="w-14 h-10 object-cover rounded flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{course.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {course.category && <span className="text-xs text-primary">{course.category}</span>}
                          {course.slug && <span className="text-xs text-muted-foreground truncate">/course/{course.slug}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={course.published ? "default" : "secondary"} className="text-xs">
                          {course.published ? "Live" : "Draft"}
                        </Badge>
                        <Switch checked={course.published} onCheckedChange={() => togglePublish(course.id, course.published)} />
                        <Dialog open={editingCourse?.id === course.id} onOpenChange={(o) => { if (!o) setEditingCourse(null); }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(course)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Edit: {editingCourse?.title}</DialogTitle></DialogHeader>
                            <CourseFormFields form={editForm} setForm={setEditForm} isEdit />
                            <Button className="w-full mt-4" onClick={handleEditSave}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
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

          {/* ── BANNERS ── */}
          <TabsContent value="banners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ImagePlay className="h-5 w-5 text-primary" />Banner Size</CardTitle>
                <CardDescription>Control the banner height on the homepage. YouTube-style is ~200px mobile, ~300px desktop.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label>Banner Height (px)</Label>
                    <Input type="number" min={100} max={500} value={bannerHeight} onChange={e => setBannerHeight(e.target.value)} placeholder="200" />
                    <p className="text-xs text-muted-foreground mt-1">Recommended: 150–300px. Preview updates after save.</p>
                  </div>
                  <Button onClick={saveBannerHeight}><Save className="h-4 w-4 mr-2" />Save</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ImagePlay className="h-5 w-5 text-primary" />Add Promotional Banner</CardTitle>
                <CardDescription>Upload banners that auto-scroll on the homepage. Use 16:9 images (e.g. 1280×720) for best results.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddBanner} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Banner Title (optional)</Label>
                      <Input value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} placeholder="e.g. Summer Sale" />
                    </div>
                    <div>
                      <Label>Sort Order</Label>
                      <Input type="number" value={bannerForm.sort_order} onChange={e => setBannerForm({ ...bannerForm, sort_order: parseInt(e.target.value) || 0 })} placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <Label>Banner Image URL *</Label>
                    <Input value={bannerForm.image_url} onChange={e => setBannerForm({ ...bannerForm, image_url: e.target.value })} placeholder="https://example.com/banner.jpg (1280×720 recommended)" required />
                    {bannerForm.image_url && (
                      <img src={bannerForm.image_url} alt="preview" className="mt-2 h-24 w-full object-cover rounded-xl border" onError={e => (e.currentTarget.style.display = "none")} />
                    )}
                  </div>
                  <div>
                    <Label>Redirect URL (when user clicks)</Label>
                    <Input value={bannerForm.redirect_url} onChange={e => setBannerForm({ ...bannerForm, redirect_url: e.target.value })} placeholder="/courses  or  https://external-link.com" />
                    <p className="text-xs text-muted-foreground mt-1">Use /courses for internal or full https:// for external links</p>
                  </div>
                  <Button type="submit" className="w-full"><PlusCircle className="h-4 w-4 mr-2" />Add Banner</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Manage Banners</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {banners.map((banner) => (
                    <div key={banner.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <img src={banner.image_url} alt={banner.title} className="w-20 h-12 object-cover rounded flex-shrink-0" onError={e => (e.currentTarget.style.display = "none")} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{banner.title || "(No title)"}</p>
                        <p className="text-xs text-muted-foreground truncate">→ {banner.redirect_url}</p>
                        <p className="text-xs text-muted-foreground">Order: {banner.sort_order}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={banner.active ? "default" : "secondary"} className="text-xs">{banner.active ? "Active" : "Off"}</Badge>
                        <Switch checked={banner.active} onCheckedChange={() => toggleBanner(banner.id, banner.active)} />
                        {/* Edit banner dialog */}
                        <Dialog open={editingBanner?.id === banner.id} onOpenChange={(o) => { if (!o) setEditingBanner(null); }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditingBanner({ ...banner })}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Edit Banner</DialogTitle></DialogHeader>
                            {editingBanner && (
                              <div className="space-y-4 pt-2">
                                <div>
                                  <Label>Title</Label>
                                  <Input value={editingBanner.title} onChange={e => setEditingBanner({ ...editingBanner, title: e.target.value })} />
                                </div>
                                <div>
                                  <Label>Image URL</Label>
                                  <Input value={editingBanner.image_url} onChange={e => setEditingBanner({ ...editingBanner, image_url: e.target.value })} />
                                  {editingBanner.image_url && <img src={editingBanner.image_url} alt="prev" className="mt-2 h-20 w-full object-cover rounded border" onError={e => (e.currentTarget.style.display = "none")} />}
                                </div>
                                <div>
                                  <Label>Redirect URL</Label>
                                  <Input value={editingBanner.redirect_url} onChange={e => setEditingBanner({ ...editingBanner, redirect_url: e.target.value })} />
                                </div>
                                <div>
                                  <Label>Sort Order</Label>
                                  <Input type="number" value={editingBanner.sort_order} onChange={e => setEditingBanner({ ...editingBanner, sort_order: parseInt(e.target.value) || 0 })} />
                                </div>
                                <Button className="w-full" onClick={saveBannerEdit}><Save className="h-4 w-4 mr-2" />Save Banner</Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteBanner(banner.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {banners.length === 0 && <p className="text-center text-muted-foreground py-6">No banners yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ADS ── */}
          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" />Rewarded Ad Settings</CardTitle>
                <CardDescription>Paste your Unity Ads / AdSense / PropellerAds embed code. Users must watch before getting the Drive link.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <Label>Ads Active</Label>
                    <p className="text-xs text-muted-foreground">Off = users can access courses without ad</p>
                  </div>
                  <Switch checked={adActive} onCheckedChange={setAdActive} />
                </div>
                <div>
                  <Label>Ad Embed Code (HTML/JS)</Label>
                  <Textarea
                    value={adEmbedCode}
                    onChange={e => setAdEmbedCode(e.target.value)}
                    rows={10}
                    placeholder={"<script src=\"unity-ads.js\"></script>\n<!-- Paste full ad network embed code here -->"}
                    className="font-mono text-sm"
                  />
                </div>
                {adEmbedCode && (
                  <div>
                    <Label>Preview</Label>
                    <div className="border rounded-lg p-4 bg-muted min-h-[60px]" dangerouslySetInnerHTML={{ __html: adEmbedCode }} />
                  </div>
                )}
                <Button onClick={saveAdSettings} className="w-full">Save Ad Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PAGES ── */}
          <TabsContent value="pages" className="space-y-6">
            {/* Category management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-primary" />Course Categories</CardTitle>
                <CardDescription>Categories appear as filter chips on the homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }} />
                  <Button onClick={addCategory} disabled={!newCategory.trim()}><PlusCircle className="h-4 w-4 mr-1" />Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat: any) => (
                    <div key={cat.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                      {cat.name}
                      <button onClick={() => deleteCategory(cat.id)} className="ml-1 hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories yet.</p>}
                </div>
              </CardContent>
            </Card>

            {/* Page editors */}
            {pageKeys.map(({ key, label }) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-base">{label}</CardTitle>
                  <CardDescription>Accessible at <code className="text-primary bg-muted px-1 rounded text-xs">/{key}</code></CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Page Title</Label>
                    <Input value={pages[key]?.title || ""} onChange={e => updPage(key, "title", e.target.value)} />
                  </div>
                  <div>
                    <Label>Page Content</Label>
                    <Textarea value={pages[key]?.content || ""} onChange={e => updPage(key, "content", e.target.value)} rows={6} placeholder={`Write ${label} content here...`} />
                  </div>
                  <Button onClick={() => savePage(key)} disabled={savingPage === key} className="w-full">
                    <Save className="h-4 w-4 mr-2" />{savingPage === key ? "Saving..." : `Save ${label}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── SETTINGS ── */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Admin Management</CardTitle>
                <CardDescription>Grant admin access to another user</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={grantAdminAccess} className="space-y-4">
                  <div>
                    <Label>User Email</Label>
                    <Input type="email" placeholder="user@example.com" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} required />
                    <p className="text-xs text-muted-foreground mt-1">User must already have an account.</p>
                  </div>
                  <Button type="submit" className="w-full">Grant Admin Access</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Search Console & SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Submit your sitemap at <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">/sitemap.xml</code> to Google Search Console.
                </p>
                <div className="bg-muted rounded-lg p-4 text-sm space-y-2">
                  <p className="font-medium">Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                    <li>Visit <strong>search.google.com/search-console</strong></li>
                    <li>Add your published site URL as a property</li>
                    <li>Sitemaps → Add → enter <code>sitemap.xml</code> → Submit</li>
                    <li>Each new course page gets auto-indexed via slug URL</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Admin Access</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Admin login page is at <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">/admin/login</code>.
                  This link is intentionally hidden from the public website footer.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
