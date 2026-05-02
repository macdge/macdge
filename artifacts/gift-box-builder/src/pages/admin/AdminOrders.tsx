import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, MapPin, Phone, User, Package, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AdminOrders() {
  const { orders, updateOrderStatus, products, packaging } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.includes(search) || o.customer.name.includes(search) || o.customer.phone.includes(search);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge className="bg-blue-500">جديد</Badge>;
      case 'in_progress': return <Badge className="bg-orange-500">قيد التنفيذ</Badge>;
      case 'delivered': return <Badge className="bg-green-500">تم التسليم</Badge>;
      case 'completed': return <Badge className="bg-emerald-600">مكتمل</Badge>;
      case 'cancelled': return <Badge className="bg-red-500">ملغى</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethod = (method: string) => {
    if (method === 'cod') return 'الدفع عند الاستلام';
    if (method === 'instapay') return 'إنستاباي';
    if (method === 'vodafone_cash') return 'فودافون كاش';
    return method;
  };

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  };

  const handleStatusChange = (status: Order['status']) => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, status);
      setSelectedOrder({ ...selectedOrder, status });
      toast({ title: "تم التحديث", description: "تم تغيير حالة الطلب بنجاح." });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الطلبات</h1>
        <p className="text-muted-foreground">متابعة وإدارة طلبات العملاء</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="بحث برقم الطلب، اسم العميل..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-4 pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الطلبات</SelectItem>
            <SelectItem value="new">جديد</SelectItem>
            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
            <SelectItem value="delivered">تم التسليم</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="cancelled">ملغى</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>المحافظة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإجمالي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenOrder(order)}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer.name}</TableCell>
                <TableCell>{order.customer.governorate}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                <TableCell>{order.total} ج.م</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenOrder(order); }}>
                    <Eye className="w-4 h-4 mr-2" />
                    عرض التفاصيل
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  لا توجد طلبات تطابق بحثك
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto" side="right" dir="rtl">
          {selectedOrder && (
            <div className="space-y-6 py-6">
              <SheetHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <SheetTitle className="text-2xl flex items-center gap-2">
                      طلب #{selectedOrder.id}
                      {getStatusBadge(selectedOrder.status)}
                    </SheetTitle>
                    <SheetDescription>
                      {new Date(selectedOrder.createdAt).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-2">
                <Label>تحديث حالة الطلب</Label>
                <Select value={selectedOrder.status} onValueChange={(val: any) => handleStatusChange(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">جديد</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="delivered">تم التسليم</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-primary border-b pb-2">
                      <User className="w-4 h-4" />
                      العميل
                    </div>
                    <div className="text-sm space-y-2">
                      <p><span className="text-muted-foreground">الاسم:</span> {selectedOrder.customer.name}</p>
                      <p className="flex items-center gap-2"><Phone className="w-3 h-3 text-muted-foreground" /> {selectedOrder.customer.phone}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-primary border-b pb-2">
                      <MapPin className="w-4 h-4" />
                      الشحن
                    </div>
                    <div className="text-sm space-y-2">
                      <p><span className="text-muted-foreground">المحافظة:</span> {selectedOrder.customer.governorate}</p>
                      <p><span className="text-muted-foreground">العنوان:</span> {selectedOrder.customer.address}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between font-bold text-primary border-b pb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      الدفع
                    </div>
                    <span className="text-foreground">{getPaymentMethod(selectedOrder.paymentMethod)}</span>
                  </div>
                  {selectedOrder.paymentScreenshot && (
                    <div className="space-y-2 pt-1">
                      <p className="text-sm font-medium text-muted-foreground">إثبات الدفع</p>
                      <a href={selectedOrder.paymentScreenshot} target="_blank" rel="noopener noreferrer">
                        <img
                          src={selectedOrder.paymentScreenshot}
                          alt="إثبات الدفع"
                          className="w-full max-h-48 object-contain rounded-lg border hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  محتويات الطلب
                </h3>
                
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => {
                    if (item.type === 'product') {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <div key={index} className="flex gap-4 items-start border rounded-lg p-3">
                          <img src={product?.image} className="w-16 h-16 object-cover rounded-md" />
                          <div className="flex-1">
                            <div className="flex justify-between font-medium">
                              <span>{product?.name}</span>
                              <span>{product ? product.price * item.quantity : 0} ج.م</span>
                            </div>
                            <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                            {item.customizations && Object.keys(item.customizations).length > 0 && (
                              <div className="text-xs bg-muted/50 p-2 mt-2 rounded border space-y-1">
                                {item.customizations.color && <p><span className="font-semibold">اللون:</span> {item.customizations.color}</p>}
                                {item.customizations.size && <p><span className="font-semibold">المقاس:</span> {item.customizations.size}</p>}
                                {item.customizations.note && <p><span className="font-semibold">ملاحظة:</span> {item.customizations.note}</p>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      const pack = packaging.find(p => p.id === item.packagingId);
                      return (
                        <div key={index} className="border-2 border-primary/20 bg-primary/5 rounded-lg overflow-hidden">
                          <div className="bg-primary/10 px-4 py-2 border-b flex justify-between font-bold text-sm">
                            <span>بوكس مخصص ({pack?.name})</span>
                            <span>{item.totalPrice * item.quantity} ج.م (الكمية: {item.quantity})</span>
                          </div>
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">الهدايا داخل البوكس:</h4>
                              <ul className="space-y-2">
                                {item.gifts.map((g, i) => {
                                  const p = products.find(prod => prod.id === g.productId);
                                  return (
                                    <li key={i} className="flex items-center gap-3 text-sm">
                                      <div className="w-8 h-8 rounded overflow-hidden shrink-0">
                                        <img src={p?.image} className="w-full h-full object-cover" />
                                      </div>
                                      <span className="flex-1">{p?.name}</span>
                                      <span className="text-muted-foreground">x{g.quantity}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                            
                            {(item.recipientName || item.message) && (
                              <>
                                <Separator />
                                <div className="text-sm space-y-1">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">بطاقة الإهداء:</h4>
                                  {item.recipientName && <p><span className="font-medium">إلى:</span> {item.recipientName}</p>}
                                  {item.senderName && <p><span className="font-medium">من:</span> {item.senderName}</p>}
                                  {item.message && <p className="italic mt-1 bg-background p-2 rounded border">"{item.message}"</p>}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{selectedOrder.total} ج.م</span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}