import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';

function PatientLayout() {
  const navigate = useNavigate();
  const { signout, dni } = useAuth();

  const handleLogout = () => {
    signout();
    navigate('/login');
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive
      ? 'bg-[#133B5C] text-white font-semibold text-xs px-4 py-2 rounded-lg transition'
      : 'text-slate-600 hover:text-[#133B5C] font-medium text-xs px-4 py-2 rounded-lg transition';

  return (
    <div className="bg-[#F4F7F9] min-h-screen flex flex-col">
      {/* Navbar Superior del Paciente */}
      <header className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between sticky top-0 z-30">
        {/* Izquierda */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#133B5C] text-white flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <span className="font-bold text-[#133B5C] text-base">
              Portal Salud
            </span>
          </NavLink>

          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={getNavLinkClass}>
              Reservar Turno
            </NavLink>
            <NavLink to="/appointments" className={getNavLinkClass}>
              Mis Turnos
            </NavLink>
          </nav>
        </div>

        {/* Derecha */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            title="Notificaciones"
            className="text-slate-400 hover:text-[#133B5C] transition"
          >
            <svg
              className="text-slate-400 w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#DDF0FF] text-[#133B5C] font-bold text-xs flex items-center justify-center">
              JD
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-700">
              {dni ? `Paciente (${dni})` : 'Johnathan Doe'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-md transition"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default PatientLayout;
