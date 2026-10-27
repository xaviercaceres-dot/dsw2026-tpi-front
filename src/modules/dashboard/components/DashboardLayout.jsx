import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';

function DashboardLayout() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const navigate = useNavigate();
  const { singout } = useAuth();

  const handleLogout = () => {
    singout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      to: '/admin/home',
      label: 'Tablero',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      to: '/admin/doctors',
      label: 'Doctores',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      to: '/admin/specialties',
      label: 'Especialidades',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M9 12h6m-3-3v6m-7 5h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      to: '/admin/patients',
      label: 'Búsqueda de Pacientes',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M21 21l-3.5-3.5"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-med-bg flex">
      {/* Sidebar fijo para desktop / retráctil en móvil */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-med-border flex flex-col justify-between transition-transform duration-200 sm:translate-x-0 ${
          openMobileMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="p-6 border-b border-med-border-subtle">
            <h2 className="text-base font-bold text-med-primary-900 leading-tight">
              Admin Portal
            </h2>
            <span className="text-xs font-medium text-med-text-muted">
              Healthcare Management
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpenMobileMenu(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-med-primary-50 text-med-primary-900 border-r-4 border-med-primary-900'
                      : 'text-med-text-sub hover:bg-gray-50 hover:text-med-primary-900'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar (Help, Logout & User profile) */}
        <div className="p-4 border-t border-med-border-subtle space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-med-text-sub hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <svg
              className="w-4 h-4 text-med-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Cerrar Sesión</span>
          </button>

          {/* User Profile Info */}
          <div className="pt-3 border-t border-med-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-med-primary-100 text-med-primary-900 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-med-text-main truncate">
                Admin User
              </p>
              <p className="text-[11px] text-med-text-muted truncate">
                Super Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop para móvil */}
      {openMobileMenu && (
        <div
          onClick={() => setOpenMobileMenu(false)}
          className="fixed inset-0 bg-slate-900/40 z-30 sm:hidden"
        />
      )}

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 sm:pl-64">
        {/* Topbar móvil */}
        <header className="sm:hidden bg-white border-b border-med-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-med-primary-900 text-white flex items-center justify-center font-bold text-xs">
              MC
            </div>
            <span className="font-bold text-sm text-med-primary-900">
              Medical Center
            </span>
          </div>
          <button
            onClick={() => setOpenMobileMenu(!openMobileMenu)}
            className="p-1.5 rounded-lg border border-med-border text-med-text-sub"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>

        {/* Contenido de Rutas Hijas */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
