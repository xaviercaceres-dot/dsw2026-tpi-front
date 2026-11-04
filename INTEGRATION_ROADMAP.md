# Roadmap de integración

## Fase 1 — Entorno y HTTP

1. Actualizar `.env.development` al puerto HTTP real del backend.
2. Verificar CORS con el origen Vite.
3. Mantener el proxy `/api` de Vite.
4. Centralizar Axios, timeout, JSON y Bearer token.
5. Crear parser común de errores y detalles de validación.

**Aceptación:** health check y una llamada autenticada funcionan desde el navegador.

## Fase 2 — Sesión y autorización

1. Crear sesión `{ token, role, dni }`.
2. Eliminar credenciales mock.
3. Corregir login admin y paciente.
4. Crear registro admin.
5. Crear rutas `AdminRoute` y `PatientRoute`.
6. Manejar 401, 403, logout y sesión restaurada.

**Aceptación:** cada rol sólo puede abrir sus rutas y el token se adjunta automáticamente.

## Fase 3 — Servicios

Crear `specialtiesApi`, `doctorsApi`, `availabilityApi` y `appointmentsApi`.
Los componentes no deben construir URLs ni manejar Axios directamente.

## Fase 4 — Especialidades

Conectar listado paginado, filtro, alta, edición, baja lógica, validaciones y
estados de UI en `SpecialtiesPage`.

## Fase 5 — Médicos

Conectar listado paginado, búsqueda, formularios con select de especialidad,
alta, edición, baja lógica y reglas de disponibilidad.

## Fase 6 — Disponibilidad

Crear configuración administrativa de rangos y consulta de slots del paciente.
Validar días, `HH:mm`, rangos y superposición. Confirmar reemplazos.

## Fase 7 — Turnos de paciente

Reemplazar datos mock por especialidades, médicos, fechas y slots reales. Agregar
motivo, resumen de confirmación, reserva, conflicto 409 y recarga de slots.

## Fase 8 — Turnos administrativos

Conectar filtros reales, búsqueda combinada, paginación y respuesta anidada.

## Fase 9 — Calidad

Ejecutar lint, build y pruebas de contratos. Verificar los flujos completos de
administrador y paciente, incluyendo 401, 403, 404, 409, 429, estados vacíos y
backend no disponible.
