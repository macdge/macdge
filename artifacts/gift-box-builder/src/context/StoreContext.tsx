import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Packaging, CartItem, Order, SpecialRequest, AppSettings } from '../lib/types';
import { seedProducts, seedPackaging, seedOrders, seedSpecialRequests, defaultSettings } from '../lib/data';

interface StoreContextType {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  packaging: Packaging[];
  setPackaging: (packaging: Packaging[]) => void;
  addPackaging: (pack: Packaging) => void;
  updatePackaging: (id: string, pack: Partial<Packaging>) => void;
  deletePackaging: (id: string) => void;

  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartItem: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  orders: Order[];
  createOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;

  specialRequests: SpecialRequest[];
  addSpecialRequest: (request: SpecialRequest) => void;
  convertSpecialRequestToOrder: (requestId: string, order: Order) => void;

  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [packaging, setPackaging] = useState<Packaging[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [specialRequests, setSpecialRequests] = useState<SpecialRequest[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const savedProducts = localStorage.getItem('products');
      const savedPackaging = localStorage.getItem('packaging');
      const savedCart = localStorage.getItem('cart');
      const savedOrders = localStorage.getItem('orders');
      const savedRequests = localStorage.getItem('specialRequests');
      const savedSettings = localStorage.getItem('appSettings');
      const savedAuth = sessionStorage.getItem('adminAuth');

      if (savedProducts) setProducts(JSON.parse(savedProducts));
      else setProducts(seedProducts);

      if (savedPackaging) setPackaging(JSON.parse(savedPackaging));
      else setPackaging(seedPackaging);

      if (savedCart) setCart(JSON.parse(savedCart));

      if (savedOrders) setOrders(JSON.parse(savedOrders));
      else setOrders(seedOrders);

      if (savedRequests) setSpecialRequests(JSON.parse(savedRequests));
      else setSpecialRequests(seedSpecialRequests);

      if (savedSettings) setSettings(JSON.parse(savedSettings));
      else setSettings(defaultSettings);

      if (savedAuth === 'true') setIsAdminAuthenticated(true);

      setIsInitialized(true);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('products', JSON.stringify(products));
  }, [products, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('packaging', JSON.stringify(packaging));
  }, [packaging, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('specialRequests', JSON.stringify(specialRequests));
  }, [specialRequests, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings, isInitialized]);

  const addProduct = (product: Product) => setProducts(prev => [...prev, product]);
  const updateProduct = (id: string, updates: Partial<Product>) =>
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  const addPackaging = (pack: Packaging) => setPackaging(prev => [...prev, pack]);
  const updatePackaging = (id: string, updates: Partial<Packaging>) =>
    setPackaging(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const deletePackaging = (id: string) => setPackaging(prev => prev.filter(p => p.id !== id));

  const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
  const updateCartItem = (id: string, quantity: number) =>
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce((total, item) => {
    if (item.type === 'product') {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    } else {
      return total + (item.totalPrice * item.quantity);
    }
  }, 0);

  const createOrder = (order: Order) => setOrders(prev => [order, ...prev]);
  const updateOrderStatus = (id: string, status: Order['status']) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

  const addSpecialRequest = (request: SpecialRequest) => setSpecialRequests(prev => [request, ...prev]);

  const convertSpecialRequestToOrder = (requestId: string, order: Order) => {
    setOrders(prev => [order, ...prev]);
    setSpecialRequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, convertedToOrderId: order.id } : r)
    );
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const adminLogin = (username: string, password: string): boolean => {
    if (username === settings.adminUsername && password === settings.adminPassword) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  if (!isInitialized) return null;

  return (
    <StoreContext.Provider value={{
      products, setProducts, addProduct, updateProduct, deleteProduct,
      packaging, setPackaging, addPackaging, updatePackaging, deletePackaging,
      cart, addToCart, updateCartItem, removeFromCart, clearCart, cartCount, cartTotal,
      orders, createOrder, updateOrderStatus,
      specialRequests, addSpecialRequest, convertSpecialRequestToOrder,
      settings, updateSettings,
      isAdminAuthenticated, adminLogin, adminLogout,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
