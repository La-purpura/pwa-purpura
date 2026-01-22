# Auditoría de Calidad y Funcionalidad - PWA Púrpura

## 1. Simulador Móvil (Implementado)
Se ha integrado un switch global en la esquina inferior derecha. Al activarlo, todo el layout se encapsula en un marco de dispositivo móvil (iPhone X dimensions) para facilitar las pruebas de responsividad sin salir del escritorio.

## 2. Escaneo de Roles (Usuarios Operativos)

### Rol: **Militante**
- **Permisos Actuales**: `content:view`, `chat:use`.
- **Visibilidad**:
  - **Sidebar**: No ve casi nada (Tareas, Alertas, Proyectos, Equipo están ocultos).
  - **Acceso**: Si intenta entrar por URL directa, el hook `useRBAC` probablemente lo rebotará (dependiendo de la implementación de página).
- **Problema Detectado**: El rol es demasiado pasivo. No puede reportar incidencias ni ver tareas asignadas.
- **Recomendación**: Agregar `incidents:create` (para avisos simples) o una vista simplificada de `forms:view`.

### Rol: **Referente Territorial**
- **Permisos Actuales**: Gestión completa dentro de su scope (Tareas, Alertas, Proyectos).
- **Visibilidad**: Correcta en Sidebar.
- **Flujo**: Puede crear proyectos y alertas.

### Rol: **Colaborador**
- **Visibilidad**: Puede ver tareas y reportar incidencias, pero no gestiona proyectos. Correcto.

---

## 3. Examen Exhaustivo de Endpoints (Integración Backend)

Este análisis verifica si las acciones de la UI están conectadas a una ruta de API (`src/app/api/...`) o si solo actúan en la memoria local del navegador (Mock Store).

| Módulo | Acción UI | API Endpoint | Estado | Observación |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | Login | `/api/auth/login` | ✅ Simulado | Mock en `useAuth`. Requiere conectar a BD real. |
| **Proyectos** | Listar | `GET /api/projects` | ✅ Conectado | Implementado en la sesión anterior. |
| **Proyectos** | Crear | `POST /api/projects` | ✅ Conectado | Envía payload completo del Wizard. |
| **Proyectos** | Editar Estado | `PUT /api/projects` | ✅ Conectado | Transiciones de workflow funcionales. |
| **Tareas** | Listar | `GET /api/tasks` | ⚠️ Parcial | `page.tsx` lee del Store, que carga Mocks. Falta `useEffect` fetch. |
| **Tareas** | Crear | `POST /api/tasks` | ❌ Desconectado | UI usa `state.addTask` (local). Falta llamada a API. |
| **Alertas** | Crear | - | ❌ Desconectado | `alerts/page.tsx` usa `addAlert` local. No hace POST a `/api/alerts`. |
| **Incidencias** | Crear | - | ❌ Desconectado | Botón "Intervenir" lleva a `/incidents/new` (si existe), ruta por verificar. |
| **Usuarios** | Listar/Crear | - | ⚠️ Inexistente | UI de Equipo puede estar usando solo mocks. |

## 4. Conclusiones y Próximos Pasos

1.  **Prioridad Alta**: Conectar los formularios de **Alertas** y **Tareas** a sus respectivos endpoints API. Actualmente, los datos creados allí morirán al refrescar si no se persiste el store (o al limpiar caché).
2.  **Ajuste de Roles**: Definir si el "Militante" debe tener capacidad operativa (reportar) o es puramente "lector" de noticias.
3.  **Base de Datos**: La estructura `DbProject`, `DbTask`, etc. en `server-db.ts` es sólida. El siguiente paso lógico es reemplazar `server-db.ts` (memoria) por un cliente prisma/postgres real.

> **Listo para Fase de Pruebas de Campo**: Una vez conectados los endpoints de Tareas y Alertas, la app será funcionalmente completa para probar flujos reales.
