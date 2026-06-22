-- ============================================================
-- SUPABASE DDL SCRIPT
-- Sedap Restaurant Admin Dashboard
-- Paste this entire script into Supabase SQL Editor and run it.
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest')),
    points integer NOT NULL DEFAULT 0,
    tier text NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: products
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    stock integer NOT NULL DEFAULT 0,
    image_url text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: orders
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid REFERENCES public.profiles(id),
    total_original numeric NOT NULL,
    discount_percentage integer NOT NULL DEFAULT 0,
    total_final numeric NOT NULL,
    points_earned integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    quantity integer NOT NULL,
    price_per_unit numeric NOT NULL
);

-- ============================================================
-- 2. HELPER FUNCTION: calculate_tier
-- ============================================================

CREATE OR REPLACE FUNCTION public.calculate_tier(total_points integer)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    IF total_points > 1500 THEN
        RETURN 'Platinum';
    ELSIF total_points > 500 THEN
        RETURN 'Gold';
    ELSIF total_points > 100 THEN
        RETURN 'Silver';
    ELSE
        RETURN 'Bronze';
    END IF;
END;
$$;

-- ============================================================
-- 3. TRIGGER: Auto-create profile on auth user signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'member')
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. HELPER: is_admin() - SECURITY DEFINER bypasses RLS
--    This prevents infinite recursion in policies.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$;

-- ============================================================
-- 4a. RLS Policies: profiles
-- ============================================================

-- Admin: ALL access (uses is_admin() to avoid recursion)
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Member/Guest: SELECT own profile
DROP POLICY IF EXISTS "profiles_member_select_own" ON public.profiles;
CREATE POLICY "profiles_member_select_own"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Member/Guest: UPDATE own profile
DROP POLICY IF EXISTS "profiles_member_update_own" ON public.profiles;
CREATE POLICY "profiles_member_update_own"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================================
-- 4b. RLS Policies: products
-- ============================================================

-- Admin: ALL access
DROP POLICY IF EXISTS "products_admin_all" ON public.products;
CREATE POLICY "products_admin_all"
    ON public.products
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Everyone (including guests): SELECT products
DROP POLICY IF EXISTS "products_public_select" ON public.products;
CREATE POLICY "products_public_select"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================================
-- 4c. RLS Policies: orders
-- ============================================================

-- Admin: ALL access
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;
CREATE POLICY "orders_admin_all"
    ON public.orders
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Member: SELECT own orders
DROP POLICY IF EXISTS "orders_member_select_own" ON public.orders;
CREATE POLICY "orders_member_select_own"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (member_id = auth.uid());

-- Member: INSERT own orders
DROP POLICY IF EXISTS "orders_member_insert_own" ON public.orders;
CREATE POLICY "orders_member_insert_own"
    ON public.orders
    FOR INSERT
    TO authenticated
    WITH CHECK (member_id = auth.uid());

-- ============================================================
-- 4d. RLS Policies: order_items
-- ============================================================

-- Admin: ALL access
DROP POLICY IF EXISTS "order_items_admin_all" ON public.order_items;
CREATE POLICY "order_items_admin_all"
    ON public.order_items
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Member: SELECT items from own orders
DROP POLICY IF EXISTS "order_items_member_select_own" ON public.order_items;
CREATE POLICY "order_items_member_select_own"
    ON public.order_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.member_id = auth.uid()
        )
    );

-- Member: INSERT items into own orders
DROP POLICY IF EXISTS "order_items_member_insert_own" ON public.order_items;
CREATE POLICY "order_items_member_insert_own"
    ON public.order_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.member_id = auth.uid()
        )
    );

-- ============================================================
-- 5. SEED DATA (Optional - sample products)
-- ============================================================

INSERT INTO public.products (name, description, price, stock, image_url) VALUES
('Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan sayuran segar', 35000, 50, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400'),
('Mie Ayam Bakso', 'Mie ayam dengan bakso sapi dan pangsit goreng', 25000, 40, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'),
('Ayam Geprek', 'Ayam geprek sambal bawang dengan nasi putih', 30000, 35, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400'),
('Es Teh Manis', 'Es teh manis segar dengan es batu', 8000, 100, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
('Jus Alpukat', 'Jus alpukat segar dengan susu coklat', 15000, 60, 'https://images.unsplash.com/photo-1623063984693-ff444ef2be53?w=400'),
('Sate Ayam', 'Sate ayam 10 tusuk dengan bumbu kacang dan lontong', 28000, 45, 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=400'),
('Rendang Sapi', 'Rendang sapi empuk dengan nasi putih', 45000, 25, 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=400'),
('Gado-Gado', 'Gado-gado sayuran segar dengan bumbu kacang', 20000, 30, 'https://images.unsplash.com/photo-1511690743698-d9d18f7e16a2?w=400'),
('Bakso Urat', 'Bakso urat sapi kuah kaldu dengan mie', 22000, 55, 'https://images.unsplash.com/photo-1583835746434-cf153d502b68?w=400'),
('Es Jeruk Segar', 'Es jeruk peras segar dengan madu', 12000, 80, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400')
ON CONFLICT DO NOTHING;
