import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDoctors } from '../../doctors/services/doctorsApi';
import {
  createAvailability,
  getDoctorAvailabilities,
  updateAvailability,
} from '../services/availabilityApi';
import {
  buildAvailabilityPayload,
  buildScheduleFromData,
  createDefaultSchedule,
} from '../helpers/scheduleUtils';
import { getApiError } from '../../shared/api/apiError';

export function useAvailability() {
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

  const latestRequestId = useRef(0);

  const fetchAvailabilities = useCallback(async (selectedId) => {
    const requestId = ++latestRequestId.current;

    if (!selectedId) {
      setSchedule(createDefaultSchedule());
      setHasCurrentAvailability(false);
      setLoadingSchedule(false);

      return;
    }

    setLoadingSchedule(true);
    setError('');

    try {
      const data = await getDoctorAvailabilities(selectedId);

      if (requestId !== latestRequestId.current) return;

      setSchedule(buildScheduleFromData(data));
      setHasCurrentAvailability(data.length > 0);
    } catch (requestError) {
      if (requestId !== latestRequestId.current) return;

      setError(getApiError(requestError).message);
      setSchedule(createDefaultSchedule());
      setHasCurrentAvailability(false);
    } finally {
      if (requestId === latestRequestId.current) {
        setLoadingSchedule(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getDoctors({ pageSize: 100, pageIndex: 1 })
      .then((result) => {
        if (!isMounted) return;

        const list = result.data;

        setDoctors(list);

        const hasInitialDoctor =
          initialDoctorIdParam &&
          list.some((d) => String(d.id) === String(initialDoctorIdParam));
        const targetId = hasInitialDoctor
          ? initialDoctorIdParam
          : list[0]?.id || '';

        if (targetId) {
          setDoctorId(targetId);
          fetchAvailabilities(targetId);
        }
      })
      .catch((requestError) => {
        if (isMounted) setError(getApiError(requestError).message);
      });

    return () => {
      isMounted = false;
      latestRequestId.current += 1;
    };
  }, [fetchAvailabilities, initialDoctorIdParam]);

  const handleSelectDoctor = (selectedId) => {
    setDoctorId(selectedId);
    setMessage('');
    setError('');
    fetchAvailabilities(selectedId);
  };

  // Recibe los horarios ya validados por React Hook Form (ScheduleConfigForm).
  const handleSave = async (values) => {
    setError('');
    setMessage('');

    if (!doctorId) {
      setError('Seleccioná un profesional.');

      return;
    }

    setSaving(true);

    try {
      const payload = buildAvailabilityPayload(doctorId, values);

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

  const selectedDoctor = useMemo(
    () => doctors.find((doc) => String(doc.id) === String(doctorId)),
    [doctors, doctorId]
  );

  return {
    doctors,
    doctorId,
    selectedDoctor,
    schedule,
    loadingSchedule,
    saving,
    error,
    message,
    handleSelectDoctor,
    handleSave,
  };
}
