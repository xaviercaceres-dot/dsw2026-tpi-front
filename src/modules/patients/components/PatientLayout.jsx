import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';
import Button from '../../shared/components/Button';
import IconButton from '../../shared/components/IconButton';

// Nombre visible a partir del email (el login del paciente solo devuelve token y rol).
function getDisplayName(email, dni) {
  const localPart = String(email || '').split('@')[0];
  const words = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  if (words.length > 0) return words.join(' ');

  return dni ? `Paciente ${dni}` : 'Paciente';
}

function getInitials(name) {
  const parts = name.split(' ').filter(Boolean);
  const initials =
    parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);

  return initials.toUpperCase();
}

function PatientLayout() {
  const navigate = useNavigate();
  const { signout, dni, email } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = getDisplayName(email, dni);

  const handleLogout = async () => {
    setMenuOpen(false);
    await signout();
    navigate('/login');
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive
      ? 'bg-med-primary-900 text-white font-semibold text-xs px-4 py-2 rounded-lg transition'
      : 'text-slate-600 hover:text-med-primary-900 font-medium text-xs px-4 py-2 rounded-lg transition';

  const navLinks = (
    <>
      <NavLink
        to="/"
        end
        className={getNavLinkClass}
        onClick={() => setMenuOpen(false)}
      >
        Reservar Turno
      </NavLink>
      <NavLink
        to="/appointments"
        className={getNavLinkClass}
        onClick={() => setMenuOpen(false)}
      >
        Mis Turnos
      </NavLink>
    </>
  );

  return (
    <div className="bg-med-bg min-h-screen flex flex-col">
      {/* Navbar Superior del Paciente */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Izquierda */}
          <div className="flex items-center gap-8 min-w-0">
            <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-med-primary-900 text-white flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <span className="font-bold text-med-primary-900 text-base">
                Portal Salud
              </span>
            </NavLink>

            <nav className="hidden md:flex items-center gap-2">{navLinks}</nav>
          </div>

          {/* Derecha */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span
              className="hidden md:inline-flex text-slate-400"
              title="Notificaciones"
              aria-hidden="true"
            >
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </span>

            <div className="hidden md:block h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full bg-med-primary-100 text-med-primary-900 font-bold text-xs flex items-center justify-center"
                title={email || undefined}
              >
                {getInitials(displayName)}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-700">
                {displayName}
              </span>
            </div>

            <div className="hidden md:block">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleLogout}
              >
                Salir
              </Button>
            </div>

            {/* Menú hamburguesa (móvil) */}
            <IconButton
              variant="menu"
              className="md:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              label="Abrir menú de navegación"
              aria-expanded={menuOpen}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </IconButton>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-slate-100 px-4 py-3 flex flex-col gap-1">
            {navLinks}
            <button
              type="button"
              onClick={handleLogout}
              className="text-left text-slate-600 hover:text-red-600 font-medium text-xs px-4 py-2 rounded-lg transition"
            >
              Salir
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default PatientLayout;
