import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CustomPaymentMethod } from "@/lib/types";
import {
  Lock, User, CreditCard, Phone, MapPin, Mail, Facebook,
  Instagram, Twitter, MessageCircle, Plus, Trash2, Eye, EyeOff, Save, Globe
} from "lucide-react";

export default function AdminSettings() {
  const { settings, updateSettings } = useStore();
  const { toast } = useToast();

  const [credentials, setCredentials] = useState({
    username: settings.adminUsername,
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [paymentLinks, setPaymentLinks] = useState({
    instapay: settings.paymentLinks.instapay,
    vodafoneCash: settings.paymentLinks.vodafoneCash,
  });

  const [customMethods, setCustomMethods] = useState<CustomPaymentMethod[]>(
    settings.paymentLinks.custom ?? []
  );
  const [newMethod, setNewMethod] = useState({ name: "", link: "" });

  const [contact, setContact] = useState({ ...settings.contact });

  const handleSaveCredentials = () => {
    if (!credentials.username.trim()) {
      toast({ title: "خطأ", description: "اسم المستخدم لا يمكن أن يكون فارغاً", variant: "destructive" });
      return;
    }
    if (credentials.newPassword && credentials.newPassword !== credentials.confirmPassword) {
      toast({ title: "خطأ", description: "كلمتا المرور غير متطابقتين", variant: "destructive" });
      return;
    }
    if (credentials.newPassword && credentials.newPassword.length < 4) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 4 أحرف على الأقل", variant: "destructive" });
      return;
    }
    updateSettings({
      adminUsername: credentials.username.trim(),
      ...(credentials.newPassword ? { adminPassword: credentials.newPassword } : {}),
    });
    setCredentials(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
    toast({ title: "تم الحفظ", description: "تم تحديث بيانات الدخول بنجاح" });
  };

  const handleSavePayment = () => {
    updateSettings({
      paymentLinks: {
        instapay: paymentLinks.instapay,
        vodafoneCash: paymentLinks.vodafoneCash,
        custom: customMethods,
      },
    });
    toast({ title: "تم الحفظ", description: "تم تحديث روابط الدفع بنجاح" });
  };

  const handleAddCustomMethod = () => {
    if (!newMethod.name.trim() || !newMethod.link.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم ورابط وسيلة الدفع", variant: "destructive" });
      return;
    }
    setCustomMethods(prev => [...prev, { id: `pay-${Date.now()}`, name: newMethod.name.trim(), link: newMethod.link.trim() }]);
    setNewMethod({ name: "", link: "" });
  };

  const handleRemoveCustomMethod = (id: string) => {
    setCustomMethods(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveContact = () => {
    updateSettings({ contact });
    toast({ title: "تم الحفظ", description: "تم تحديث بيانات التواصل بنجاح" });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات المتجر وبيانات الدخول</p>
      </div>

      {/* ─── Credentials ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            بيانات الدخول
          </CardTitle>
          <CardDescription>تعديل اسم المستخدم وكلمة المرور للوحة الأدمن</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>اسم المستخدم</Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={credentials.username}
                onChange={e => setCredentials(p => ({ ...p, username: e.target.value }))}
                className="pr-10"
                placeholder="اسم المستخدم"
              />
            </div>
          </div>

          <Separator />

          <p className="text-sm text-muted-foreground">اتركِ حقلَي كلمة المرور فارغين إذا لم تُرِد تغييرها</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>كلمة المرور الجديدة</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showNewPass ? "text" : "password"}
                  value={credentials.newPassword}
                  onChange={e => setCredentials(p => ({ ...p, newPassword: e.target.value }))}
                  className="pr-10 pl-10"
                  placeholder="كلمة المرور الجديدة"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showConfirmPass ? "text" : "password"}
                  value={credentials.confirmPassword}
                  onChange={e => setCredentials(p => ({ ...p, confirmPassword: e.target.value }))}
                  className="pr-10 pl-10"
                  placeholder="تأكيد كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveCredentials} className="gap-2">
            <Save className="w-4 h-4" />
            حفظ بيانات الدخول
          </Button>
        </CardContent>
      </Card>

      {/* ─── Payment Links ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            روابط الدفع
          </CardTitle>
          <CardDescription>تعديل أرقام / روابط وسائل الدفع الإلكتروني</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                إنستاباي — رقم المحفظة
              </Label>
              <Input
                value={paymentLinks.instapay}
                onChange={e => setPaymentLinks(p => ({ ...p, instapay: e.target.value }))}
                placeholder="01XXXXXXXXX"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                فودافون كاش — رقم المحفظة
              </Label>
              <Input
                value={paymentLinks.vodafoneCash}
                onChange={e => setPaymentLinks(p => ({ ...p, vodafoneCash: e.target.value }))}
                placeholder="01XXXXXXXXX"
                dir="ltr"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">وسائل دفع إضافية</p>
            {customMethods.length > 0 && (
              <div className="space-y-2">
                {customMethods.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground truncate" dir="ltr">{m.link}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleRemoveCustomMethod(m.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
              <p className="text-sm text-muted-foreground">إضافة وسيلة دفع جديدة</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">اسم الوسيلة</Label>
                  <Input
                    value={newMethod.name}
                    onChange={e => setNewMethod(p => ({ ...p, name: e.target.value }))}
                    placeholder="مثال: Fawry"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">الرابط أو الرقم</Label>
                  <Input
                    value={newMethod.link}
                    onChange={e => setNewMethod(p => ({ ...p, link: e.target.value }))}
                    placeholder="https://... أو 01XXXXXXXXX"
                    dir="ltr"
                  />
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleAddCustomMethod}>
                <Plus className="w-4 h-4" />
                إضافة الوسيلة
              </Button>
            </div>
          </div>

          <Button onClick={handleSavePayment} className="gap-2">
            <Save className="w-4 h-4" />
            حفظ روابط الدفع
          </Button>
        </CardContent>
      </Card>

      {/* ─── Contact Info ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            بيانات التواصل
          </CardTitle>
          <CardDescription>تعديل بيانات التواصل التي تظهر للعملاء</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                العنوان
              </Label>
              <Input
                value={contact.address}
                onChange={e => setContact(p => ({ ...p, address: e.target.value }))}
                placeholder="العنوان الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                رقم الهاتف
              </Label>
              <Input
                value={contact.phone}
                onChange={e => setContact(p => ({ ...p, phone: e.target.value }))}
                placeholder="+20 1XX XXX XXXX"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                البريد الإلكتروني
              </Label>
              <Input
                value={contact.email}
                onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                placeholder="example@domain.com"
                dir="ltr"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
                واتساب
              </Label>
              <Input
                value={contact.whatsapp}
                onChange={e => setContact(p => ({ ...p, whatsapp: e.target.value }))}
                placeholder="01XXXXXXXXX"
                dir="ltr"
              />
            </div>
          </div>

          <Separator />

          <p className="text-sm font-medium text-muted-foreground">روابط السوشيال ميديا</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                فيسبوك
              </Label>
              <Input
                value={contact.facebook}
                onChange={e => setContact(p => ({ ...p, facebook: e.target.value }))}
                placeholder="https://facebook.com/..."
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                إنستجرام
              </Label>
              <Input
                value={contact.instagram}
                onChange={e => setContact(p => ({ ...p, instagram: e.target.value }))}
                placeholder="https://instagram.com/..."
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Twitter className="w-3.5 h-3.5 text-sky-400" />
                تويتر / X
              </Label>
              <Input
                value={contact.twitter}
                onChange={e => setContact(p => ({ ...p, twitter: e.target.value }))}
                placeholder="https://x.com/..."
                dir="ltr"
              />
            </div>
          </div>

          <Button onClick={handleSaveContact} className="gap-2">
            <Save className="w-4 h-4" />
            حفظ بيانات التواصل
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
