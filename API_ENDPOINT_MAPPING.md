# Mapeo de endpoints

Fuente de verdad: controladores, DTOs y configuración del backend `Dsw2026Tpi.Api`.
Todas las rutas requieren `Authorization: Bearer <token>`, salvo los dos logins.

| Módulo       | Método | Ruta                               | Rol requerido | Request / query                                              | Response                                                                          | Uso en el frontend                        |
| ------------ | ------ | ---------------------------------- | ------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------- |
| Auth         | POST   | `/api/auth/admin/login`            | Público       | `{ email, password }`                                        | `{ token, role: "ADMINISTRADOR" }`                                                | `auth/services/adminLogin.js`             |
| Auth         | POST   | `/api/auth/patient/login`          | Público       | `{ email, dni }`                                             | `{ token, role: "PACIENTE" }`                                                     | `auth/services/patientLogin.js`           |
| Auth         | POST   | `/api/auth/logout`                 | Autenticado   | —                                                            | `"ok"`                                                                            | `auth/services/logout.js` (Cerrar Sesión) |
| Auth         | POST   | `/api/auth/admin/register`         | ADMINISTRADOR | `{ email, password }`                                        | email registrado                                                                  | `auth/services/adminRegister.js` (extra)  |
| Specialties  | GET    | `/api/specialties`                 | Autenticado   | `pageSize`, `pageIndex`, `name` (3–100)                      | `{ pageSize, pageIndex, total, data: [{ id, name, description }] }`               | listado, selects                          |
| Specialties  | POST   | `/api/specialties`                 | ADMINISTRADOR | `{ name, description }`                                      | especialidad creada (201)                                                         | alta                                      |
| Specialties  | PUT    | `/api/specialties/{id}`            | ADMINISTRADOR | `{ name, description }`                                      | especialidad actualizada                                                          | edición                                   |
| Specialties  | DELETE | `/api/specialties/{id}`            | ADMINISTRADOR | —                                                            | `"ok"`                                                                            | baja lógica                               |
| Doctors      | GET    | `/api/doctors`                     | Autenticado   | `pageSize`, `pageIndex`, `name` (3–100)                      | paginado `data: [{ id, name, licenseNumber, specialty: { id, name } }]`           | listado, selects                          |
| Doctors      | GET    | `/api/doctors/{id}/availabilities` | Autenticado   | —                                                            | `[{ id, day, startTime, endTime }]` del mes en curso                              | carga de la disponibilidad del médico     |
| Doctors      | POST   | `/api/doctors`                     | ADMINISTRADOR | `{ name, licenseNumber, specialtyId }`                       | médico creado (201)                                                               | alta                                      |
| Doctors      | PUT    | `/api/doctors/{id}`                | ADMINISTRADOR | `{ name, licenseNumber, specialtyId }`                       | médico actualizado                                                                | edición                                   |
| Doctors      | DELETE | `/api/doctors/{id}`                | ADMINISTRADOR | —                                                            | `"ok"`                                                                            | baja lógica                               |
| Availability | GET    | `/api/availabilities`              | Autenticado   | `doctorId`, `date=YYYY-MM-DD`                                | `[{ id, startTime, endTime, status }]` (turnos libres)                            | grilla de turnos del paciente             |
| Availability | POST   | `/api/availabilities`              | ADMINISTRADOR | `{ doctorId, days: [{ day, startTime, endTime }] }`          | reglas creadas (201)                                                              | primera configuración del mes             |
| Availability | PUT    | `/api/availabilities`              | ADMINISTRADOR | mismo body que el POST                                       | reglas vigentes                                                                   | sobrescritura de la disponibilidad        |
| Appointments | POST   | `/api/appointments`                | PACIENTE      | `{ doctorId, availabilitySlotId, patient: { dni }, reason }` | cita creada (201)                                                                 | reserva                                   |
| Appointments | GET    | `/api/appointments/patient`        | PACIENTE      | `dni`                                                        | `[{ id, doctorName, speciality, date, startTime, endTime, reason, status, ... }]` | Mis Turnos                                |
| Appointments | DELETE | `/api/appointments/{id}`           | PACIENTE      | —                                                            | `"ok"`                                                                            | cancelación                               |
| Appointments | GET    | `/api/appointments`                | ADMINISTRADOR | `date`, `pageSize`, `pageIndex`                              | paginado de `SearchItem`                                                          | turnos del día (tablero y búsqueda)       |
| Appointments | GET    | `/api/appointments/search`         | ADMINISTRADOR | `specialtyId`, `doctorId`, `dni`, `date` (opcionales)        | paginado de `SearchItem`                                                          | búsqueda combinada                        |

`SearchItem`: `{ appointmentsId, appointmentsStatus, patient: { dni, fullName }, doctor: { doctorId, name, specialty: { specialtyId, name } }, availableTime }`.
`availableTime` (`YYYY-MM-DDTHH:mm:ss`) es la fecha y hora del turno que se muestra en la tabla.

## Errores

Todas las respuestas de error tienen el formato `{ errorCode, message, details: [{ field, issue }] }`.
`shared/api/apiError.js` arma el mensaje para el usuario: usa mensajes propios para algunos
`errorCode` (por ejemplo `APPOINTMENT_CONFLICT`), muestra los `details` de los errores de
validación y detecta cuando el backend no está disponible. Ante un 401 en una ruta privada,
`shared/api/axiosInstance.js` borra la sesión y redirige al login correspondiente.
