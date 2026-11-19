import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
} from '../services/doctorsApi';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getApiError } from '../../shared/api/apiError';
import useAuth from '../../auth/hook/useAuth';
import { ROLES } from '../../auth/helpers/roles';
import PageHeader from '../../shared/components/PageHeader';
import SearchInput from '../../shared/components/SearchInput';
import DoctorFormCard from '../components/DoctorFormCard';
import DoctorsTable from '../components/DoctorsTable';

const PAGE_SIZE = 10;
const emptyForm = { name: '', licenseNumber: '', specialtyId: '' };

// Mismas reglas que DoctorService.ValidateRequest del backend.
function validateDoctor(form) {
  const errors = {};
  const name = form.name.trim();
  const license = form.licenseNumber.trim();

  if (name.length < 3 || name.length > 100) {
    errors.name =
      'El nombre es obligatorio y debe tener entre 3 y 100 caracteres.';
  }

  if (!license) {
    errors.licenseNumber = 'El número de licencia es obligatorio.';
  } else if (license.length > 50) {
    errors.licenseNumber =
      'El número de licencia no puede superar los 50 caracteres.';
  }

  if (!String(form.specialtyId).trim()) {
    errors.specialtyId = 'Seleccioná una especialidad.';
  }

  return errors;
}

function DoctorsPage() {
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [result, setResult] = useState({
    data: [],
    total: 0,
    pageIndex: 1,
    pageSize: PAGE_SIZE,
  });
  const [specialties, setSpecialties] = useState([]);
  const [name, setName] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(
    () => searchParams.get('action') === 'create'
  );
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreating(true);
      setEditingId(null);
      setForm(emptyForm);
      setFieldErrors({});
    }
  }, [searchParams]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const trimmedName = name.trim();
      const response = await getDoctors({
        pageSize: PAGE_SIZE,
        pageIndex,
        ...(trimmedName.length >= 3 ? { name: trimmedName } : {}),
      });

      setResult(response);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [pageIndex, name]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAdmin) {
      getSpecialties({ pageSize: 100, pageIndex: 1 })
        .then((page) => setSpecialties(page.data))
        .catch((requestError) => setError(getApiError(requestError).message));
    }
  }, [isAdmin]);

  const closeForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm(emptyForm);
    setFieldErrors({});
    setError('');

    if (searchParams.get('action')) {
      setSearchParams({});
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFieldErrors({});
    setError('');
    setMessage('');
    setIsCreating(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      licenseNumber: item.licenseNumber || '',
      specialtyId: item.specialty?.id ?? '',
    });
    setFieldErrors({});
    setError('');
    setMessage('');
    setIsCreating(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const errors = validateDoctor(form);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      if (editingId) await updateDoctor(editingId, form);
      else await createDoctor(form);

      const successMessage = editingId
        ? 'Médico actualizado correctamente.'
        : 'Médico registrado correctamente.';

      closeForm();
      setMessage(successMessage);
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setSaving(false);
    }
  };

  // Baja lógica: DELETE /api/doctors/{id} (el backend marca la columna deleted).
  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este médico?')) return;

    setError('');
    setMessage('');
    try {
      await deleteDoctor(id);
      setMessage('Médico eliminado correctamente.');
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  // El backend filtra por nombre a partir de 3 caracteres; con 1 o 2 se filtra la página actual.
  const trimmedFilter = name.trim().toLowerCase();
  const matchesFilter = (doc) =>
    (doc.name || '').toLowerCase().includes(trimmedFilter);
  const displayedDoctors =
    trimmedFilter.length > 0 && trimmedFilter.length < 3
      ? result.data.filter(matchesFilter)
      : result.data;

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  if (isCreating && isAdmin) {
    return (
      <DoctorFormCard
        form={form}
        specialties={specialties}
        error={error}
        fieldErrors={fieldErrors}
        isEditing={Boolean(editingId)}
        saving={saving}
        onChange={(nextForm) => {
          setForm(nextForm);
          setFieldErrors({});
        }}
        onSubmit={submit}
        onCancel={closeForm}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Directorio de Doctores"
        subtitle="Gestione el personal médico y supervise su disponibilidad actual."
        actions={
          <>
            <SearchInput
              value={name}
              placeholder="Buscar doctor por nombre..."
              onChange={(value) => {
                setName(value);
                setPageIndex(1);
              }}
            />

            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/admin/availability')}
                  className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition"
                >
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Agregar Disponibilidad Horaria</span>
                </button>

                <button
                  type="button"
                  onClick={openCreateForm}
                  className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold px-4 py-2 rounded-lg text-xs transition"
                >
                  + Nuevo Doctor
                </button>
              </>
            )}
          </>
        }
      />

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700"
        >
          {message}
        </div>
      )}

      <DoctorsTable
        doctors={displayedDoctors}
        loading={loading}
        isAdmin={isAdmin}
        onViewAvailability={(id) =>
          navigate(`/admin/availability?doctorId=${id}`)
        }
        onEdit={handleEdit}
        onDelete={remove}
        pagination={{
          currentPage: result.pageIndex,
          totalPages,
          totalItems: result.total,
          pageSize: result.pageSize,
          onPageChange: setPageIndex,
        }}
      />
    </div>
  );
}

export default DoctorsPage;
