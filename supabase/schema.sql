-- ByMik — Schema de base de datos
-- Ejecutar en el SQL Editor de Supabase

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  sheets_spreadsheet_id TEXT,
  google_credentials TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION create_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile();

-- ─── Categorías de clientes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias_clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#000000',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categorias_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categorias_own" ON categorias_clientes FOR ALL USING (auth.uid() = user_id);

-- ─── Clientes ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  direccion TEXT,
  instagram TEXT,
  notas TEXT,
  categoria_id UUID REFERENCES categorias_clientes(id) ON DELETE SET NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clientes_own" ON clientes FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);

-- ─── Productos ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "productos_own" ON productos FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_productos_user_id ON productos(user_id);

-- Funciones para ajustar stock
CREATE OR REPLACE FUNCTION decrement_stock(p_id UUID, p_qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE productos SET stock = GREATEST(0, stock - p_qty) WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_stock(p_id UUID, p_qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE productos SET stock = stock + p_qty WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Pedidos ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','preparando','enviado','entregado','cancelado')),
  tiene_envio BOOLEAN DEFAULT FALSE,
  direccion_envio TEXT,
  retira_en_agencia BOOLEAN DEFAULT FALSE,
  agencia_envio TEXT,
  notas TEXT,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  synced_sheets BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pedidos_own" ON pedidos FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at);

-- ─── Items de pedido ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedido_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE NOT NULL,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(10,2) NOT NULL DEFAULT 0
);

ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pedido_items_own" ON pedido_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = pedido_items.pedido_id AND pedidos.user_id = auth.uid())
  );

-- ─── Sync log ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sync_log_own" ON sync_log FOR ALL USING (auth.uid() = user_id);
