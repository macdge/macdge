import { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/types";
import {
  Search, PackageSearch, CheckCircle2, Truck, Clock,
  XCircle, Package, CreditCard, Banknote, ChevronRight,
  CalendarDays, User, MapPin, Phone, ReceiptText, Globe
} from "lucide-react";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "new",         label: "طلب جديد",      icon: Clock,         color: "text-amber-500",  bg: "bg-amber-50",  ring: "ring-amber-400" },
  { key: "in_progress", label: "قيد التنفيذ",    icon: Package,       color: "text-blue-500",   bg: "bg-blue-50",   ring: "ring-blue-400" },
  { key: "delivered",   label: "تم الشحن",       icon: Truck,         color: "text-purple-500", bg: "bg-purple-50", ring: "ring-purple-400" },
  { key: "completed",   label: "مكتمل",          icon: CheckCircle2,  color: "text-green-500",  bg: "bg-green-50",  ring: "ring-green-400" },
] as const;

type StepKey = typeof STATUS_STEPS[number]["key"];

function getStepIndex(status: string): number {
  return STATUS_STEPS.findIndex(s => s.key === status);
}

function getPaymentLabel(method: string): string {
  if (method === "cod") return "الدفع عند الاستلام";
  if (method === "instapay") return "إنستاباي";
  if (method === "vodafone_cash") return "فودافون كاش";
  return method;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ar-EG", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

// ── Status Progress Bar ────────────────────────────────────────────────────
function StatusProgress({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <p className="font-bold text-red-700">تم إلغاء الطلب</p>
          <p className="text-sm text-red-500">يُرجى التواصل معنا لمزيد من التفاصيل.</p>
        </div>
      </div>
    );
  }

  const activeIdx = getStepIndex(status);

  return (
    <div className="space-y-4">
      {/* Mobile: vertical */}
      <div className="flex flex-col gap-3 sm:hidden">
        {STATUS_STEPS.map((step, idx) => {
          const isDone = idx < activeIdx;
          const isActive = idx === activeIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive ? `${step.bg} border-transparent ring-2 ${step.ring}` : isDone ? "bg-muted/40 border-transparent" : "border-muted"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isActive ? step.bg : isDone ? "bg-green-50" : "bg-muted"}`}>
                {isDone ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Icon className={`w-5 h-5 ${isActive ? step.color : "text-muted-foreground"}`} />}
              </div>
              <span className={`font-medium text-sm ${isActive ? step.color : isDone ? "text-green-600" : "text-muted-foreground"}`}>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-center">
        {STATUS_STEPS.map((step, idx) => {
          const isDone = idx < activeIdx;
          const isActive = idx === activeIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  isActive ? `${step.bg} border-current ring-4 ${step.ring} ring-opacity-30 ${step.color}` :
                  isDone ? "bg-green-50 border-green-400" : "bg-muted border-muted-foreground/20"
                }`}>
                  {isDone
                    ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                    : <Icon className={`w-6 h-6 ${isActive ? step.color : "text-muted-foreground/50"}`} />
                  }
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${isActive ? step.color : isDone ? "text-green-600" : "text-muted-foreground/60"}`}>{step.label}</span>
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 mb-6 rounded-full transition-all ${idx < activeIdx ? "bg-green-400" : "bg-muted"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Order Card ─────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const statusStep = STATUS_STEPS.find(s => s.key === order.status);
  const PayIcon = order.paymentMethod === "cod" ? Banknote : order.paymentMethod === "instapay" ? CreditCard : order.paymentMethod === "vodafone_cash" ? Phone : Globe;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-primary">{order.id}</h2>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <CalendarDays className="w-4 h-4" />
            {formatDate(order.createdAt)}
          </div>
        </div>
        {statusStep && order.status !== "cancelled" && (
          <Badge className={`${statusStep.bg} ${statusStep.color} border-0 text-sm px-3 py-1 font-semibold`}>
            {statusStep.label}
          </Badge>
        )}
        {order.status === "cancelled" && (
          <Badge variant="destructive" className="text-sm px-3 py-1">ملغى</Badge>
        )}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            حالة الطلب
          </h3>
          <StatusProgress status={order.status} />
        </CardContent>
      </Card>

      {/* Customer info */}
      <Card>
        <CardContent className="p-5 grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">اسم العميل</p>
              <p className="font-semibold">{order.customer.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">رقم الهاتف</p>
              <p className="font-semibold" dir="ltr">{order.customer.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">عنوان التوصيل</p>
              <p className="font-semibold">{order.customer.governorate} — {order.customer.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order summary */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-primary" />
            ملخص الطلب
          </h3>

          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={item.id ?? i} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {item.type === "product" ? "منتج جاهز" : "بوكس هدايا مخصص"}
                    </p>
                    <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-sm">
                  {item.type === "product" ? "—" : `${item.totalPrice * item.quantity} ج.م`}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
            <span>الإجمالي</span>
            <span className="text-primary">{order.total} ج.م</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
            <PayIcon className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">طريقة الدفع</p>
              <p className="font-medium text-sm">{getPaymentLabel(order.paymentMethod)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TrackOrder() {
  const { orders } = useStore();
  const [location] = useLocation();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<Order | null | undefined>(undefined);

  // Pre-fill from ?id= query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setQuery(id);
      const found = orders.find(o => o.id.toLowerCase() === id.toLowerCase()) ?? null;
      setResult(found);
      setSearched(true);
    }
  }, [orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const found = orders.find(o => o.id.toLowerCase() === trimmed.toLowerCase()) ?? null;
    setResult(found);
    setSearched(true);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">

      {/* Page header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <PackageSearch className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">تتبع طلبك</h1>
        <p className="text-muted-foreground">أدخل رقم الطلب لمعرفة حالته الحالية</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => { setQuery(e.target.value); setSearched(false); }}
            placeholder="مثال: ORD-1234"
            className="pr-10 h-12 text-base"
            dir="ltr"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-6 gap-2" disabled={!query.trim()}>
          <Search className="w-4 h-4" />
          بحث
        </Button>
      </form>

      {/* Results */}
      {searched && result === null && (
        <div className="text-center py-16 animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <PackageSearch className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">لم يُعثر على الطلب</h2>
          <p className="text-muted-foreground">تأكد من صحة رقم الطلب وحاول مرة أخرى</p>
          <p className="text-sm text-muted-foreground mt-1">أرقام الطلبات تبدأ بـ <span dir="ltr" className="font-mono bg-muted px-1 rounded">ORD-</span></p>
        </div>
      )}

      {searched && result && <OrderCard order={result} />}

      {/* Initial hint */}
      {!searched && (
        <div className="text-center py-10 text-muted-foreground">
          <div className="flex items-center justify-center gap-2 text-sm">
            <ChevronRight className="w-4 h-4" />
            <span>رقم الطلب يمكن إيجاده في رسالة تأكيد الطلب</span>
          </div>
        </div>
      )}
    </div>
  );
}
