import { Link, useLocation } from "wouter";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, Gift, ShoppingCart, MessageSquare, LogOut, Settings, Store } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { adminLogout } = useStore();

  const navItems = [
    { title: "الرئيسية", url: "/admin", icon: LayoutDashboard },
    { title: "المنتجات", url: "/admin/products", icon: Gift },
    { title: "التغليف", url: "/admin/packaging", icon: Package },
    { title: "الطلبات", url: "/admin/orders", icon: ShoppingCart },
    { title: "الطلبات الخاصة", url: "/admin/special-requests", icon: MessageSquare },
    { title: "الإعدادات", url: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    adminLogout();
    setLocation("/admin/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/20">
        <Sidebar side="right">
          <SidebarHeader className="border-b h-16 flex items-center justify-center">
            <h2 className="text-xl font-bold text-primary">لوحة التحكم</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>إدارة المتجر</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.url} tooltip={item.title}>
                        <Link href={item.url}>
                          <a className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </a>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="p-4 mt-auto border-t space-y-1">
            <SidebarMenuButton asChild tooltip="العودة للمتجر">
              <Link href="/">
                <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Store className="h-4 w-4" />
                  <span>العودة للمتجر</span>
                </a>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="تسجيل الخروج"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer w-full"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </SidebarMenuButton>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 border-b bg-background flex items-center px-4 shrink-0">
            <SidebarTrigger className="ml-2" />
            <div className="font-medium text-lg">متجر الهدايا المخصص — الإدارة</div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
