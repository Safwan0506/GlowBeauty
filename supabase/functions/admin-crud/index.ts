import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Get action from query or body
    let action = url.searchParams.get("action");
    let body: Record<string, unknown> = {};

    if (req.method !== "GET" && req.body) {
      const text = await req.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          // Empty body
        }
      }
      if (!action && body.action) {
        action = body.action as string;
      }
    }

    // Route handlers
    switch (true) {
      // Clients
      case path.includes("/clients") && req.method === "GET":
        return await handleGetAll("clients");
      case path.includes("/clients") && req.method === "POST":
        return await handleInsert("clients", body);
      case path.includes("/clients") && req.method === "PUT":
        return await handleUpdate("clients", body);
      case path.includes("/clients") && req.method === "DELETE":
        return await handleDelete("clients", body);

      // Categories
      case path.includes("/categories") && req.method === "GET":
        return await handleGetAll("categories");
      case path.includes("/categories") && req.method === "POST":
        return await handleInsert("categories", body);
      case path.includes("/categories") && req.method === "PUT":
        return await handleUpdate("categories", body);
      case path.includes("/categories") && req.method === "DELETE":
        return await handleDelete("categories", body);

      // Products
      case path.includes("/products") && req.method === "GET":
        return await handleGetAll("products");
      case path.includes("/products") && req.method === "POST":
        return await handleInsert("products", body);
      case path.includes("/products") && req.method === "PUT":
        return await handleUpdate("products", body);
      case path.includes("/products") && req.method === "DELETE":
        return await handleDelete("products", body);

      // Suppliers
      case path.includes("/suppliers") && req.method === "GET":
        return await handleGetAll("suppliers");
      case path.includes("/suppliers") && req.method === "POST":
        return await handleInsert("suppliers", body);
      case path.includes("/suppliers") && req.method === "PUT":
        return await handleUpdate("suppliers", body);
      case path.includes("/suppliers") && req.method === "DELETE":
        return await handleDelete("suppliers", body);

      // Delivery Persons
      case path.includes("/delivery-persons") && req.method === "GET":
        return await handleGetAll("delivery_persons");
      case path.includes("/delivery-persons") && req.method === "POST":
        return await handleInsert("delivery_persons", body);
      case path.includes("/delivery-persons") && req.method === "PUT":
        return await handleUpdate("delivery_persons", body);
      case path.includes("/delivery-persons") && req.method === "DELETE":
        return await handleDelete("delivery_persons", body);

      // Orders
      case path.includes("/orders") && req.method === "GET":
        return await handleGetOrders();
      case path.includes("/orders") && req.method === "PUT":
        return await handleUpdate("orders", body);

      // Order Items
      case path.includes("/order-items") && req.method === "GET":
        return await handleGetAll("order_items");
      case path.includes("/order-items") && req.method === "POST":
        return await handleInsert("order_items", body);

      // Deliveries
      case path.includes("/deliveries") && req.method === "GET":
        return await handleGetDeliveries();
      case path.includes("/deliveries") && req.method === "POST":
        return await handleInsert("deliveries", body);
      case path.includes("/deliveries") && req.method === "PUT":
        return await handleUpdate("deliveries", body);

      // Payments
      case path.includes("/payments") && req.method === "GET":
        return await handleGetPayments();

      // Default action-based routing
      case action === "get-clients":
        return await handleGetAll("clients");
      case action === "get-categories":
        return await handleGetAll("categories");
      case action === "get-products":
        return await handleGetAll("products");
      case action === "get-suppliers":
        return await handleGetAll("suppliers");
      case action === "get-delivery-persons":
        return await handleGetAll("delivery_persons");
      case action === "get-orders":
        return await handleGetOrders();
      case action === "get-deliveries":
        return await handleGetDeliveries();
      case action === "get-payments":
        return await handleGetPayments();

      default:
        return new Response(
          JSON.stringify({ error: "Invalid endpoint" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleGetAll(table: string) {
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleInsert(table: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.from(table).insert([body]).select();
  if (error) throw error;
  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleUpdate(table: string, body: Record<string, unknown>) {
  const { id, ...updates } = body;
  if (!id) throw new Error("ID is required for update");
  const { data, error } = await supabase.from(table).update(updates).eq("id", id).select();
  if (error) throw error;
  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleDelete(table: string, body: Record<string, unknown>) {
  const { id } = body;
  if (!id) throw new Error("ID is required for delete");
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleGetOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, client:clients(*), items:order_items(*, product:products(*))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleGetDeliveries() {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*, order:orders(*, client:clients(*)), delivery_person:delivery_persons(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleGetPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("*, client:clients(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
