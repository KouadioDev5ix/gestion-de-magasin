import { useMemo, useState } from 'react';

export const PAGE_SIZE = 10;

/**
 * Découpe une liste en pages. Revient à la page 1 quand `resetKey` change (recherche, filtre, tri),
 * et ne dépasse jamais la dernière page si la liste rétrécit.
 */
export function usePagination<T>(items: T[], resetKey: string, pageSize = PAGE_SIZE) {
  const [requestedPage, setPage] = useState(1);
  const [lastKey, setLastKey] = useState(resetKey);

  if (resetKey !== lastKey) {
    setLastKey(resetKey);
    setPage(1);
  }

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const pageItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize]);

  return { page, pageCount, pageItems, setPage };
}
