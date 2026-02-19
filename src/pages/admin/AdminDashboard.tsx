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
import { Upload, LogOut, DollarSign, BookOpen, Settings, ShoppingCart, Check, X } from "lucide-react";
import { courseFormSchema, paymentProviderSchema } from "@/lib/validations/course";
import { z } from "zod";

interface Course {
  id: string;
  title: string;
  price: number;
  mrp: number;
  published: boolean;
  image_url: string | null;
}

interface PaymentProvider {
  id: string;
  provider: string;
  display_name: string;
  active: boolean;
  account_number: string | null;
  instructions: string | null;
}

interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  payment_method: string;
  transaction_ref: string | null;
  status: string;
  created_at: string;
  courses: { title: string } | null;
  user_email?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    price: "",
    mrp: "",
    features: [""],
    lessons: [{ title: "", content_url: "" }],
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<Record<string, { account_number: string; instructions: string }>>({});

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
      fetchPaymentProviders();
      fetchPurchases();
    }
  }, [isAdmin]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) setCourses(data);
  };

  const fetchPaymentProviders = async () => {
    const { data, error } = await supabase.from("payment_providers").select("*");
    
    if (!error && data) {
      setPaymentProviders(data);
      // Initialize payment settings state
      const settings: Record<string, { account_number: string; instructions: string }> = {};
      data.forEach(provider => {
        settings[provider.id] = {
          account_number: provider.account_number || '',
          instructions: provider.instructions || ''
        };
      });
      setPaymentSettings(settings);
    } else {
      const providers: Array<{ provider: 'easypaisa' | 'jazzcash', display_name: string, active: boolean, account_number: string, instructions: string }> = [
        { provider: 'easypaisa', display_name: 'EasyPaisa', active: false, account_number: '', instructions: '' },
        { provider: 'jazzcash', display_name: 'JazzCash', active: false, account_number: '', instructions: '' },
      ];
      for (const p of providers) {
        await supabase.from("payment_providers").insert([p]);
      }
      fetchPaymentProviders();
    }
  };

  const fetchPurchases = async () => {
    const { data, error } = await supabase
      .from("purchases")
      .select(`
        *,
        courses(title)
      `)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      // Fetch user emails for each purchase
      const purchasesWithEmails = await Promise.all(
        data.map(async (purchase) => {
          const { data: userData } = await supabase.auth.admin.getUserById(purchase.user_id);
          return {
            ...purchase,
            user_email: userData?.user?.email || 'Unknown'
          };
        })
      );
      setPurchases(purchasesWithEmails as any);
    }
  };

  const updatePurchaseStatus = async (purchaseId: string, newStatus: 'paid' | 'failed') => {
    const { error } = await supabase
      .from("purchases")
      .update({ status: newStatus })
      .eq("id", purchaseId);
    
    if (!error) {
      toast({ 
        title: newStatus === 'paid' ? "Purchase Approved" : "Purchase Rejected",
        description: `Purchase has been ${newStatus === 'paid' ? 'approved' : 'rejected'} successfully` 
      });
      fetchPurchases();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedImage(e.target.files[0]);
  };

  const addFeature = () => {
    setCourseForm({ ...courseForm, features: [...courseForm.features, ""] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...courseForm.features];
    newFeatures[index] = value;
    setCourseForm({ ...courseForm, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    setCourseForm({ ...courseForm, features: courseForm.features.filter((_, i) => i !== index) });
  };

  const addLesson = () => {
    setCourseForm({ ...courseForm, lessons: [...courseForm.lessons, { title: "", content_url: "" }] });
  };

  const updateLesson = (index: number, field: 'title' | 'content_url', value: string) => {
    const newLessons = [...courseForm.lessons];
    newLessons[index][field] = value;
    setCourseForm({ ...courseForm, lessons: newLessons });
  };

  const removeLesson = (index: number) => {
    setCourseForm({ ...courseForm, lessons: courseForm.lessons.filter((_, i) => i !== index) });
  };

  const handleUploadCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Validate form data
      const validatedData = courseFormSchema.parse({
        title: courseForm.title,
        description: courseForm.description || undefined,
        price: parseInt(courseForm.price),
        mrp: parseInt(courseForm.mrp),
        features: courseForm.features.filter(f => f.trim() !== ""),
      });

      let imageUrl = null;

      if (selectedImage) {
        // Validate file size (max 5MB)
        if (selectedImage.size > 5 * 1024 * 1024) {
          throw new Error("Image size must be less than 5MB");
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(selectedImage.type)) {
          throw new Error("Only JPEG, PNG, and WebP images are allowed");
        }

        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('course-assets').upload(fileName, selectedImage);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('course-assets').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { data: courseData, error } = await supabase.from("courses").insert({
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        mrp: validatedData.mrp,
        features: validatedData.features,
        image_url: imageUrl,
        published: false,
      }).select().single();

      if (error) throw error;

      // Insert lessons if any
      const validLessons = courseForm.lessons.filter(l => l.title.trim() !== "" && l.content_url.trim() !== "");
      if (validLessons.length > 0 && courseData) {
        const lessonsToInsert = validLessons.map((lesson, index) => ({
          course_id: courseData.id,
          title: lesson.title,
          content_url: lesson.content_url,
          sort_order: index,
        }));

        const { error: lessonsError } = await supabase.from("lessons").insert(lessonsToInsert);
        if (lessonsError) throw lessonsError;
      }

      toast({ title: "Course uploaded!", description: "Course created successfully with lessons" });
      setCourseForm({ title: "", description: "", price: "", mrp: "", features: [""], lessons: [{ title: "", content_url: "" }] });
      setSelectedImage(null);
      fetchCourses();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ 
          title: "Validation Error", 
          description: error.issues[0].message, 
          variant: "destructive" 
        });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCoursePublish = async (courseId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("courses").update({ published: !currentStatus }).eq("id", courseId);
    if (!error) {
      toast({ title: "Course updated", description: `Course ${!currentStatus ? 'published' : 'unpublished'}` });
      fetchCourses();
    }
  };

  const updatePaymentProvider = async (id: string, updates: {active?: boolean, account_number?: string, instructions?: string}) => {
    try {
      // Validate payment provider data
      const validatedData = paymentProviderSchema.parse(updates);
      
      const { error } = await supabase.from("payment_providers").update(validatedData).eq("id", id);
      if (error) throw error;
      
      toast({ title: "Payment settings updated" });
      fetchPaymentProviders();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ 
          title: "Validation Error", 
          description: error.issues[0].message, 
          variant: "destructive" 
        });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const grantAdminAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail.trim()) {
      toast({ title: "Error", description: "Please enter an email address", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('grant-admin-access', {
        body: { email: newAdminEmail.trim() }
      });

      if (error) throw error;

      if (data.error) {
        toast({ 
          title: "User Not Found", 
          description: data.error,
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Success", 
          description: data.message 
        });
        setNewAdminEmail("");
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to grant admin access", 
        variant: "destructive" 
      });
    }
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="courses"><BookOpen className="h-4 w-4 mr-2" />Courses</TabsTrigger>
            <TabsTrigger value="purchases"><ShoppingCart className="h-4 w-4 mr-2" />Purchases</TabsTrigger>
            <TabsTrigger value="payments"><DollarSign className="h-4 w-4 mr-2" />Payments</TabsTrigger>
            <TabsTrigger value="admins"><Settings className="h-4 w-4 mr-2" />Admins</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Course</CardTitle>
                <CardDescription>Add a new course to your platform</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadCourse} className="space-y-4">
                  <div>
                    <Label>Course Title</Label>
                    <Input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price (Rs)</Label>
                      <Input type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} required />
                    </div>
                    <div>
                      <Label>MRP (Rs)</Label>
                      <Input type="number" value={courseForm.mrp} onChange={(e) => setCourseForm({ ...courseForm, mrp: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <Label>Course Thumbnail</Label>
                    <Input type="file" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Features</Label>
                    {courseForm.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input value={feature} onChange={(e) => updateFeature(index, e.target.value)} placeholder="Feature description" />
                        <Button type="button" variant="outline" onClick={() => removeFeature(index)} disabled={courseForm.features.length === 1}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addFeature}>Add Feature</Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Lessons</Label>
                    {courseForm.lessons.map((lesson, index) => (
                      <div key={index} className="space-y-2 p-4 border rounded-lg">
                        <div className="flex gap-2 items-center">
                          <span className="text-sm font-medium">Lesson {index + 1}</span>
                          <Button type="button" variant="outline" size="sm" onClick={() => removeLesson(index)} disabled={courseForm.lessons.length === 1}>Remove</Button>
                        </div>
                        <Input 
                          value={lesson.title} 
                          onChange={(e) => updateLesson(index, 'title', e.target.value)} 
                          placeholder="Lesson title" 
                        />
                        <Input 
                          value={lesson.content_url} 
                          onChange={(e) => updateLesson(index, 'content_url', e.target.value)} 
                          placeholder="Google Drive link or video URL" 
                        />
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addLesson}>Add Lesson</Button>
                  </div>
                  <Button type="submit" disabled={isUploading} className="w-full"><Upload className="h-4 w-4 mr-2" />{isUploading ? "Uploading..." : "Upload Course"}</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Courses</CardTitle>
                <CardDescription>View and manage all courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">Rs {course.price} <span className="line-through ml-2">Rs {course.mrp}</span></p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={course.published ? "default" : "secondary"}>{course.published ? "Published" : "Draft"}</Badge>
                        <Switch checked={course.published} onCheckedChange={() => toggleCoursePublish(course.id, course.published)} />
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && <p className="text-center text-muted-foreground py-8">No courses yet. Upload your first course above!</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Purchases</CardTitle>
                <CardDescription>View and manage all course purchase requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchases.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No purchase requests yet.</p>
                  ) : (
                    <>
                      {/* Pending Purchases */}
                      <div>
                        <h3 className="font-semibold mb-3">Pending Approvals</h3>
                        <div className="space-y-3">
                          {purchases.filter(p => p.status === 'pending').map((purchase) => (
                            <Card key={purchase.id} className="border-yellow-200 dark:border-yellow-900">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{purchase.courses?.title || 'Unknown Course'}</h4>
                                    <p className="text-sm font-medium text-primary">User: {purchase.user_email}</p>
                                    <p className="text-sm text-muted-foreground">Amount: Rs {purchase.amount}</p>
                                    <p className="text-sm text-muted-foreground">Payment: {purchase.payment_method}</p>
                                    <p className="text-sm font-medium text-foreground">Transaction ID: {purchase.transaction_ref || 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(purchase.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => updatePurchaseStatus(purchase.id, 'paid')}
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updatePurchaseStatus(purchase.id, 'failed')}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {purchases.filter(p => p.status === 'pending').length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No pending purchases</p>
                          )}
                        </div>
                      </div>

                      {/* Approved Purchases */}
                      <div className="mt-6">
                        <h3 className="font-semibold mb-3">Approved Purchases</h3>
                        <div className="space-y-3">
                          {purchases.filter(p => p.status === 'paid').slice(0, 5).map((purchase) => (
                            <Card key={purchase.id} className="border-green-200 dark:border-green-900">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{purchase.courses?.title || 'Unknown Course'}</h4>
                                    <p className="text-sm font-medium text-primary">User: {purchase.user_email}</p>
                                    <p className="text-sm text-muted-foreground">Amount: Rs {purchase.amount}</p>
                                    <p className="text-sm text-muted-foreground">Transaction ID: {purchase.transaction_ref || 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(purchase.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                  <Badge variant="default" className="bg-green-500">Approved</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {purchases.filter(p => p.status === 'paid').length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No approved purchases yet</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Settings</CardTitle>
                <CardDescription>Configure EasyPaisa and JazzCash payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {paymentProviders.map((provider) => (
                  <Card key={provider.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{provider.display_name}</CardTitle>
                        <Switch checked={provider.active} onCheckedChange={(checked) => updatePaymentProvider(provider.id, { active: checked })} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Account Number / Mobile Number</Label>
                        <Input 
                          value={paymentSettings[provider.id]?.account_number || ""} 
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            [provider.id]: {
                              ...paymentSettings[provider.id],
                              account_number: e.target.value
                            }
                          })} 
                          placeholder="03XX-XXXXXXX" 
                        />
                      </div>
                      <div>
                        <Label>Payment Instructions for Users</Label>
                        <Textarea 
                          value={paymentSettings[provider.id]?.instructions || ""} 
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            [provider.id]: {
                              ...paymentSettings[provider.id],
                              instructions: e.target.value
                            }
                          })} 
                          placeholder="Instructions for making payment..." 
                          rows={3} 
                        />
                      </div>
                      <Button 
                        onClick={() => updatePaymentProvider(provider.id, paymentSettings[provider.id])}
                        className="w-full"
                      >
                        Save {provider.display_name} Settings
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription>Grant admin access to other users</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={grantAdminAccess} className="space-y-4">
                  <div>
                    <Label htmlFor="admin-email">User Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="user@example.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Note: The user must sign up first before you can grant them admin access.
                    </p>
                  </div>
                  <Button type="submit" className="w-full">
                    Grant Admin Access
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your admin settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">More settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
