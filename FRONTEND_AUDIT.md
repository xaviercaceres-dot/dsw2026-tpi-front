# Auditoría del frontend

## Arquitectura actual

El proyecto utiliza React 19, Vite, JSX, React Router, Context API, React Hook Form,
Axios y Tailwind CSS. La organización sigue una variante de Screaming Architecture:
los módulos `auth`, `patients`, `doctors`, `specialties`, `appointments`, `dashboard`
y `shared` agrupan páginas, componentes y servicios por dominio.

## Estructura relevante

- `src/App.jsx`: rutas públicas y privadas.
- `src/modules/auth`: login, contexto y protección básica.
- `src/modules/patients`: agenda y turnos del paciente.
- `src/modules/doctors`: directorio visual de médicos.
- `src/modules/specialties`: directorio visual de especialidades.
- `src/modules/appointments`: búsqueda administrativa visual.
- `src/modules/shared`: componentes reutilizables y cliente Axios.
- `vite.config.js`: proxy de desarrollo para `/api`.

## Dependencias

React, React DOM, React Router DOM, Axios, React Hook Form, Tailwind CSS,
Vite, ESLint y Prettier ya están declarados. No se requiere agregar una librería
de estado global ni otra librería HTTP.

## Funcionalidad existente

- Rutas diferenciadas para paciente y administración.
- Layouts responsive para ambos perfiles.
- Formularios visuales de login.
- Componentes `Button`, `Card`, `Input` y `TablePagination`.
- Cliente Axios con interceptor inicial.
- Navegación y logout visual.

## Funcionalidad incompleta o mockeada

- Los logins usan rutas antiguas y credenciales mock.
- El login de paciente todavía solicita contraseña, aunque el backend requiere DNI.
- El rol no se conserva ni se utiliza para proteger rutas.
- Especialidades, médicos, dashboard y turnos usan arrays locales.
- Crear, editar, eliminar, reservar, cancelar y filtrar ejecutan `alert`.
- Disponibilidad y slots están hardcodeados.
- No existe registro de administrador.
- No existe capa de servicios para dominios de negocio.
- No hay tests automatizados.

## Componentes reutilizables

Se pueden conservar los layouts, tarjetas, botones, inputs, tabla y paginador.
Las páginas existentes también pueden conservar su estructura visual, reemplazando
los datos locales por estado y servicios reales.

## Riesgos técnicos

1. La URL actual de desarrollo (`localhost:5142`) no coincide con el perfil HTTP
   del backend (`localhost:5278`).
2. El interceptor actual contiene una configuración incompleta del header Bearer.
3. La respuesta real de errores usa `errorCode`, `message` y `details`, mientras
   el frontend busca códigos numéricos.
4. El backend usa respuestas paginadas y DTOs anidados que no coinciden con los
   objetos visuales actuales.
5. Las operaciones administrativas requieren autorización por rol.

## Estrategia

Se conserva la UI y la estructura modular. Se agrega una capa de servicios por
dominio, una sesión consistente con token/rol/DNI, rutas por rol, manejo global
de errores y estados explícitos de carga, vacío, éxito y error.
