# MedPortal — Frontend del TPI (Desarrollo de Software 2026)

Frontend del Sistema de Turnos Médicos (UTN FRT). Aplicación SPA hecha con **React + Vite**,
**React Router**, **React Hook Form**, **Axios** y **Tailwind CSS**, que consume la API REST
`Dsw2026Tpi.Api` (ASP.NET Core).

## Requisitos

- Node.js 20 o superior y npm.
- Backend `Dsw2026Tpi.Api` en ejecución con el perfil **http** (`http://localhost:5278`):

  ```bash
  dotnet run --project Dsw2026Tpi.Api --launch-profile http
  ```

## Configuración

El archivo `.env.development` define a dónde se envían las llamadas a la API:

| Variable                    | Valor por defecto       | Uso                                                            |
| --------------------------- | ----------------------- | -------------------------------------------------------------- |
| `VITE_BACKEND_URL`          | `/`                     | `baseURL` de Axios (las rutas empiezan con `/api/...`).        |
| `VITE_BACKEND_PROXY_TARGET` | `http://localhost:5278` | Destino del proxy de Vite para todo lo que empieza con `/api`. |

Como el navegador llama al mismo origen de Vite y el proxy reenvía las solicitudes al backend,
no hace falta agregar el puerto de Vite (5173) a la lista de CORS del backend.

## Ejecución

```bash
npm install      # instala las dependencias
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run lint     # ESLint + Prettier
npm run build    # genera la carpeta dist para producción
```

## Acceso

| Rol           | Pantalla de acceso | Credenciales                                                                                 |
| ------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| Paciente      | `/login`           | Email + DNI (7 u 8 dígitos). Si es el primer ingreso, el backend registra al paciente.       |
| Administrador | `/admin/login`     | Email + contraseña del administrador inicial (`Admin:Email` / `Admin:Password` del backend). |

El token JWT y el rol se guardan en `sessionStorage`. Al cerrar sesión se llama a
`POST /api/auth/logout`, que revoca el token en el backend.

## Funcionalidades

**Administrador** (`/admin/...`): tablero con métricas, listado/alta/edición/baja lógica de
médicos y especialidades, configuración de disponibilidad horaria (genera turnos de 30 minutos
hasta fin de mes), turnos del día y búsqueda combinada por especialidad, médico, DNI y fecha.

**Paciente** (`/` y `/appointments`): reserva de turnos (especialidad → médico → horario →
motivo → confirmación), listado de turnos activos y cancelación.

## Estructura (Screaming Architecture)

```
src/
├── App.jsx                 # rutas (createBrowserRouter) y AuthProvider
├── main.jsx
├── index.css / elements.css
└── modules/
    ├── auth/               # login y registro de administrador, sesión, rutas privadas
    │   ├── components/     # ProtectedRoute, AuthLayout, LoginField, íconos
    │   ├── context/        # AuthProvider (Context API)
    │   ├── helpers/        # roles y reglas de validación
    │   ├── hook/           # useAuth
    │   ├── pages/          # AdminLoginPage, AdminRegisterPage
    │   └── services/       # llamadas a /api/auth
    ├── dashboard/          # layout del administrador y tablero
    ├── doctors/            # médicos
    ├── specialties/        # especialidades
    ├── availability/       # disponibilidad horaria
    ├── appointments/       # búsqueda de citas (administrador) y servicios de citas
    ├── patients/           # login, layout, reserva (PatientHome) y turnos del paciente
    └── shared/             # cliente Axios, manejo de errores, componentes y utilidades comunes
```

Cada módulo separa páginas (`pages`), componentes de presentación (`components`) y acceso a la
API (`services`); los componentes no construyen URLs ni usan Axios directamente.

El detalle de los endpoints consumidos está en [API_ENDPOINT_MAPPING.md](API_ENDPOINT_MAPPING.md).
