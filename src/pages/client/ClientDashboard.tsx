import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ThemeToggle from '../../components/ThemeToggle';
import { initiateMobileMoneyPayment, type MobileMoneyProvider } from '../../lib/mobile-money';
import { createDemoOrder, createDemoNotification, getDemoCategories, getDemoFavorites, getDemoOrders, getDemoPayments, getDemoProducts, toggleDemoFavorite, promotionalPrice, validateDemoCoupon, getDemoLoyalty } from '../../lib/demo-store';
import { useAuth } from '../../contexts/AuthContext';
import type { Product, CartItem, Order, Payment, Review, Favorite, Category } from '../../types/database';
import {
  ShoppingCart,
  Heart,
  Star,
  MessageCircle,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  History,
  Package,
  LogOut,
  Menu,
  X,
  Check,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Sparkle,
  RotateCcw,
  Share2,
  BookOpen,
  Send,
  Layers3,
  MessageSquare,
  XCircle
} from 'lucide-react';

function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeView, setActiveView] = useState<'catalog' | 'cart' | 'favorites' | 'history' | 'loyalty' | 'quiz' | 'blog' | 'returns' | 'compare' | 'support'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showReviewModal, setShowReviewModal] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Check if user is stored in localStorage for client_id
    const clientId = user.id;

    const [productsRes, categoriesRes, favoritesRes, ordersRes, paymentsRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').gt('quantity', 0).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('favorites').select('*').eq('client_id', clientId),
      supabase.from('orders').select('*, items:order_items(*, product:products(*))').eq('client_id', clientId).order('created_at', { ascending: false }),
      supabase.from('payments').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
    ]);

    const demoProducts = getDemoProducts();
    const demoCategories = getDemoCategories();
    const demoOrders = getDemoOrders().filter((order) => order.client_id === clientId);
    const demoPayments = getDemoPayments().filter((payment) => payment.client_id === clientId);

    const remoteProducts = productsRes.data || [];
    const remoteProductCodes = new Set(remoteProducts.map((product) => product.code));
    const mergedProducts = [
      ...remoteProducts,
      ...demoProducts.filter((product) => !remoteProductCodes.has(product.code)),
    ];
    const remoteCategories = categoriesRes.data || [];
    const remoteCategoryCodes = new Set(remoteCategories.map((category) => category.code));
    const mergedCategories = [
      ...remoteCategories,
      ...demoCategories.filter((category) => !remoteCategoryCodes.has(category.code)),
    ];

    setProducts(mergedProducts);
    setCategories(mergedCategories);
    const demoFavorites = getDemoFavorites(clientId);
    setFavorites((favoritesRes.data && favoritesRes.data.length > 0) ? favoritesRes.data : demoFavorites);

    const remoteOrders = ordersRes.data || [];
    const remotePayments = paymentsRes.data || [];
    const remoteOrderIds = new Set(remoteOrders.map((order) => order.id));
    const remotePaymentIds = new Set(remotePayments.map((payment) => payment.id));
    setOrders([...demoOrders.filter((order) => !remoteOrderIds.has(order.id)), ...remoteOrders]);
    setPayments([...demoPayments.filter((payment) => !remotePaymentIds.has(payment.id)), ...remotePayments]);

    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      alert('Ce produit est actuellement en rupture de stock.');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert(`Stock insuffisant. Quantité disponible : ${product.quantity}`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const safeQuantity = Math.min(quantity, item.product.quantity);
        if (quantity > item.product.quantity) {
          alert(`Stock insuffisant. Quantité disponible : ${item.product.quantity}`);
        }
        return { ...item, quantity: safeQuantity };
      })
    );
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) return;

    const nextFavorites = toggleDemoFavorite(user.id, productId);
    setFavorites(nextFavorites);

    const isNowFavorite = nextFavorites.some((f) => f.product_id === productId);
    try {
      if (!isNowFavorite) {
        await supabase.from('favorites').delete().match({ client_id: user.id, product_id: productId });
      } else {
        await supabase.from('favorites').insert([{ client_id: user.id, product_id: productId }]);
      }
    } catch {
      // Mode démonstration local : les favoris restent fonctionnels même sans Supabase.
    }
  };

  const isFavorite = (productId: string) => favorites.some((f) => f.product_id === productId);

  const cartTotal = cart.reduce((sum, item) => sum + promotionalPrice(item.product).price * item.quantity, 0);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 dark:bg-[#1A1512] dark:border-b dark:border-[#2D2520]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-light tracking-[0.2em] uppercase text-gray-900 dark:text-[#F5F0EB] hidden sm:block">Scensora</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setActiveView('catalog')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  activeView === 'catalog' ? 'bg-rose-100 text-rose-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Produits
              </button>
              <button
                onClick={() => setActiveView('favorites')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                  activeView === 'favorites' ? 'bg-rose-100 text-rose-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className="h-5 w-5" />
                Favoris
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                  activeView === 'history' ? 'bg-rose-100 text-rose-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <History className="h-5 w-5" />
                Historique
              </button>
              <button
                onClick={() => setActiveView('loyalty')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                  activeView === 'loyalty' ? 'bg-rose-100 text-rose-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Star className="h-5 w-5" />
                Fidélité
              </button>
              <button
                onClick={() => setActiveView('quiz')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                  activeView === 'quiz' ? 'bg-rose-100 text-rose-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Sparkle className="h-5 w-5" />
                Quiz beauté
              </button>
              <button
                onClick={() => setActiveView('support')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                  activeView === 'support' ? 'bg-rose-100 text-rose-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                Support
              </button>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => setActiveView('cart')}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-light tracking-[0.15em] uppercase">Scensora</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <button
                onClick={() => { setActiveView('catalog'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  activeView === 'catalog' ? 'bg-rose-100 text-rose-600' : 'text-gray-600'
                }`}
              >
                Produits
              </button>
              <button
                onClick={() => { setActiveView('favorites'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  activeView === 'favorites' ? 'bg-rose-100 text-rose-600' : 'text-gray-600'
                }`}
              >
                Favoris
              </button>
              <button
                onClick={() => { setActiveView('history'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  activeView === 'history' ? 'bg-rose-100 text-rose-600' : 'text-gray-600'
                }`}
              >
                Historique
              </button>
              <button
                onClick={() => { setActiveView('cart'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  activeView === 'cart' ? 'bg-rose-100 text-rose-600' : 'text-gray-600'
                }`}
              >
                Panier ({cart.length})
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
          {[['catalog','Produits'],['cart','Panier'],['favorites','Favoris'],['history','Historique'],['loyalty','Fidélité'],['quiz','Quiz'],['blog','Blog'],['returns','Retours'],['compare','Comparer'],['support','Support']].map(([id,label]) => (
            <button key={id} onClick={() => setActiveView(id as typeof activeView)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${activeView === id ? 'bg-rose-600 text-white' : 'bg-white text-gray-600 shadow-sm'}`}>{label}</button>
          ))}
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          </div>
        ) : (
          <>
            {activeView === 'catalog' && (
              <CatalogView
                products={filteredProducts}
                allProducts={products}
                userSkinType={(user as unknown as { skin_type?: string })?.skin_type || ''}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                addToCart={addToCart}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                setShowReviewModal={setShowReviewModal}
                setActiveView={setActiveView}
              />
            )}

            {activeView === 'cart' && (
              <CartView
                cart={cart}
                cartTotal={cartTotal}
                updateCartQuantity={updateCartQuantity}
                removeFromCart={removeFromCart}
                setShowPaymentModal={setShowPaymentModal}
                setActiveView={setActiveView}
              />
            )}

            {activeView === 'favorites' && (
              <FavoritesView
                favorites={favorites}
                products={products}
                addToCart={addToCart}
                toggleFavorite={toggleFavorite}
                setShowReviewModal={setShowReviewModal}
              />
            )}

            {activeView === 'history' && (
              <HistoryView orders={orders} payments={payments} />
            )}

            {activeView === 'loyalty' && user && (
              <LoyaltyView clientId={user.id} />
            )}

            {activeView === 'quiz' && (
              <BeautyQuizView allProducts={products} addToCart={addToCart} setActiveView={setActiveView} />
            )}

            {activeView === 'blog' && (
              <BlogView />
            )}

            {activeView === 'returns' && (
              <ReturnsView orders={orders} />
            )}

            {activeView === 'compare' && (
              <CompareView products={products} addToCart={addToCart} />
            )}

            {activeView === 'support' && (
              <SupportView />
            )}
          </>
        )}
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          product={showReviewModal}
          clientId={user?.id || ''}
          onClose={() => setShowReviewModal(null)}
          onSuccess={() => setShowReviewModal(null)}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          cart={cart}
          cartTotal={cartTotal}
          clientId={user?.id || ''}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setCart([]);
            setShowPaymentModal(false);
            loadData();
            setActiveView('history');
          }}
        />
      )}
    </div>
  );
}

// Catalog View Component
function CatalogView({
  products,
  allProducts,
  userSkinType,
  categories,
  selectedCategory,
  setSelectedCategory,
  addToCart,
  toggleFavorite,
  isFavorite,
  setShowReviewModal,
  setActiveView
}: {
  products: Product[];
  allProducts: Product[];
  userSkinType: string;
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  addToCart: (product: Product) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  setShowReviewModal: (product: Product) => void;
  setActiveView: (view: 'catalog' | 'cart' | 'favorites' | 'history' | 'loyalty' | 'quiz' | 'blog' | 'returns' | 'compare' | 'support') => void;
}) {
  const [query, setQuery] = useState('');
  const [skinFilter, setSkinFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [promoOnly, setPromoOnly] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const recommendedProducts = userSkinType
    ? allProducts.filter((product) => product.skin_type?.toLowerCase().includes(userSkinType.toLowerCase())).slice(0, 4)
    : allProducts.filter((product) => product.quantity > 0).slice(0, 4);

  const brands = Array.from(new Set(allProducts.map((p) => p.brand).filter(Boolean))).sort();
  const skinTypes = Array.from(new Set(allProducts.map((p) => p.skin_type).filter(Boolean))).sort();
  const suggestions = query.trim()
    ? allProducts.filter((product) => `${product.name} ${product.brand}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const visibleProducts = products.filter((product) => {
    const promo = promotionalPrice(product);
    const q = query.trim().toLowerCase();
    const matchesSearch = !q || `${product.name} ${product.brand} ${product.description}`.toLowerCase().includes(q);
    const matchesSkin = !skinFilter || product.skin_type === skinFilter;
    const matchesBrand = !brandFilter || product.brand === brandFilter;
    const matchesPromo = !promoOnly || promo.discountPercent > 0;
    const price = promo.price;
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'low' && price <= 5000) ||
      (priceFilter === 'mid' && price > 5000 && price <= 10000) ||
      (priceFilter === 'high' && price > 10000);
    return matchesSearch && matchesSkin && matchesBrand && matchesPromo && matchesPrice;
  });

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : prev.length >= 3 ? [...prev.slice(1), id] : [...prev, id]);
  };
  const compareProducts = allProducts.filter((product) => compareIds.includes(product.id));

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-[#B76E79]/10 bg-gradient-to-br from-white via-[#FAF7F4] to-[#F5EDE8] dark:from-[#1A1512] dark:via-[#1A1512] dark:to-[#0C0A09] p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-[#B76E79]">Votre espace beaute</p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-[#F5F0EB] md:text-4xl">Trouvez les soins parfaits pour votre peau</h1>
            <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-400">Recherchez, filtrez, comparez et composez votre routine beauté personnalisée.</p>
            <div className="relative mt-6 max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher : crème, sérum, karité..." className="w-full rounded-2xl border border-rose-100 bg-white py-4 pl-12 pr-4 shadow-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100" />
              {suggestions.length > 0 && (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                  {suggestions.map((product) => <button key={product.id} onClick={() => setQuery(product.name)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-rose-50"><span className="font-medium text-gray-800">{product.name}</span><span className="text-sm text-gray-500">{product.brand}</span></button>)}
                </div>
              )}
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-gray-950 p-6 text-white shadow-xl">
            <p className="text-sm text-rose-200">Conseil beauté</p>
            <h2 className="mt-2 text-2xl font-bold">Quiz + recommandations</h2>
            <p className="mt-2 text-sm text-gray-300">Indiquez type de peau, objectif et problème pour obtenir routine matin/soir.</p>
            <button onClick={() => setActiveView('quiz')} className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-bold text-gray-950">Démarrer</button>
          </div>
        </div>
      </section>

      {recommendedProducts.length > 0 && (
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-sm uppercase tracking-wide text-rose-500">Sélection beauté</p><h2 className="text-2xl font-bold text-gray-900">Recommandés pour vous</h2></div>
            <Sparkle className="h-7 w-7 text-rose-500" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedProducts.map((product) => (
              <button onClick={() => setDetailProduct(product)} key={product.id} className="rounded-2xl bg-rose-50 p-4 text-left hover:bg-rose-100">
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">{Number(product.price).toLocaleString()} FCFA</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100">
        <div className="mb-4 flex items-center gap-2 text-gray-900"><SlidersHorizontal className="h-5 w-5 text-rose-500" /><h2 className="font-bold">Filtres avancés</h2></div>
        <div className="grid gap-3 md:grid-cols-5">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-100"><option value="">Toutes catégories</option>{categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3"><option value="">Toutes marques</option>{brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select>
          <select value={skinFilter} onChange={(e) => setSkinFilter(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3"><option value="">Tous types de peau</option>{skinTypes.map((skin) => <option key={skin} value={skin}>{skin}</option>)}</select>
          <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3"><option value="all">Tous les prix</option><option value="low">≤ 5 000 FCFA</option><option value="mid">5 001 - 10 000 FCFA</option><option value="high">+ 10 000 FCFA</option></select>
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm"><input type="checkbox" checked={promoOnly} onChange={(e) => setPromoOnly(e.target.checked)} /> Promotions</label>
        </div>
      </section>

      {compareProducts.length > 0 && (
        <section className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-gray-900">Comparaison ({compareProducts.length}/3)</h2><button onClick={() => setCompareIds([])} className="text-sm font-semibold text-amber-700">Vider</button></div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">{compareProducts.map((p) => <div key={p.id} className="rounded-2xl bg-white p-4"><p className="font-bold">{p.name}</p><p className="text-sm text-gray-500">{p.brand} • {p.skin_type}</p><p className="mt-2 font-bold text-rose-600">{promotionalPrice(p).price.toLocaleString()} FCFA</p></div>)}</div>
        </section>
      )}

      {visibleProducts.length === 0 ? (
        <div className="text-center py-12"><Package className="h-16 w-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucun produit disponible</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleProducts.map((product) => (
            <div key={product.id} className="group overflow-hidden rounded-[1.6rem] border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-56 bg-gradient-to-br from-rose-50 to-stone-50">
                <img src={product.image_url || 'https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg?auto=compress&cs=tinysrgb&w=600'} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <button onClick={() => toggleFavorite(product.id)} className={`absolute right-3 top-3 rounded-full p-2 shadow-sm transition ${isFavorite(product.id) ? 'bg-rose-600 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'}`}><Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} /></button>
                <button onClick={() => toggleCompare(product.id)} className={`absolute left-3 bottom-3 rounded-full px-3 py-1 text-xs font-bold ${compareIds.includes(product.id) ? 'bg-gray-950 text-white' : 'bg-white/90 text-gray-700'}`}><Layers3 className="mr-1 inline h-3 w-3" />Comparer</button>
                {promotionalPrice(product).discountPercent > 0 && <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">-{promotionalPrice(product).discountPercent}%</span>}
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wide text-gray-400">{product.brand}</p>
                <button onClick={() => setDetailProduct(product)} className="mt-1 text-left text-lg font-bold text-gray-950 hover:text-rose-600">{product.name}</button>
                <p className="mt-1 text-xs text-gray-500">Peau {product.skin_type || 'tous types'} • ⭐ 4.7</p>
                <p className="mt-3 line-clamp-2 text-sm text-gray-500">{product.description}</p>
                <div className="mt-4 flex items-end justify-between gap-2"><div><p className="text-xl font-bold text-rose-600">{promotionalPrice(product).price.toLocaleString()} FCFA</p>{promotionalPrice(product).discountPercent > 0 && <p className="text-xs text-gray-400 line-through">{product.price.toLocaleString()} FCFA</p>}</div><button onClick={() => addToCart(product)} disabled={product.quantity <= 0} className="rounded-full bg-gray-950 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:bg-gray-300"><Plus className="inline h-4 w-4" /> Panier</button></div>
                <button onClick={() => setShowReviewModal(product)} className="mt-3 text-sm font-semibold text-gray-500 hover:text-rose-600">Voir / ajouter avis</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {detailProduct && <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} addToCart={addToCart} setShowReviewModal={setShowReviewModal} />}
    </div>
  );
}

// Cart View Component
function CartView({
  cart,
  cartTotal,
  updateCartQuantity,
  removeFromCart,
  setShowPaymentModal,
  setActiveView
}: {
  cart: CartItem[];
  cartTotal: number;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  setShowPaymentModal: (show: boolean) => void;
  setActiveView: (view: 'catalog' | 'cart' | 'favorites' | 'history' | 'loyalty' | 'quiz' | 'blog' | 'returns' | 'compare' | 'support') => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveView('catalog')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Continuer les achats
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Mon Panier</h1>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Votre panier est vide</p>
          <button
            onClick={() => setActiveView('catalog')}
            className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
          >
            Voir les produits
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-xl shadow p-4 flex gap-4"
              >
                <img
                  src={item.product.image_url || 'https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg?auto=compress&cs=tinysrgb&w=200'}
                  alt={item.product.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{item.product.brand}</p>
                  <p className="text-rose-600 font-bold mt-1">
                    {promotionalPrice(item.product).price.toLocaleString()} FCFA
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {(promotionalPrice(item.product).price * item.quantity).toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recapitulatif</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{cartTotal.toLocaleString()} FCFA</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-rose-600">{cartTotal.toLocaleString()} FCFA</span>
              </div>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="h-5 w-5" />
              Passer la commande
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Favorites View Component
function FavoritesView({
  favorites,
  products,
  addToCart,
  toggleFavorite,
  setShowReviewModal
}: {
  favorites: Favorite[];
  products: Product[];
  addToCart: (product: Product) => void;
  toggleFavorite: (productId: string) => void;
  setShowReviewModal: (product: Product) => void;
}) {
  const favoriteProducts = products.filter((p) => favorites.some((f) => f.product_id === p.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1><button onClick={() => { navigator.clipboard?.writeText(window.location.href + '#wishlist'); alert('Lien de wishlist copié.'); }} className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-600 shadow-sm hover:bg-rose-50"><Share2 className="h-4 w-4" /> Partager ma wishlist</button></div>

      {favoriteProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun produit dans vos favoris</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="relative h-48 bg-gradient-to-br from-rose-50 to-pink-50">
                <img
                  src={product.image_url || 'https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 right-3 p-2 bg-rose-600 text-white rounded-full"
                >
                  <Heart className="h-5 w-5 fill-current" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                {(() => {
                  const promo = promotionalPrice(product);
                  return (
                    <div className="mb-3">
                      {promo.discountPercent > 0 && (
                        <span className="inline-flex rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">-{promo.discountPercent}%</span>
                      )}
                      <p className="text-lg font-bold text-rose-600">{promo.price.toLocaleString()} FCFA</p>
                      {promo.discountPercent > 0 && <p className="text-xs text-gray-400 line-through">{promo.originalPrice.toLocaleString()} FCFA</p>}
                    </div>
                  );
                })()}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReviewModal(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Avis
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.quantity <= 0}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    <Plus className="h-4 w-4" />
                    Panier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// History View Component
function HistoryView({ orders, payments }: { orders: Order[]; payments: Payment[] }) {
  const [activeTab, setActiveTab] = useState<'orders' | 'payments'>('orders');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mon Historique</h1>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-xl transition-colors ${
            activeTab === 'orders' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Commandes
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-6 py-2 rounded-xl transition-colors ${
            activeTab === 'payments' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Paiements
        </button>
      </div>

      {activeTab === 'orders' ? (
        orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune commande</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="font-bold text-gray-900">{order.code}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      order.status === 'validated' ? 'bg-green-100 text-green-700' :
                      order.status === 'refused' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'validated' ? 'Valide' : order.status === 'refused' ? 'Refuse' : 'En attente'}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {order.payment_status === 'paid' ? 'Paye' : 'En attente'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.product?.name} x{item.quantity}</span>
                      <span className="font-medium">{Number(item.subtotal).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-rose-600">{Number(order.total_amount).toLocaleString()} FCFA</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : payments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun paiement</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-xl shadow p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900">{payment.code}</p>
                <p className="text-sm text-gray-500">
                  {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  payment.payment_method === 'MTN' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {payment.payment_method}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                  payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {payment.status === 'completed' ? 'Complete' : payment.status === 'failed' ? 'Echoue' : 'En attente'}
                </span>
                <span className="font-bold text-gray-900">{Number(payment.amount).toLocaleString()} FCFA</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Review Modal Component
function ReviewModal({
  product,
  clientId,
  onClose,
  onSuccess
}: {
  product: Product;
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    loadReviews();
  }, [product.id]);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, client:clients(*)')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await supabase.from('reviews').insert([{
      client_id: clientId,
      product_id: product.id,
      rating,
      comment
    }]);

    setLoading(false);
    onSuccess();
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Avis sur {product.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Average Rating */}
          <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-xl">
            <div className="text-4xl font-bold text-rose-600">{averageRating}</div>
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(parseFloat(averageRating)) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{reviews.length} avis</p>
            </div>
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900">Donnez votre avis</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="p-1"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        i < rating ? 'text-amber-400 fill-current' : 'text-gray-300 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
                rows={3}
                placeholder="Partagez votre experience..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 bg-white border rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <span className="text-rose-600 font-semibold">
                      {review.client?.first_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.client?.first_name} {review.client?.last_name}
                    </p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600">{review.comment}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(review.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}

            {reviews.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun avis pour ce produit
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function LoyaltyView({ clientId }: { clientId: string }) {
  const loyalty = getDemoLoyalty(clientId);
  const nextTier = loyalty.tier === 'Bronze' ? 200 : loyalty.tier === 'Silver' ? 500 : loyalty.tier === 'Gold' ? 1000 : loyalty.points;
  const progress = loyalty.tier === 'Platinum' ? 100 : Math.min(100, Math.round((loyalty.points / nextTier) * 100));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-[#F5F0EB]">Programme fidélité Scensora</h1>
      <section className="rounded-3xl bg-gradient-to-br from-gray-900 via-rose-900 to-pink-700 p-8 text-white shadow-xl">
        <p className="text-sm uppercase tracking-widest text-rose-100">Carte membre</p>
        <h2 className="mt-2 text-4xl font-bold">{loyalty.tier}</h2>
        <p className="mt-4 text-rose-100">{loyalty.points} points cumulés • {loyalty.total_spent.toLocaleString()} FCFA dépensés</p>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow"><h3 className="font-bold text-gray-900">Bronze</h3><p className="text-sm text-gray-500">0 à 199 points</p></div>
        <div className="rounded-2xl bg-white p-6 shadow"><h3 className="font-bold text-gray-900">Silver / Gold</h3><p className="text-sm text-gray-500">Réductions, accès promos et avantages livraison.</p></div>
        <div className="rounded-2xl bg-white p-6 shadow"><h3 className="font-bold text-gray-900">Platinum</h3><p className="text-sm text-gray-500">Avantages VIP et offres premium.</p></div>
      </div>
    </div>
  );
}

// Payment Modal Component
function PaymentModal({
  cart,
  cartTotal,
  clientId,
  onClose,
  onSuccess
}: {
  cart: CartItem[];
  cartTotal: number;
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<MobileMoneyProvider>('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const couponResult = couponCode.trim() ? validateDemoCoupon(couponCode, cartTotal) : { valid: false, discount: 0, message: '', coupon: null };
  const finalTotal = Math.max(0, cartTotal - couponResult.discount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateCode = (prefix: string) => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const unavailable = cart.find((item) => item.quantity > item.product.quantity || item.product.quantity <= 0);
      if (unavailable) {
        throw new Error(`Stock insuffisant pour ${unavailable.product.name}. Disponible : ${unavailable.product.quantity}`);
      }

      // Create order
      const orderCode = generateCode('ORD');
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          code: orderCode,
          client_id: clientId,
          total_amount: finalTotal,
          status: 'pending',
          payment_status: 'pending',
          delivery_address: deliveryAddress
        }])
        .select()
        .single();

      if (orderError || !orderData) {
        throw new Error('SUPABASE_ORDER_FAILED');
      }

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) {
        throw new Error('SUPABASE_ITEMS_FAILED');
      }

      // Create payment record
      const paymentCode = generateCode('PAY');
      const { error: paymentError } = await supabase.from('payments').insert([{
        code: paymentCode,
        order_id: orderData.id,
        client_id: clientId,
        amount: finalTotal,
        payment_method: paymentMethod,
        phone_number: phoneNumber,
        status: 'pending'
      }]);

      if (paymentError) {
        throw new Error('SUPABASE_PAYMENT_FAILED');
      }

      const paymentResult = await initiateMobileMoneyPayment({
        provider: paymentMethod,
        phoneNumber,
        amount: finalTotal,
        orderCode,
        paymentCode,
        description: `Commande Scensora ${orderCode}`
      });

      if (!paymentResult.success) {
        await supabase.from('payments').update({ status: 'failed' }).eq('code', paymentCode);
        throw new Error(paymentResult.message || 'Le paiement mobile a échoué');
      }

      await supabase.from('payments').update({ status: 'completed' }).eq('code', paymentCode);
      await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', orderData.id);

      // Le stock sera diminué au moment où l'administrateur valide la commande.

      setLoading(false);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      const canFallback = message.startsWith('SUPABASE_') || message.includes('Failed to fetch') || message.includes('fetch');

      if (canFallback) {
        const paymentResult = await initiateMobileMoneyPayment({
          provider: paymentMethod,
          phoneNumber,
          amount: finalTotal,
          orderCode: `ORD-DEMO-${Date.now()}`,
          paymentCode: `PAY-DEMO-${Date.now()}`,
          description: 'Commande Scensora en mode demonstration'
        });

        if (!paymentResult.success) {
          setLoading(false);
          setError(paymentResult.message);
          return;
        }

        createDemoOrder({ client: null, clientId, cart, total: cartTotal, paymentMethod, phoneNumber, deliveryAddress, couponCode: couponResult.coupon?.code, discountAmount: couponResult.discount });
        setLoading(false);
        onSuccess();
        return;
      }

      setLoading(false);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Paiement Mobile</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Order Summary */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} article(s)</span>
              <span>Total a payer</span>
            </div>
            <div className="flex justify-between font-bold text-xl">
              <span></span>
              <span className="text-rose-600">{cartTotal.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('MTN')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'MTN'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-yellow-600 text-2xl mb-1">MTN</div>
                  <p className="text-xs text-gray-500">Mobile Money</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ORANGE')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'ORANGE'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-orange-600 text-2xl mb-1">ORANGE</div>
                  <p className="text-xs text-gray-500">Orange Money</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse de livraison</label>
              <textarea
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                placeholder="Ex : Douala, Bonapriso, près de..."
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500">Cette adresse sera transmise automatiquement à l'administrateur et au livreur.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code promo / coupon</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponMessage(''); }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  placeholder="WELCOME10, BEAUTY20..."
                />
                <button
                  type="button"
                  onClick={() => setCouponMessage(couponResult.message)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >Tester</button>
              </div>
              {(couponMessage || couponResult.valid) && <p className={`mt-1 text-xs ${couponResult.valid ? 'text-emerald-600' : 'text-red-500'}`}>{couponMessage || couponResult.message}</p>}
              {couponResult.discount > 0 && <p className="mt-1 text-xs text-rose-600">Réduction : -{couponResult.discount.toLocaleString()} FCFA</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Numero de telephone</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                placeholder="6XX XX XX XX"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !phoneNumber || !deliveryAddress.trim()}
              className="w-full py-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Traitement en cours...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Effectuer le paiement
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center">
            Paiement réel si les clés opérateur sont configurées côté serveur ; sinon simulation académique. En cliquant sur "Effectuer le paiement", vous serez débité de {finalTotal.toLocaleString()} FCFA via {paymentMethod} Mobile Money.
          </p>
        </div>
      </div>
    </div>
  );
}


function ProductDetailModal({ product, onClose, addToCart, setShowReviewModal }: { product: Product; onClose: () => void; addToCart: (product: Product) => void; setShowReviewModal: (product: Product) => void }) {
  const promo = promotionalPrice(product);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 px-6 py-4 backdrop-blur">
          <div><p className="text-xs uppercase tracking-[0.3em] text-rose-500">Fiche produit</p><h2 className="text-2xl font-bold text-gray-950">{product.name}</h2></div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><XCircle className="h-6 w-6" /></button>
        </div>
        <div className="grid gap-8 p-6 lg:grid-cols-2">
          <img src={product.image_url} alt={product.name} className="h-[440px] w-full rounded-[1.5rem] object-cover" />
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">{product.brand}</p>
            <div className="flex items-center gap-2 text-amber-500"><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5" /><span className="text-sm text-gray-500">4.7 • avis vérifiés</span></div>
            <p className="text-gray-600">{product.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-rose-50 p-4"><p className="text-sm text-gray-500">Type de peau</p><p className="font-bold text-gray-900">{product.skin_type || 'Tous types'}</p></div>
              <div className="rounded-2xl bg-stone-50 p-4"><p className="text-sm text-gray-500">Stock</p><p className="font-bold text-gray-900">{product.quantity} unité(s)</p></div>
              <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-sm text-gray-500">Conseil matin</p><p className="font-bold text-gray-900">Appliquer après nettoyage</p></div>
              <div className="rounded-2xl bg-indigo-50 p-4"><p className="text-sm text-gray-500">Conseil soir</p><p className="font-bold text-gray-900">Associer à une crème douce</p></div>
            </div>
            <div><p className="text-3xl font-black text-rose-600">{promo.price.toLocaleString()} FCFA</p>{promo.discountPercent > 0 && <p className="text-sm text-gray-400 line-through">{promo.originalPrice.toLocaleString()} FCFA</p>}</div>
            <div className="flex flex-wrap gap-3"><button onClick={() => addToCart(product)} className="rounded-full bg-gray-950 px-6 py-3 font-bold text-white hover:bg-rose-700">Ajouter au panier</button><button onClick={() => setShowReviewModal(product)} className="rounded-full border border-gray-200 px-6 py-3 font-bold text-gray-700 hover:bg-gray-50">Avis clients</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BeautyQuizView({ allProducts, addToCart, setActiveView }: { allProducts: Product[]; addToCart: (product: Product) => void; setActiveView: (view: 'catalog' | 'cart' | 'favorites' | 'history' | 'loyalty' | 'quiz' | 'blog' | 'returns' | 'compare' | 'support') => void }) {
  const [skin, setSkin] = useState('grasse');
  const [concern, setConcern] = useState('taches');
  const matches = allProducts.filter((p) => p.skin_type?.toLowerCase().includes(skin) || p.description.toLowerCase().includes(concern)).slice(0, 4);
  return <div className="space-y-6"><section className="rounded-[2rem] bg-gradient-to-br from-gray-950 to-rose-900 p-8 text-white"><p className="text-sm uppercase tracking-[0.3em] text-rose-200">Beauty Quiz</p><h1 className="mt-2 text-4xl font-bold">Votre routine personnalisée</h1><p className="mt-3 text-rose-100">Répondez à quelques critères et Scensora propose une routine matin/soir.</p></section><div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-white p-6 shadow"><label className="font-bold">Type de peau</label><select value={skin} onChange={(e)=>setSkin(e.target.value)} className="mt-3 w-full rounded-xl border p-3"><option value="grasse">Peau grasse</option><option value="sèche">Peau sèche</option><option value="mixte">Peau mixte</option><option value="sensible">Peau sensible</option></select></div><div className="rounded-2xl bg-white p-6 shadow"><label className="font-bold">Objectif principal</label><select value={concern} onChange={(e)=>setConcern(e.target.value)} className="mt-3 w-full rounded-xl border p-3"><option value="taches">Taches / éclat</option><option value="acné">Acné</option><option value="hydratation">Hydratation</option><option value="brillance">Brillance</option></select></div></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-white p-6 shadow"><h2 className="text-xl font-bold">Routine matin</h2><ol className="mt-4 list-decimal space-y-2 pl-5 text-gray-600"><li>Nettoyant doux</li><li>Sérum adapté</li><li>Crème hydratante</li><li>Protection solaire</li></ol></div><div className="rounded-2xl bg-white p-6 shadow"><h2 className="text-xl font-bold">Routine soir</h2><ol className="mt-4 list-decimal space-y-2 pl-5 text-gray-600"><li>Démaquillage / nettoyage</li><li>Soin ciblé</li><li>Crème réparatrice</li></ol></div></div><section className="rounded-3xl bg-white p-6 shadow"><h2 className="text-xl font-bold">Produits recommandés</h2><div className="mt-4 grid gap-4 md:grid-cols-4">{matches.map((p)=><div key={p.id} className="rounded-2xl border p-4"><img src={p.image_url} className="h-32 w-full rounded-xl object-cover"/><p className="mt-3 font-bold">{p.name}</p><p className="text-sm text-gray-500">{promotionalPrice(p).price.toLocaleString()} FCFA</p><button onClick={()=>addToCart(p)} className="mt-3 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white">Ajouter</button></div>)}</div><button onClick={()=>setActiveView('catalog')} className="mt-5 text-sm font-bold text-rose-600">Retour au catalogue</button></section></div>;
}

function BlogView() {
  const articles = ['Comment traiter les taches sans agresser la peau ?', 'Routine peau grasse : les erreurs à éviter', 'Pourquoi la protection solaire est indispensable ?', 'Construire une routine cheveux naturels en 4 étapes'];
  return <div className="space-y-6"><h1 className="text-3xl font-bold text-gray-900">Blog beauté</h1><div className="grid gap-5 md:grid-cols-2">{articles.map((title, i)=><article key={title} className="rounded-[1.5rem] bg-white p-6 shadow-sm border border-gray-100"><BookOpen className="h-8 w-8 text-rose-500"/><p className="mt-4 text-xs uppercase tracking-wide text-gray-400">Conseil #{i+1}</p><h2 className="mt-2 text-xl font-bold text-gray-900">{title}</h2><p className="mt-2 text-gray-600">Un contenu éditorial pour conseiller les clients et renforcer la crédibilité de la boutique.</p><button className="mt-4 text-sm font-bold text-rose-600">Lire l'article</button></article>)}</div></div>;
}

function ReturnsView({ orders }: { orders: Order[] }) {
  const [requested, setRequested] = useState<string[]>([]);
  return <div className="space-y-6"><h1 className="text-3xl font-bold text-gray-900">Retours et réclamations</h1><div className="grid gap-4">{orders.map((order)=><div key={order.id} className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold">{order.code}</p><p className="text-sm text-gray-500">{Number(order.total_amount).toLocaleString()} FCFA</p></div><button onClick={()=>setRequested((prev)=>prev.includes(order.id)?prev:[...prev,order.id])} className="rounded-full bg-gray-950 px-4 py-2 text-sm font-bold text-white"><RotateCcw className="mr-1 inline h-4 w-4" />{requested.includes(order.id)?'Retour demandé':'Demander un retour'}</button></div></div>)}</div>{orders.length===0 && <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">Aucune commande disponible.</div>}</div>;
}

function CompareView({ products, addToCart }: { products: Product[]; addToCart: (product: Product) => void }) {
  const sample = products.slice(0,3);
  return <div className="space-y-6"><h1 className="text-3xl font-bold text-gray-900">Comparateur produit</h1><div className="grid gap-4 md:grid-cols-3">{sample.map((p)=><div key={p.id} className="rounded-3xl bg-white p-5 shadow-sm border"><img src={p.image_url} className="h-48 w-full rounded-2xl object-cover"/><h2 className="mt-4 text-xl font-bold">{p.name}</h2><p className="text-sm text-gray-500">{p.brand} • {p.skin_type}</p><p className="mt-2 font-bold text-rose-600">{promotionalPrice(p).price.toLocaleString()} FCFA</p><button onClick={()=>addToCart(p)} className="mt-4 rounded-full bg-rose-600 px-4 py-2 font-bold text-white">Ajouter</button></div>)}</div></div>;
}

function SupportView() {
  const { user } = useAuth();
  const clientId = user?.id || 'anonymous';
  const storageKey = `scensora_support_${clientId}`;

  const [messages, setMessages] = useState<{from: string; text: string; time: string}[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [{ from: 'admin', text: 'Bienvenue sur le support Scensora. Comment pouvons-nous vous aider ?', time: new Date().toISOString() }];
  });
  const [text, setText] = useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.length !== messages.length) setMessages(parsed);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length, storageKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const send = () => {
    if (!text.trim()) return;
    const newMsg = { from: 'client', text: text.trim(), time: new Date().toISOString() };
    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setText('');

    createDemoNotification({
      type: 'order',
      title: `Message support de ${user?.first_name || 'Client'}`,
      message: text.trim().slice(0, 100),
      priority: 'high',
      link: '/admin/notifications',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Support Client</h1>
      <p className="text-sm text-gray-500">Vos messages sont conservés. L'administrateur peut voir et répondre depuis son panneau.</p>
      <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-gray-100">
        <div ref={scrollRef} className="max-h-[450px] space-y-3 overflow-y-auto pr-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'client' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${m.from === 'client' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className="text-sm">{m.text}</p>
                <p className="text-[10px] mt-1 opacity-50">{new Date(m.time).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Écrivez votre message..." className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#B76E79]" />
          <button onClick={send} disabled={!text.trim()} className="rounded-xl bg-[#1A1A1A] px-5 py-3 text-sm font-medium text-white hover:bg-[#B76E79] transition-colors disabled:opacity-40">
            <Send className="inline h-4 w-4" /> Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}


export default ClientDashboard;
