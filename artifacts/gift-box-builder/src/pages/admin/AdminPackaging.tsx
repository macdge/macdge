import { useState, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { Packaging } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Upload, X, ImageIcon, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AdminPackaging() {
  const { packaging, addPackaging, updatePackaging, deletePackaging } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Packaging | null>(null);
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const defaultFormState = {
    name: "",
    material: "cardboard" as "wood" | "cardboard" | "fabric",
    price: "",
    maxCapacityPoints: "",
    image: "",
    sizeSmall: "",
    sizeMedium: "",
    sizeLarge: "",
  };

  const [formData, setFormData] = useState(defaultFormState);

  const handleOpenDialog = (pack?: Packaging) => {
    if (pack) {
      setEditingPack(pack);
      setFormData({
        name: pack.name,
        material: pack.material,
        price: pack.price.toString(),
        maxCapacityPoints: pack.maxCapacityPoints.toString(),
        image: pack.image,
        sizeSmall: pack.sizes?.small?.toString() ?? "",
        sizeMedium: pack.sizes?.medium?.toString() ?? "",
        sizeLarge: pack.sizes?.large?.toString() ?? "",
      });
    } else {
      setEditingPack(null);
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
    if (!formData.name || !formData.price || !formData.maxCapacityPoints) {
      toast({ title: "خطأ", description: "يرجى تعبئة الحقول الأساسية", variant: "destructive" });
      return;
    }

    const hasSizes = formData.sizeSmall || formData.sizeMedium || formData.sizeLarge;
    const sizes = hasSizes ? {
      ...(formData.sizeSmall ? { small: parseFloat(formData.sizeSmall) } : {}),
      ...(formData.sizeMedium ? { medium: parseFloat(formData.sizeMedium) } : {}),
      ...(formData.sizeLarge ? { large: parseFloat(formData.sizeLarge) } : {}),
    } : undefined;

    const packData = {
      name: formData.name,
      material: formData.material,
      price: parseFloat(formData.price),
      maxCapacityPoints: parseInt(formData.maxCapacityPoints),
      image: formData.image || "/src/assets/packaging-cardboard.png",
      sizes,
    };

    if (editingPack) {
      updatePackaging(editingPack.id, packData);
      toast({ title: "نجاح", description: "تم تحديث التغليف بنجاح" });
    } else {
      addPackaging({
        id: `PACK-${Date.now()}`,
        ...packData
      });
      toast({ title: "نجاح", description: "تم إضافة التغليف بنجاح" });
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا التغليف؟")) {
      deletePackaging(id);
      toast({ title: "نجاح", description: "تم حذف التغليف بنجاح" });
    }
  };

  const materialLabel = (m: string) => m === 'wood' ? 'خشب' : m === 'cardboard' ? 'كرتون مقوى' : 'قماش';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">أنواع التغليف</h1>
          <p className="text-muted-foreground">إدارة خيارات التغليف المتاحة للبوكس المخصص</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة تغليف
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التغليف</TableHead>
              <TableHead>الخامة</TableHead>
              <TableHead>السعر الأساسي</TableHead>
              <TableHead>المقاسات والأسعار</TableHead>
              <TableHead>أقصى سعة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packaging.map((pack) => (
              <TableRow key={pack.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={pack.image} className="w-10 h-10 rounded object-cover" />
                    <span className="font-medium">{pack.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{materialLabel(pack.material)}</Badge>
                </TableCell>
                <TableCell>{pack.price} ج.م</TableCell>
                <TableCell>
                  {pack.sizes ? (
                    <div className="flex gap-1 flex-wrap">
                      {pack.sizes.small !== undefined && (
                        <Badge variant="secondary" className="text-xs">S: {pack.sizes.small} ج.م</Badge>
                      )}
                      {pack.sizes.medium !== undefined && (
                        <Badge variant="secondary" className="text-xs">M: {pack.sizes.medium} ج.م</Badge>
                      )}
                      {pack.sizes.large !== undefined && (
                        <Badge variant="secondary" className="text-xs">L: {pack.sizes.large} ج.م</Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>{pack.maxCapacityPoints} نقطة</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(pack)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(pack.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPack ? "تعديل تغليف" : "إضافة تغليف جديد"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>صورة التغليف</Label>
              <div
                className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => imageInputRef.current?.click()}
              >
                {formData.image ? (
                  <div className="relative inline-block w-full">
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
              <div className="space-y-2 col-span-2">
                <Label>الاسم</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>الخامة</Label>
                <Select value={formData.material} onValueChange={(v: "wood" | "cardboard" | "fabric") => setFormData({ ...formData, material: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wood">خشب</SelectItem>
                    <SelectItem value="cardboard">كرتون مقوى</SelectItem>
                    <SelectItem value="fabric">قماش</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>السعر الأساسي (ج.م)</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>السعة القصوى (بالنقاط)</Label>
                <Input type="number" value={formData.maxCapacityPoints} onChange={e => setFormData({ ...formData, maxCapacityPoints: e.target.value })} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" />
                <Label className="text-base font-semibold">أسعار المقاسات</Label>
              </div>
              <p className="text-xs text-muted-foreground">اترك حقلاً فارغاً لاستبعاد هذا المقاس من خيارات العميل</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">S</Badge>
                    صغير (ج.م)
                  </Label>
                  <Input
                    type="number"
                    placeholder="مثال: 150"
                    value={formData.sizeSmall}
                    onChange={e => setFormData({ ...formData, sizeSmall: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">M</Badge>
                    متوسط (ج.م)
                  </Label>
                  <Input
                    type="number"
                    placeholder="مثال: 180"
                    value={formData.sizeMedium}
                    onChange={e => setFormData({ ...formData, sizeMedium: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">L</Badge>
                    كبير (ج.م)
                  </Label>
                  <Input
                    type="number"
                    placeholder="مثال: 220"
                    value={formData.sizeLarge}
                    onChange={e => setFormData({ ...formData, sizeLarge: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">حفظ التغليف</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
