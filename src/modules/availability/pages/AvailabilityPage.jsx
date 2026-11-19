import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getDoctorAvailabilities,
  getDoctors,
} from '../../doctors/services/doctorsApi';
import {
  createAvailability,
  updateAvailability,
} from '../services/availabilityApi';
import {
  buildAvailabilityPayload,
  buildScheduleFromData,
  createDefaultSchedule,
  validateSchedule,
} from '../helpers/scheduleUtils';
import { getApiError } from '../../shared/api/apiError';
import PageHeader from '../../shared/components/PageHeader';
import DoctorAvailabilitySidebar from '../components/DoctorAvailabilitySidebar';
import ScheduleConfigForm from '../components/ScheduleConfigForm';

function AvailabilityPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDoctorIdParam = searchParams.get('doctorId') || '';

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(initialDoctorIdParam);
  const [schedule, setSchedule] = useState(createDefaultSchedule);
  const [hasCurrentAvailability, setHasCurrentAvailability] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchAvailabilities = async (selectedId) => {
    if (!selectedId) {
      setSchedule(createDefaultSchedule());
      setHasCurrentAvailability(false);

      return;
    }

    setLoadingSchedule(true);
    setError('');
    try {
      const data = await getDoctorAvailabilities(selectedId);

      setSchedule(buildScheduleFromData(data));
      setHasCurrentAvailability(data.length > 0);
    } catch (requestError) {
      setError(getApiError(requestError).message);
      setSchedule(createDefaultSchedule());
      setHasCurrentAvailability(false);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    getDoctors({ pageSize: 100, pageIndex: 1 })
      .then((result) => {
        const list = result.data;

        setDoctors(list);

        const targetId =
          initialDoctorIdParam &&
          list.some((d) => String(d.id) === String(initialDoctorIdParam))
            ? initialDoctorIdParam
            : list[0]?.id || '';

        if (targetId) {
          setDoctorId(targetId);
          fetchAvailabilities(targetId);
        }
      })
      .catch((requestError) => setError(getApiError(requestError).message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectDoctor = (selectedId) => {
    setDoctorId(selectedId);
    setMessage('');
    setError('');
    fetchAvailabilities(selectedId);
  };

  const handleToggleDay = (dayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], enabled: !prev[dayKey].enabled },
    }));
    setMessage('');
    setError('');
  };

  const handleUpdateDayTime = (dayKey, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value },
    }));
    setMessage('');
    setError('');
  };

  const handleSave = async () => {
    setError('');
    setMessage('');

    const validationError = validateSchedule(doctorId, schedule);

    if (validationError) {
      setError(validationError);

      return;
    }

    setSaving(true);
    try {
      const payload = buildAvailabilityPayload(doctorId, schedule);

      if (hasCurrentAvailability) await updateAvailability(payload);
      else await createAvailability(payload);

      await fetchAvailabilities(doctorId);
      setMessage(
        'Disponibilidad guardada correctamente. Se generaron los turnos de 30 minutos hasta fin de mes.'
      );
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setSaving(false);
    }
  };

  const selectedDoctor = doctors.find(
    (doc) => String(doc.id) === String(doctorId)
  );

  return (
    <div>
      <PageHeader
        breadcrumb={{
          parentLabel: 'Doctores',
          onParentClick: () => navigate('/admin/doctors'),
          currentLabel: 'Disponibilidad Horaria',
        }}
      />

      <div>
        <h1 className="text-xl font-bold text-[#0F2942] mt-2">
          Gestionar Disponibilidad Horaria
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Defina los días y rangos horarios de atención para el profesional
          seleccionado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <DoctorAvailabilitySidebar
          doctors={doctors}
          doctorId={doctorId}
          selectedDoctor={selectedDoctor}
          onSelectDoctor={handleSelectDoctor}
        />

        <ScheduleConfigForm
          schedule={schedule}
          loading={loadingSchedule}
          saving={saving}
          error={error}
          message={message}
          onToggleDay={handleToggleDay}
          onUpdateDayTime={handleUpdateDayTime}
          onSubmit={handleSave}
          onCancel={() => navigate('/admin/doctors')}
        />
      </div>
    </div>
  );
}

export default AvailabilityPage;
