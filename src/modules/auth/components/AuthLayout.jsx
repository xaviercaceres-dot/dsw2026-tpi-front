import { ShieldIcon } from './AuthIcons';

function AuthLayout({ title, subtitle, banner, bottomLink, children }) {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-med-primary-950 px-4 py-8">
      <header className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-3 text-med-primary-900">
          <ShieldIcon />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          MedPortal
        </h1>
      </header>

      <section className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        <div className="p-8 sm:p-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-med-primary-900">{title}</h2>
            {subtitle && (
              <p className="text-xs text-med-text-sub mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
        {banner}
      </section>

      {bottomLink && <div className="mt-6 text-center">{bottomLink}</div>}
    </main>
  );
}

export default AuthLayout;
