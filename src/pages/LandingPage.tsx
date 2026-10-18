import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getDemoProducts } from '../lib/demo-store';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import type { Product, Review } from '../types/database';
import {
  Heart,
  Shield,
  Leaf,
  Menu,
  X,
  Star,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Send,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';
import AuthModal from '../components/AuthModal';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';

function LandingPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(products.length, 6));
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  const fetchProducts = async () => {
    const demoProducts = getDemoProducts().filter((product) => product.quantity > 0);
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*), supplier:suppliers(*)')
      .gt('quantity', 0)
      .order('created_at', { ascending: false });

    const remoteProducts = data || [];
    const remoteCodes = new Set(remoteProducts.map((product) => product.code));
    const mergedProducts = [
      ...remoteProducts,
      ...demoProducts.filter((product) => !remoteCodes.has(product.code)),
    ];

    setProducts(mergedProducts);
  };

  const handleOrderClick = () => {
    if (isAuthenticated) {
      window.location.href = isAdmin ? '/admin' : '/client';
    } else {
      setAuthMode('login');
      setShowAuth(true);
    }
  };

  const handleShowReviews = async (product: Product) => {
    setSelectedProduct(product);
    const { data } = await supabase
      .from('reviews')
      .select('*, client:clients(*)')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });
    if (data) setProductReviews(data);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Nouveau message de ${contactForm.name}%0AEmail: ${contactForm.email}%0A%0A${contactForm.message}`;
    window.open(`https://wa.me/237651819516?text=${message}`, '_blank');
  };

  const navItems = [
    { label: t.nav.home, href: '#accueil' },
    { label: t.nav.about, href: '#apropos' },
    { label: t.nav.products, href: '#produits' },
    { label: t.nav.contact, href: '#contact' },
  ];

  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#FAF7F4] text-[#1A1A1A] dark:bg-[#0C0A09] dark:text-[#F5F0EB] font-sans antialiased">
      {/* Navigation - Dior/Sephora inspired minimal sticky header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 dark:bg-[#0C0A09]/95 backdrop-blur-lg shadow-[0_1px_0_rgba(0,0,0,0.05)]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <a href="#accueil" className="flex items-center gap-3 group">
              <span className="text-2xl font-light tracking-[0.25em] uppercase text-[#1A1A1A] dark:text-[#F5F0EB] transition-colors">
                Scensora
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm tracking-[0.1em] uppercase font-light text-[#1A1A1A]/70 hover:text-[#1A1A1A] dark:text-[#F5F0EB]/70 dark:hover:text-[#F5F0EB] transition-all duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-[#B76E79] after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-5">
              <LanguageToggle />
              <ThemeToggle />
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    window.location.href = isAdmin ? '/admin' : '/client';
                  } else {
                    setAuthMode('login');
                    setShowAuth(true);
                  }
                }}
                className="px-7 py-2.5 bg-[#1A1A1A] dark:bg-[#F5F0EB] text-white dark:text-[#1A1A1A] text-xs tracking-[0.15em] uppercase font-medium rounded-full hover:bg-[#B76E79] dark:hover:bg-[#B76E79] dark:hover:text-white transition-all duration-300 hover:scale-[1.02]"
              >
                {isAuthenticated ? t.nav.myAccount : t.nav.login}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#1A1A1A] dark:text-[#F5F0EB]"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-6 bg-white/98 dark:bg-[#0C0A09]/98 backdrop-blur-lg border-t border-[#1A1A1A]/5 dark:border-[#F5F0EB]/5 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm tracking-[0.1em] uppercase font-light text-[#1A1A1A]/80 dark:text-[#F5F0EB]/80 hover:text-[#B76E79] transition-colors py-2"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (isAuthenticated) {
                  window.location.href = isAdmin ? '/admin' : '/client';
                } else {
                  setAuthMode('login');
                  setShowAuth(true);
                }
              }}
              className="w-full mt-4 px-6 py-3 bg-[#1A1A1A] dark:bg-[#F5F0EB] text-white dark:text-[#1A1A1A] text-xs tracking-[0.15em] uppercase font-medium rounded-full"
            >
              {isAuthenticated ? t.nav.myAccount : t.nav.login}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full-bleed, Dior-inspired elegance */}
      <section id="accueil" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF7F4] via-[#F5EDE8] to-[#EDE4DC] dark:from-[#0C0A09] dark:via-[#1A1512] dark:to-[#1F1610]"></div>
        <div
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.04]"
          style={{
            backgroundImage: `url("https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg?auto=compress&cs=tinysrgb&w=1920")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>

        {/* Subtle decorative elements */}
        <div className="absolute top-1/4 right-[10%] w-[400px] h-[400px] bg-[#B76E79]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 left-[10%] w-[300px] h-[300px] bg-[#D4A574]/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 text-center pt-24">
          <p className="text-xs tracking-[0.4em] uppercase text-[#B76E79] font-medium mb-8 animate-[fadeInUp_0.8s_ease-out]">
            {t.hero.subtitle}
          </p>
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight tracking-[0.15em] uppercase text-[#1A1A1A] dark:text-[#F5F0EB] mb-8 leading-[0.9] animate-[fadeInUp_1s_ease-out]">
            {t.hero.title}
          </h1>
          <p className="text-lg md:text-xl font-light text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-4 max-w-2xl mx-auto leading-relaxed animate-[fadeInUp_1.2s_ease-out]">
            {t.hero.description}
          </p>
          <p className="text-sm italic text-[#B76E79] mb-14 animate-[fadeInUp_1.4s_ease-out]">
            "{t.hero.tagline}"
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center animate-[fadeInUp_1.6s_ease-out]">
            <a
              href="#produits"
              className="group px-10 py-4 bg-[#1A1A1A] dark:bg-[#F5F0EB] text-white dark:text-[#1A1A1A] text-xs tracking-[0.2em] uppercase font-medium rounded-full hover:bg-[#B76E79] dark:hover:bg-[#B76E79] dark:hover:text-white transition-all duration-500 hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.1)] inline-flex items-center justify-center gap-3"
            >
              {t.hero.cta1}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <button
              onClick={handleOrderClick}
              className="group px-10 py-4 bg-transparent border border-[#1A1A1A]/20 dark:border-[#F5F0EB]/20 text-[#1A1A1A] dark:text-[#F5F0EB] text-xs tracking-[0.2em] uppercase font-medium rounded-full hover:border-[#B76E79] hover:text-[#B76E79] transition-all duration-500 hover:scale-[1.02] inline-flex items-center justify-center gap-3"
            >
              <ShoppingCart className="h-4 w-4" />
              {t.hero.cta2}
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#B76E79]/50 to-transparent animate-pulse"></div>
        </div>
      </section>

      {/* About Section - Clean, generous whitespace */}
      <section id="apropos" className="py-28 lg:py-36 bg-white dark:bg-[#0F0D0B]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[#B76E79] font-medium mb-4">{t.about.subtitle}</p>
            <h2 className="text-4xl md:text-5xl font-extralight tracking-[0.05em] text-[#1A1A1A] dark:text-[#F5F0EB]">
              {t.about.title}
            </h2>
            <div className="w-16 h-[1px] bg-[#B76E79] mx-auto mt-8"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B76E79]/10 to-[#D4A574]/10 rounded-[2rem] transform rotate-2"></div>
              <img
                src="https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Scensora Collection"
                className="relative rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] w-full object-cover h-[500px]"
              />
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl md:text-3xl font-light text-[#1A1A1A] dark:text-[#F5F0EB] tracking-wide">
                {t.about.since}
              </h3>
              <p className="text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 leading-[1.9] font-light text-base">
                {t.about.description1}
              </p>
              <p className="text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 leading-[1.9] font-light text-base">
                {t.about.description2}
              </p>

              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center p-5 bg-[#FAF7F4] dark:bg-[#1A1512] rounded-2xl border border-[#1A1A1A]/5 dark:border-[#F5F0EB]/5">
                  <Heart className="h-6 w-6 text-[#B76E79] mx-auto mb-3" />
                  <p className="text-xs font-medium tracking-wide uppercase text-[#1A1A1A] dark:text-[#F5F0EB]">{t.about.card1}</p>
                </div>
                <div className="text-center p-5 bg-[#FAF7F4] dark:bg-[#1A1512] rounded-2xl border border-[#1A1A1A]/5 dark:border-[#F5F0EB]/5">
                  <Shield className="h-6 w-6 text-[#B76E79] mx-auto mb-3" />
                  <p className="text-xs font-medium tracking-wide uppercase text-[#1A1A1A] dark:text-[#F5F0EB]">{t.about.card2}</p>
                </div>
                <div className="text-center p-5 bg-[#FAF7F4] dark:bg-[#1A1512] rounded-2xl border border-[#1A1A1A]/5 dark:border-[#F5F0EB]/5">
                  <Leaf className="h-6 w-6 text-[#B76E79] mx-auto mb-3" />
                  <p className="text-xs font-medium tracking-wide uppercase text-[#1A1A1A] dark:text-[#F5F0EB]">{t.about.card3}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Premium grid inspired by Sephora/The Ordinary */}
      <section id="produits" className="py-28 lg:py-36 bg-[#FAF7F4] dark:bg-[#0C0A09]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[#B76E79] font-medium mb-4">{t.products.subtitle}</p>
            <h2 className="text-4xl md:text-5xl font-extralight tracking-[0.05em] text-[#1A1A1A] dark:text-[#F5F0EB]">
              {t.products.title}
            </h2>
            <div className="w-16 h-[1px] bg-[#B76E79] mx-auto mt-8"></div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#1A1A1A]/40 dark:text-[#F5F0EB]/40 font-light">{t.products.empty}</p>
            </div>
          ) : (
            <>
              {/* Featured Slideshow */}
              <div className="relative mb-20">
                <div className="overflow-hidden rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                  <div
                    className="flex transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {featuredProducts.map((product) => (
                      <div key={product.id} className="min-w-full">
                        <div className="relative h-[450px] md:h-[550px] bg-gradient-to-br from-[#F5EDE8] to-[#EDE4DC] dark:from-[#1A1512] dark:to-[#0F0D0B]">
                          <img
                            src={product.image_url || 'https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-8 md:p-12">
                            <div className="text-white max-w-lg">
                              <p className="text-xs tracking-[0.3em] uppercase text-[#D4A574] mb-3">{product.category?.name || 'Collection'}</p>
                              <h3 className="text-3xl md:text-4xl font-light mb-2 tracking-wide">{product.name}</h3>
                              <p className="text-white/70 font-light mb-3">{product.brand}</p>
                              <p className="text-2xl font-light tracking-wider">{product.price.toLocaleString()} FCFA</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)}
                  className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-[#1A1A1A] transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5 text-[#1A1A1A] dark:text-[#F5F0EB]" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)}
                  className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-[#1A1A1A] transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="h-5 w-5 text-[#1A1A1A] dark:text-[#F5F0EB]" />
                </button>

                {/* Slide indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {featuredProducts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Product Grid - The Ordinary / Sephora card style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white dark:bg-[#1A1512] rounded-[1.5rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1 border border-[#1A1A1A]/[0.03] dark:border-[#F5F0EB]/[0.05]"
                  >
                    <div className="relative h-64 md:h-72 bg-[#F5EDE8] dark:bg-[#0F0D0B] overflow-hidden">
                      <img
                        src={product.image_url || 'https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg?auto=compress&cs=tinysrgb&w=600'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute top-4 left-4 bg-[#1A1A1A]/80 dark:bg-[#F5F0EB]/80 text-white dark:text-[#1A1A1A] text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {product.category?.name || 'Collection'}
                      </span>
                    </div>

                    <div className="p-6 md:p-7">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-[#B76E79] font-medium mb-2">{product.brand}</p>
                      <h3 className="text-lg font-medium text-[#1A1A1A] dark:text-[#F5F0EB] mb-1 tracking-wide leading-tight">{product.name}</h3>
                      <p className="text-xl font-light text-[#1A1A1A] dark:text-[#F5F0EB] mt-3 tracking-wide">
                        {product.price.toLocaleString()} <span className="text-sm">FCFA</span>
                      </p>

                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => handleShowReviews(product)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF7F4] dark:bg-[#0C0A09] text-[#1A1A1A]/70 dark:text-[#F5F0EB]/70 rounded-full text-xs tracking-wide font-medium hover:bg-[#F5EDE8] dark:hover:bg-[#1A1512] transition-colors duration-300"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          {t.products.reviews}
                        </button>
                        <button
                          onClick={handleOrderClick}
                          className="flex-1 px-4 py-2.5 bg-[#1A1A1A] dark:bg-[#F5F0EB] text-white dark:text-[#1A1A1A] rounded-full text-xs tracking-wide font-medium hover:bg-[#B76E79] dark:hover:bg-[#B76E79] dark:hover:text-white transition-all duration-300"
                        >
                          {t.products.order}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Reviews Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white dark:bg-[#1A1512] rounded-[2rem] max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs tracking-[0.3em] uppercase text-[#B76E79] mb-2">{t.reviews.title}</p>
                  <h3 className="text-xl font-light text-[#1A1A1A] dark:text-[#F5F0EB] tracking-wide">{selectedProduct.name}</h3>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-[#1A1A1A]/40 dark:text-[#F5F0EB]/40 hover:text-[#1A1A1A] dark:hover:text-[#F5F0EB] transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {productReviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="h-10 w-10 text-[#1A1A1A]/10 dark:text-[#F5F0EB]/10 mx-auto mb-4" />
                  <p className="text-[#1A1A1A]/40 dark:text-[#F5F0EB]/40 font-light">{t.reviews.noReviews}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {productReviews.map((review) => (
                    <div key={review.id} className="p-5 bg-[#FAF7F4] dark:bg-[#0C0A09] rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-[#B76E79]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#B76E79] text-sm font-medium">
                            {review.client?.first_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#F5F0EB]">
                            {review.client?.first_name} {review.client?.last_name}
                          </p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-[#D4A574] fill-current' : 'text-[#1A1A1A]/10 dark:text-[#F5F0EB]/10'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 leading-relaxed font-light">{review.comment}</p>}
                      <p className="text-[#1A1A1A]/30 dark:text-[#F5F0EB]/30 text-xs mt-3">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-28 lg:py-36 bg-white dark:bg-[#0F0D0B]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[#B76E79] font-medium mb-4">{t.contact.subtitle}</p>
            <h2 className="text-4xl md:text-5xl font-extralight tracking-[0.05em] text-[#1A1A1A] dark:text-[#F5F0EB]">
              {t.contact.title}
            </h2>
            <div className="w-16 h-[1px] bg-[#B76E79] mx-auto mt-8"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            <div className="space-y-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-[#B76E79]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-[#B76E79]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium tracking-wide text-[#1A1A1A] dark:text-[#F5F0EB] mb-1">{t.contact.address}</h3>
                  <p className="text-[#1A1A1A]/50 dark:text-[#F5F0EB]/50 font-light">Douala, Cameroun</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-[#B76E79]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-[#B76E79]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium tracking-wide text-[#1A1A1A] dark:text-[#F5F0EB] mb-1">{t.contact.phone}</h3>
                  <p className="text-[#1A1A1A]/50 dark:text-[#F5F0EB]/50 font-light">+237 651 819 516</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-[#B76E79]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-[#B76E79]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium tracking-wide text-[#1A1A1A] dark:text-[#F5F0EB] mb-1">Email</h3>
                  <p className="text-[#1A1A1A]/50 dark:text-[#F5F0EB]/50 font-light">contact@scensora.com</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label className="block text-xs tracking-[0.1em] uppercase font-medium text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-3">{t.contact.name}</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-5 py-4 bg-[#FAF7F4] dark:bg-[#0C0A09] border border-[#1A1A1A]/5 dark:border-[#F5F0EB]/5 rounded-xl focus:ring-1 focus:ring-[#B76E79] focus:border-[#B76E79] outline-none transition-all text-[#1A1A1A] dark:text-[#F5F0EB] placeholder-[#1A1A1A]/30 dark:placeholder-[#F5F0EB]/30 font-light"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-xs tracking-[0.1em] uppercase font-medium text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-3">{t.contact.email}</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-5 py-4 bg-[#FAF7F4] dark:bg-[#0C0A09] border border-[#1A1A1A]/5 dark:border-[#F5F0EB]/5 rounded-xl focus:ring-1 focus:ring-[#B76E79] focus:border-[#B76E79] outline-none transition-all text-[#1A1A1A] dark:text-[#F5F0EB] placeholder-[#1A1A1A]/30 dark:placeholder-[#F5F0EB]/30 font-light"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-xs tracking-[0.1em] uppercase font-medium text-[#1A1A1A]/60 dark:text-[#F5F0EB]/60 mb-3">{t.contact.message}</label>
                <textarea
                  required
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-5 py-4 bg-[#FAF7F4] dark:bg-[#0C0A09] border border-[#1A1A1A]/5 dark:border-[#F5F0EB]/5 rounded-xl focus:ring-1 focus:ring-[#B76E79] focus:border-[#B76E79] outline-none transition-all text-[#1A1A1A] dark:text-[#F5F0EB] placeholder-[#1A1A1A]/30 dark:placeholder-[#F5F0EB]/30 resize-none font-light"
                  placeholder="Votre message..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] dark:bg-[#F5F0EB] text-white dark:text-[#1A1A1A] text-xs tracking-[0.2em] uppercase font-medium rounded-full hover:bg-[#B76E79] dark:hover:bg-[#B76E79] dark:hover:text-white transition-all duration-500 hover:scale-[1.01]"
              >
                <Send className="h-4 w-4" />
                {t.contact.send}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer - Minimal and elegant */}
      <footer className="bg-[#1A1A1A] dark:bg-[#050403] text-[#F5F0EB] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <span className="text-xl font-light tracking-[0.25em] uppercase">Scensora</span>
              <p className="text-[#F5F0EB]/40 font-light mt-4 leading-relaxed text-sm">
                {t.footer.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase font-medium mb-6">{t.footer.quickLinks}</h4>
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-[#F5F0EB]/40 hover:text-[#B76E79] transition-colors text-sm font-light">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase font-medium mb-6">{t.footer.contactTitle}</h4>
              <ul className="space-y-3 text-[#F5F0EB]/40 text-sm font-light">
                <li>Douala, Cameroun</li>
                <li>+237 651 819 516</li>
                <li>contact@scensora.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#F5F0EB]/5 mt-12 pt-8 text-center">
            <p className="text-[#F5F0EB]/30 text-xs tracking-wider font-light">
              &copy; {new Date().getFullYear()} SCENSORA. {t.footer.rights}
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        />
      )}
    </div>
  );
}

export default LandingPage;
