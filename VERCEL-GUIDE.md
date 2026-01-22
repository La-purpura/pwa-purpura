# 🚀 Guía Paso a Paso: Desplegar en Vercel

## Paso 1: Importar Proyecto

1. Ve a **https://vercel.com**
2. Click en **"Add New..."** (botón arriba a la derecha)
3. Selecciona **"Project"**
4. Conecta tu cuenta de GitHub si aún no lo hiciste
5. Busca tu repositorio **"pwa-purpura"** (o como lo hayas llamado)
6. Click en **"Import"**

---

## Paso 2: Configurar Variables de Entorno

### 📍 AQUÍ ES DONDE AGREGAS LAS VARIABLES:

Después de importar, verás una pantalla de configuración. Busca la sección:

```
┌─────────────────────────────────────────┐
│  Environment Variables                  │
│  ─────────────────────────────────────  │
│                                         │
│  Add environment variables to use in   │
│  your project                           │
│                                         │
│  [+ Add]                                │
└─────────────────────────────────────────┘
```

### Agrega estas 3 variables:

#### Variable 1: DATABASE_URL
```
Name:  DATABASE_URL
Value: postgresql://postgres:vUz.%24%239pH%2AP9%2BMA@db.rlxcxgrwtvxqsxoxtybd.supabase.co:5432/postgres
```

#### Variable 2: NEXTAUTH_SECRET
Primero genera el secret. Abre tu terminal y ejecuta:
```bash
openssl rand -base64 32
```

Copia el resultado (algo como: `xK9mP2nQ5rT8vW1yZ3aB4cD6eF7gH9jK0lM2nO4pQ6r=`)

Luego en Vercel:
```
Name:  NEXTAUTH_SECRET
Value: (pega el secret que generaste)
```

#### Variable 3: NEXTAUTH_URL
```
Name:  NEXTAUTH_URL
Value: https://tu-proyecto.vercel.app

⚠️ IMPORTANTE: Vercel te mostrará la URL después del primer deploy.
   Por ahora, déjala en blanco o pon un placeholder.
   La actualizarás después del primer deploy.
```

---

## Paso 3: Deploy

1. Después de agregar las variables, click en **"Deploy"**
2. Espera 2-3 minutos mientras Vercel:
   - Instala dependencias
   - Ejecuta `prisma generate`
   - Compila Next.js
   - Despliega tu app

3. ✅ ¡Listo! Verás un mensaje de éxito con tu URL

---

## Paso 4: Actualizar NEXTAUTH_URL (Importante)

Después del primer deploy:

1. Copia la URL que Vercel te dio (ej: `https://pwa-purpura.vercel.app`)
2. Ve a tu proyecto en Vercel
3. Click en **"Settings"** (arriba)
4. Click en **"Environment Variables"** (menú izquierdo)
5. Busca `NEXTAUTH_URL`
6. Click en los 3 puntos `⋮` → **"Edit"**
7. Pega tu URL real: `https://tu-proyecto.vercel.app`
8. Click **"Save"**
9. Ve a **"Deployments"** → Click en los 3 puntos del último deploy → **"Redeploy"**

---

## Paso 5: Ejecutar Migraciones en Producción

Una vez desplegado, necesitas crear las tablas en Supabase:

### Opción A: Desde tu terminal local
```bash
# Apunta a la base de datos de producción
DATABASE_URL="postgresql://postgres:vUz.$#9pH*P9+MA@db.rlxcxgrwtvxqsxoxtybd.supabase.co:5432/postgres" npx prisma migrate deploy

# Poblar con datos iniciales
DATABASE_URL="postgresql://postgres:vUz.$#9pH*P9+MA@db.rlxcxgrwtvxqsxoxtybd.supabase.co:5432/postgres" npx prisma db seed
```

### Opción B: Desde Vercel (más fácil)
Vercel ejecutará automáticamente las migraciones en el primer deploy gracias al script `postinstall` en `package.json`.

---

## 🎯 Verificar que Todo Funciona

1. Abre tu URL de Vercel
2. Deberías ver la pantalla de login
3. Intenta loguearte con:
   - Email: `admin@purpura.app`
   - Password: `admin123`

Si no funciona, revisa los logs:
- En Vercel: **Deployments** → Click en tu deploy → **"View Function Logs"**

---

## 🐛 Problemas Comunes

### "Can't reach database"
- Verifica que `DATABASE_URL` esté correctamente URL-encoded
- Asegúrate de que Supabase esté activo

### "Invalid credentials"
- Ejecuta el seed para crear el usuario admin:
  ```bash
  DATABASE_URL="tu-url-de-supabase" npx prisma db seed
  ```

### "NEXTAUTH_URL is not defined"
- Ve a Settings → Environment Variables
- Agrega/actualiza `NEXTAUTH_URL` con tu URL de Vercel
- Redeploy

---

## 📱 Instalar como PWA

Una vez funcionando:

1. Abre la URL desde tu **móvil**
2. En Chrome/Safari: Menú → **"Agregar a pantalla de inicio"**
3. ¡Listo! Ahora funciona como app nativa

---

## 🎉 ¡Felicidades!

Tu app está en producción y lista para usar. Ahora puedes:
- Compartir la URL con tu equipo
- Instalarla como PWA en móviles
- Gestionar usuarios desde el panel de admin

**URL de tu app**: `https://tu-proyecto.vercel.app`

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel
2. Verifica las variables de entorno
3. Consulta `DEPLOYMENT.md` para más detalles
