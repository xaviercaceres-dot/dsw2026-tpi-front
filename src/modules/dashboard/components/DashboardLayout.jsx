import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';

function DashboardLayout() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signout } = useAuth();

  const handleLogout = async () => {
    await signout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      to: '/admin/home',
      label: 'Tablero',
      isActiveMatch: (pathname) => pathname.startsWith('/admin/home'),
      icon: (
        <svg
          className="w-5 h-5 shrink-0"
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
      isActiveMatch: (pathname) =>
        pathname.startsWith('/admin/doctors') ||
        pathname.startsWith('/admin/availability'),
      icon: (
        <svg
          className="w-5 h-5 shrink-0"
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
      isActiveMatch: (pathname) => pathname.startsWith('/admin/specialties'),
      icon: (
        <svg
          className="w-5 h-5 shrink-0"
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
      isActiveMatch: (pathname) =>
        pathname.startsWith('/admin/patients') ||
        pathname.startsWith('/admin/patient-search'),
      icon: (
        <svg
          className="w-5 h-5 shrink-0"
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
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex">
      {/* Sidebar izquierdo fijo */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between min-h-screen transition-transform duration-200 sm:translate-x-0 ${
          openMobileMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1">
          {/* 1. Cabecera del Sidebar */}
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-[#133B5C] leading-tight">
              Admin Portal
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Healthcare Management
            </p>
          </div>

          {/* 2. Menú de Navegación */}
          <nav className="p-4 space-y-1.5 flex-1">
            {navItems.map((item) => {
              const active = item.isActiveMatch(location.pathname);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpenMobileMenu(false)}
                  className={
                    active
                      ? 'bg-[#EBF3F9] text-[#133B5C] font-bold border-r-4 border-[#133B5C] rounded-l-lg py-2.5 px-4 flex items-center gap-3 text-sm transition'
                      : 'text-slate-600 hover:bg-slate-50 font-medium py-2.5 px-4 rounded-lg flex items-center gap-3 text-sm transition'
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* 3. Pie del Sidebar */}
        <div className="p-4 border-t border-slate-100 space-y-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 w-full transition"
          >
            <svg
              className="w-4 h-4 shrink-0"
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

          <div className="border-t border-slate-100" />

          {/* Bloque de Perfil Admin */}
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-9 h-9 rounded-full bg-[#DDF0FF] text-[#133B5C] font-bold text-xs flex items-center justify-center shrink-0">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">
                Admin User
              </p>
              <p className="text-[11px] text-slate-400 truncate">
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
        <header className="sm:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#133B5C]">Admin Portal</h2>
            <p className="text-[10px] text-slate-400">Healthcare Management</p>
          </div>
          <button
            type="button"
            onClick={() => setOpenMobileMenu(!openMobileMenu)}
            aria-label="Abrir menú de navegación"
            aria-expanded={openMobileMenu}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600"
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
