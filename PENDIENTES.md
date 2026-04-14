# PENDIENTES — ByMik

## Configuración manual requerida

### 1. Supabase ✅
- [x] Crear proyecto en supabase.com → `ozwciusfikwtauqebzjd`
- [x] Ejecutar `supabase/schema.sql` en el SQL Editor
- [x] Ejecutar `supabase/migration_bymik.sql` en el SQL Editor
- [ ] Ejecutar `supabase/migration_devoluciones.sql` en el SQL Editor ← PENDIENTE
- [x] Crear usuario: `mikagonz@gmail.com` en Authentication > Users
- [x] Copiar URL y claves a `.env.local`

### 2. Variables de entorno ✅
- [x] `.env.local` configurado con claves de producción

### 3. Vercel ✅
- [x] Proyecto importado en vercel.com
- [x] Variables de entorno configuradas en dashboard
- [x] `NEXT_PUBLIC_APP_URL=https://bymik.mikagonz.site`
- [x] `NEXT_PUBLIC_HUB_URL=https://mikagonz.site`

### 4. Google Sheets ✅
- [x] Service Account creada en Google Cloud
- [x] Planilla compartida con la service account
- [x] Credenciales JSON configuradas en la app (Configuración)

### 5. Iconos PWA ✅
- [x] `scripts/generate-icons.mjs` creado y ejecutado
- [x] `public/icon-192.png` y `public/icon-512.png` generados

---

## Roadmap

### ✅ Completado
- [x] Estructura base (Next.js + TypeScript + Tailwind)
- [x] Autenticación con Supabase (login, logout, middleware)
- [x] Schema de base de datos completo con RLS
- [x] CRUD de productos (precio y stock opcionales)
- [x] CRUD de clientes con categorías
- [x] Gestión de pedidos (crear, actualizar estado, eliminar)
- [x] Métricas mensuales con gráficos
- [x] Sincronización con Google Sheets (service account)
- [x] Navegación responsive (sidebar desktop, bottom nav mobile)
- [x] Safe-area para iPhone
- [x] Facturas en PDF (imprimir desde pedido)
- [x] Estadísticas de clientes frecuentes en métricas
- [x] Gestión de devoluciones (estado "devuelto" + restauración de stock)
- [x] Auth callback route para Supabase
- [x] Error Boundary global
- [x] PWA instalable (manifest + iconos)

### 🔲 Futuro
- [ ] Facturas formales en PDF con diseño avanzado
- [ ] Estadísticas de clientes frecuentes (histórico multi-mes)
- [ ] Exportar métricas a PDF
- [ ] Modo offline básico
