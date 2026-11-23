import DoctorAvatar from '../../shared/components/DoctorAvatar';

function SelectedDoctorBanner({ doctor }) {
  if (!doctor) return null;

  const license = doctor.licenseNumber;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex items-center gap-4">
      <DoctorAvatar variant="rounded" size="lg" showStatus />
      <div>
        <h2 className="font-bold text-med-text-main text-base">
          {doctor.name}
        </h2>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">
          {doctor.specialty?.name || 'Sin especialidad'}
        </p>
        {license && (
          <p className="text-[11px] text-slate-400 mt-0.5">
            Matrícula: {license}
          </p>
        )}
      </div>
    </div>
  );
}

export default SelectedDoctorBanner;
