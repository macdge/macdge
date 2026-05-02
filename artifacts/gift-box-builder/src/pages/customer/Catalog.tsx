import { useState, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { Product } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingCart, Plus, Upload, X, Image } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Catalog() {
  const { products, addToCart } = useStore();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customization, setCustomization] = useState({ color: "", size: "", note: "", uploadedImage: "" });
  const [quantity, setQuantity] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filteredProducts = products.filter(p => (p.available !== false) && (p.name.includes(search) || p.description.includes(search)));
  const readyProducts = filteredProducts.filter(p => p.category === 'ready');
  const handmadeProducts = filteredProducts.filter(p => p.category === 'handmade');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "الملف كبير جداً", description: "الحد الأقصى لحجم الصورة 5 ميجابايت.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setCustomization(prev => ({ ...prev, uploadedImage: result }));
    };
    reader.readAsDataURL(file);
  };

  const clearUploadedImage = () => {
    setImagePreview(null);
    setCustomization(prev => ({ ...prev, uploadedImage: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    addToCart({
      type: 'product',
      id: `cart-${Date.now()}`,
      productId: selectedProduct.id,
      quantity,
      customizations: {
        color: customization.color || undefined,
        size: customization.size || undefined,
        note: customization.note || undefined,
        uploadedImage: customization.uploadedImage || undefined,
      }
    });

    toast({ title: "تم الإضافة للسلة", description: `تم إضافة ${selectedProduct.name} بنجاح.` });
    setDialogOpen(false);
    setCustomization({ color: "", size: "", note: "", uploadedImage: "" });
    setImagePreview(null);
    setQuantity(1);
  };

  const openProductDialog = (product: Product) => {
    setSelectedProduct(product);
    setCustomization({ color: product.colors?.[0] || "", size: product.sizes?.[0] || "", note: "", uploadedImage: "" });
    setImagePreview(null);
    setQuantity(1);
    setDialogOpen(true);
  };

  const ProductGrid = ({ items }: { items: Product[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden group cursor-pointer border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
          onClick={() => openProductDialog(product)}
        >
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.sizePoints && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur shadow-sm">
                  {product.sizePoints} نقاط حجم
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4 flex flex-col flex-1">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="font-bold text-primary text-lg">{product.price} ج.م</span>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {items.length === 0 && (
        <div className="col-span-full py-12 text-center text-muted-foreground flex flex-col items-center">
          <Search className="w-12 h-12 mb-4 text-muted" />
          <p>لم نجد أي منتجات تطابق بحثك</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">كتالوج الهدايا</h1>
        <p className="text-muted-foreground">تصفح مجموعتنا المتنوعة من الهدايا الجاهزة والمصنوعة يدوياً.</p>

        <div className="relative max-w-md mx-auto mt-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            className="pl-4 pr-10 rounded-full bg-muted/50 border-transparent focus:bg-background"
            placeholder="ابحث عن هدية..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" dir="rtl">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all" className="px-6 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">الكل</TabsTrigger>
            <TabsTrigger value="ready" className="px-6 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">الهدايا الجاهزة</TabsTrigger>
            <TabsTrigger value="handmade" className="px-6 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">الهدايا المصنوعة</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0"><ProductGrid items={filteredProducts} /></TabsContent>
        <TabsContent value="ready" className="mt-0"><ProductGrid items={readyProducts} /></TabsContent>
        <TabsContent value="handmade" className="mt-0"><ProductGrid items={handmadeProducts} /></TabsContent>
      </Tabs>

      {/* Product Customization Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  {selectedProduct.price} ج.م • تأخذ {selectedProduct.sizePoints} نقاط في البوكس المخصص
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-4 py-4 border-y my-2">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-24 h-24 rounded-lg object-cover shrink-0" />
                <div className="flex-1 text-sm text-muted-foreground">{selectedProduct.description}</div>
              </div>

              <div className="space-y-5 py-2">
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div className="space-y-2">
                    <Label>اللون المفضل</Label>
                    <Select value={customization.color} onValueChange={(val) => setCustomization(prev => ({ ...prev, color: val }))}>
                      <SelectTrigger><SelectValue placeholder="اختر لوناً" /></SelectTrigger>
                      <SelectContent>
                        {selectedProduct.colors.map(color => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="space-y-2">
                    <Label>المقاس</Label>
                    <Select value={customization.size} onValueChange={(val) => setCustomization(prev => ({ ...prev, size: val }))}>
                      <SelectTrigger><SelectValue placeholder="اختر مقاساً" /></SelectTrigger>
                      <SelectContent>
                        {selectedProduct.sizes.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-primary" />
                    رفع صورة مرجعية (اختياري)
                  </Label>
                  <p className="text-xs text-muted-foreground">يمكنك رفع صورة توضيحية لطلبك الخاص (مثلاً: صورة للشخص أو تصميم مخصص)</p>

                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-primary/30 bg-muted/30">
                      <img
                        src={imagePreview}
                        alt="معاينة الصورة"
                        className="w-full max-h-48 object-contain"
                      />
                      <button
                        type="button"
                        onClick={clearUploadedImage}
                        className="absolute top-2 left-2 bg-background/80 backdrop-blur rounded-full p-1.5 border hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 right-2 bg-primary/90 text-primary-foreground text-xs rounded-full px-2 py-0.5">
                        تم الرفع بنجاح
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm">اضغط لرفع صورة</p>
                        <p className="text-xs mt-1">PNG, JPG, WEBP — الحد الأقصى 5 ميجابايت</p>
                      </div>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ملاحظات إضافية (اختياري)</Label>
                  <Textarea
                    placeholder="أي تعليمات خاصة بهذا المنتج..."
                    className="resize-none"
                    value={customization.note}
                    onChange={(e) => setCustomization(prev => ({ ...prev, note: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الكمية</Label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                    <span className="w-8 text-center font-bold">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>+</Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto" onClick={handleAddToCart}>
                  <ShoppingCart className="ml-2 w-4 h-4" />
                  أضف للسلة ({(selectedProduct.price * quantity).toLocaleString()} ج.م)
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
