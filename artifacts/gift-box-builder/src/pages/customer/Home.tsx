import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/StoreContext";
import { Gift, Package, ArrowLeft, Star, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { products } = useStore();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-primary/5 py-20 md:py-32">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-right z-10">
            <Badge variant="outline" className="bg-background text-primary border-primary/20 px-4 py-1 text-sm rounded-full">
              <Star className="w-3 h-3 ml-2 inline-block" />
              هدايا مصنوعة بحب
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
              اصنع هديتك <br />
              <span className="text-primary relative">
                بلمسة شخصية
                <span className="absolute bottom-0 left-0 w-full h-2 bg-primary/20 -z-10 rounded-full"></span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0 leading-relaxed">
              اختر من بين مجموعتنا المختارة بعناية أو صمم صندوق هدايا مخصص يعبر عن مشاعرك لمن تحب بكل رقي وأناقة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <Link href="/builder">
                <Button size="lg" className="rounded-full px-8 text-base h-14 group">
                  <Package className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  صمم بوكس هديتك
                </Button>
              </Link>
              <Link href="/catalog">
                <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-14 bg-background group">
                  <Gift className="ml-2 w-5 h-5 group-hover:text-primary transition-colors" />
                  تصفح الهدايا الجاهزة
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 relative w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/40 rounded-full blur-3xl -z-10 transform scale-110"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-background transform rotate-2 hover:rotate-0 transition-transform duration-500">
              {featuredProducts.length > 0 && (
                <img 
                  src={featuredProducts[0].image} 
                  alt="صندوق هدايا فاخر" 
                  className="w-full h-auto object-cover aspect-square"
                />
              )}
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-background p-4 rounded-xl shadow-xl border border-border/50 animate-bounce" style={{animationDuration: '3s'}}>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Heart className="w-6 h-6 fill-primary/20" />
                </div>
                <div>
                  <p className="text-sm font-bold">هدايا لا تُنسى</p>
                  <p className="text-xs text-muted-foreground">تفاصيل تصنع الفارق</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">كيف تصنع صندوق هديتك؟</h2>
            <p className="text-muted-foreground">خطوات بسيطة لتصميم هدية استثنائية تناسب ذوقك وتعبّر عن مشاعرك.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: "اختر التغليف", desc: "اختر الصندوق أو الغلاف المناسب", icon: Package, step: "1" },
              { title: "أضف الهدايا", desc: "اختر منتجات تناسب ذوق المهدى إليه", icon: Gift, step: "2" },
              { title: "اكتب رسالتك", desc: "أضف كارت إهداء بكلمات من القلب", icon: MessageCircle, step: "3", customIcon: true },
              { title: "استلم هديتك", desc: "نجهزها بكل حب ونوصلها لأي مكان", icon: Heart, step: "4" }
            ].map((feature, i) => (
              <div key={i} className="relative p-6 bg-card rounded-2xl border text-center group hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                  {feature.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
                
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 -left-4 w-8 border-t-2 border-dashed border-muted-foreground/30 z-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">هدايا مميزة</h2>
              <p className="text-muted-foreground">أكثر المنتجات طلباً من عملائنا</p>
            </div>
            <Link href="/catalog">
              <Button variant="ghost" className="text-primary hover:text-primary/80 group">
                عرض الكل
                <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/catalog`}>
                <Card className="overflow-hidden group cursor-pointer border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-background/80 backdrop-blur text-foreground hover:bg-background">
                        {product.category === 'handmade' ? 'صنع بحب' : 'جاهز'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-bold text-primary">{product.price} ج.م</span>
                      <Button size="sm" variant="secondary" className="rounded-full">
                        تخصيص
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">هل تبحث عن هدية فريدة لشركتك؟</h2>
          <p className="text-primary-foreground/80 text-lg mb-10">
            نقدم حلول هدايا الشركات المصممة خصيصاً لتعكس هوية علامتك التجارية وتعبر عن تقديرك لفريقك وعملائك.
          </p>
          <Link href="/special-request">
            <Button size="lg" variant="secondary" className="rounded-full px-10 text-lg text-primary hover:text-primary">
              تواصل معنا لطلب خاص
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

// Temporary icon fix
const MessageCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
);
