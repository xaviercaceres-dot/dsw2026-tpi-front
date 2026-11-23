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

// Recorre todas las páginas de un endpoint paginado (fetchPage recibe { pageSize, pageIndex }).
export async function fetchAllPages(fetchPage, pageSize = 100) {
  const first = await fetchPage({ pageSize, pageIndex: 1 });
  const items = [...first.data];
  const totalPages = Math.ceil(first.total / pageSize);

  for (let pageIndex = 2; pageIndex <= totalPages; pageIndex += 1) {
    const next = await fetchPage({ pageSize, pageIndex });

    items.push(...next.data);
  }

  return items;
}

// Pagina en el cliente una lista ya filtrada, con el mismo formato que normalizePage.
export function paginateItems(items, pageIndex = 1, pageSize = 10) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, pageIndex), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    data: items.slice(start, start + pageSize),
    total,
    pageIndex: currentPage,
    pageSize,
  };
}
