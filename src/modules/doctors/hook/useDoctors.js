import { useEffect, useState } from 'react';
import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
} from '../services/doctorsApi';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getApiError } from '../../shared/api/apiError';
import { useCrudList } from '../../shared/hooks/useCrudList';

const EMPTY_FORM = { name: '', licenseNumber: '', specialtyId: '' };
const MESSAGES = {
  created: 'Médico registrado correctamente.',
  updated: 'Médico actualizado correctamente.',
  deleted: 'Médico eliminado correctamente.',
};

// Valores iniciales del formulario a partir del DTO del backend.
function toFormValues(doctor) {
  return {
    name: doctor.name ?? '',
    licenseNumber: doctor.licenseNumber ?? '',
    specialtyId: doctor.specialty?.id ?? '',
  };
}

// El acceso por rol lo resuelve ProtectedRoute: esta pantalla solo la abre el administrador.
export function useDoctors() {
  const crud = useCrudList({
    fetchPage: getDoctors,
    createItem: createDoctor,
    updateItem: updateDoctor,
    deleteItem: deleteDoctor,
    toFormValues,
    emptyForm: EMPTY_FORM,
    messages: MESSAGES,
  });
  const { setError } = crud;
  const [specialties, setSpecialties] = useState([]);

  // Opciones del select de especialidad del formulario.
  useEffect(() => {
    let isMounted = true;

    getSpecialties({ pageSize: 100, pageIndex: 1 })
      .then((page) => {
        if (isMounted) setSpecialties(page.data);
      })
      .catch((requestError) => {
        if (isMounted) setError(getApiError(requestError).message);
      });

    return () => {
      isMounted = false;
    };
  }, [setError]);

  return { ...crud, specialties, displayedDoctors: crud.items };
}
