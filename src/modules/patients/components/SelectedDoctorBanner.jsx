import DoctorAvatar from '../../shared/components/DoctorAvatar';

function SelectedDoctorBanner({ doctor }) {
  if (!doctor) return null;

  const license = doctor.licenseNumber;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex items-center gap-4">
      <DoctorAvatar variant="rounded" size="lg" showStatus />
      <div>
        <div className="flex flex-wrap items-center">
          <h2 className="font-bold text-[#0F2942] text-base">{doctor.name}</h2>
          <span className="bg-[#E0F2FE] text-[#133B5C] text-[10px] font-bold px-2 py-0.5 rounded ml-2">
            Verificado
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">
          {doctor.specialty?.name || 'Especialista Médico'}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Clínica San Rafael • Sede Central Consultorio 402
          {license ? ` • Matrícula: ${license}` : ''}
        </p>
      </div>
    </div>
  );
}

export default SelectedDoctorBanner;
