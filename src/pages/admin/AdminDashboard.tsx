import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { adminApi } from '../../lib/admin-api';
import {
  createDemoDelivery,
  decrementDemoStockForOrder,
  getDemoCategories,
  getDemoDeliveryPersons,
  getDemoDeliveries,
  getDemoOrders,
  getDemoPayments,
  getDemoProducts,
  getDemoNotifications,
  markDemoNotificationRead,
  markAllDemoNotificationsRead,
  getDemoPromotions,
  saveDemoPromotions,
  getDemoSuppliers,
  updateDemoDelivery,
  updateDemoOrder
} from '../../lib/demo-store';
import type {
  Client,
  Product,
  Category,
  Supplier,
  DeliveryPerson,
  Order,
  Delivery,
  Payment,
  AdminNotification,
  Promotion
} from '../../types/database';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Save,
  Check,
  XCircle,
  Eye,
  Truck,
  MapPin,
  BarChart3,
  Bell,
  CheckCheck,
  Tag,
  Download
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalQuantity: number;
  totalOrders: number;
  soldUnits: number;
  totalRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  lowStock: number;
}

function AdminDashboard() {
  const params = useParams();
  const section = params['*'] || 'dashboard';

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalQuantity: 0,
    totalOrders: 0,
    soldUnits: 0,
    totalRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    lowStock: 0
  });

  useEffect(() => {
    loadData();
  }, [section]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load data using admin API
      const [clientsRes, productsRes, categoriesRes, suppliersRes, deliveryRes, ordersRes, deliveriesRes, paymentsRes] = await Promise.all([
        adminApi.getClients().catch(() => ({ data: [] })),
        adminApi.getProducts().catch(() => ({ data: [] })),
        adminApi.getCategories().catch(() => ({ data: [] })),
        adminApi.getSuppliers().catch(() => ({ data: [] })),
        adminApi.getDeliveryPersons().catch(() => ({ data: [] })),
        adminApi.getOrders().catch(() => ({ data: [] })),
        adminApi.getDeliveries().catch(() => ({ data: [] })),
        adminApi.getPayments().catch(() => ({ data: [] }))
      ]);

      const demoProducts = getDemoProducts();
      const demoCategories = getDemoCategories();
      const demoDeliveryPersons = getDemoDeliveryPersons();
      const demoSuppliers = getDemoSuppliers();
      const demoOrders = getDemoOrders();
      const demoDeliveries = getDemoDeliveries();
      const demoPayments = getDemoPayments();
      const demoNotifications = getDemoNotifications();
      const demoPromotions = getDemoPromotions();

      const remoteOrders = ordersRes.data || [];
      const remoteDeliveries = deliveriesRes.data || [];
      const remotePayments = paymentsRes.data || [];
      const remoteOrderIds = new Set(remoteOrders.map((order: Order) => order.id));
      const remoteDeliveryIds = new Set(remoteDeliveries.map((delivery: Delivery) => delivery.id));
      const remotePaymentIds = new Set(remotePayments.map((payment: Payment) => payment.id));

      const mergedOrders = [...demoOrders.filter((order) => !remoteOrderIds.has(order.id)), ...remoteOrders];
      const mergedDeliveries = [...demoDeliveries.filter((delivery) => !remoteDeliveryIds.has(delivery.id)), ...remoteDeliveries];
      const mergedPayments = [...demoPayments.filter((payment) => !remotePaymentIds.has(payment.id)), ...remotePayments];

      const remoteProducts = productsRes.data || [];
      const remoteProductCodes = new Set(remoteProducts.map((product: Product) => product.code));
      const productsData = [
        ...remoteProducts,
        ...demoProducts.filter((product) => !remoteProductCodes.has(product.code)),
      ];

      const remoteCategories = categoriesRes.data || [];
      const remoteCategoryCodes = new Set(remoteCategories.map((category: Category) => category.code));
      const categoriesData = [
        ...remoteCategories,
        ...demoCategories.filter((category) => !remoteCategoryCodes.has(category.code)),
      ];

      const remoteSuppliers = suppliersRes.data || [];
      const remoteSupplierCodes = new Set(remoteSuppliers.map((supplier: Supplier) => supplier.code));
      const suppliersData = [
        ...remoteSuppliers,
        ...demoSuppliers.filter((supplier) => !remoteSupplierCodes.has(supplier.code)),
      ];

      const remoteDeliveryPersons = deliveryRes.data || [];
      const remoteDeliveryCodes = new Set(remoteDeliveryPersons.map((person: DeliveryPerson) => person.code));
      const deliveryPersonsData = [
        ...remoteDeliveryPersons,
        ...demoDeliveryPersons.filter((person) => !remoteDeliveryCodes.has(person.code)),
      ];

      const enrichedDeliveries = mergedDeliveries.map((delivery: Delivery) => {
        const linkedOrder = mergedOrders.find((order: Order) => order.id === delivery.order_id) || delivery.order;
        const linkedPerson = deliveryPersonsData.find((person: DeliveryPerson) => person.id === delivery.delivery_person_id) || delivery.delivery_person;
        return {
          ...delivery,
          order: linkedOrder,
          delivery_person: linkedPerson || undefined,
          delivery_address: delivery.delivery_address || linkedOrder?.delivery_address || ''
        };
      });

      setClients(clientsRes.data || []);
      setProducts(productsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setDeliveryPersons(deliveryPersonsData);
      setOrders(mergedOrders);
      setDeliveries(enrichedDeliveries);
      setPayments(mergedPayments);
      setNotifications(demoNotifications);
      setPromotions(demoPromotions);

      // Calculate stats
      const ordersData = mergedOrders;

      const totalQuantity = productsData.reduce((sum: number, p: Product) => sum + Number(p.quantity), 0);
      const validatedOrders = ordersData.filter((o: Order) => o.status === 'validated');
      const soldUnits = validatedOrders.reduce((sum: number, o: Order) => sum + (o.items || []).reduce((itemSum, item) => itemSum + Number(item.quantity), 0), 0);
      const totalRevenue = validatedOrders.reduce((sum: number, o: Order) => sum + Number(o.total_amount), 0);
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = ordersData.filter((o: Order) => o.created_at?.startsWith(today)).length;
      const pendingOrders = ordersData.filter((o: Order) => o.status === 'pending').length;
      const lowStock = productsData.filter((p: Product) => Number(p.quantity) <= 5).length;

      setStats({
        totalProducts: productsData.length,
        totalQuantity,
        totalOrders: validatedOrders.length,
        soldUnits,
        totalRevenue,
        todayOrders,
        pendingOrders,
        lowStock
      });
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erreur lors du chargement des donnees');
    }

    setLoading(false);
  };

  const handleCreate = async (table: string, data: Record<string, unknown>) => {
    try {
      setError(null);
      switch (table) {
        case 'categories':
          await adminApi.createCategory(data);
          break;
        case 'products':
          await adminApi.createProduct(data);
          break;
        case 'suppliers':
          await adminApi.createSupplier(data);
          break;
        case 'delivery_persons':
          await adminApi.createDeliveryPerson(data);
          break;
      }
      loadData();
      return { success: true };
    } catch (err) {
      console.error('Create error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la creation');
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const handleUpdate = async (table: string, data: Record<string, unknown>) => {
    try {
      setError(null);
      switch (table) {
        case 'categories':
          await adminApi.updateCategory(data);
          break;
        case 'products':
          await adminApi.updateProduct(data);
          break;
        case 'suppliers':
          await adminApi.updateSupplier(data);
          break;
        case 'delivery_persons':
          await adminApi.updateDeliveryPerson(data);
          break;
        case 'orders':
          try {
            await adminApi.updateOrder(data);
          } catch {
            updateDemoOrder(String(data.id), data as Partial<Order>);
          }
          break;
        case 'deliveries':
          try {
            await adminApi.updateDelivery(data);
          } catch {
            updateDemoDelivery(String(data.id), data as Partial<Delivery>);
          }
          break;
      }
      loadData();
      return { success: true };
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet element?')) return { success: false };

    try {
      setError(null);
      switch (table) {
        case 'categories':
          await adminApi.deleteCategory(id);
          break;
        case 'products':
          await adminApi.deleteProduct(id);
          break;
        case 'suppliers':
          await adminApi.deleteSupplier(id);
          break;
        case 'delivery_persons':
          await adminApi.deleteDeliveryPerson(id);
          break;
      }
      loadData();
      return { success: true };
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const renderSection = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
        </div>
      );
    }

    switch (section) {
      case 'dashboard':
        return <DashboardSection stats={stats} orders={orders} products={products} notifications={notifications} />;
      case 'clients':
        return <ClientsSection clients={clients} />;
      case 'products':
        return <ProductsSection products={products} categories={categories} suppliers={suppliers} onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDelete} />;
      case 'categories':
        return <CategoriesSection categories={categories} onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDelete} />;
      case 'suppliers':
        return <SuppliersSection suppliers={suppliers} products={products} onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDelete} />;
      case 'delivery':
        return <DeliveryPersonsSection deliveryPersons={deliveryPersons} onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDelete} />;
      case 'orders':
        return <OrdersSection orders={orders} products={products} onUpdate={handleUpdate} loadData={loadData} />;
      case 'deliveries':
        return <DeliveriesSection deliveries={deliveries} deliveryPersons={deliveryPersons} onUpdate={handleUpdate} loadData={loadData} />;
      case 'payments':
        return <PaymentsSection payments={payments} />;
      case 'notifications':
        return <NotificationsSection notifications={notifications} loadData={loadData} />;
      case 'promotions':
        return <PromotionsSection promotions={promotions} categories={categories} products={products} loadData={loadData} />;
      case 'support':
        return <AdminSupportSection />;
      default:
        return <DashboardSection stats={stats} orders={orders} products={products} notifications={notifications} />;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-800 hover:text-red-900">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      {renderSection()}
    </div>
  );
}

// Dashboard Section
function DashboardSection({ stats, orders, products, notifications }: { stats: DashboardStats; orders: Order[]; products: Product[]; notifications: AdminNotification[] }) {
  const today = new Date().toISOString().split('T')[0];
  const exportSales = (period: 'monthly' | 'annual') => {
    const now = new Date();
    const filtered = orders.filter((order) => {
      const d = new Date(order.created_at || '');
      if (period === 'monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return d.getFullYear() === now.getFullYear();
    });
    const header = ['Code commande','Date','Statut','Paiement','Articles','Total FCFA'];
    const rows = filtered.map((order) => [
      order.code,
      new Date(order.created_at).toLocaleDateString('fr-FR'),
      order.status,
      order.payment_status,
      String((order.items || []).reduce((sum, item) => sum + Number(item.quantity), 0)),
      String(order.total_amount)
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Scensora_ventes_${period}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const todayOrders = orders.filter(o => o.created_at?.startsWith(today));
  const validatedOrders = orders.filter((order) => order.status === 'validated');
  const totalSold = Math.max(1, stats.soldUnits);
  const topProducts = products
    .map((product) => ({ ...product, sold: validatedOrders.reduce((sum, order) => sum + (order.items || []).filter((item) => item.product_id === product.id).reduce((itemSum, item) => itemSum + Number(item.quantity), 0), 0) }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);
  const stockHealth = Math.min(100, Math.round((stats.totalQuantity / Math.max(1, stats.totalQuantity + stats.soldUnits)) * 100));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-rose-500">Pilotage commercial</p>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportSales('monthly')} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-50"><Download className="h-4 w-4" /> Export mensuel</button>
          <button onClick={() => exportSales('annual')} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"><Download className="h-4 w-4" /> Export annuel</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <Package className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-rose-100 text-sm">Produits en stock</p>
          <p className="text-3xl font-bold">{stats.totalQuantity}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <ShoppingCart className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-emerald-100 text-sm">Quantité vendue</p>
          <p className="text-3xl font-bold">{stats.soldUnits}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <TrendingUp className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-amber-100 text-sm">Revenus totaux</p>
          <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <Calendar className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-blue-100 text-sm">Commandes aujourd'hui</p>
          <p className="text-3xl font-bold">{stats.todayOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Santé du stock</h2>
            <BarChart3 className="h-6 w-6 text-rose-500" />
          </div>
          <div className="mx-auto my-4 h-44 w-44 rounded-full flex items-center justify-center"
               style={{ background: `conic-gradient(#e11d48 ${stockHealth * 3.6}deg, #ffe4e6 0deg)` }}>
            <div className="h-32 w-32 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
              <span className="text-3xl font-bold text-gray-900">{stockHealth}%</span>
              <span className="text-xs text-gray-500">disponible</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-rose-50 p-3"><p className="text-gray-500">Stock faible</p><p className="text-xl font-bold text-rose-600">{stats.lowStock}</p></div>
            <div className="rounded-xl bg-amber-50 p-3"><p className="text-gray-500">En attente</p><p className="text-xl font-bold text-amber-600">{stats.pendingOrders}</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top produits vendus</h2>
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{product.name}</span>
                  <span className="text-gray-500">{product.sold} vendu(s)</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500" style={{ width: `${Math.max(5, (product.sold / totalSold) * 100)}%` }} />
                </div>
              </div>
            ))}
            {topProducts.every((product) => product.sold === 0) && <p className="text-gray-500 text-sm">Les meilleures ventes apparaîtront après les validations de commandes.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Notifications prioritaires</h2>
            <Bell className="h-6 w-6 text-rose-500" />
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className={`rounded-xl border p-3 ${notification.read ? 'bg-white' : 'bg-rose-50 border-rose-100'}`}>
                <p className="font-semibold text-gray-900">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-sm text-gray-500">Aucune notification pour l’instant.</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Objectifs commerciaux</h2>
          <div className="space-y-4">
            <div><div className="flex justify-between text-sm"><span>Validation commandes</span><span>{Math.round((stats.totalOrders / Math.max(1, stats.totalOrders + stats.pendingOrders))*100)}%</span></div><div className="h-3 bg-gray-100 rounded-full"><div className="h-3 bg-emerald-500 rounded-full" style={{width: `${Math.round((stats.totalOrders / Math.max(1, stats.totalOrders + stats.pendingOrders))*100)}%`}} /></div></div>
            <div><div className="flex justify-between text-sm"><span>Stock sain</span><span>{Math.max(0, 100 - stats.lowStock * 5)}%</span></div><div className="h-3 bg-gray-100 rounded-full"><div className="h-3 bg-rose-500 rounded-full" style={{width: `${Math.max(0, 100 - stats.lowStock * 5)}%`}} /></div></div>
          </div>
        </div>
      </div>

      {/* Today's Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Commandes du jour</h2>
        </div>
        {todayOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune commande aujourd'hui
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {todayOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.client?.first_name || '-'} {order.client?.last_name || ''}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{Number(order.total_amount).toLocaleString()} FCFA</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        order.status === 'validated' ? 'bg-green-100 text-green-700' :
                        order.status === 'refused' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status === 'validated' ? 'Valide' : order.status === 'refused' ? 'Refuse' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {order.payment_status === 'paid' ? 'Paye' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Clients Section
function ClientsSection({ clients }: { clients: Client[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter((client) =>
    `${client.first_name} ${client.last_name} ${client.username} ${client.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Clients</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom complet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telephone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{client.username}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{client.first_name} {client.last_name}</td>
                  <td className="px-6 py-4 text-gray-600">{client.email}</td>
                  <td className="px-6 py-4 text-gray-600">{client.phone}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(client.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClients.length === 0 && (
          <div className="p-8 text-center text-gray-500">Aucun client trouve</div>
        )}
      </div>
    </div>
  );
}

// Products Section
function ProductsSection({
  products,
  categories,
  suppliers,
  onCreate,
  onUpdate,
  onDelete
}: {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  onCreate: (table: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (table: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onDelete: (table: string, id: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    brand: '',
    skin_type: '',
    acquisition_date: new Date().toISOString().split('T')[0],
    image_url: '',
    category_id: '',
    supplier_id: ''
  });
  const [saving, setSaving] = useState(false);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      price: '',
      quantity: '',
      brand: '',
      skin_type: '',
      acquisition_date: new Date().toISOString().split('T')[0],
      image_url: '',
      category_id: '',
      supplier_id: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const productData = {
      code: formData.code,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.quantity) || 0,
      brand: formData.brand,
      skin_type: formData.skin_type,
      acquisition_date: formData.acquisition_date,
      image_url: formData.image_url,
      category_id: formData.category_id || null,
      supplier_id: formData.supplier_id || null
    };

    if (editingProduct) {
      await onUpdate('products', { id: editingProduct.id, ...productData });
    } else {
      await onCreate('products', productData);
    }

    setSaving(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      brand: product.brand,
      skin_type: product.skin_type,
      acquisition_date: product.acquisition_date,
      image_url: product.image_url,
      category_id: product.category_id || '',
      supplier_id: product.supplier_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await onDelete('products', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Ajouter
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code produit *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (FCFA) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantite *</label>
              <input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de peau cible</label>
              <input
                type="text"
                value={formData.skin_type}
                onChange={(e) => setFormData({ ...formData, skin_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'acquisition</label>
              <input
                type="date"
                value={formData.acquisition_date}
                onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              >
                <option value="">Selectionner une categorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              >
                <option value="">Selectionner un fournisseur</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>{sup.first_name} {sup.last_name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                rows={3}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : (
                  <>
                    <Save className="h-5 w-5" />
                    {editingProduct ? 'Modifier' : 'Ajouter'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantite</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.code}</td>
                  <td className="px-6 py-4">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/50'}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.brand}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{product.price.toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.quantity}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-gray-500">Aucun produit trouve</div>
        )}
      </div>
    </div>
  );
}

// Categories Section
function CategoriesSection({
  categories,
  onCreate,
  onUpdate,
  onDelete
}: {
  categories: Category[];
  onCreate: (table: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (table: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onDelete: (table: string, id: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ code: '', name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ code: '', name: '', description: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingCategory) {
      await onUpdate('categories', { id: editingCategory.id, ...formData });
    } else {
      await onCreate('categories', formData);
    }

    setSaving(false);
    resetForm();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await onDelete('categories', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Categories</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingCategory ? 'Modifier la categorie' : 'Nouvelle categorie'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-3 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {editingCategory ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{cat.description || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Suppliers Section
function SuppliersSection({
  suppliers,
  products,
  onCreate,
  onUpdate,
  onDelete
}: {
  suppliers: Supplier[];
  products: Product[];
  onCreate: (table: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (table: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onDelete: (table: string, id: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: ''
  });
  const [saving, setSaving] = useState(false);

  const filteredSuppliers = suppliers.filter((sup) =>
    `${sup.first_name} ${sup.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ code: '', first_name: '', last_name: '', email: '', phone: '', gender: '' });
    setEditingSupplier(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      ...formData,
      gender: formData.gender || null
    };

    if (editingSupplier) {
      await onUpdate('suppliers', { id: editingSupplier.id, ...data });
    } else {
      await onCreate('suppliers', data);
    }

    setSaving(false);
    resetForm();
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      code: supplier.code,
      first_name: supplier.first_name,
      last_name: supplier.last_name,
      email: supplier.email,
      phone: supplier.phone,
      gender: supplier.gender || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await onDelete('suppliers', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Fournisseurs</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors">
          <Plus className="h-5 w-5" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prenom *</label>
              <input type="text" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input type="text" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telephone *</label>
              <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none">
                <option value="">Selectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Feminin</option>
              </select>
            </div>
            <div className="md:col-span-3 flex gap-4">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50">
                <Save className="h-5 w-5" />
                {editingSupplier ? 'Modifier' : 'Ajouter'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" />
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telephone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produits livrés</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sexe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{sup.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sup.first_name} {sup.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sup.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sup.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    {products.filter((product) => product.supplier_id === sup.id).slice(0, 3).map((product) => product.name).join(', ') || '-'}
                    {products.filter((product) => product.supplier_id === sup.id).length > 3 ? ` +${products.filter((product) => product.supplier_id === sup.id).length - 3}` : ''}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sup.gender === 'M' ? 'Masculin' : sup.gender === 'F' ? 'Feminin' : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(sup)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="h-5 w-5" /></button>
                      <button onClick={() => handleDelete(sup.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Delivery Persons Section
function DeliveryPersonsSection({
  deliveryPersons,
  onCreate,
  onUpdate,
  onDelete
}: {
  deliveryPersons: DeliveryPerson[];
  onCreate: (table: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (table: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onDelete: (table: string, id: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingDeliveryPerson, setEditingDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ code: '', first_name: '', last_name: '', email: '', phone: '', gender: '' });
  const [saving, setSaving] = useState(false);

  const filteredDeliveryPersons = deliveryPersons.filter((dp) =>
    `${dp.first_name} ${dp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ code: '', first_name: '', last_name: '', email: '', phone: '', gender: '' });
    setEditingDeliveryPerson(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = { ...formData, gender: formData.gender || null };

    if (editingDeliveryPerson) {
      await onUpdate('delivery_persons', { id: editingDeliveryPerson.id, ...data });
    } else {
      await onCreate('delivery_persons', data);
    }

    setSaving(false);
    resetForm();
  };

  const handleEdit = (dp: DeliveryPerson) => {
    setEditingDeliveryPerson(dp);
    setFormData({
      code: dp.code, first_name: dp.first_name, last_name: dp.last_name,
      email: dp.email, phone: dp.phone, gender: dp.gender || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await onDelete('delivery_persons', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Livreurs</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors">
          <Plus className="h-5 w-5" /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{editingDeliveryPerson ? 'Modifier le livreur' : 'Nouveau livreur'}</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Code *</label><input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Prenom *</label><input type="text" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label><input type="text" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telephone *</label><input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label><select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"><option value="">Selectionner</option><option value="M">Masculin</option><option value="F">Feminin</option></select></div>
            <div className="md:col-span-3 flex gap-4">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"><Save className="h-5 w-5" /> {editingDeliveryPerson ? 'Modifier' : 'Ajouter'}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" />
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telephone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDeliveryPersons.map((dp) => (
                <tr key={dp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{dp.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dp.first_name} {dp.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dp.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dp.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(dp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="h-5 w-5" /></button>
                      <button onClick={() => handleDelete(dp.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Orders Section
function OrdersSection({
  orders,
  products,
  onUpdate,
  loadData
}: {
  orders: Order[];
  products: Product[];
  onUpdate: (table: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  loadData: () => void;
}) {
  const [showDetails, setShowDetails] = useState<Order | null>(null);

  const handleValidate = async (order: Order) => {
    if (order.payment_status !== 'paid') {
      alert('Vous ne pouvez valider que les commandes deja payees');
      return;
    }

    const missingStock = (order.items || []).find((item) => {
      const current = products.find((product) => product.id === item.product_id) || item.product;
      return current && Number(current.quantity) < Number(item.quantity);
    });

    if (missingStock) {
      alert(`Stock insuffisant pour : ${missingStock.product?.name || 'un produit'}`);
      return;
    }

    await onUpdate('orders', { id: order.id, status: 'validated' });

    try {
      for (const item of order.items || []) {
        const current = products.find((product) => product.id === item.product_id) || item.product;
        if (!current) continue;
        await adminApi.updateProduct({ ...current, quantity: Math.max(0, Number(current.quantity) - Number(item.quantity)) });
      }
    } catch {
      decrementDemoStockForOrder(order.id);
    }

    // Create delivery record with the delivery address from the customer order.
    try {
      await adminApi.createDelivery({ order_id: order.id, status: 'pending', delivery_address: order.delivery_address || '' });
    } catch {
      createDemoDelivery(order.id);
    }

    loadData();
  };

  const handleRefuse = async (orderId: string) => {
    if (confirm('Voulez-vous vraiment refuser cette commande?')) {
      await onUpdate('orders', { id: orderId, status: 'refused' });
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Articles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.client?.first_name || '-'} {order.client?.last_name || ''}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{(order.items || []).map((item) => `${item.product?.name || 'Produit'} x${item.quantity}`).join(', ') || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{order.delivery_address || '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{Number(order.total_amount).toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${order.status === 'validated' ? 'bg-green-100 text-green-700' : order.status === 'refused' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status === 'validated' ? 'Valide' : order.status === 'refused' ? 'Refuse' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {order.payment_status === 'paid' ? 'Paye' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button onClick={() => handleValidate(order)} disabled={order.payment_status !== 'paid'} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title={order.payment_status !== 'paid' ? 'Paiement requis' : 'Valider'}><Check className="h-5 w-5" /></button>
                          <button onClick={() => handleRefuse(order.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><XCircle className="h-5 w-5" /></button>
                        </>
                      )}
                      <button onClick={() => setShowDetails(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Details de la commande</h3>
                <button onClick={() => setShowDetails(null)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Code:</span><span className="font-medium">{showDetails.code}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Client:</span><span className="font-medium">{showDetails.client?.first_name || '-'} {showDetails.client?.last_name || ''}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total:</span><span className="font-medium">{Number(showDetails.total_amount).toLocaleString()} FCFA</span></div>
                <div><span className="text-gray-600">Adresse de livraison:</span><p className="font-medium mt-1">{showDetails.delivery_address || '-'}</p></div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Articles commandes</h4>
                  {showDetails.items && showDetails.items.length > 0 ? (
                    <div className="space-y-2">
                      {showDetails.items.map((item) => (
                        <div key={item.id} className="rounded-xl bg-gray-50 p-3 text-sm">
                          <div className="flex justify-between font-medium text-gray-900"><span>{item.product?.name || '-'}</span><span>{Number(item.subtotal || 0).toLocaleString()} FCFA</span></div>
                          <div className="mt-1 text-gray-500">Quantité : {item.quantity} · Prix unitaire : {Number(item.unit_price || 0).toLocaleString()} FCFA</div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-gray-500 text-sm">Aucun article</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Deliveries Section
function DeliveriesSection({
  deliveries,
  deliveryPersons,
  onUpdate,
  loadData
}: {
  deliveries: Delivery[];
  deliveryPersons: DeliveryPerson[];
  onUpdate: (table: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  loadData: () => void;
}) {
  const handleCompleteDelivery = async (deliveryId: string) => {
    await onUpdate('deliveries', { id: deliveryId, status: 'completed', completed_at: new Date().toISOString() });
    loadData();
  };

  const handleAssignDeliveryPerson = async (deliveryId: string, deliveryPersonId: string) => {
    await onUpdate('deliveries', { id: deliveryId, delivery_person_id: deliveryPersonId });
    loadData();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gestion des Livraisons</h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livreur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{delivery.order?.code || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{delivery.order?.client?.first_name || '-'} {delivery.order?.client?.last_name || ''}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{Number(delivery.order?.total_amount || 0).toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs"><MapPin className="inline h-4 w-4 text-rose-500 mr-1" />{delivery.delivery_address || delivery.order?.delivery_address || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {delivery.delivery_person_id ? (
                        <span className="block text-sm font-medium text-gray-700"><Truck className="inline h-4 w-4 text-rose-500 mr-1" />{delivery.delivery_person?.first_name || '-'} {delivery.delivery_person?.last_name || ''}</span>
                      ) : (
                        <span className="block text-xs text-amber-600 font-medium">Aucun livreur assigné</span>
                      )}
                      <select
                        value={delivery.delivery_person_id || ''}
                        onChange={(e) => handleAssignDeliveryPerson(delivery.id, e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                      >
                        <option value="">Choisir livreur</option>
                        {deliveryPersons.map((dp) => (<option key={dp.id} value={dp.id}>{dp.first_name} {dp.last_name}</option>))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${delivery.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {delivery.status === 'completed' ? 'Effectuee' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {delivery.status === 'pending' && delivery.delivery_person_id && (
                      <button onClick={() => handleCompleteDelivery(delivery.id)} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">Marquer livrée</button>
                    )}
                    {delivery.status === 'completed' && (
                      <span className="text-xs text-gray-500">Livrée le {delivery.completed_at ? new Date(delivery.completed_at).toLocaleDateString('fr-FR') : '-'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {deliveries.length === 0 && <div className="p-8 text-center text-gray-500">Aucune livraison</div>}
      </div>
    </div>
  );
}

// Payments Section
function PaymentsSection({ payments }: { payments: Payment[] }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gestion des Paiements</h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telephone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.client?.first_name || '-'} {payment.client?.last_name || ''}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{Number(payment.amount).toLocaleString()} FCFA</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${payment.payment_method === 'MTN' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'}`}>{payment.payment_method}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.phone_number}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : payment.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {payment.status === 'completed' ? 'Complete' : payment.status === 'failed' ? 'Echoue' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(payment.created_at).toLocaleDateString('fr-FR')} {new Date(payment.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && <div className="p-8 text-center text-gray-500">Aucun paiement</div>}
      </div>
    </div>
  );
}


function NotificationsSection({ notifications, loadData }: { notifications: AdminNotification[]; loadData: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Centre de notifications</h1>
        <button onClick={() => { markAllDemoNotificationsRead(); loadData(); }} className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"><CheckCheck className="h-5 w-5" /> Tout marquer comme lu</button>
      </div>
      <div className="grid gap-4">
        {notifications.map((notification) => (
          <button key={notification.id} onClick={() => { markDemoNotificationRead(notification.id); loadData(); }} className={`rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md ${notification.read ? 'bg-white border-gray-100' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-gray-900">{notification.title}</p>
                <p className="mt-1 text-gray-600">{notification.message}</p>
                <p className="mt-2 text-xs text-gray-400">{new Date(notification.created_at).toLocaleString('fr-FR')}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${notification.priority === 'high' ? 'bg-red-100 text-red-700' : notification.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{notification.priority}</span>
            </div>
          </button>
        ))}
        {notifications.length === 0 && <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">Aucune notification.</div>}
      </div>
    </div>
  );
}

function PromotionsSection({ promotions, categories, products, loadData }: { promotions: Promotion[]; categories: Category[]; products: Product[]; loadData: () => void }) {
  const [localPromotions, setLocalPromotions] = useState<Promotion[]>(promotions);
  useEffect(() => setLocalPromotions(promotions), [promotions]);
  const togglePromotion = (id: string) => {
    const next = localPromotions.map((promo) => promo.id === id ? { ...promo, active: !promo.active } : promo);
    setLocalPromotions(next);
    saveDemoPromotions(next);
    loadData();
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Promotions et réductions</h1>
        <div className="rounded-xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">Coupons actifs : WELCOME10 • BEAUTY20 • FREESHIP</div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {localPromotions.map((promotion) => (
          <div key={promotion.id} className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-rose-500">{promotion.code}</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">{promotion.name}</h2>
                <p className="mt-2 text-gray-600">{promotion.description}</p>
              </div>
              <Tag className="h-8 w-8 text-rose-500" />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-3xl font-bold text-rose-600">-{promotion.discount_percent}%</span>
              <button onClick={() => togglePromotion(promotion.id)} className={`rounded-xl px-4 py-2 font-semibold ${promotion.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{promotion.active ? 'Active' : 'Inactive'}</button>
            </div>
            <p className="mt-3 text-sm text-gray-500">Cible : {categories.find(c => c.id === promotion.category_id)?.name || products.find(p => p.id === promotion.product_id)?.name || 'Toute la boutique'}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900">Règles commerciales configurées</h2>
        <ul className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-3">
          <li className="rounded-xl bg-gray-50 p-4"><strong>WELCOME10</strong><br/>-10% dès 10 000 FCFA</li>
          <li className="rounded-xl bg-gray-50 p-4"><strong>BEAUTY20</strong><br/>-20% dès 50 000 FCFA</li>
          <li className="rounded-xl bg-gray-50 p-4"><strong>Glow Club</strong><br/>1 point pour 1 000 FCFA dépensés</li>
        </ul>
      </div>
    </div>
  );
}

function AdminSupportSection() {
  const [conversations, setConversations] = React.useState<{clientId: string; messages: {from: string; text: string; time: string}[]}[]>([]);
  const [selectedClient, setSelectedClient] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState('');

  const loadConversations = React.useCallback(() => {
    const convos: {clientId: string; messages: {from: string; text: string; time: string}[]}[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('scensora_support_')) {
        const clientId = key.replace('scensora_support_', '');
        try {
          const messages = JSON.parse(localStorage.getItem(key) || '[]');
          if (messages.length > 1 || (messages.length === 1 && messages[0].from === 'client')) {
            convos.push({ clientId, messages });
          }
        } catch {}
      }
    }
    convos.sort((a, b) => {
      const lastA = a.messages[a.messages.length - 1]?.time || '';
      const lastB = b.messages[b.messages.length - 1]?.time || '';
      return lastB.localeCompare(lastA);
    });
    setConversations(convos);
  }, []);

  React.useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const selectedConvo = conversations.find((c) => c.clientId === selectedClient);

  const sendReply = () => {
    if (!reply.trim() || !selectedClient) return;
    const key = `scensora_support_${selectedClient}`;
    const messages = JSON.parse(localStorage.getItem(key) || '[]');
    messages.push({ from: 'admin', text: reply.trim(), time: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(messages));
    setReply('');
    loadConversations();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light tracking-wide text-gray-900">Support Client</h1>
        <p className="text-sm text-gray-500 mt-1">Conversations avec les clients. Les messages sont persistants.</p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 min-h-[500px]">
        {/* Conversations list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Conversations ({conversations.length})</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="p-6 text-sm text-gray-400 text-center">Aucune conversation</p>
            ) : conversations.map((convo) => {
              const lastMsg = convo.messages[convo.messages.length - 1];
              const hasUnread = lastMsg?.from === 'client';
              return (
                <button
                  key={convo.clientId}
                  onClick={() => setSelectedClient(convo.clientId)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${selectedClient === convo.clientId ? 'bg-[#B76E79]/5' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{convo.clientId.slice(0, 12)}...</p>
                    {hasUnread && <span className="h-2 w-2 rounded-full bg-[#B76E79]" />}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsg?.text}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {!selectedConvo ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Sélectionnez une conversation
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Client: {selectedClient}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[400px]">
                {selectedConvo.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-2xl px-4 py-2.5 max-w-[75%] ${m.from === 'admin' ? 'bg-[#B76E79] text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <p className="text-sm">{m.text}</p>
                      <p className="text-[10px] mt-1 opacity-50">{new Date(m.time).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendReply(); }}
                  placeholder="Répondre au client..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#B76E79]"
                />
                <button onClick={sendReply} disabled={!reply.trim()} className="rounded-xl bg-[#B76E79] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#9B5A64] transition-colors disabled:opacity-40">
                  Envoyer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
