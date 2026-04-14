-- ByMik — Migración para Supabase compartido con gestion_empresa
-- Ejecutar en el SQL Editor del proyecto: onxpijatxdmpnevslbbm
-- Las tablas profiles y sync_log ya existen, solo se agregan las tablas nuevas.

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Agregar columna google_credentials a profiles si no existe ───────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_credentials TEXT;

-- ─── Trigger para crear perfil al registrar usuario (si no existe) ────────────
CREATE OR REPLACE FUNCTION create_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created ON auth.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile();

-- ─── Categorías de clientes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categorias_clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#000000',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categorias_clientes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "categorias_own" ON public.categorias_clientes FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Clientes ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  direccion TEXT,
  instagram TEXT,
  notas TEXT,
  categoria_id UUID REFERENCES public.categorias_clientes(id) ON DELETE SET NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "clientes_own" ON public.clientes FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);

-- ─── Productos ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "productos_own" ON public.productos FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_productos_user_id ON public.productos(user_id);

-- Funciones para ajustar stock
CREATE OR REPLACE FUNCTION decrement_stock(p_id UUID, p_qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.productos SET stock = GREATEST(0, stock - p_qty) WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_stock(p_id UUID, p_qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.productos SET stock = stock + p_qty WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Pedidos ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
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

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "pedidos_own" ON public.pedidos FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON public.pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at);

-- ─── Items de pedido ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pedido_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(10,2) NOT NULL DEFAULT 0
);

ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "pedido_items_own" ON public.pedido_items
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.pedidos WHERE public.pedidos.id = pedido_items.pedido_id AND public.pedidos.user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
