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
import PageHeader from '../../shared/components/PageHeader';
import SearchInput from '../../shared/components/SearchInput';
import DoctorFormCard from '../components/DoctorFormCard';
import DoctorsTable from '../components/DoctorsTable';

const emptyForm = { name: '', licenseNumber: '', specialtyId: '' };

function DoctorsPage() {
  const { role } = useAuth();
  const isAdmin = role === 'Administrador';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [result, setResult] = useState({
    data: [],
    total: 0,
    pageIndex: 1,
    pageSize: 10,
  });
  const [specialties, setSpecialties] = useState([]);
  const [name, setName] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(
    () => searchParams.get('action') === 'create'
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreating(true);
      setEditingId(null);
      setForm(emptyForm);
    }
  }, [searchParams]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const trimmedName = name.trim();
      const response = await getDoctors({
        pageSize: 10,
        pageIndex,
        ...(trimmedName.length >= 3 ? { name: trimmedName } : {}),
      });
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setResult({
        data: items,
        total: response?.total ?? items.length,
        pageIndex: response?.pageIndex ?? pageIndex,
        pageSize: response?.pageSize ?? 10,
      });
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
        .then((data) =>
          setSpecialties(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.data)
                ? data.data
                : []
          )
        )
        .catch((requestError) => setError(getApiError(requestError).message));
    }
  }, [isAdmin]);

  const closeForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');

    if (searchParams.get('action')) {
      setSearchParams({});
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setIsCreating(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      licenseNumber: item.licenseNumber || item.license_number || '',
      specialtyId: item.specialty?.id ?? item.specialtyId ?? '',
    });
    setIsCreating(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const trimmedName = form.name.trim();
    const trimmedLicense = form.licenseNumber.trim();

    if (
      trimmedName.length < 3 ||
      !trimmedLicense ||
      !String(form.specialtyId).trim()
    ) {
      setError(
        'Completá nombre (mín. 3 caracteres), matrícula y especialidad.'
      );

      return;
    }

    try {
      const payload = {
        name: trimmedName,
        licenseNumber: trimmedLicense,
        license_number: trimmedLicense,
        specialtyId: form.specialtyId,
      };

      if (editingId) await updateDoctor(editingId, payload);
      else await createDoctor(payload);

      closeForm();
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este médico?')) return;

    try {
      await deleteDoctor(id);
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

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
        onChange={setForm}
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
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
