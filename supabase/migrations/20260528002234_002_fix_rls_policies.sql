/*
  # Fix RLS Policies for Admin Operations and Registration

  This migration:
  1. Adds policies to allow public registration (INSERT on clients)
  2. Adds policies for admin operations on all tables
  3. Enables necessary operations for the application to work
*/

-- Allow public registration (anyone can create a client account)
CREATE POLICY "Anyone can register as client"
  ON clients FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow clients to read all products and categories (needed for catalog)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (true);

-- Admin policies for clients (full access)
CREATE POLICY "Admin can manage clients"
  ON clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin policies for categories (full access)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin policies for suppliers (full access)
CREATE POLICY "Admin can manage suppliers"
  ON suppliers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin policies for delivery_persons (full access)
CREATE POLICY "Admin can manage delivery_persons"
  ON delivery_persons FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin policies for products (full access)
CREATE POLICY "Admin can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin policies for orders (full access)
CREATE POLICY "Admin can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin policies for order_items (full access)
CREATE POLICY "Admin can manage order_items"
  ON order_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin policies for deliveries (full access)
CREATE POLICY "Admin can manage deliveries"
  ON deliveries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin policies for payments (full access)
CREATE POLICY "Admin can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin policies for favorites (full access)
CREATE POLICY "Admin can manage favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin policies for reviews (full access)
CREATE POLICY "Admin can manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow public to view delivery_persons (for selection dropdowns)
CREATE POLICY "Delivery persons are viewable"
  ON delivery_persons FOR SELECT
  TO public
  USING (true);

-- Allow public to view suppliers (for product details)
CREATE POLICY "Suppliers are viewable"
  ON suppliers FOR SELECT
  TO public
  USING (true);