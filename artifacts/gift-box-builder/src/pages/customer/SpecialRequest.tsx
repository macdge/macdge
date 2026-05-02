import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, UploadCloud, ImageIcon } from "lucide-react";

export default function SpecialRequest() {
  const { addSpecialRequest } = useStore();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp || !description) {
      toast({ title: "تنبيه", description: "الرجاء ملء جميع الحقول المطلوبة.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    // Simulate upload/network delay
    setTimeout(() => {
      addSpecialRequest({
        id: `SR-${Date.now()}`,
        name,
        whatsapp,
        description,
        referenceImages: [], // File upload mocked
        createdAt: new Date().toISOString()
      });

      toast({ 
        title: "تم استلام طلبك بنجاح", 
        description: "سنتواصل معك عبر واتساب في أقرب وقت لمناقشة التفاصيل." 
      });

      setName("");
      setWhatsapp("");
      setDescription("");
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">الطلبات الخاصة وهدايا الشركات</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          هل لديك فكرة مميزة لهدية غير متوفرة في الكتالوج؟ أو تبحث عن هدايا مخصصة لموظفي شركتك؟ شاركنا أفكارك وسنحولها إلى واقع ملموس.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <MessageCircle className="w-10 h-10 text-primary mb-2" />
              <h3 className="font-bold text-xl">كيف نعمل؟</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">1</div>
                  <span>تشاركنا تفاصيل الفكرة والميزانية التقريبية عبر النموذج.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">2</div>
                  <span>يتواصل معك فريقنا خلال 24 ساعة عبر واتساب لمناقشة الخيارات.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">3</div>
                  <span>نصمم ونجهز طلبك ونوصله لك بأعلى معايير الجودة.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكريم <span className="text-destructive">*</span></Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: أحمد محمد" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">رقم الواتساب <span className="text-destructive">*</span></Label>
                    <Input id="whatsapp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" className="text-right" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">وصف الفكرة أو الطلب <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="صِف لنا ما تبحث عنه... (عدد القطع، المناسبة، الميزانية المتوقعة، تفاصيل المنتجات المطلوبة)"
                    className="min-h-[150px] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label>صور مرجعية أو إلهام (اختياري)</Label>
                  <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer group">
                    <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium mb-1">اضغط هنا لرفع صور</p>
                    <p className="text-xs text-muted-foreground">أو قم بسحب الصور وإفلاتها هنا (أقصى حجم 5 ميجا)</p>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}