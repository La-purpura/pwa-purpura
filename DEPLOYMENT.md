# 🚀 Guía de Despliegue - La Púrpura PWA

## Opción A: Desplegar en Vercel (Recomendado)

### Paso 1: Preparar Supabase
1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. En Settings → Database, copia tu **Connection String** (Direct Connection)
3. Guarda esta URL, la necesitarás en el paso 3

### Paso 2: Conectar con GitHub
```bash
# Asegúrate de que todo esté commiteado
git add .
git commit -m "Ready for production"
git push
```

### Paso 3: Desplegar en Vercel
1. Ve a https://vercel.com
2. Click en "Import Project"
3. Selecciona tu repositorio de GitHub
4. En **Environment Variables**, agrega:
   - `DATABASE_URL` = (tu connection string de Supabase)
   - `NEXTAUTH_SECRET` = (genera uno con: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = (se auto-completa, ej: https://tu-app.vercel.app)

### Paso 4: Ejecutar Migraciones en Producción
Una vez desplegado, Vercel ejecutará automáticamente:
```bash
npx prisma generate
npx prisma migrate deploy
```

Si necesitas poblar la base de datos:
```bash
# En tu terminal local, apuntando a producción
DATABASE_URL="tu-url-de-supabase" npx prisma db seed
```

---

## Opción B: Desplegar en Netlify

### Paso 1-2: Igual que Vercel

### Paso 3: Configurar Netlify
1. Ve a https://netlify.com
2. Import from Git
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Environment variables (igual que Vercel)

### Paso 4: Configurar Build Plugins
Netlify necesita el plugin de Next.js:
```bash
npm install -D @netlify/plugin-nextjs
```

Crear `netlify.toml`:
```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 🔧 Troubleshooting

### Error: "Can't reach database"
- Verifica que la `DATABASE_URL` esté correctamente URL-encoded
- Caracteres especiales: `@` → `%40`, `#` → `%23`, `$` → `%24`

### Error: "Prisma Client not generated"
Agrega en `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Verificar conexión a Supabase
```bash
# Test desde terminal
node -e "const {Client}=require('pg');new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}}).connect().then(()=>console.log('✅ OK')).catch(e=>console.error('❌',e.message))"
```

---

## 📊 Monitoreo Post-Despliegue

1. **Logs de Vercel/Netlify**: Revisa errores en tiempo real
2. **Supabase Dashboard**: Monitorea queries y performance
3. **Prisma Studio**: `npx prisma studio` para ver datos en producción

---

## 🔐 Seguridad en Producción

✅ **Checklist antes de lanzar:**
- [ ] Cambiar `NEXTAUTH_SECRET` por uno aleatorio fuerte
- [ ] Configurar CORS en Supabase (Settings → API)
- [ ] Habilitar RLS (Row Level Security) en Supabase
- [ ] Revisar que `.env` esté en `.gitignore`
- [ ] Configurar dominios personalizados

---

## 🎯 Comandos Útiles

```bash
# Ver logs de producción
vercel logs

# Ejecutar migraciones en producción
DATABASE_URL="..." npx prisma migrate deploy

# Poblar base de datos
DATABASE_URL="..." npx prisma db seed

# Abrir Prisma Studio en producción
DATABASE_URL="..." npx prisma studio
```
