import type { Category, Client, Product, CartItem, Order, Payment, Delivery, DeliveryPerson, Supplier, Favorite, AdminNotification, Promotion, Coupon, LoyaltyAccount } from '../types/database';
import type { MobileMoneyProvider } from './mobile-money';

const KEYS = {
  clients: 'glowbeauty_demo_clients',
  orders: 'glowbeauty_demo_orders',
  payments: 'glowbeauty_demo_payments',
  deliveries: 'glowbeauty_demo_deliveries',
  products: 'glowbeauty_demo_products_v5',
  categories: 'glowbeauty_demo_categories_v5',
  deliveryPersons: 'glowbeauty_demo_delivery_persons',
  suppliers: 'glowbeauty_demo_suppliers_v5',
  favorites: 'glowbeauty_demo_favorites',
  notifications: 'glowbeauty_demo_admin_notifications_v1',
  promotions: 'glowbeauty_demo_promotions_v1',
  coupons: 'glowbeauty_demo_coupons_v1',
  loyalty: 'glowbeauty_demo_loyalty_v1',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const demoCategories: Category[] = [
  { id: 'cat_skincare', code: 'SKIN', name: 'Soins visage', description: 'Nettoyants, sérums, crèmes et masques pour le visage', created_at: new Date().toISOString() },
  { id: 'cat_haircare', code: 'HAIR', name: 'Soins cheveux', description: 'Produits capillaires, huiles, shampoings et traitements', created_at: new Date().toISOString() },
  { id: 'cat_makeup', code: 'MAKE', name: 'Maquillage', description: 'Produits de maquillage et accessoires beauté', created_at: new Date().toISOString() },
  { id: 'cat_perfume', code: 'PARF', name: 'Parfums', description: 'Parfums, brumes et senteurs corporelles', created_at: new Date().toISOString() },
  { id: 'cat_wellness', code: 'WELL', name: 'Bien-être', description: 'Produits relaxation, bain, massage et accessoires', created_at: new Date().toISOString() },
];

export const demoSuppliers: Supplier[] = [
  { id: 'sup_001', code: 'SUP001', first_name: 'Maison', last_name: 'GlowCare', email: 'contact@glowcare.cm', phone: '699100001', gender: null, created_at: new Date().toISOString() },
  { id: 'sup_002', code: 'SUP002', first_name: 'Laboratoire', last_name: 'PureBeauty', email: 'sales@purebeauty.cm', phone: '699100002', gender: null, created_at: new Date().toISOString() },
  { id: 'sup_003', code: 'SUP003', first_name: 'Afro', last_name: 'Nature', email: 'hello@afronature.cm', phone: '699100003', gender: null, created_at: new Date().toISOString() },
  { id: 'sup_004', code: 'SUP004', first_name: 'Bella', last_name: 'Cosmetics', email: 'info@bellacosmetics.cm', phone: '699100004', gender: null, created_at: new Date().toISOString() },
];

const productSeed = [
  ['GB-001','Sérum vitamine C éclat','Sérum visage pour illuminer le teint et aider à unifier la peau.',8500,18,'GlowCare','mixte','cat_skincare','sup_001','vitamin-c-serum,cosmetics'],
  ['GB-002','Gel hydratant Aloe Vera','Gel léger pour hydrater et apaiser la peau après nettoyage.',5500,24,'PureBeauty','sèche','cat_skincare','sup_002','aloe-vera-gel,skincare'],
  ['GB-003','Masque purifiant à l’argile','Masque adapté aux peaux grasses pour réduire l’excès de sébum.',6500,16,'Dermaluxe','grasse','cat_skincare','sup_002','clay-mask,beauty'],
  ['GB-004','Crème visage karité','Crème nourrissante pour peau sèche et sensible.',7500,20,'NatureCare','sèche','cat_skincare','sup_003','face-cream,cosmetic'],
  ['GB-005','Nettoyant doux visage','Nettoyant quotidien sans agresser la barrière cutanée.',4500,30,'PureBeauty','sensible','cat_skincare','sup_002','facial-cleanser,skincare'],
  ['GB-006','Tonique rose fraîcheur','Lotion tonique pour rafraîchir et préparer la peau.',5000,18,'BellaSkin','tous types','cat_skincare','sup_004','rose-toner,cosmetics'],
  ['GB-007','Crème solaire SPF 50','Protection solaire légère adaptée au climat chaud.',9000,14,'SunGlow','tous types','cat_skincare','sup_001','sunscreen,skincare'],
  ['GB-008','Sérum acide hyaluronique','Hydratation intense et effet repulpant.',9500,12,'Dermaluxe','déshydratée','cat_skincare','sup_002','hyaluronic-acid-serum'],
  ['GB-009','Gommage visage doux','Exfoliation douce pour un teint plus lisse.',6000,22,'GlowCare','tous types','cat_skincare','sup_001','face-scrub,beauty'],
  ['GB-010','Patchs contour des yeux','Patchs défatigants pour le contour des yeux.',3500,28,'BellaSkin','tous types','cat_skincare','sup_004','eye-patches,beauty'],
  ['GB-011','Huile capillaire nourrissante','Huile pour renforcer les cheveux et apporter de la brillance.',7000,25,'AfroGlow','tous types','cat_haircare','sup_003','hair-oil,beauty'],
  ['GB-012','Shampoing doux hydratant','Shampoing sans sulfate pour cheveux secs.',6500,18,'AfroGlow','tous types','cat_haircare','sup_003','shampoo,haircare'],
  ['GB-013','Après-shampoing réparateur','Démêle et nourrit les cheveux abîmés.',6800,16,'AfroGlow','tous types','cat_haircare','sup_003','conditioner,haircare'],
  ['GB-014','Masque cheveux avocat','Masque profond pour cheveux secs et cassants.',8000,13,'NatureCare','tous types','cat_haircare','sup_003','hair-mask,avocado'],
  ['GB-015','Crème coiffante boucles','Définit les boucles et limite les frisottis.',7500,17,'CurlBeauty','tous types','cat_haircare','sup_003','curl-cream,hair'],
  ['GB-016','Spray protecteur thermique','Protège les cheveux avant brushing ou lissage.',6500,20,'HairLuxe','tous types','cat_haircare','sup_004','heat-protectant,hair'],
  ['GB-017','Sérum anti-chute','Soin stimulant pour cuir chevelu fragile.',10500,10,'AfroGlow','tous types','cat_haircare','sup_003','hair-serum'],
  ['GB-018','Beurre de karité brut','Soin naturel multi-usage peau et cheveux.',5000,35,'NatureCare','tous types','cat_haircare','sup_003','shea-butter'],
  ['GB-019','Bain d’huile coco','Traitement nourrissant avant shampoing.',6200,21,'NatureCare','tous types','cat_haircare','sup_003','coconut-oil,hair'],
  ['GB-020','Brosse démêlante','Accessoire doux pour cheveux naturels.',4000,26,'BeautyTools','tous types','cat_haircare','sup_004','hair-brush'],
  ['GB-021','Fond de teint fluide','Teint uniforme avec fini naturel.',9500,15,'BellaCosmetics','tous types','cat_makeup','sup_004','foundation,makeup'],
  ['GB-022','Poudre compacte matifiante','Réduit la brillance et fixe le maquillage.',6500,23,'BellaCosmetics','grasse','cat_makeup','sup_004','compact-powder,makeup'],
  ['GB-023','Rouge à lèvres velours','Couleur intense, tenue confortable.',4500,30,'BellaCosmetics','tous types','cat_makeup','sup_004','lipstick,makeup'],
  ['GB-024','Gloss hydratant','Brillance et confort pour les lèvres.',3500,28,'GlowCare','tous types','cat_makeup','sup_001','lip-gloss,makeup'],
  ['GB-025','Mascara volume','Allonge et intensifie les cils.',5500,22,'BellaCosmetics','tous types','cat_makeup','sup_004','mascara,makeup'],
  ['GB-026','Palette yeux nude','Palette polyvalente pour maquillage quotidien.',12000,11,'BellaCosmetics','tous types','cat_makeup','sup_004','eyeshadow-palette'],
  ['GB-027','Eyeliner précision','Trait net et intense.',4000,19,'BellaCosmetics','tous types','cat_makeup','sup_004','eyeliner,makeup'],
  ['GB-028','Blush rose naturel','Effet bonne mine immédiat.',5000,17,'GlowCare','tous types','cat_makeup','sup_001','blush,makeup'],
  ['GB-029','Highlighter éclat','Illuminateur visage pour fini lumineux.',7000,14,'BellaCosmetics','tous types','cat_makeup','sup_004','highlighter,makeup'],
  ['GB-030','Kit pinceaux makeup','Set de pinceaux pour application professionnelle.',11000,9,'BeautyTools','tous types','cat_makeup','sup_004','makeup-brushes'],
  ['GB-031','Parfum floral Élégance','Fragrance féminine douce et raffinée.',15000,13,'BellaSkin','tous types','cat_perfume','sup_004','perfume-bottle'],
  ['GB-032','Brume parfumée douceur','Brume corporelle légère pour une sensation fraîche toute la journée.',6000,25,'BellaSkin','tous types','cat_perfume','sup_004','body-mist'],
  ['GB-033','Eau de parfum vanille','Senteur chaude et gourmande.',13500,15,'GlowCare','tous types','cat_perfume','sup_001','vanilla-perfume'],
  ['GB-034','Déodorant naturel','Protection quotidienne sans aluminium.',3500,20,'NatureCare','tous types','cat_perfume','sup_003','natural-deodorant'],
  ['GB-035','Parfum homme intense','Senteur boisée et élégante.',16000,10,'LuxCare','tous types','cat_perfume','sup_001','men-perfume'],
  ['GB-036','Brume coco tropicale','Brume fraîche au parfum exotique.',5800,18,'NatureCare','tous types','cat_perfume','sup_003','coconut-body-mist'],
  ['GB-037','Roll-on parfum musc','Format pratique pour sac à main.',4500,30,'BellaSkin','tous types','cat_perfume','sup_004','roll-on-perfume'],
  ['GB-038','Coffret parfum cadeau','Coffret parfum et crème corporelle.',22000,7,'LuxCare','tous types','cat_perfume','sup_001','perfume-gift-set'],
  ['GB-039','Spray textile parfumé','Parfume délicatement vêtements et linge.',5000,16,'HomeGlow','tous types','cat_perfume','sup_002','fragrance-spray'],
  ['GB-040','Huile parfumée jasmin','Huile légère pour peau parfumée.',6500,12,'BellaSkin','tous types','cat_perfume','sup_004','jasmine-oil'],
  ['GB-041','Savon doux au karité','Savon hydratant pour une routine beauté simple et efficace.',2500,40,'NatureCare','sensible','cat_wellness','sup_003','shea-soap'],
  ['GB-042','Sel de bain relaxant','Sel minéral parfumé pour bain détente.',5500,18,'ZenBeauty','tous types','cat_wellness','sup_002','bath-salt'],
  ['GB-043','Bougie parfumée spa','Ambiance douce pour relaxation maison.',8000,14,'ZenBeauty','tous types','cat_wellness','sup_002','spa-candle'],
  ['GB-044','Huile de massage lavande','Huile relaxante pour massage corporel.',7500,16,'ZenBeauty','tous types','cat_wellness','sup_002','massage-oil'],
  ['GB-045','Lait corporel hydratant','Hydrate la peau et laisse un fini doux.',6500,24,'GlowCare','sèche','cat_wellness','sup_001','body-lotion'],
  ['GB-046','Gommage corps sucre','Exfolie et adoucit la peau.',7000,13,'NatureCare','tous types','cat_wellness','sup_003','body-scrub'],
  ['GB-047','Crème mains réparatrice','Protège les mains sèches et fragiles.',3000,32,'PureBeauty','sèche','cat_wellness','sup_002','hand-cream'],
  ['GB-048','Baume lèvres nourrissant','Soin quotidien pour lèvres sèches.',2000,45,'GlowCare','tous types','cat_wellness','sup_001','lip-balm'],
  ['GB-049','Kit routine bien-être','Coffret complet soin corps et détente.',25000,6,'ZenBeauty','tous types','cat_wellness','sup_002','wellness-kit'],
  ['GB-050','Diffuseur aromatique','Diffuseur élégant pour huiles essentielles.',18000,8,'HomeGlow','tous types','cat_wellness','sup_002','aroma-diffuser'],
] as const;

const productImages: Record<string, string> = {
  'GB-001': 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-002': 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-003': 'https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-004': 'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-005': 'https://images.pexels.com/photos/5069613/pexels-photo-5069613.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-006': 'https://images.pexels.com/photos/7796578/pexels-photo-7796578.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-007': 'https://images.pexels.com/photos/5217958/pexels-photo-5217958.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-008': 'https://images.pexels.com/photos/7290709/pexels-photo-7290709.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-009': 'https://images.pexels.com/photos/5069609/pexels-photo-5069609.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-010': 'https://images.pexels.com/photos/5938558/pexels-photo-5938558.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-011': 'https://images.pexels.com/photos/7262897/pexels-photo-7262897.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-012': 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-013': 'https://images.pexels.com/photos/3992870/pexels-photo-3992870.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-014': 'https://images.pexels.com/photos/7290054/pexels-photo-7290054.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-015': 'https://images.pexels.com/photos/3738349/pexels-photo-3738349.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-016': 'https://images.pexels.com/photos/7449860/pexels-photo-7449860.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-017': 'https://images.pexels.com/photos/7290073/pexels-photo-7290073.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-018': 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-019': 'https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-020': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-021': 'https://images.pexels.com/photos/2587370/pexels-photo-2587370.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-022': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-023': 'https://images.pexels.com/photos/2693644/pexels-photo-2693644.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-024': 'https://images.pexels.com/photos/4620843/pexels-photo-4620843.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-025': 'https://images.pexels.com/photos/2253834/pexels-photo-2253834.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-026': 'https://images.pexels.com/photos/2637820/pexels-photo-2637820.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-027': 'https://images.pexels.com/photos/3373746/pexels-photo-3373746.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-028': 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-029': 'https://images.pexels.com/photos/2688990/pexels-photo-2688990.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-030': 'https://images.pexels.com/photos/1115128/pexels-photo-1115128.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-031': 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-032': 'https://images.pexels.com/photos/3059609/pexels-photo-3059609.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-033': 'https://images.pexels.com/photos/1961791/pexels-photo-1961791.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-034': 'https://images.pexels.com/photos/8128069/pexels-photo-8128069.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-035': 'https://images.pexels.com/photos/4110343/pexels-photo-4110343.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-036': 'https://images.pexels.com/photos/7142619/pexels-photo-7142619.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-037': 'https://images.pexels.com/photos/6712351/pexels-photo-6712351.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-038': 'https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-039': 'https://images.pexels.com/photos/6177607/pexels-photo-6177607.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-040': 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-041': 'https://images.pexels.com/photos/4465829/pexels-photo-4465829.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-042': 'https://images.pexels.com/photos/6621337/pexels-photo-6621337.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-043': 'https://images.pexels.com/photos/3270223/pexels-photo-3270223.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-044': 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-045': 'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-046': 'https://images.pexels.com/photos/5069609/pexels-photo-5069609.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-047': 'https://images.pexels.com/photos/4202326/pexels-photo-4202326.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-048': 'https://images.pexels.com/photos/4938369/pexels-photo-4938369.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-049': 'https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg?auto=compress&cs=tinysrgb&w=800',
  'GB-050': 'https://images.pexels.com/photos/4203091/pexels-photo-4203091.jpeg?auto=compress&cs=tinysrgb&w=800',
};

function productImage(code: string) {
  return productImages[code] || 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800';
}

export const demoProducts: Product[] = productSeed.map((item, index) => {
  const [code, name, description, price, quantity, brand, skinType, categoryId, supplierId] = item;
  const category = demoCategories.find((cat) => cat.id === categoryId);
  const supplier = demoSuppliers.find((sup) => sup.id === supplierId);
  return {
    id: `prod_${String(index + 1).padStart(3, '0')}`,
    code,
    name,
    description,
    price: Number(price),
    quantity: Number(quantity),
    brand,
    skin_type: skinType,
    acquisition_date: new Date().toISOString(),
    image_url: productImage(String(code)),
    category_id: categoryId,
    supplier_id: supplierId,
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
    category,
    supplier,
  };
});

export const demoDeliveryPersons: DeliveryPerson[] = [
  { id: 'liv_001', code: 'LIV001', first_name: 'Kevin', last_name: 'Mballa', email: 'kevin.demo@scensora.cm', phone: '699000001', gender: 'M', created_at: new Date().toISOString() },
  { id: 'liv_002', code: 'LIV002', first_name: 'Grace', last_name: 'Talla', email: 'grace.demo@scensora.cm', phone: '699000002', gender: 'F', created_at: new Date().toISOString() },
  { id: 'liv_003', code: 'LIV003', first_name: 'Junior', last_name: 'Fotso', email: 'junior.demo@scensora.cm', phone: '699000003', gender: 'M', created_at: new Date().toISOString() },
];

export const demoPromotions: Promotion[] = [
  {
    id: 'promo_glow_week',
    code: 'GLOWWEEK',
    name: 'Glow Week',
    description: 'Offre spéciale sur les soins visage et les routines éclat.',
    discount_percent: 15,
    category_id: 'cat_skincare',
    product_id: null,
    start_date: new Date(Date.now() - 86400000).toISOString(),
    end_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'promo_wellness',
    code: 'ZENBEAUTY',
    name: 'Bien-être Premium',
    description: 'Réduction sur les produits de relaxation et soins corps.',
    discount_percent: 10,
    category_id: 'cat_wellness',
    product_id: null,
    start_date: new Date(Date.now() - 86400000).toISOString(),
    end_date: new Date(Date.now() + 21 * 86400000).toISOString(),
    active: true,
    created_at: new Date().toISOString(),
  },
];

export const demoCoupons: Coupon[] = [
  { id: 'coupon_welcome10', code: 'WELCOME10', description: 'Bienvenue chez Scensora : -10% dès 10 000 FCFA', discount_percent: 10, min_amount: 10000, active: true, expires_at: null, created_at: new Date().toISOString() },
  { id: 'coupon_beauty20', code: 'BEAUTY20', description: 'Offre beauté premium : -20% dès 50 000 FCFA', discount_percent: 20, min_amount: 50000, active: true, expires_at: null, created_at: new Date().toISOString() },
  { id: 'coupon_livraison', code: 'FREESHIP', description: 'Réduction fidélité livraison : -5% dès 15 000 FCFA', discount_percent: 5, min_amount: 15000, active: true, expires_at: null, created_at: new Date().toISOString() },
];

export function getDemoProducts() {
  const stored = read<Product[]>(KEYS.products, []);
  if (stored.length === 0) {
    write(KEYS.products, demoProducts);
    return demoProducts;
  }

  // Migration automatique : si l'utilisateur possède déjà quelques anciens produits
  // en localStorage, on complète sans les supprimer pour garantir un catalogue riche.
  const existingCodes = new Set(stored.map((product) => product.code));
  const missingProducts = demoProducts.filter((product) => !existingCodes.has(product.code));
  const normalized = [...stored, ...missingProducts].map((product) => ({
    ...product,
    image_url: product.image_url || productImage(String(product.code)),
    category: product.category || demoCategories.find((cat) => cat.id === product.category_id),
    supplier: product.supplier || demoSuppliers.find((sup) => sup.id === product.supplier_id),
  }));

  write(KEYS.products, normalized);
  return normalized;
}

export function saveDemoProducts(products: Product[]) {
  write(KEYS.products, products);
}

export function getDemoCategories() {
  const stored = read<Category[]>(KEYS.categories, []);
  if (stored.length) return stored;
  write(KEYS.categories, demoCategories);
  return demoCategories;
}

export function getDemoSuppliers() {
  const stored = read<Supplier[]>(KEYS.suppliers, []);
  if (stored.length) return stored;
  write(KEYS.suppliers, demoSuppliers);
  return demoSuppliers;
}

export function getDemoDeliveryPersons() {
  const stored = read<DeliveryPerson[]>(KEYS.deliveryPersons, []);
  if (stored.length) return stored;
  write(KEYS.deliveryPersons, demoDeliveryPersons);
  return demoDeliveryPersons;
}

export function getDemoClients() {
  return read<Client[]>(KEYS.clients, []);
}

export function saveDemoClient(client: Client) {
  const clients = getDemoClients();
  write(KEYS.clients, [client, ...clients.filter((c) => c.id !== client.id)]);
}

export function getDemoFavorites(clientId?: string) {
  const favorites = read<Favorite[]>(KEYS.favorites, []);
  return clientId ? favorites.filter((favorite) => favorite.client_id === clientId) : favorites;
}

export function toggleDemoFavorite(clientId: string, productId: string) {
  const favorites = read<Favorite[]>(KEYS.favorites, []);
  const exists = favorites.find((favorite) => favorite.client_id === clientId && favorite.product_id === productId);
  if (exists) {
    const next = favorites.filter((favorite) => favorite.id !== exists.id);
    write(KEYS.favorites, next);
    return next.filter((favorite) => favorite.client_id === clientId);
  }
  const favorite: Favorite = { id: uid('fav'), client_id: clientId, product_id: productId, created_at: new Date().toISOString() };
  const next = [favorite, ...favorites];
  write(KEYS.favorites, next);
  return next.filter((item) => item.client_id === clientId);
}

export function getDemoOrders() {
  return read<Order[]>(KEYS.orders, []);
}

export function getDemoPayments() {
  return read<Payment[]>(KEYS.payments, []);
}

export function getDemoDeliveries() {
  return read<Delivery[]>(KEYS.deliveries, []);
}

export function createDemoOrder(params: {
  client: Client | null;
  clientId: string;
  cart: CartItem[];
  total: number;
  paymentMethod: MobileMoneyProvider;
  phoneNumber: string;
  deliveryAddress: string;
  couponCode?: string;
  discountAmount?: number;
}) {
  const now = new Date().toISOString();
  const orderCode = `ORD-${Date.now().toString().slice(-6)}`;
  const paymentCode = `PAY-${Date.now().toString().slice(-6)}`;
  const orderId = uid('order');

  const currentProducts = getDemoProducts();
  const order: Order = {
    id: orderId,
    code: orderCode,
    client_id: params.clientId,
    total_amount: Math.max(0, params.total - Number(params.discountAmount || 0)),
    status: 'pending',
    payment_status: 'paid',
    delivery_address: params.deliveryAddress,
    stock_updated: false,
    created_at: now,
    client: params.client || undefined,
    items: params.cart.map((item) => {
      const latestProduct = currentProducts.find((product) => product.id === item.product.id) || item.product;
      return {
        id: uid('item'),
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: latestProduct.price,
        subtotal: latestProduct.price * item.quantity,
        product: latestProduct,
      };
    }),
  };

  const payment: Payment = {
    id: uid('payment'),
    code: paymentCode,
    order_id: order.id,
    client_id: params.clientId,
    amount: Math.max(0, params.total - Number(params.discountAmount || 0)),
    payment_method: params.paymentMethod,
    phone_number: params.phoneNumber,
    status: 'completed',
    created_at: now,
    client: params.client || undefined,
  };

  write(KEYS.orders, [order, ...getDemoOrders()]);
  write(KEYS.payments, [payment, ...getDemoPayments()]);
  addDemoLoyaltyPoints(params.clientId, payment.amount);
  createDemoNotification({
    type: 'order',
    title: `Nouvelle commande ${order.code}`,
    message: `${params.client?.first_name || 'Un client'} a passé une commande de ${payment.amount.toLocaleString()} FCFA${params.couponCode ? ` avec le coupon ${params.couponCode}` : ''}.`,
    priority: 'high',
    link: '/admin/orders',
  });
  createDemoNotification({
    type: 'payment',
    title: `Paiement ${payment.payment_method} reçu`,
    message: `Paiement confirmé pour la commande ${order.code}.`,
    priority: 'medium',
    link: '/admin/payments',
  });
  return { order, payment };
}

export function decrementDemoStockForOrder(orderId: string) {
  const orders = getDemoOrders();
  const order = orders.find((item) => item.id === orderId);
  if (!order || order.stock_updated) return order || null;

  const products = getDemoProducts().map((product) => {
    const item = order.items?.find((orderItem) => orderItem.product_id === product.id);
    if (!item) return product;
    const nextQuantity = Math.max(0, Number(product.quantity) - Number(item.quantity));
    if (nextQuantity <= 5) {
      createDemoNotification({ type: 'stock', title: 'Alerte stock faible', message: `${product.name} : ${nextQuantity} unité(s) restante(s).`, priority: nextQuantity === 0 ? 'high' : 'medium', link: '/admin/products' });
    }
    return { ...product, quantity: nextQuantity };
  });
  write(KEYS.products, products);

  const updatedOrder = { ...order, stock_updated: true };
  write(KEYS.orders, orders.map((item) => (item.id === orderId ? updatedOrder : item)));
  return updatedOrder;
}

export function updateDemoOrder(id: string, data: Partial<Order>) {
  let updated: Order | null = null;
  const orders = getDemoOrders().map((order) => {
    if (order.id !== id) return order;
    updated = { ...order, ...data };
    return updated;
  });
  write(KEYS.orders, orders);
  if (data.status === 'validated') {
    const updatedAfterStock = decrementDemoStockForOrder(id);
    if (updatedAfterStock) {
      createDemoDelivery(id);
      createDemoNotification({ type: 'delivery', title: `Commande validée ${updatedAfterStock.code}`, message: 'Stock déduit automatiquement et livraison créée.', priority: 'medium', link: '/admin/deliveries' });
    }
    return updatedAfterStock;
  }
  return updated;
}

export function createDemoDelivery(orderId: string) {
  const existing = getDemoDeliveries().find((delivery) => delivery.order_id === orderId);
  if (existing) return existing;
  const order = getDemoOrders().find((item) => item.id === orderId);
  const delivery: Delivery = {
    id: uid('delivery'),
    order_id: orderId,
    delivery_person_id: null,
    status: 'pending',
    delivery_address: order?.delivery_address || '',
    created_at: new Date().toISOString(),
    completed_at: null,
    order,
  };
  write(KEYS.deliveries, [delivery, ...getDemoDeliveries()]);
  return delivery;
}

export function updateDemoDelivery(id: string, data: Partial<Delivery>) {
  const deliveries = getDemoDeliveries().map((delivery) => {
    if (delivery.id !== id) return delivery;
    const next = { ...delivery, ...data };
    const deliveryPerson = getDemoDeliveryPersons().find((person) => person.id === next.delivery_person_id);
    return { ...next, delivery_person: deliveryPerson || next.delivery_person };
  });
  write(KEYS.deliveries, deliveries);
  return deliveries.find((delivery) => delivery.id === id) || null;
}


export function getDemoNotifications() {
  return read<AdminNotification[]>(KEYS.notifications, []);
}

export function createDemoNotification(notification: Omit<AdminNotification, 'id' | 'read' | 'created_at'>) {
  const item: AdminNotification = {
    id: uid('notif'),
    read: false,
    created_at: new Date().toISOString(),
    ...notification,
  };
  write(KEYS.notifications, [item, ...getDemoNotifications()].slice(0, 80));
  window.dispatchEvent(new Event('glowbeauty:notifications'));
  return item;
}

export function markDemoNotificationRead(id: string) {
  const next = getDemoNotifications().map((item) => item.id === id ? { ...item, read: true } : item);
  write(KEYS.notifications, next);
  window.dispatchEvent(new Event('glowbeauty:notifications'));
  return next;
}

export function markAllDemoNotificationsRead() {
  const next = getDemoNotifications().map((item) => ({ ...item, read: true }));
  write(KEYS.notifications, next);
  window.dispatchEvent(new Event('glowbeauty:notifications'));
  return next;
}

export function getDemoPromotions() {
  const stored = read<Promotion[]>(KEYS.promotions, []);
  if (stored.length) return stored;
  write(KEYS.promotions, demoPromotions);
  return demoPromotions;
}

export function saveDemoPromotions(promotions: Promotion[]) {
  write(KEYS.promotions, promotions);
  createDemoNotification({ type: 'promo', title: 'Promotions mises à jour', message: `${promotions.filter(p => p.active).length} promotion(s) active(s) sur la boutique.`, priority: 'medium', link: '/admin/promotions' });
}

export function getDemoCoupons() {
  const stored = read<Coupon[]>(KEYS.coupons, []);
  if (stored.length) return stored;
  write(KEYS.coupons, demoCoupons);
  return demoCoupons;
}

export function validateDemoCoupon(code: string, amount: number) {
  const normalized = code.trim().toUpperCase();
  const coupon = getDemoCoupons().find((item) => item.code.toUpperCase() === normalized && item.active);
  if (!coupon) return { valid: false, message: 'Code promo invalide', discount: 0, coupon: null as Coupon | null };
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) return { valid: false, message: 'Code promo expiré', discount: 0, coupon: null as Coupon | null };
  if (amount < coupon.min_amount) return { valid: false, message: `Montant minimum : ${coupon.min_amount.toLocaleString()} FCFA`, discount: 0, coupon: null as Coupon | null };
  const discount = Math.round(amount * (coupon.discount_percent / 100));
  return { valid: true, message: `${coupon.discount_percent}% de réduction appliquée`, discount, coupon };
}

function loyaltyTier(points: number): LoyaltyAccount['tier'] {
  if (points >= 1000) return 'Platinum';
  if (points >= 500) return 'Gold';
  if (points >= 200) return 'Silver';
  return 'Bronze';
}

export function getDemoLoyalty(clientId: string) {
  const accounts = read<LoyaltyAccount[]>(KEYS.loyalty, []);
  const existing = accounts.find((item) => item.client_id === clientId);
  if (existing) return existing;
  return { client_id: clientId, points: 0, tier: 'Bronze', total_spent: 0, updated_at: new Date().toISOString() } as LoyaltyAccount;
}

export function addDemoLoyaltyPoints(clientId: string, amount: number) {
  const accounts = read<LoyaltyAccount[]>(KEYS.loyalty, []);
  const existing = accounts.find((item) => item.client_id === clientId) || getDemoLoyalty(clientId);
  const earned = Math.floor(amount / 1000);
  const next: LoyaltyAccount = {
    ...existing,
    points: existing.points + earned,
    total_spent: existing.total_spent + amount,
    tier: loyaltyTier(existing.points + earned),
    updated_at: new Date().toISOString(),
  };
  write(KEYS.loyalty, [next, ...accounts.filter((item) => item.client_id !== clientId)]);
  return { account: next, earned };
}

export function activePromotionForProduct(product: Product) {
  const now = Date.now();
  return getDemoPromotions().find((promotion) => promotion.active && new Date(promotion.start_date).getTime() <= now && new Date(promotion.end_date).getTime() >= now && (promotion.product_id === product.id || (!promotion.product_id && promotion.category_id === product.category_id)));
}

export function promotionalPrice(product: Product) {
  const promotion = activePromotionForProduct(product);
  if (!promotion) return { price: product.price, originalPrice: product.price, discountPercent: 0, promotion: null as Promotion | null };
  const price = Math.round(product.price * (1 - promotion.discount_percent / 100));
  return { price, originalPrice: product.price, discountPercent: promotion.discount_percent, promotion };
}
