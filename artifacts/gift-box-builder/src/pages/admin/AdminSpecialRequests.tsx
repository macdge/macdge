import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Phone, MessageSquare, ExternalLink, Image as ImageIcon, ArrowLeftRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SpecialRequest, Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function AdminSpecialRequests() {
  const { specialRequests, convertSpecialRequestToOrder } = useStore();
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<SpecialRequest | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const filteredRequests = specialRequests.filter(req =>
    req.name.includes(search) || req.whatsapp.includes(search) || req.description.includes(search)
  );

  const handleOpenRequest = (request: SpecialRequest) => {
    setSelectedRequest(request);
    setSheetOpen(true);
  };

  const formatPhone = (phone: string) => {
    let p = phone.replace(/\s+/g, '');
    if (p.startsWith('0')) p = '20' + p.substring(1);
    else if (p.startsWith('+')) p = p.substring(1);
    return p;
  };

  const handleWhatsApp = (request: SpecialRequest) => {
    const phone = formatPhone(request.whatsapp);
    const message = encodeURIComponent(
      `مرحباً ${request.name}،\n\nشكراً لتواصلك مع متجر الهدايا المخصص.\n\nبخصوص طلبك الخاص رقم ${request.id}:\n"${request.description}"\n\nسيتم التواصل معك في أقرب وقت لمناقشة تفاصيل الطلب. 🎁`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleConvertToOrder = (request: SpecialRequest) => {
    if (request.convertedToOrderId) {
      toast({ title: "تنبيه", description: "تم تحويل هذا الطلب مسبقاً" });
      return;
    }

    const orderId = `ORD-SR-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      customer: {
        name: request.name,
        phone: request.whatsapp,
        address: "يتم التأكيد عبر الواتساب",
        governorate: "—",
      },
      items: [],
      paymentMethod: 'cod',
      total: 0,
      status: 'new',
      createdAt: new Date().toISOString(),
      fromSpecialRequest: request.id,
    };

    convertSpecialRequestToOrder(request.id, newOrder);
    setSelectedRequest(prev => prev ? { ...prev, convertedToOrderId: orderId } : prev);
    setSheetOpen(false);

    toast({
      title: "تم التحويل بنجاح",
      description: `تم إنشاء الطلب ${orderId} في صفحة الطلبات.`,
    });

    setLocation('/admin/orders');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الطلبات الخاصة</h1>
        <p className="text-muted-foreground">متابعة طلبات الهدايا المخصصة وهدايا الشركات</p>
      </div>

      <div className="flex items-center space-x-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم، رقم الواتساب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-4 pr-10"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>رقم الواتساب</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((req) => (
              <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenRequest(req)}>
                <TableCell className="font-medium">{req.id}</TableCell>
                <TableCell>{req.name}</TableCell>
                <TableCell>{new Date(req.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                <TableCell dir="ltr" className="text-right">{req.whatsapp}</TableCell>
                <TableCell>
                  {req.convertedToOrderId ? (
                    <Badge className="bg-emerald-600 gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      محوَّل إلى طلب
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      طلب جديد
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenRequest(req); }}>
                    <Eye className="w-4 h-4 mr-2" />
                    عرض التفاصيل
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  لا توجد طلبات خاصة حتى الآن
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto" side="right" dir="rtl">
          {selectedRequest && (
            <div className="space-y-6 py-6">
              <SheetHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <SheetTitle className="text-2xl">
                      طلب خاص #{selectedRequest.id}
                    </SheetTitle>
                    <SheetDescription>
                      {new Date(selectedRequest.createdAt).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}
                    </SheetDescription>
                  </div>
                  {selectedRequest.convertedToOrderId ? (
                    <Badge className="bg-emerald-600 gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      محوَّل إلى طلب
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      طلب جديد
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              {selectedRequest.convertedToOrderId && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">
                  تم تحويل هذا الطلب إلى الطلبات العادية برقم: <span className="font-bold">{selectedRequest.convertedToOrderId}</span>
                </div>
              )}

              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">اسم العميل</p>
                      <p className="font-bold text-lg">{selectedRequest.name}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">رقم الواتساب</p>
                      <p className="font-bold flex items-center gap-2 justify-end" dir="ltr">
                        {selectedRequest.whatsapp}
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      تفاصيل الطلب:
                    </h4>
                    <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap leading-relaxed text-sm">
                      {selectedRequest.description}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      الصور المرفقة ({selectedRequest.referenceImages?.length || 0}):
                    </h4>
                    {selectedRequest.referenceImages && selectedRequest.referenceImages.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {selectedRequest.referenceImages.map((img, i) => (
                          <div key={i} className="w-24 h-24 rounded-lg border overflow-hidden shrink-0">
                            <img src={img} alt="مرفق" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">لا توجد صور مرفقة</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3 pt-2">
                <Button
                  className="w-full h-12 text-base gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                  onClick={() => handleWhatsApp(selectedRequest)}
                >
                  <MessageSquare className="w-5 h-5" />
                  مراسلة عبر واتساب مع تفاصيل الطلب
                  <ExternalLink className="w-4 h-4 mr-auto opacity-70" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 text-base gap-2 border-primary text-primary hover:bg-primary/5"
                  onClick={() => handleConvertToOrder(selectedRequest)}
                  disabled={!!selectedRequest.convertedToOrderId}
                >
                  <ArrowLeftRight className="w-5 h-5" />
                  {selectedRequest.convertedToOrderId ? "تم التحويل مسبقاً" : "تحويل إلى طلب عادي"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
