import { useMemo, useState, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2, ChevronRight, MapPin, Phone, User, CreditCard,
  ExternalLink, Upload, X, Image, Banknote, Globe, PackageSearch
} from "lucide-react";

interface PaymentOption {
  value: string;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  deepLink?: string;
  linkLabel?: string;
  needsScreenshot: boolean;
}

export default function Checkout() {
  const { cart, cartTotal, createOrder, clearCart, settings } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const paymentOptions = useMemo<PaymentOption[]>(() => {
    const instapay = settings.paymentLinks.instapay.trim();
    const vodafone = settings.paymentLinks.vodafoneCash.trim();
    const custom = settings.paymentLinks.custom ?? [];

    const opts: PaymentOption[] = [
      {
        value: "cod",
        label: "الدفع عند الاستلام",
        subtitle: "ادفع نقداً عند استلام طلبك",
        icon: Banknote,
        color: "text-green-600",
        needsScreenshot: false,
      },
    ];

    if (instapay) {
      opts.push({
        value: "instapay",
        label: "إنستاباي",
        subtitle: `حوّل إلى الرقم: ${instapay}`,
        icon: CreditCard,
        color: "text-blue-600",
        deepLink: `https://ipn.eg/S/${instapay}/Pay`,
        linkLabel: "افتح تطبيق إنستاباي",
        needsScreenshot: true,
      });
    }

    if (vodafone) {
      opts.push({
        value: "vodafone_cash",
        label: "فودافون كاش",
        subtitle: `حوّل إلى الرقم: ${vodafone}`,
        icon: Phone,
        color: "text-red-600",
        deepLink: `https://transfer.vodafonecash.com.eg/?msisdn=${vodafone}`,
        linkLabel: "افتح تطبيق فودافون كاش",
        needsScreenshot: true,
      });
    }

    custom.forEach(m => {
      const link = m.link.trim();
      opts.push({
        value: m.id,
        label: m.name,
        subtitle: link.startsWith("http") ? "اضغط لفتح رابط الدفع" : `حوّل إلى: ${link}`,
        icon: Globe,
        color: "text-purple-600",
        deepLink: link.startsWith("http") ? link : undefined,
        linkLabel: link.startsWith("http") ? `افتح ${m.name}` : undefined,
        needsScreenshot: true,
      });
    });

    return opts;
  }, [settings.paymentLinks]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    governorate: "",
    paymentMethod: "cod",
  });
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const selectedPayment = paymentOptions.find(p => p.value === formData.paymentMethod) ?? paymentOptions[0];

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "الملف كبير جداً", description: "الحد الأقصى 10 ميجابايت.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPaymentScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const getAccountNumber = () => {
    if (formData.paymentMethod === "instapay") return settings.paymentLinks.instapay;
    if (formData.paymentMethod === "vodafone_cash") return settings.paymentLinks.vodafoneCash;
    const custom = (settings.paymentLinks.custom ?? []).find(m => m.id === formData.paymentMethod);
    return custom?.link ?? "";
  };

  if (cart.length === 0 && !isSuccess) {
    setLocation("/cart");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.governorate) {
      toast({ title: "تنبيه", description: "الرجاء إكمال جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    if (selectedPayment.needsScreenshot && !paymentScreenshot) {
      toast({ title: "إثبات الدفع مطلوب", description: "الرجاء رفع صورة إثبات التحويل قبل تأكيد الطلب.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const newOrderId = `ORD-${Math.floor(Math.random() * 10000) + 1000}`;
      createOrder({
        id: newOrderId,
        customer: { name: formData.name, phone: formData.phone, address: formData.address, governorate: formData.governorate },
        items: [...cart],
        paymentMethod: formData.paymentMethod,
        paymentScreenshot: paymentScreenshot || undefined,
        total: cartTotal,
        status: "new",
        createdAt: new Date().toISOString()
      });
      clearCart();
      setOrderId(newOrderId);
      setIsSuccess(true);
      setIsSubmitting(false);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center max-w-lg">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 animate-in zoom-in">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-4">تم تأكيد طلبك بنجاح!</h1>
        <p className="text-lg text-muted-foreground mb-2">
          رقم الطلب: <span className="font-bold text-primary">{orderId}</span>
        </p>
        <p className="text-muted-foreground mb-8">
          شكراً لتسوقك معنا. سنتواصل معك قريباً لتأكيد تفاصيل الشحن والتوصيل.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link href={`/track-order?id=${orderId}`}>
            <Button size="lg" className="rounded-full px-8 gap-2 w-full sm:w-auto">
              <PackageSearch className="w-5 h-5" />
              تتبع طلبك
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="rounded-full px-8 w-full sm:w-auto" onClick={() => setLocation("/")}>
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/cart")} className="rounded-full">
          <ChevronRight className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">إتمام الطلب</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">

                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    المعلومات الشخصية
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم بالكامل</Label>
                      <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="أحمد محمد" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="01xxxxxxxxx" dir="ltr" className="text-right" />
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    عنوان التوصيل
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gov">المحافظة</Label>
                      <Input id="gov" value={formData.governorate} onChange={e => setFormData({ ...formData, governorate: e.target.value })} placeholder="القاهرة" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">العنوان بالتفصيل</Label>
                      <Input id="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="اسم الشارع، رقم العمارة، الطابق..." />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    طريقة الدفع
                  </h3>

                  <div className="grid gap-3">
                    {paymentOptions.map(option => {
                      const isSelected = formData.paymentMethod === option.value;
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => { setFormData({ ...formData, paymentMethod: option.value }); setPaymentScreenshot(null); }}
                          className={`w-full text-right p-4 rounded-xl border-2 transition-all focus:outline-none ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-muted hover:border-primary/30 hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <div className="flex items-center gap-3 flex-1 mr-3">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Icon className={`w-5 h-5 ${option.color}`} />
                              </div>
                              <div>
                                <p className="font-bold text-base">{option.label}</p>
                                <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment Action — shown for methods needing transfer + screenshot */}
                  {selectedPayment.needsScreenshot && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 fade-in pt-2">

                      {selectedPayment.deepLink && (
                        <a
                          href={selectedPayment.deepLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 w-full p-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary font-bold hover:bg-primary/10 hover:border-primary transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                          {selectedPayment.linkLabel}
                        </a>
                      )}

                      <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4 text-sm">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                        <span>
                          {selectedPayment.deepLink
                            ? "اضغط على الزر أعلاه لفتح التطبيق، ثم حوّل المبلغ الكامل ("
                            : "قم بالتحويل إلى ("}
                          <strong>{cartTotal} ج.م</strong>)
                          {" "}إلى <strong dir="ltr">{getAccountNumber()}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4 text-sm">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                        <span>بعد إتمام التحويل، ارفع هنا صورة إثبات الدفع (Screenshot)</span>
                      </div>

                      {/* Screenshot Upload */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-semibold">
                          <Image className="w-4 h-4 text-primary" />
                          صورة إثبات الدفع
                          <span className="text-destructive">*</span>
                        </Label>

                        {paymentScreenshot ? (
                          <div className="relative rounded-xl overflow-hidden border border-primary/30 bg-muted/30">
                            <img src={paymentScreenshot} alt="إثبات الدفع" className="w-full max-h-56 object-contain" />
                            <button
                              type="button"
                              onClick={() => { setPaymentScreenshot(null); if (screenshotInputRef.current) screenshotInputRef.current.value = ""; }}
                              className="absolute top-2 left-2 bg-background/80 backdrop-blur rounded-full p-1.5 border hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
                              تم رفع الإثبات بنجاح
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => screenshotInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-sm">اضغط لرفع صورة الإيصال</p>
                              <p className="text-xs mt-1">PNG, JPG — الحد الأقصى 10 ميجابايت</p>
                            </div>
                          </button>
                        )}

                        <input
                          ref={screenshotInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleScreenshotUpload}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24 border-primary/20 bg-primary/5">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-xl border-b border-primary/20 pb-4">ملخص الطلب</h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pl-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 flex-1">
                      {item.type === 'product' ? 'منتج جاهز' : 'بوكس مخصص'} (x{item.quantity})
                    </span>
                    <span className="font-medium shrink-0">
                      {(item.type === 'product' ? 0 : item.totalPrice) * item.quantity} ج.م
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-primary/20 pt-4 flex justify-between font-bold text-2xl">
                <span>الإجمالي</span>
                <span className="text-primary">{cartTotal} ج.م</span>
              </div>

              {selectedPayment.needsScreenshot && !paymentScreenshot && (
                <p className="text-sm text-destructive text-center">يجب رفع إثبات الدفع أولاً</p>
              )}

              <Button
                type="submit"
                form="checkout-form"
                className="w-full h-14 text-lg rounded-xl"
                disabled={isSubmitting || (selectedPayment.needsScreenshot && !paymentScreenshot)}
              >
                {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
