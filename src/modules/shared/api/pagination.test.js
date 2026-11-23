import { describe, expect, it, vi } from 'vitest';
import { fetchAllPages, normalizePage, paginateItems } from './pagination';

describe('normalizePage', () => {
  it('normaliza la respuesta paginada del backend', () => {
    expect(
      normalizePage({
        pageSize: 10,
        pageIndex: 2,
        total: 11,
        data: [{ id: 1 }],
      })
    ).toEqual({ data: [{ id: 1 }], total: 11, pageIndex: 2, pageSize: 10 });
    expect(normalizePage(null, { pageIndex: 3, pageSize: 5 })).toEqual({
      data: [],
      total: 0,
      pageIndex: 3,
      pageSize: 5,
    });
  });
});

describe('paginateItems', () => {
  const items = Array.from({ length: 23 }, (_, i) => i + 1);

  it('pagina en el cliente con el mismo formato que el backend', () => {
    expect(paginateItems(items, 3, 10)).toEqual({
      data: [21, 22, 23],
      total: 23,
      pageIndex: 3,
      pageSize: 10,
    });
  });

  it('ajusta páginas fuera de rango', () => {
    expect(paginateItems(items, 99, 10).pageIndex).toBe(3);
    expect(paginateItems([], 2, 10)).toEqual({
      data: [],
      total: 0,
      pageIndex: 1,
      pageSize: 10,
    });
  });
});

describe('fetchAllPages', () => {
  it('recorre todas las páginas del endpoint', async () => {
    const all = Array.from({ length: 250 }, (_, i) => ({ id: i }));
    const fetchPage = vi.fn(async ({ pageSize, pageIndex }) => ({
      data: all.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
      total: all.length,
    }));

    await expect(fetchAllPages(fetchPage)).resolves.toHaveLength(250);
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });
});
