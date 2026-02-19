import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Smartphone, Wallet, Shield, CheckCircle, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Buy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [paymentProviders, setPaymentProviders] = useState<any[]>([]);
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentProof, setPaymentProof] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchCourseAndProviders();
    }
  }, [id, user]);

  const fetchCourseAndProviders = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch active payment providers
      const { data: providersData, error: providersError } = await supabase
        .from('payment_providers')
        .select('*')
        .eq('active', true);

      if (providersError) throw providersError;
      setPaymentProviders(providersData || []);
      
      if (providersData && providersData.length > 0) {
        setSelectedPayment(providersData[0].provider);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load payment information');
    } finally {
      setLoadingData(false);
    }
  };

  const handlePayment = async () => {
    if (!transactionRef.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from('purchases')
        .insert([{
          user_id: user!.id,
          course_id: id!,
          amount: course.price,
          payment_method: selectedPayment as any,
          transaction_ref: transactionRef,
          status: 'pending' as any
        }]);

      if (error) throw error;

      toast.success('Payment submitted! Admin will verify and approve shortly.');
      navigate("/mycourses");
    } catch (error: any) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || loadingData) {
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

  const discount = course.mrp && course.price ? course.mrp - course.price : 0;
  const discountPercentage = course.mrp && course.price ? Math.round((discount / course.mrp) * 100) : 0;

  const selectedProvider = paymentProviders.find(p => p.provider === selectedPayment);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Complete Purchase</h1>
        </div>

        {/* Course Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <img
                src={course.image_url || '/placeholder.svg'}
                alt={course.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1 space-y-2">
                <h3 className="font-medium text-foreground">{course.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-primary">Rs {course.price}</span>
                  {course.mrp && course.mrp > course.price && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">Rs {course.mrp}</span>
                      <Badge variant="secondary" className="text-xs bg-success text-success-foreground">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>Payment Method</span>
            </CardTitle>
            <CardDescription>Choose your preferred payment method and complete payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentProviders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment methods available at the moment.</p>
            ) : (
              <>
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                  {paymentProviders.map((provider) => (
                    <div 
                      key={provider.id}
                      className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent"
                      onClick={() => setSelectedPayment(provider.provider)}
                    >
                      <RadioGroupItem value={provider.provider} />
                      {provider.provider === 'easypaisa' && <Smartphone className="h-5 w-5 text-primary" />}
                      {provider.provider === 'jazzcash' && <Wallet className="h-5 w-5 text-primary" />}
                      {provider.provider === 'bank_transfer' && <CreditCard className="h-5 w-5 text-primary" />}
                      <div className="flex-1">
                        <Label className="font-medium cursor-pointer">{provider.display_name}</Label>
                        {provider.account_number && (
                          <p className="text-sm text-muted-foreground">Account: {provider.account_number}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                {selectedProvider && selectedProvider.instructions && (
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Payment Instructions</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedProvider.instructions}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="transactionRef">Transaction ID / Reference Number *</Label>
                    <Input
                      id="transactionRef"
                      placeholder="Enter your transaction ID"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentProof">Additional Notes (Optional)</Label>
                    <Textarea
                      id="paymentProof"
                      placeholder="Any additional information about your payment"
                      value={paymentProof}
                      onChange={(e) => setPaymentProof(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Secure Payment</h4>
                <p className="text-xs text-muted-foreground">
                  Your payment information is encrypted and secure. We never store your payment details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Features */}
        {Array.isArray(course.features) && course.features.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Purchase Button */}
        <div className="sticky bottom-4">
          <Button 
            onClick={handlePayment}
            disabled={isProcessing || !selectedPayment || paymentProviders.length === 0}
            className="w-full bg-primary hover:bg-primary-hover py-6 text-lg"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              `Submit Payment - Rs ${course.price}`
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Your payment will be verified by admin before course access is granted
          </p>
        </div>
      </main>
    </div>
  );
};

export default Buy;