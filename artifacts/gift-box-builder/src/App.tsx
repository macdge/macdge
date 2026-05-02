import { StoreProvider, useStore } from "@/context/StoreContext";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/customer/Home";
import Catalog from "@/pages/customer/Catalog";
import Builder from "@/pages/customer/Builder";
import Cart from "@/pages/customer/Cart";
import Checkout from "@/pages/customer/Checkout";
import SpecialRequest from "@/pages/customer/SpecialRequest";
import TrackOrder from "@/pages/customer/TrackOrder";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminPackaging from "@/pages/admin/AdminPackaging";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminSpecialRequests from "@/pages/admin/AdminSpecialRequests";
import AdminSettings from "@/pages/admin/AdminSettings";
import { useEffect } from "react";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAdminAuthenticated, setLocation]);

  if (!isAdminAuthenticated) return null;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />

      <Route path="/admin">
        <AdminGuard>
          <AdminLayout><AdminDashboard /></AdminLayout>
        </AdminGuard>
      </Route>
      <Route path="/admin/products">
        <AdminGuard>
          <AdminLayout><AdminProducts /></AdminLayout>
        </AdminGuard>
      </Route>
      <Route path="/admin/packaging">
        <AdminGuard>
          <AdminLayout><AdminPackaging /></AdminLayout>
        </AdminGuard>
      </Route>
      <Route path="/admin/orders">
        <AdminGuard>
          <AdminLayout><AdminOrders /></AdminLayout>
        </AdminGuard>
      </Route>
      <Route path="/admin/special-requests">
        <AdminGuard>
          <AdminLayout><AdminSpecialRequests /></AdminLayout>
        </AdminGuard>
      </Route>
      <Route path="/admin/settings">
        <AdminGuard>
          <AdminLayout><AdminSettings /></AdminLayout>
        </AdminGuard>
      </Route>

      <Route>
        <CustomerLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/catalog" component={Catalog} />
            <Route path="/builder" component={Builder} />
            <Route path="/special-request" component={SpecialRequest} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/track-order" component={TrackOrder} />
            <Route component={NotFound} />
          </Switch>
        </CustomerLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <StoreProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </StoreProvider>
  );
}

export default App;
