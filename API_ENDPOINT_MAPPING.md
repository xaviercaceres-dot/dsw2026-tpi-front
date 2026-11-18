# Mapeo de endpoints

Fuente de verdad: controladores, DTOs y configuración del backend.

| Módulo       | Método | Ruta                               | Auth | Rol           | Request/query                                       | Response                                        | Frontend         |
| ------------ | ------ | ---------------------------------- | ---- | ------------- | --------------------------------------------------- | ----------------------------------------------- | ---------------- |
| Auth         | POST   | `/api/auth/admin/register`         | No   | -             | `{ email, password }`                               | string email                                    | Registro admin   |
| Auth         | POST   | `/api/auth/admin/login`            | No   | -             | `{ email, password }`                               | `{ token, role }`                               | Login admin      |
| Auth         | POST   | `/api/auth/patient/login`          | No   | -             | `{ email, dni }`                                    | `{ token, role }`                               | Login paciente   |
| Specialties  | GET    | `/api/specialties`                 | Sí   | Cualquiera    | `pageSize`, `pageIndex`, `name`                     | paginado `{ pageSize, pageIndex, total, data }` | Listado/selects  |
| Specialties  | POST   | `/api/specialties`                 | Sí   | Administrador | `{ name, description }`                             | especialidad                                    | Alta             |
| Specialties  | PUT    | `/api/specialties/{id}`            | Sí   | Administrador | `{ name, description }`                             | especialidad                                    | Edición          |
| Specialties  | DELETE | `/api/specialties/{id}`            | Sí   | Administrador | path `id`                                           | `"ok"`                                          | Baja lógica      |
| Doctors      | GET    | `/api/doctors`                     | Sí   | Cualquiera    | `pageSize`, `pageIndex`, `name`                     | paginado de médicos                             | Listado/selects  |
| Doctors      | GET    | `/api/doctors/{id}/availabilities` | Sí   | Cualquiera    | path `id`                                           | reglas de disponibilidad                        | Detalle          |
| Doctors      | POST   | `/api/doctors`                     | Sí   | Administrador | `{ name, licenseNumber, specialtyId }`              | médico                                          | Alta             |
| Doctors      | PUT    | `/api/doctors/{id}`                | Sí   | Administrador | `{ name, licenseNumber, specialtyId }`              | médico                                          | Edición          |
| Doctors      | DELETE | `/api/doctors/{id}`                | Sí   | Administrador | path `id`                                           | `"ok"`                                          | Baja lógica      |
| Availability | GET    | `/api/availabilities`              | Sí   | Cualquiera    | `doctorId`, `date=yyyy-MM-dd`                       | slots `AVAILABLE`                               | Agenda           |
| Availability | POST   | `/api/availabilities`              | Sí   | Administrador | `{ doctorId, days[] }`                              | reglas                                          | Configuración    |
| Availability | PUT    | `/api/availabilities`              | Sí   | Administrador | `{ doctorId, days[] }`                              | reglas                                          | Reemplazo        |
| Appointments | POST   | `/api/appointments`                | Sí   | Paciente      | `{ doctorId, availabilitySlotId, patient, reason }` | turno                                           | Reserva          |
| Appointments | GET    | `/api/appointments/patient`        | Sí   | Paciente      | `dni`                                               | array de turnos                                 | Mis turnos       |
| Appointments | DELETE | `/api/appointments/{id}`           | Sí   | Paciente      | path `id`                                           | `"ok"`                                          | Cancelación      |
| Appointments | GET    | `/api/appointments`                | Sí   | Administrador | `date`, paginación                                  | paginado de búsquedas                           | Turnos por fecha |
| Appointments | GET    | `/api/appointments/search`         | Sí   | Administrador | filtros opcionales                                  | paginado de búsquedas                           | Búsqueda         |
| Health       | GET    | `/health-check`                    | No   | -             | -                                                   | HTTP 200                                        | Diagnóstico      |

Todos los errores controlados pueden devolver `errorCode`, `message` y `details`.
Los códigos relevantes son 400, 401, 403, 404, 409, 429 y 500.

## Diferencias detectadas

- La respuesta administrativa de turnos (`SearchItem`) no contiene fecha, hora ni
  motivo; la tabla debe limitarse a los campos existentes salvo que el backend
  amplíe el DTO.
- Las reglas de `/api/doctors/{id}/availabilities` no son slots reservables.
- Los slots reservables provienen de `/api/availabilities`.
