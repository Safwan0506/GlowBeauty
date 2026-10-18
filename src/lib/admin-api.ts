// Admin API Service - uses edge function with service role for unrestricted access

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function adminFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/functions/v1/admin-crud${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const adminApi = {
  // Clients
  getClients: () => adminFetch('/clients'),
  createClient: (data: Record<string, unknown>) => adminFetch('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (data: Record<string, unknown>) => adminFetch('/clients', { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: string) => adminFetch('/clients', { method: 'DELETE', body: JSON.stringify({ id }) }),

  // Categories
  getCategories: () => adminFetch('/categories'),
  createCategory: (data: Record<string, unknown>) => adminFetch('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (data: Record<string, unknown>) => adminFetch('/categories', { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => adminFetch('/categories', { method: 'DELETE', body: JSON.stringify({ id }) }),

  // Products
  getProducts: () => adminFetch('/products'),
  createProduct: (data: Record<string, unknown>) => adminFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (data: Record<string, unknown>) => adminFetch('/products', { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => adminFetch('/products', { method: 'DELETE', body: JSON.stringify({ id }) }),

  // Suppliers
  getSuppliers: () => adminFetch('/suppliers'),
  createSupplier: (data: Record<string, unknown>) => adminFetch('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (data: Record<string, unknown>) => adminFetch('/suppliers', { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id: string) => adminFetch('/suppliers', { method: 'DELETE', body: JSON.stringify({ id }) }),

  // Delivery Persons
  getDeliveryPersons: () => adminFetch('/delivery-persons'),
  createDeliveryPerson: (data: Record<string, unknown>) => adminFetch('/delivery-persons', { method: 'POST', body: JSON.stringify(data) }),
  updateDeliveryPerson: (data: Record<string, unknown>) => adminFetch('/delivery-persons', { method: 'PUT', body: JSON.stringify(data) }),
  deleteDeliveryPerson: (id: string) => adminFetch('/delivery-persons', { method: 'DELETE', body: JSON.stringify({ id }) }),

  // Orders
  getOrders: () => adminFetch('/orders'),
  updateOrder: (data: Record<string, unknown>) => adminFetch('/orders', { method: 'PUT', body: JSON.stringify(data) }),

  // Order Items
  getOrderItems: () => adminFetch('/order-items'),
  createOrderItem: (data: Record<string, unknown>) => adminFetch('/order-items', { method: 'POST', body: JSON.stringify(data) }),

  // Deliveries
  getDeliveries: () => adminFetch('/deliveries'),
  createDelivery: (data: Record<string, unknown>) => adminFetch('/deliveries', { method: 'POST', body: JSON.stringify(data) }),
  updateDelivery: (data: Record<string, unknown>) => adminFetch('/deliveries', { method: 'PUT', body: JSON.stringify(data) }),

  // Payments
  getPayments: () => adminFetch('/payments'),
};
