import { useStore } from "@/context/StoreContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag, Package } from "lucide-react";

export default function Cart() {
  const { cart, products, packaging, updateCartItem, removeFromCart, cartTotal } = useStore();
  const [, setLocation] = useLocation();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">سلة المشتريات فارغة</h2>
        <p className="text-muted-foreground mb-8 max-w-md">يبدو أنك لم تقم بإضافة أي هدايا إلى سلتك بعد. تصفح الكتالوج أو ابدأ بتصميم صندوقك الخاص.</p>
        <div className="flex gap-4">
          <Link href="/catalog">
            <Button size="lg" className="rounded-full">تصفح الكتالوج</Button>
          </Link>
          <Link href="/builder">
            <Button size="lg" variant="outline" className="rounded-full">صمم بوكس</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">سلة المشتريات</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map((item) => {
            if (item.type === 'product') {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;
              
              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <img src={product.image} alt={product.name} className="w-full sm:w-24 h-24 object-cover rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <span className="font-bold text-primary">{product.price * item.quantity} ج.م</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                      
                      {item.customizations && (
                        <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-2">
                          {item.customizations.color && <span className="bg-muted px-2 py-1 rounded-md">اللون: {item.customizations.color}</span>}
                          {item.customizations.size && <span className="bg-muted px-2 py-1 rounded-md">المقاس: {item.customizations.size}</span>}
                          {item.customizations.note && <span className="bg-muted px-2 py-1 rounded-md">ملاحظة: {item.customizations.note}</span>}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCartItem(item.id, item.quantity + 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            } else {
              const pack = packaging.find(p => p.id === item.packagingId);
              
              return (
                <Card key={item.id} className="overflow-hidden border-primary/20">
                  <div className="bg-primary/5 px-4 py-2 border-b flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="font-bold text-sm text-primary">صندوق مخصص</span>
                  </div>
                  <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24 grid grid-cols-2 gap-1 rounded-lg overflow-hidden h-24">
                      {item.gifts.slice(0, 4).map((g, i) => {
                        const p = products.find(prod => prod.id === g.productId);
                        return p ? <img key={i} src={p.image} className="w-full h-full object-cover" /> : null;
                      })}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-lg">{pack?.name || 'تغليف مخصص'}</h3>
                        <span className="font-bold text-primary">{item.totalPrice * item.quantity} ج.م</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mt-2">
                        يحتوي على {item.gifts.reduce((acc, g) => acc + g.quantity, 0)} هدايا
                      </div>
                      
                      {(item.recipientName || item.message) && (
                        <div className="mt-2 bg-muted/50 p-2 rounded text-xs font-serif italic text-muted-foreground">
                          {item.recipientName && <div>إلى: {item.recipientName}</div>}
                          {item.message && <div className="line-clamp-1">"{item.message}"</div>}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCartItem(item.id, item.quantity + 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          })}
        </div>
        
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-xl border-b pb-4">ملخص الطلب</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium">{cartTotal} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الشحن</span>
                  <span className="text-primary font-medium">يحدد لاحقاً</span>
                </div>
              </div>
              
              <div className="border-t pt-4 flex justify-between font-bold text-xl">
                <span>الإجمالي</span>
                <span className="text-primary">{cartTotal} ج.م</span>
              </div>
              
              <Button className="w-full h-12 text-lg rounded-xl" onClick={() => setLocation('/checkout')}>
                متابعة الدفع
              </Button>
              
              <Link href="/catalog">
                <Button variant="ghost" className="w-full">مواصلة التسوق</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}