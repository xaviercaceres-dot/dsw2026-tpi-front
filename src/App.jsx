import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { AuthProvider } from './modules/auth/context/AuthProvider';
import RoleRoute from './modules/auth/components/RoleRoute';

// Auth Module
import AdminLoginPage from './modules/auth/pages/AdminLoginPage';
import AdminRegisterPage from './modules/auth/pages/AdminRegisterPage';

// Patients Module
import PatientLoginPage from './modules/patients/pages/PatientLoginPage';
import PatientLayout from './modules/patients/components/PatientLayout';
import PatientHome from './modules/patients/pages/PatientHome';
import AppointmentsPage from './modules/patients/pages/AppointmentsPage';

// Dashboard Module
import DashboardLayout from './modules/dashboard/components/DashboardLayout';
import OverviewPage from './modules/dashboard/pages/OverviewPage';

// Domain Modules (Screaming Architecture)
import DoctorsPage from './modules/doctors/pages/DoctorsPage';
import SpecialtiesPage from './modules/specialties/pages/SpecialtiesPage';
import AppointmentsSearchPage from './modules/appointments/pages/AppointmentsSearchPage';
import AvailabilityPage from './modules/availability/pages/AvailabilityPage';

const routes = [
  // Rutas públicas
  {
    path: '/login',
    element: <PatientLoginPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/register',
    element: <AdminRegisterPage />,
  },

  // Rutas privadas de pacientes (URL base y turnos)
  {
    path: '/',
    element: (
      <RoleRoute role="Paciente" redirectTo="/login">
        <PatientLayout />
      </RoleRoute>
    ),
    children: [
      {
        index: true,
        element: <PatientHome />,
      },
      {
        path: 'appointments',
        element: <AppointmentsPage />,
      },
    ],
  },

  // Rutas privadas de gestión clínica y administración
  {
    path: '/admin',
    element: (
      <RoleRoute role="Administrador" redirectTo="/admin/login">
        <DashboardLayout />
      </RoleRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/home" replace />,
      },
      {
        path: 'home',
        element: <OverviewPage />,
      },
      {
        path: 'patients',
        element: <AppointmentsSearchPage />,
      },
      {
        path: 'patient-search',
        element: <AppointmentsSearchPage />,
      },
      {
        path: 'appointments',
        element: <Navigate to="/admin/patients" replace />,
      },
      {
        path: 'specialties',
        element: <SpecialtiesPage />,
      },
      {
        path: 'doctors',
        element: <DoctorsPage />,
      },
      {
        path: 'availability',
        element: <AvailabilityPage />,
      },
    ],
  },

  // Redirección para cualquier otra URL
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

function App() {
  const router = createBrowserRouter(routes);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
