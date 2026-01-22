# M12: Sistema de Reporte de Incidencias Georeferenciadas

## Objetivo
Permitir a los usuarios reportar incidencias en territorio con geolocalización automática, categorización y seguimiento de estado.

## Base de Datos
- Modelo `Incident` ya existe en schema.prisma
- Campos: título, descripción, categoría, prioridad, estado, lat/lng, dirección
- Relaciones: reportedBy (User), assignedTo (User), territory

## API Endpoints
- GET /api/incidents - Listar incidencias con filtros
- POST /api/incidents - Crear nueva incidencia
- PATCH /api/incidents/:id - Actualizar estado/asignación
- GET /api/incidents/:id - Detalle de incidencia

## Frontend
- /incidents - Lista de incidencias con mapa
- /incidents/new - Formulario de reporte con geolocalización
- /incidents/:id - Vista detalle con timeline

## Características Clave
1. Captura automática de ubicación GPS
2. Subida de fotos (URL externa o base64)
3. Categorización (Infraestructura, Seguridad, Social, etc.)
4. Asignación a responsables
5. Estados: PENDING, IN_PROGRESS, RESOLVED, CLOSED
