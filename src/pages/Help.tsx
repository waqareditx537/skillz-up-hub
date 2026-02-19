import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, HelpCircle, Search, Mail } from "lucide-react";

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    { question: "Are the courses really free?", answer: "Yes! All courses are 100% free. You just need to watch a short rewarded ad before accessing the course content." },
    { question: "How do I access a course?", answer: "Browse our courses, click on the one you want, and click 'Watch Ad to Access Course'. After watching, you'll get a direct link to the course on Google Drive." },
    { question: "Do I need to create an account?", answer: "No! You don't need to sign up or login. All courses are publicly available." },
    { question: "What if the Google Drive link doesn't work?", answer: "Contact us via email and we'll fix it right away. Links are regularly maintained." },
    { question: "Can I download the courses?", answer: "Yes, once you access the Google Drive link, you can download the content depending on the sharing settings." },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-hover" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Help & Support</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <HelpCircle className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-2xl font-bold">How can we help?</h2>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search FAQs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {filteredFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" />Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Email us at <a href="mailto:support@skillzup.com" className="text-primary hover:underline">support@skillzup.com</a></p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Help;
