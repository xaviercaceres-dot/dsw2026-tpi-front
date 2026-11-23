import { Link } from 'react-router-dom';
import { usePatientBooking } from '../hooks/usePatientBooking';
import DoctorSearchBar from '../components/DoctorSearchBar';
import SelectedDoctorBanner from '../components/SelectedDoctorBanner';
import WeeklySlotsGrid from '../components/WeeklySlotsGrid';
import AppointmentSummaryBar from '../components/AppointmentSummaryBar';

function PatientHome() {
  const {
    specialties,
    filteredDoctors,
    selectedDoctor,
    specialtyId,
    doctorId,
    daysWindow,
    slotsByDate,
    selectedSlot,
    selectedDayMeta,
    rangeHeaderLabel,
    canGoBack,
    reasonField,
    reasonError,
    message,
    error,
    noDoctorsMessage,
    loadingSlots,
    booking,
    handleSpecialtyChange,
    handleDoctorChange,
    handleSearch,
    handleShiftWeek,
    handleSelectSlot,
    handleConfirmBooking,
  } = usePatientBooking();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-5">
      <DoctorSearchBar
        specialties={specialties}
        doctors={filteredDoctors}
        specialtyId={specialtyId}
        doctorId={doctorId}
        onSpecialtyChange={handleSpecialtyChange}
        onDoctorChange={handleDoctorChange}
        onSearch={handleSearch}
      />

      {error && (
        <div
          role="alert"
          className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium"
        >
          {message}{' '}
          <Link to="/appointments" className="underline font-semibold">
            Ver Mis Turnos
          </Link>
        </div>
      )}
      {noDoctorsMessage && (
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
          {noDoctorsMessage}
        </div>
      )}

      <SelectedDoctorBanner doctor={selectedDoctor} />

      {selectedDoctor && (
        <WeeklySlotsGrid
          daysWindow={daysWindow}
          slotsByDate={slotsByDate}
          selectedSlot={selectedSlot}
          rangeHeaderLabel={rangeHeaderLabel}
          canGoBack={canGoBack}
          loading={loadingSlots}
          onShiftWeek={handleShiftWeek}
          onSelectSlot={handleSelectSlot}
        />
      )}

      <AppointmentSummaryBar
        selectedSlot={selectedSlot}
        selectedDayMeta={selectedDayMeta}
        reasonField={reasonField}
        reasonError={reasonError}
        loading={booking}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}

export default PatientHome;
