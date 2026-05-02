import { useState, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2, Upload, X, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const defaultFormState = {
    name: "",
    category: "ready" as "ready" | "handmade",
    price: "",
    sizePoints: "",
    description: "",
    image: "",
    available: true,
  };

  const [formData, setFormData] = useState(defaultFormState);

  const filteredProducts = products.filter(p =>
    p.name.includes(search) || p.category.includes(search)
  );

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        sizePoints: product.sizePoints.toString(),
        description: product.description,
        image: product.image,
        available: product.available !== false,
      });
    } else {
      setEditingProduct(null);
      setFormData(defaultFormState);
    }
    setDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الصورة يجب أن لا يتجاوز 5 ميجابايت", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.sizePoints) {
      toast({ title: "خطأ", description: "يرجى تعبئة الحقول الأساسية", variant: "destructive" });
      return;
    }

    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      sizePoints: parseInt(formData.sizePoints),
      description: formData.description,
      image: formData.image || "/src/assets/product-mug.png",
      available: formData.available,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast({ title: "نجاح", description: "تم تحديث المنتج بنجاح" });
    } else {
      addProduct({
        id: `PROD-${Date.now()}`,
        ...productData
      });
      toast({ title: "نجاح", description: "تم إضافة المنتج بنجاح" });
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      deleteProduct(id);
      toast({ title: "نجاح", description: "تم حذف المنتج بنجاح" });
    }
  };

  const handleToggleAvailability = (id: string, current: boolean) => {
    updateProduct(id, { available: !current });
    toast({ title: "تم التحديث", description: !current ? "المنتج أصبح متاحاً" : "المنتج أصبح غير متاح" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <p className="text-muted-foreground">إدارة المنتجات والهدايا في المتجر</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة منتج
        </Button>
      </div>

      <div className="flex items-center space-x-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن منتج..."
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
              <TableHead>المنتج</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>الحجم (نقاط)</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const isAvailable = product.available !== false;
              return (
                <TableRow key={product.id} className={!isAvailable ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={product.image} className="w-10 h-10 rounded object-cover" />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.category === 'handmade' ? 'default' : 'secondary'}>
                      {product.category === 'handmade' ? 'صناعة يدوية' : 'جاهز'}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.price} ج.م</TableCell>
                  <TableCell>{product.sizePoints}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isAvailable}
                        onCheckedChange={() => handleToggleAvailability(product.id, isAvailable)}
                      />
                      <span className={`text-sm font-medium ${isAvailable ? "text-green-600" : "text-muted-foreground"}`}>
                        {isAvailable ? "متاح" : "غير متاح"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>صورة المنتج</Label>
              <div
                className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => imageInputRef.current?.click()}
              >
                {formData.image ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.image}
                      alt="معاينة"
                      className="h-32 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image: "" })); }}
                      className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">اضغط لرفع صورة</p>
                      <p className="text-xs">PNG, JPG حتى 5 ميجابايت</p>
                    </div>
                    <Upload className="w-4 h-4" />
                  </div>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم المنتج</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>القسم</Label>
                <Select value={formData.category} onValueChange={(v: "ready" | "handmade") => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ready">جاهز</SelectItem>
                    <SelectItem value="handmade">صناعة يدوية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>السعر (ج.م)</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>الحجم (بالنقاط للبوكس)</Label>
                <Input type="number" value={formData.sizePoints} onChange={e => setFormData({ ...formData, sizePoints: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div>
                <p className="font-medium text-sm">حالة المنتج</p>
                <p className="text-xs text-muted-foreground">
                  {formData.available ? "سيظهر في كتالوج العميل" : "لن يظهر في كتالوج العميل (نفاد المخزون)"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <span className={`text-sm font-bold ${formData.available ? "text-green-600" : "text-muted-foreground"}`}>
                  {formData.available ? "متاح" : "غير متاح"}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">حفظ المنتج</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
