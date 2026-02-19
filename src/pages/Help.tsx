import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Mail, Phone, HelpCircle, Search, Send } from "lucide-react";

const Help = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const faqs = [
    {
      question: "How do I purchase a course?",
      answer: "Browse our courses, select the one you want, click 'Buy Now', and follow the payment instructions using EasyPaisa or JazzCash. After payment confirmation, the course will be available in 'My Courses'."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We currently accept EasyPaisa and JazzCash for secure and convenient payments. More payment options will be added soon!"
    },
    {
      question: "How do I access my purchased courses?",
      answer: "After purchasing, navigate to 'My Courses' from the bottom navigation bar to access all your enrolled courses and start learning immediately."
    },
    {
      question: "Can I get a refund?",
      answer: "We offer a 30-day money-back guarantee on all courses. If you're not satisfied, contact our support team with your purchase details within 30 days."
    },
    {
      question: "How long do I have access to a course?",
      answer: "You get lifetime access to all purchased courses, including any future updates, resources, and additional content added by the instructor."
    },
    {
      question: "Do I receive a certificate?",
      answer: "Yes! Upon successfully completing a course, you'll receive a certificate of completion that you can download and share on LinkedIn or your resume."
    },
    {
      question: "What if I face technical issues?",
      answer: "Contact our support team using the form below or email us at support@skillzup.com. We typically respond within 24 hours."
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setContactForm({ name: "", email: "", message: "" });
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
            <HelpCircle className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground">We're here to help you succeed</p>
        </div>

        {/* Search FAQs */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No FAQs found matching your search.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Contact Support
            </CardTitle>
            <CardDescription>Send us a message and we'll respond within 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  placeholder="How can we help you?"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Other Ways to Reach Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="mailto:support@skillzup.com" className="flex items-center p-3 hover:bg-accent rounded-lg transition-colors">
              <Mail className="h-5 w-5 text-primary mr-3" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@skillzup.com</p>
              </div>
            </a>
            <a href="tel:+923001234567" className="flex items-center p-3 hover:bg-accent rounded-lg transition-colors">
              <Phone className="h-5 w-5 text-primary mr-3" />
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">+92 300 123 4567</p>
              </div>
            </a>
          </CardContent>
        </Card>

        {/* Support Hours */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Support Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between p-2 hover:bg-accent rounded">
                <span className="text-muted-foreground">Monday - Friday:</span>
                <span className="font-medium">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between p-2 hover:bg-accent rounded">
                <span className="text-muted-foreground">Saturday:</span>
                <span className="font-medium">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between p-2 hover:bg-accent rounded">
                <span className="text-muted-foreground">Sunday:</span>
                <span className="font-medium">Closed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <BottomNav activeTab="help" onTabChange={(tab) => {
        if (tab === "home") navigate("/home");
        if (tab === "mycourses") navigate("/mycourses");
        if (tab === "profile") navigate("/profile");
      }} />
    </div>
  );
};

export default Help;
