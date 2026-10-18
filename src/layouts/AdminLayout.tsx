import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { getDemoNotifications, markAllDemoNotificationsRead, markDemoNotificationRead } from '../lib/demo-store';
import type { AdminNotification } from '../types/database';
import {
  LayoutDashboard,
  Users,
  Package,
  Folder,
  Truck,
  Bike,
  ShoppingCart,
  CreditCard,
  LogOut,
  Menu,
  Bell,
  CheckCheck,
  X,
  Tag,
  MessageSquare,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'categories', label: 'Catégories', icon: Folder },
  { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
  { id: 'delivery', label: 'Livreurs', icon: Bike },
  { id: 'orders', label: 'Commandes', icon: ShoppingCart },
  { id: 'deliveries', label: 'Livraisons', icon: Bike },
  { id: 'payments', label: 'Paiements', icon: CreditCard },
  { id: 'promotions', label: 'Promotions', icon: Tag },
  { id: 'support', label: 'Support Client', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const activeSection = params['*'] || 'dashboard';
  const [notifications, setNotifications] = React.useState<AdminNotification[]>([]);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const refresh = () => setNotifications(getDemoNotifications());
    refresh();
    const timer = window.setInterval(refresh, 2000);
    window.addEventListener('glowbeauty:notifications', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('glowbeauty:notifications', refresh); };
  }, []);

  const unreadNotifications = notifications.filter((item) => !item.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuClick = (id: string) => {
    navigate(`/admin/${id}`);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3] dark:bg-[#0C0A09] flex">
      {/* Sidebar - Premium dark with rose-gold accents */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-[#1A1512] text-[#F5F0EB] transform transition-transform duration-300 ease-in-out lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-7 py-7 border-b border-[#2D2520]">
            <h1 className="text-lg font-light tracking-[0.25em] uppercase text-[#F5F0EB]">Scensora</h1>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#B76E79] mt-1">Administration</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id || (!activeSection && item.id === 'dashboard');
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-[#B76E79] text-white shadow-lg shadow-[#B76E79]/20'
                      : 'text-[#F5F0EB]/60 hover:bg-[#2D2520] hover:text-[#F5F0EB]'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="font-medium tracking-wide">{item.label}</span>
                  {item.id === 'notifications' && unreadNotifications > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-[#2D2520] space-y-2">
            <div className="flex items-center gap-2 px-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#F5F0EB]/50 hover:bg-red-600/10 hover:text-red-400 rounded-xl transition-all text-sm"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar - Mobile */}
        <header className="bg-white dark:bg-[#1A1512] shadow-sm px-5 py-4 flex items-center justify-between lg:hidden border-b border-[#1A1A1A]/5 dark:border-[#2D2520]">
          <button onClick={() => setSidebarOpen(true)} className="text-[#1A1A1A] dark:text-[#F5F0EB]">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-light tracking-[0.2em] uppercase text-sm text-[#1A1A1A] dark:text-[#F5F0EB]">Scensora</span>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/notifications')} className="relative p-2 text-[#1A1A1A] dark:text-[#F5F0EB]">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-[#B76E79] px-1 text-[10px] text-white flex items-center justify-center">{unreadNotifications}</span>}
            </button>
          </div>
        </header>

        {/* Top Bar - Desktop */}
        <div ref={notifRef} className="hidden lg:flex items-center justify-between bg-white dark:bg-[#1A1512] border-b border-[#1A1A1A]/5 dark:border-[#2D2520] px-8 py-4 relative">
          <div>
            <p className="text-sm text-[#1A1A1A]/40 dark:text-[#F5F0EB]/40 font-light">Bienvenue sur votre espace d'administration</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex items-center gap-2 rounded-full border border-[#B76E79]/20 bg-[#B76E79]/5 px-4 py-2 text-sm text-[#B76E79] hover:bg-[#B76E79]/10 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden xl:inline">Notifications</span>
              {unreadNotifications > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B76E79] px-1 text-[10px] font-bold text-white">{unreadNotifications}</span>}
            </button>
          </div>

          {/* Notifications dropdown */}
          {notifOpen && (
            <div className="absolute right-8 top-16 z-50 w-[420px] overflow-hidden rounded-2xl border border-[#1A1A1A]/5 dark:border-[#2D2520] bg-white dark:bg-[#1A1512] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/5 dark:border-[#2D2520] px-5 py-4">
                <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-[#F5F0EB] tracking-wide">Centre de notifications</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => { markAllDemoNotificationsRead(); setNotifications(getDemoNotifications()); }} className="flex items-center gap-1 text-xs text-[#B76E79] hover:underline">
                    <CheckCheck className="h-3.5 w-3.5" /> Tout marquer lu
                  </button>
                  <button onClick={() => setNotifOpen(false)} className="rounded-full p-1 text-[#1A1A1A]/30 dark:text-[#F5F0EB]/30 hover:text-[#1A1A1A] dark:hover:text-[#F5F0EB]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-6 text-sm text-[#1A1A1A]/40 dark:text-[#F5F0EB]/40 text-center">Aucune notification</p>
                ) : notifications.slice(0, 15).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { markDemoNotificationRead(item.id); setNotifications(getDemoNotifications()); if (item.link) navigate(item.link); setNotifOpen(false); }}
                    className={`block w-full border-b border-[#1A1A1A]/3 dark:border-[#2D2520] px-5 py-3.5 text-left transition-colors hover:bg-[#FAF7F4] dark:hover:bg-[#0C0A09] ${!item.read ? 'bg-[#B76E79]/5' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#F5F0EB]">{item.title}</p>
                      {!item.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-[#B76E79] flex-shrink-0" />}
                    </div>
                    <p className="mt-1 text-xs text-[#1A1A1A]/50 dark:text-[#F5F0EB]/50 line-clamp-2">{item.message}</p>
                    <p className="mt-1 text-[10px] text-[#1A1A1A]/30 dark:text-[#F5F0EB]/30">{new Date(item.created_at).toLocaleString('fr-FR')}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
