import { useMemo, useState } from 'react';

export function usePagination(items = [], pageSize = 10, initialPage = 1) {
  const [rawPage, setCurrentPage] = useState(initialPage);

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const totalItems = safeItems.length;
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, rawPage), totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * safePageSize;

    return safeItems.slice(start, start + safePageSize);
  }, [safeItems, currentPage, safePageSize]);

  const handlePageChange = (nextPage) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);

    setCurrentPage(clamped);
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    totalItems,
    pageSize: safePageSize,
    setCurrentPage,
    handlePageChange,
  };
}

export default usePagination;
