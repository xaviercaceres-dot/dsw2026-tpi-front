import {
  createSpecialty,
  deleteSpecialty,
  getSpecialties,
  updateSpecialty,
} from '../services/specialtiesApi';
import { useCrudList } from '../../shared/hooks/useCrudList';

const EMPTY_FORM = { name: '', description: '' };
const MESSAGES = {
  created: 'Especialidad registrada correctamente.',
  updated: 'Especialidad actualizada correctamente.',
  deleted: 'Especialidad eliminada correctamente.',
};

// Valores iniciales del formulario a partir del DTO del backend.
function toFormValues(specialty) {
  return {
    name: specialty.name ?? '',
    description: specialty.description ?? '',
  };
}

// El acceso por rol lo resuelve ProtectedRoute: esta pantalla solo la abre el administrador.
export function useSpecialties() {
  const crud = useCrudList({
    fetchPage: getSpecialties,
    createItem: createSpecialty,
    updateItem: updateSpecialty,
    deleteItem: deleteSpecialty,
    toFormValues,
    emptyForm: EMPTY_FORM,
    messages: MESSAGES,
  });

  return { ...crud, displayedSpecialties: crud.items };
}
