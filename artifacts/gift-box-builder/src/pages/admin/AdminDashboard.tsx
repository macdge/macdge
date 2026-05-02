import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Gift, ShoppingCart, MessageSquare, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { products, packaging, orders, specialRequests } = useStore();

  const newOrders = orders.filter(o => o.status === 'new').length;
  const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge className="bg-blue-500">جديد</Badge>;
      case 'in_progress': return <Badge className="bg-orange-500">قيد التنفيذ</Badge>;
      case 'delivered': return <Badge className="bg-green-500">تم التسليم</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethod = (method: string) => {
    return method === 'cod' ? 'الدفع عند الاستلام' : 'إنستاباي / محفظة';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">نظرة عامة</h1>
        <p className="text-muted-foreground mt-1">ملخص سريع لأداء المتجر</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} ج.م</div>
            <p className="text-xs text-muted-foreground mt-1">
              من إجمالي {orders.length} طلب
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات النشطة</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newOrders + inProgressOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {newOrders} جديد، {inProgressOrders} قيد التنفيذ
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات والتغليف</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              و {packaging.length} أنواع تغليف
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات الخاصة</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{specialRequests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              في انتظار المراجعة
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>أحدث الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                      <TableCell>{getPaymentMethod(order.paymentMethod)}</TableCell>
                      <TableCell>{order.total} ج.م</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        لا توجد طلبات بعد
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}