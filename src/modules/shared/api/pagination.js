// Normaliza las respuestas paginadas del backend: { pageSize, pageIndex, total, data }.
export function normalizePage(payload, queryParams = {}) {
  const items = Array.isArray(payload?.data) ? payload.data : [];

  return {
    data: items,
    total: payload?.total ?? items.length,
    pageIndex: payload?.pageIndex ?? queryParams.pageIndex ?? 1,
    pageSize: payload?.pageSize ?? queryParams.pageSize ?? 10,
  };
}
