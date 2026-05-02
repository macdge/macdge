import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Packaging, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Gift, PenTool, CheckCircle, ChevronLeft, ChevronRight, Plus, Minus, Info, ShoppingCart, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const BOX_SIZES = [
  { name: "صغير", value: "small" as const, label: "S", capacityMultiplier: 0.5, priceAdd: 0, description: "مثالي للهدايا البسيطة" },
  { name: "متوسط", value: "medium" as const, label: "M", capacityMultiplier: 0.75, priceAdd: 30, description: "الأكثر طلباً للمناسبات" },
  { name: "كبير", value: "large" as const, label: "L", capacityMultiplier: 1.0, priceAdd: 70, description: "لتجربة هدية متكاملة" },
];

type BoxSizeValue = "small" | "medium" | "large";

const getAvailableSizes = (pack: { price: number; maxCapacityPoints: number; sizes?: { small?: number; medium?: number; large?: number } }) => {
  if (!pack.sizes || Object.keys(pack.sizes).length === 0) return BOX_SIZES;
  return BOX_SIZES.filter(s => pack.sizes![s.value] !== undefined);
};

const getSizePrice = (pack: { price: number; sizes?: { small?: number; medium?: number; large?: number } }, sizeValue: BoxSizeValue, priceAdd: number) => {
  if (pack.sizes && pack.sizes[sizeValue] !== undefined) return pack.sizes[sizeValue]!;
  return pack.price + priceAdd;
};

export default function Builder() {
  const { packaging, products, addToCart } = useStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(1);
  const [selectedPackaging, setSelectedPackaging] = useState<Packaging | null>(null);
  const [selectedSizeValue, setSelectedSizeValue] = useState<BoxSizeValue | null>(null);
  const [selectedGifts, setSelectedGifts] = useState<{ product: Product; quantity: number }[]>([]);
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [boxQuantity, setBoxQuantity] = useState(1);
  const [search, setSearch] = useState("");

  const availableSizes = selectedPackaging ? getAvailableSizes(selectedPackaging) : BOX_SIZES;
  const selectedSize = availableSizes.find(s => s.value === selectedSizeValue) || null;

  const effectiveMaxPoints = selectedPackaging && selectedSize
    ? Math.round(selectedPackaging.maxCapacityPoints * selectedSize.capacityMultiplier)
    : 0;

  const effectivePackagingPrice = selectedPackaging && selectedSize
    ? getSizePrice(selectedPackaging, selectedSize.value, selectedSize.priceAdd)
    : 0;

  const currentPoints = selectedGifts.reduce((total, item) => total + (item.product.sizePoints * item.quantity), 0);
  const isFull = currentPoints >= effectiveMaxPoints;
  const pointsPercentage = effectiveMaxPoints > 0 ? Math.min(100, (currentPoints / effectiveMaxPoints) * 100) : 0;

  const handleNext = () => {
    if (step === 1 && !selectedPackaging) {
      toast({ title: "تنبيه", description: "الرجاء اختيار نوع التغليف أولاً", variant: "destructive" });
      return;
    }
    if (step === 1 && !selectedSizeValue) {
      toast({ title: "تنبيه", description: "الرجاء اختيار مقاس البوكس", variant: "destructive" });
      return;
    }
    if (step === 2 && selectedGifts.length === 0) {
      toast({ title: "تنبيه", description: "الرجاء اختيار هدية واحدة على الأقل", variant: "destructive" });
      return;
    }
    if (step < 4) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleAddGift = (product: Product) => {
    if (!selectedPackaging || !selectedSize) return;
    if (currentPoints + product.sizePoints > effectiveMaxPoints) {
      toast({
        title: "البوكس ممتلئ!",
        description: `لا توجد مساحة كافية. المساحة المتبقية: ${effectiveMaxPoints - currentPoints} نقاط.`,
        variant: "destructive"
      });
      return;
    }
    setSelectedGifts(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveGift = (productId: string) => {
    setSelectedGifts(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.product.id !== productId);
    });
  };

  const filteredProducts = products.filter(p => (p.available !== false) && (p.name.includes(search) || p.description.includes(search)));
  const totalBoxPrice = effectivePackagingPrice + selectedGifts.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const handleAddToCart = () => {
    if (!selectedPackaging || !selectedSize) return;
    addToCart({
      type: 'custom_box',
      id: `custom-box-${Date.now()}`,
      packagingId: selectedPackaging.id,
      boxSize: selectedSize.value,
      gifts: selectedGifts.map(g => ({ productId: g.product.id, quantity: g.quantity })),
      message,
      senderName,
      recipientName,
      quantity: boxQuantity,
      totalPrice: totalBoxPrice,
      totalPoints: currentPoints
    });
    toast({ title: "تم الإضافة للسلة", description: "تم إضافة البوكس المخصص إلى سلة المشتريات." });
    setLocation("/cart");
  };

  const steps = [
    { num: 1, title: "التغليف", icon: Package },
    { num: 2, title: "الهدايا", icon: Gift },
    { num: 3, title: "الرسالة", icon: PenTool },
    { num: 4, title: "المراجعة", icon: CheckCircle },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-center mb-8">صمم صندوقك الخاص</h1>

      {/* Progress Stepper */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10"></div>
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-300"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        ></div>
        {steps.map(s => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-background p-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s.num ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted-foreground text-muted-foreground'}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`text-sm font-medium ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>{s.title}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Packaging + Size */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">اختر نوع التغليف</h2>
            <p className="text-muted-foreground">كل خيار يأتي بسعة معينة للهدايا</p>
          </div>

          {/* Packaging Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packaging.map(pack => (
              <Card
                key={pack.id}
                className={`cursor-pointer transition-all hover:border-primary ${selectedPackaging?.id === pack.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
                onClick={() => { setSelectedPackaging(pack); setSelectedSizeValue(null); setSelectedGifts([]); }}
              >
                <div className="aspect-square bg-muted rounded-t-xl overflow-hidden p-4">
                  <img src={pack.image} alt={pack.name} className="w-full h-full object-cover rounded-lg" />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg">{pack.name}</h3>
                  <p className="text-primary font-bold my-2">يبدأ من {pack.price} ج.م</p>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground bg-background rounded-full px-3 py-1 border mx-auto w-max">
                    <Package className="w-4 h-4" />
                    <span>حتى {pack.maxCapacityPoints} نقاط</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Size Selection — appears after choosing packaging type */}
          {selectedPackaging && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 pt-2">
              <div className="flex items-center gap-2 text-center justify-center">
                <Ruler className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">اختر مقاس البوكس</h3>
              </div>
              <p className="text-muted-foreground text-center text-sm">
                المقاس يحدد سعة البوكس وسعره النهائي
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {availableSizes.map(size => {
                  const effectiveCapacity = Math.round(selectedPackaging.maxCapacityPoints * size.capacityMultiplier);
                  const effectivePrice = getSizePrice(selectedPackaging, size.value, size.priceAdd);
                  const isSelected = selectedSizeValue === size.value;

                  return (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => setSelectedSizeValue(size.value)}
                      className={`relative text-right p-5 rounded-2xl border-2 transition-all hover:border-primary focus:outline-none ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-muted bg-card hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant={isSelected ? "default" : "secondary"} className="text-base font-bold px-3 py-1">
                          {size.label}
                        </Badge>
                        <span className={`text-2xl font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {size.name}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{size.description}</p>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">السعة</span>
                          <span className={`font-bold ${isSelected ? 'text-primary' : ''}`}>{effectiveCapacity} نقطة</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">السعر</span>
                          <span className={`font-bold ${isSelected ? 'text-primary' : ''}`}>{effectivePrice} ج.م</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-3 left-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Summary of selected choice */}
              {selectedSizeValue && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-wrap gap-4 justify-between items-center animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <img src={selectedPackaging.image} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold">{selectedPackaging.name} — {selectedSize?.name}</p>
                      <p className="text-sm text-muted-foreground">سعة {effectiveMaxPoints} نقطة</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-primary">{effectivePackagingPrice} ج.م</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Gifts */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">اختر الهدايا</h2>
            <p className="text-muted-foreground">املأ الصندوق بالهدايا المميزة</p>
          </div>

          {/* Capacity Bar */}
          <div className="bg-card p-4 rounded-xl border sticky top-16 z-20 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">سعة البوكس</span>
              <span className={`font-bold ${isFull ? 'text-destructive' : 'text-primary'}`}>
                {currentPoints} / {effectiveMaxPoints} نقاط
              </span>
            </div>
            <Progress
              value={pointsPercentage}
              className="h-3"
            />
            {isFull && (
              <Alert variant="destructive" className="mt-4 py-2">
                <Info className="w-4 h-4" />
                <AlertDescription>البوكس ممتلئ! لا يمكنك إضافة المزيد من الهدايا.</AlertDescription>
              </Alert>
            )}

            {selectedGifts.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {selectedGifts.map(g => (
                  <div key={g.product.id} className="flex items-center gap-2 bg-muted rounded-full pl-2 pr-1 py-1 whitespace-nowrap border shrink-0">
                    <img src={g.product.image} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-sm font-medium">{g.product.name}</span>
                    <span className="text-xs bg-background rounded-full px-1.5 text-primary border">{g.quantity}x</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-destructive/20 hover:text-destructive" onClick={() => handleRemoveGift(g.product.id)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative max-w-md mx-auto my-6">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              className="pl-4 pr-10 rounded-full bg-muted/50 border-transparent focus:bg-background"
              placeholder="ابحث عن هدية للبوكس..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const selectedCount = selectedGifts.find(g => g.product.id === product.id)?.quantity || 0;
              const canAdd = !isFull && (currentPoints + product.sizePoints <= effectiveMaxPoints);

              return (
                <Card key={product.id} className={`flex flex-row overflow-hidden transition-all ${selectedCount > 0 ? 'border-primary bg-primary/5' : ''} ${!canAdd && selectedCount === 0 ? 'opacity-60 grayscale-[50%]' : ''}`}>
                  <img src={product.image} alt={product.name} className="w-24 h-24 object-cover" />
                  <CardContent className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">الحجم: {product.sizePoints} نقاط</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-sm">{product.price} ج.م</span>
                      {selectedCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleRemoveGift(product.id)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-bold w-4 text-center">{selectedCount}</span>
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleAddGift(product)} disabled={!canAdd}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="secondary" className="h-7 px-3 text-xs rounded-full" onClick={() => handleAddGift(product)} disabled={!canAdd}>
                          إضافة
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Message */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 max-w-2xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">بطاقة الإهداء</h2>
            <p className="text-muted-foreground">أضف لمسة شخصية بكلمات من القلب (اختياري)</p>
          </div>

          <Card className="border-primary/20 bg-card overflow-hidden">
            <div className="bg-primary/5 p-4 border-b text-center font-serif italic text-muted-foreground">
              "الهدايا لغة القلوب"
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>من (اسم المُرسل)</Label>
                  <Input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="مثال: أحمد" />
                </div>
                <div className="space-y-2">
                  <Label>إلى (اسم المُستلم)</Label>
                  <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="مثال: سارة" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>الرسالة</Label>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="min-h-[120px] resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">مراجعة البوكس</h2>
            <p className="text-muted-foreground">تأكد من تفاصيل هديتك قبل إضافتها للسلة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2">التفاصيل</h3>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={selectedPackaging?.image} className="w-12 h-12 rounded object-cover" />
                      <div>
                        <p className="font-medium text-sm">{selectedPackaging?.name} — {selectedSize?.name}</p>
                        <p className="text-xs text-muted-foreground">تغليف ({effectiveMaxPoints} نقطة)</p>
                      </div>
                    </div>
                    <span className="font-medium">{effectivePackagingPrice} ج.م</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {selectedGifts.map(g => (
                      <div key={g.product.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img src={g.product.image} className="w-10 h-10 rounded object-cover" />
                          <div>
                            <p className="font-medium text-sm">{g.product.name}</p>
                            <p className="text-xs text-muted-foreground">الكمية: {g.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium">{g.product.price * g.quantity} ج.م</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {(message || senderName || recipientName) && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center space-y-2 font-serif">
                    {recipientName && <p className="text-lg font-bold text-primary">إلى: {recipientName}</p>}
                    {message && <p className="italic text-muted-foreground">"{message}"</p>}
                    {senderName && <p className="text-sm font-bold text-primary mt-2">من: {senderName}</p>}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="border-2 border-primary/20 shadow-md">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">سعر التغليف ({selectedSize?.name})</span>
                      <span>{effectivePackagingPrice} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">سعر الهدايا</span>
                      <span>{totalBoxPrice - effectivePackagingPrice} ج.م</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                      <span>الإجمالي للبوكس</span>
                      <span className="text-primary">{totalBoxPrice} ج.م</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-center block">عدد البوكسات المطلوبة (نفس المواصفات)</Label>
                    <div className="flex items-center justify-center gap-4">
                      <Button variant="outline" size="icon" onClick={() => setBoxQuantity(Math.max(1, boxQuantity - 1))}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-xl">{boxQuantity}</span>
                      <Button variant="outline" size="icon" onClick={() => setBoxQuantity(boxQuantity + 1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex justify-between font-bold text-xl">
                    <span>المجموع الكلي</span>
                    <span className="text-primary">{totalBoxPrice * boxQuantity} ج.م</span>
                  </div>

                  <Button className="w-full h-12 text-lg rounded-xl" onClick={handleAddToCart}>
                    أضف إلى السلة
                    <ShoppingCart className="mr-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-12 pt-6 border-t border-muted max-w-5xl mx-auto">
        <Button variant="outline" onClick={handleBack} disabled={step === 1} className="gap-2 px-6">
          <ChevronRight className="w-4 h-4" />
          السابق
        </Button>
        {step < 4 ? (
          <Button onClick={handleNext} className="gap-2 px-8">
            التالي
            <ChevronLeft className="w-4 h-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
