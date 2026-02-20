const SiteFooter = () => (
  <footer className="bg-card border-t border-border py-8 mt-auto">
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-foreground mb-3">SkillzUp</h3>
          <p className="text-sm text-muted-foreground">Free online courses for everyone. Learn, grow, succeed.</p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
            <li><a href="/courses" className="hover:text-primary transition-colors">All Courses</a></li>
            <li><a href="/help" className="hover:text-primary transition-colors">Help</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-3">Legal & Info</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
            <li><a href="/contact" className="hover:text-primary transition-colors">Contact Us</a></li>
            <li><a href="/copyright" className="hover:text-primary transition-colors">Copyright & DMCA</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} SkillzUp. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/copyright" className="hover:text-primary transition-colors">DMCA / Copyright Report</a>
          <a href="/admin/login" className="hover:text-primary transition-colors">Admin</a>
        </div>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
