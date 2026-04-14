# PENDIENTES — ByMik

## Configuración manual requerida

### 1. Supabase
- [ ] Crear proyecto en supabase.com
- [ ] Ejecutar `supabase/schema.sql` en el SQL Editor
- [ ] Crear usuario: `mikagonz@gmail.com` en Authentication > Users
- [ ] Copiar URL y claves a `.env.local`

### 2. Variables de entorno
Crear `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. Vercel
- [ ] Importar repo en vercel.com
- [ ] Agregar variables de entorno en dashboard
- [ ] Actualizar `NEXT_PUBLIC_APP_URL` con la URL de Vercel

### 4. Google Sheets (opcional)
- [ ] Crear proyecto en Google Cloud Console
- [ ] Habilitar Google Sheets API
- [ ] Crear cuenta de servicio
- [ ] Descargar JSON de credenciales
- [ ] Crear una planilla y compartirla con el email de la cuenta de servicio
- [ ] En Configuración: pegar el ID de la planilla y el JSON de credenciales

### 5. Iconos PWA
- [ ] Ejecutar `node scripts/generate-icons.mjs` para generar icon-192.png e icon-512.png (copiar script de gestion_empresa y adaptar)

## Roadmap futuro
- [ ] Facturas en PDF
- [ ] Estadísticas de clientes frecuentes
- [ ] Gestión de devoluciones
- [ ] Modo oscuro
- [ ] PWA instalable
