import { useCallback, useEffect, useState } from 'react';
import useAuth from '../../auth/hook/useAuth';
import {
  cancelAppointment,
  getPatientAppointments,
} from '../../appointments/services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';

export function usePatientAppointments() {
  const { dni } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);

  const load = useCallback(async () => {
    if (!dni) {
      setLoading(false);

      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getPatientAppointments(dni);

      setAppointments(data);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [dni]);

  useEffect(() => {
    load();
  }, [load]);

  const requestCancel = (appointment) => {
    setError('');
    setMessage('');
    setPendingCancel(appointment);
  };

  const dismissCancel = () => setPendingCancel(null);

  const confirmCancel = async () => {
    if (!pendingCancel) return;

    setCancellingId(pendingCancel.id);

    try {
      await cancelAppointment(pendingCancel.id);
      setMessage('El turno fue cancelado y el horario quedó disponible.');
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setCancellingId(null);
      setPendingCancel(null);
    }
  };

  return {
    appointments,
    error,
    message,
    loading,
    cancellingId,
    pendingCancel,
    requestCancel,
    dismissCancel,
    confirmCancel,
  };
}
