-- Agregar estado 'devuelto' al check constraint de pedidos
ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_check;
ALTER TABLE public.pedidos ADD CONSTRAINT pedidos_estado_check
  CHECK (estado IN ('pendiente','preparando','enviado','entregado','cancelado','devuelto'));
