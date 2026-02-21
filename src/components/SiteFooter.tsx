const SiteFooter = () => (
  <footer className="bg-card border-t border-border py-6 sm:py-8 mt-auto">
    <div className="max-w-6xl mx-auto px-3 sm:px-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-bold text-foreground mb-2">SkillzUp</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Free online courses for everyone. Learn, grow, succeed.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">Quick Links</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/" className="hover:text-primary transition-colors py-1 inline-block">Home</a></li>
            <li><a href="/courses" className="hover:text-primary transition-colors py-1 inline-block">All Courses</a></li>
            <li><a href="/help" className="hover:text-primary transition-colors py-1 inline-block">Help</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">Legal & Info</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/about" className="hover:text-primary transition-colors py-1 inline-block">About Us</a></li>
            <li><a href="/contact" className="hover:text-primary transition-colors py-1 inline-block">Contact Us</a></li>
            <li><a href="/copyright" className="hover:text-primary transition-colors py-1 inline-block">Copyright & DMCA</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border pt-4 sm:pt-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} SkillzUp. All rights reserved.</p>
        <p className="text-xs text-muted-foreground/60">Made with ❤️ for learners everywhere</p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
