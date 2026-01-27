# 💜 La Púrpura - PWA de Gestión Territorial

Progressive Web App para gestión territorial con autenticación, RBAC, y base de datos en la nube.

## 🚀 Inicio Rápido

### Desarrollo Local
```bash
npm install
npm run dev
```

La aplicación estará en `http://localhost:3000`

**Usuario por defecto:**
- Email: `admin@purpura.app`
- Password: `admin123`

---

## 📦 Stack Tecnológico

- **Frontend**: Next.js 14 + React + TailwindCSS
- **Backend**: Next.js API Routes
- **Base de Datos**: 
  - Desarrollo y Producción: PostgreSQL ([Neon](https://neon.tech))
- **ORM**: Prisma
- **Auth**: NextAuth.js (JWT) + Sesiones persistentes en DB
- **Seguridad**: RBAC + ABAC

---

## 🗂️ Estructura del Proyecto

```
├── src/
│   ├── app/              # Rutas y páginas (App Router)
│   │   ├── (app)/       # Rutas protegidas
│   │   ├── api/         # API endpoints
│   │   └── auth/        # Autenticación
│   ├── components/       # Componentes React
│   ├── lib/             # Utilidades y lógica de negocio
│   └── hooks/           # Custom React hooks
├── prisma/
│   ├── schema.prisma    # Modelo de datos
│   ├── migrations/      # Migraciones SQL
│   └── seed.ts          # Datos iniciales
└── scripts/             # Scripts de utilidad
```

---

## 🔐 Roles y Permisos

### Roles Disponibles
- `SuperAdminNacional`: Acceso total
- `AdminNacional`: Gestión nacional
- `AdminProvincial`: Gestión provincial
- `Coordinador`: Coordinación territorial
- `Referente`: Gestión local
- `Militante`: Acceso básico

### Sistema de Permisos (RBAC)
El sistema implementa control de acceso basado en roles y atributos:
- **RBAC**: Permisos por rol
- **ABAC**: Filtrado por territorio asignado

---

## 🗄️ Base de Datos

### Desarrollo Local (SQLite)
```bash
# Crear/actualizar base de datos
npx prisma migrate dev

# Poblar con datos de ejemplo
npx prisma db seed

# Abrir interfaz visual
npx prisma studio
```

### Producción (Neon)
La aplicación utiliza PostgreSQL en Neon. Para despliegues en Vercel, se recomienda:
1. Usar el string de conexión con **Pooling** (puerto 5432 o 6543) para evitar agotar conexiones en funciones serverless.
2. Configurar `DATABASE_URL` en Vercel apuntando a la URL del Pooler.
3. El cliente Prisma está centralizado en `src/lib/prisma.ts` como singleton para mayor eficiencia.

Ver guía completa en [`DEPLOYMENT.md`](./DEPLOYMENT.md)

---

## 📝 Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
# Base de datos
DATABASE_URL="file:./dev.db"

# Autenticación
NEXTAUTH_SECRET="tu-secret-super-seguro"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar servidor de desarrollo
npm run build                  # Compilar para producción
npm start                      # Iniciar servidor de producción

# Base de Datos
npx prisma migrate dev         # Crear migración
npx prisma migrate reset       # Resetear BD
npx prisma db seed             # Poblar datos
npx prisma studio              # Interfaz visual

# Utilidades
node scripts/switch-db.js local       # Cambiar a SQLite
node scripts/switch-db.js production  # Cambiar a PostgreSQL
```

---

## 🚢 Despliegue

### Opción 1: Vercel (Recomendado)
1. Push a GitHub
2. Importar en Vercel
3. Configurar variables de entorno
4. Deploy automático

### Opción 2: Netlify
Similar a Vercel, ver [`DEPLOYMENT.md`](./DEPLOYMENT.md)

---

## 📚 Módulos Implementados

- ✅ **M1**: Autenticación Real (JWT + Cookies)
- ✅ **M2**: Seguridad RBAC + Auditoría
- ✅ **M3**: Modelo Territorial (Ramas + Territorios)
- ✅ **M4**: Gestión de Usuarios
- ✅ **M5**: Control ABAC en Tareas
- ✅ **M6**: Sistema de Alertas
- ✅ **M7**: Dashboard con Métricas Reales

---

## 🔒 Seguridad

- Autenticación JWT con cookies HTTP-only
- Passwords hasheados con bcrypt
- CSRF protection
- Rate limiting en endpoints críticos
- Validación de permisos server-side
- Auditoría de acciones

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 📞 Soporte

Para problemas o preguntas, consulta:
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Guía de despliegue
- Issues en GitHub
- Documentación de Prisma: https://prisma.io/docs
- Documentación de Next.js: https://nextjs.org/docs