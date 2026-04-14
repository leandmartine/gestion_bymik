# 🖤 ByMik — Sistema de Gestión de Pedidos

## ¿Qué es esto?
Panel de gestión para ByMik, emprendimiento de cosméticos.
Permite registrar y gestionar pedidos, productos con control de stock,
clientes categorizados, métricas de ventas y sincronización con Google Sheets.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Estilos | Tailwind CSS v4 — paleta monocromática |
| Animaciones | Framer Motion |
| Base de datos | Supabase (PostgreSQL + Auth) |
| Data fetching | TanStack Query v5 |
| Gráficos | Recharts |
| Backup | Google Sheets API |
| Deploy | Vercel (free tier) |

---

## Funcionalidades

### 🛍️ Pedidos
- Crear pedido con cliente, productos, cantidades
- Agregar cliente rápido sin salir del formulario
- Opción de envío: dirección, retiro en agencia, agencia de envíos
- Cambiar estado: Pendiente → Preparando → Enviado → Entregado
- Link directo a WhatsApp del cliente
- Eliminar pedido (restaura stock)

### 💄 Productos
- CRUD completo con nombre, descripción, precio, stock
- Alerta visual si stock ≤ 3
- Stock se actualiza automáticamente al crear/cancelar pedidos

### 👥 Clientes
- CRUD con nombre, teléfono, Instagram, dirección, notas
- Categorías creadas por el usuario con colores
- Búsqueda por nombre, teléfono o Instagram

### 📊 Métricas
- Total de pedidos y monto vendido del mes
- Pedidos por estado (gráfico de estados)
- Gráfico de pedidos por día
- Ranking de productos más vendidos
- Control de stock con barra de progreso

### 🔄 Google Sheets
- Sincronización automática al crear pedido
- Sync manual desde Configuración
- Una hoja por mes con todos los pedidos

---

## Arquitectura de carpetas

```
src/
├── app/
│   ├── dashboard/        # Panel principal
│   ├── pedidos/          # Gestión de pedidos
│   ├── productos/        # Catálogo de productos
│   ├── clientes/         # Gestión de clientes
│   ├── metricas/         # Métricas y estadísticas
│   ├── configuracion/    # Perfil y Google Sheets
│   └── api/              # Endpoints REST
├── components/
│   ├── auth/             # LoginForm
│   ├── layout/           # Sidebar, BottomNav, TopBar
│   └── shared/           # Celebrations, EasterEgg
├── hooks/                # TanStack Query hooks
├── lib/
│   ├── supabase/         # Cliente, servidor, dev-store
│   ├── sounds.ts         # Sonidos Web Audio API
│   └── utils.ts          # Helpers
├── providers/            # QueryProvider, AuthProvider
├── types/                # TypeScript types
└── middleware.ts         # Protección de rutas
```

---

## Dev mode

- Login: `mikagonz@gmail.com` / `12345678`
- Cookie `dev-auth=true` activa el store en memoria
- `globalThis.__devStoreBymik` sobrevive hot-reloads

---

## Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3001
```
