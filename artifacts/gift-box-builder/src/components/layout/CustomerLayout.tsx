import { Link, useLocation } from "wouter";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, Gift, Package, Star, MessageCircle, Home, Phone, Mail, MapPin, Facebook, Instagram, Twitter, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { cartCount, settings } = useStore();
  const { contact } = settings;

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/catalog", label: "الكتالوج", icon: Gift },
    { href: "/builder", label: "صانع البوكس", icon: Package },
    { href: "/special-request", label: "طلب خاص", icon: MessageCircle },
    { href: "/track-order", label: "تتبع الطلب", icon: PackageSearch },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">القائمة</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 font-sans">
                <div className="flex flex-col gap-6 pt-10">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={cn(
                        "flex items-center gap-3 text-lg font-medium transition-colors hover:text-primary",
                        location === link.href ? "text-primary" : "text-muted-foreground"
                      )}>
                        <link.icon className="h-5 w-5" />
                        {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
                <Star className="h-6 w-6 text-primary fill-primary/20" />
                <span className="text-xl font-bold text-primary hidden sm:inline-block">متجر الهدايا المخصص</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-1",
                  location === link.href ? "text-primary" : "text-muted-foreground"
                )}>
                  {link.label}
                  {location === link.href && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                  )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative text-foreground hover:text-primary hover:bg-primary/10 inline-flex h-10 w-10 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">السلة</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <footer className="border-t bg-card mt-auto py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          {/* Brand */}
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Star className="h-5 w-5 text-primary fill-primary/20" />
              <span className="text-lg font-bold text-primary">متجر الهدايا المخصص</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto md:mx-0 mb-5">
              نصنع ذكريات لا تُنسى في كل صندوق. هدايا مصممة بحب واهتمام لتناسب كل مناسباتكم السعيدة.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              {contact.facebook && (
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-blue-100 hover:text-blue-600 transition-colors" aria-label="فيسبوك">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {contact.instagram && (
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-pink-100 hover:text-pink-600 transition-colors" aria-label="إنستجرام">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {contact.twitter && (
                <a href={contact.twitter} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-sky-100 hover:text-sky-500 transition-colors" aria-label="تويتر">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {contact.whatsapp && (
                <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-green-100 hover:text-green-600 transition-colors" aria-label="واتساب">
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/catalog" className="hover:text-primary transition-colors">الكتالوج</Link></li>
              <li><Link href="/builder" className="hover:text-primary transition-colors">صانع البوكس</Link></li>
              <li><Link href="/special-request" className="hover:text-primary transition-colors">الطلبات الخاصة</Link></li>
              <li><Link href="/track-order" className="hover:text-primary transition-colors">تتبع الطلب</Link></li>
            </ul>
          </div>

          {/* Dynamic Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">تواصل معنا</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {contact.address && (
                <li className="flex items-start gap-2 justify-center md:justify-start">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors" dir="ltr">{contact.phone}</a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors" dir="ltr">{contact.email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} متجر الهدايا المخصص. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
