import { Product, Packaging, Order, SpecialRequest, AppSettings } from './types';
import packagingWood from '../assets/packaging-wood.png';
import packagingCardboard from '../assets/packaging-cardboard.png';
import packagingFabric from '../assets/packaging-fabric.png';
import productMug from '../assets/product-mug.png';
import productChocolate from '../assets/product-chocolate.png';
import productCandle from '../assets/product-candle.png';
import productNotebook from '../assets/product-notebook.png';
import productPen from '../assets/product-pen.png';
import productSoap from '../assets/product-soap.png';
import productCoffee from '../assets/product-coffee.png';

export const seedPackaging: Packaging[] = [
  {
    id: 'pack-1',
    name: 'صندوق خشبي فاخر',
    material: 'wood',
    price: 350,
    maxCapacityPoints: 12,
    image: packagingWood,
    sizes: { small: 350, medium: 380, large: 420 },
  },
  {
    id: 'pack-2',
    name: 'صندوق كرتون مقوى',
    material: 'cardboard',
    price: 150,
    maxCapacityPoints: 10,
    image: packagingCardboard,
    sizes: { small: 150, medium: 180, large: 220 },
  },
  {
    id: 'pack-3',
    name: 'تغليف قماشي (فوروشيكي)',
    material: 'fabric',
    price: 100,
    maxCapacityPoints: 6,
    image: packagingFabric,
    sizes: { small: 100, medium: 130, large: 170 },
  }
];

export const seedProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'كوب سيراميك يدوي الصنع',
    category: 'handmade',
    price: 250,
    sizePoints: 3,
    image: productMug,
    description: 'كوب سيراميك فريد بطلاء ترابي، مثالي للقهوة أو الشاي.',
    available: true,
    colors: ['بني ترابي', 'أبيض منقط', 'أزرق داكن']
  },
  {
    id: 'prod-2',
    name: 'علبة شوكولاتة فاخرة',
    category: 'ready',
    price: 450,
    sizePoints: 4,
    image: productChocolate,
    description: 'تشكيلة مختارة من الشوكولاتة البلجيكية بحشوات متنوعة.',
    available: true,
  },
  {
    id: 'prod-3',
    name: 'شمعة عطرية باللافندر',
    category: 'handmade',
    price: 180,
    sizePoints: 2,
    image: productCandle,
    description: 'شمعة صويا طبيعية بعطر اللافندر المهدئ في وعاء زجاجي فاخر.',
    available: true,
  },
  {
    id: 'prod-4',
    name: 'مفكرة جلدية كلاسيكية',
    category: 'handmade',
    price: 320,
    sizePoints: 3,
    image: productNotebook,
    description: 'مفكرة بغلاف جلدي طبيعي مع إمكانية حفر الاسم.',
    available: true,
    colors: ['بني كلاسيكي', 'أسود', 'جملي']
  },
  {
    id: 'prod-5',
    name: 'قلم ذهبي أنيق',
    category: 'ready',
    price: 200,
    sizePoints: 1,
    image: productPen,
    description: 'قلم حبر جاف بتصميم عصري ولمسات ذهبية، مع علبة هدايا.',
    available: true,
  },
  {
    id: 'prod-6',
    name: 'صابون طبيعي بالورد',
    category: 'handmade',
    price: 90,
    sizePoints: 1,
    image: productSoap,
    description: 'قطعة صابون مصنوعة يدوياً بمستخلصات الورد وزيوت مرطبة.',
    available: true,
  },
  {
    id: 'prod-7',
    name: 'قهوة مختصة محمصة',
    category: 'ready',
    price: 280,
    sizePoints: 2,
    image: productCoffee,
    description: 'حبوب قهوة أرابيكا محمصة بعناية في كيس حافظ للنكهة.',
    available: true,
  }
];

export const seedOrders: Order[] = [
  {
    id: 'ORD-1001',
    customer: {
      name: 'أحمد محمود',
      phone: '01012345678',
      address: 'شارع التسعين، التجمع الخامس',
      governorate: 'القاهرة'
    },
    items: [
      {
        type: 'product',
        id: 'cart-1',
        productId: 'prod-2',
        quantity: 2,
      }
    ],
    paymentMethod: 'cod',
    total: 900,
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ORD-1002',
    customer: {
      name: 'سارة خالد',
      phone: '01123456789',
      address: 'سبورتنج',
      governorate: 'الإسكندرية'
    },
    items: [
      {
        type: 'custom_box',
        id: 'cart-2',
        packagingId: 'pack-1',
        boxSize: 'large',
        gifts: [
          { productId: 'prod-1', quantity: 1 },
          { productId: 'prod-4', quantity: 1 },
          { productId: 'prod-5', quantity: 1 }
        ],
        message: 'مبارك التخرج، مع أطيب التمنيات.',
        senderName: 'خالد',
        recipientName: 'سارة',
        quantity: 1,
        totalPrice: 1120,
        totalPoints: 7
      }
    ],
    paymentMethod: 'instapay',
    total: 1120,
    status: 'in_progress',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

export const seedSpecialRequests: SpecialRequest[] = [
  {
    id: 'SR-1',
    name: 'منى أحمد',
    whatsapp: '01234567890',
    description: 'أريد بوكس هدايا مخصص لعروس يحتوي على طقم روب حمام محفور عليه اسمها وتاريخ الزفاف، مع إضافة منتجات عناية بالبشرة طبيعية وتنسيق زهور بيضاء.',
    referenceImages: [],
    createdAt: new Date().toISOString()
  }
];

export const defaultSettings: AppSettings = {
  adminUsername: 'admin',
  adminPassword: '123456',
  paymentLinks: {
    instapay: '01012345678',
    vodafoneCash: '01012345678',
    custom: [],
  },
  contact: {
    address: 'القاهرة، مصر',
    phone: '+20 100 123 4567',
    email: 'contact@customgifts.eg',
    facebook: 'https://facebook.com/customgifts',
    instagram: 'https://instagram.com/customgifts',
    whatsapp: '01012345678',
    twitter: '',
  },
};
