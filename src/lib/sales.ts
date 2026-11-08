import { AppState } from 'react-native';
import { useSyncExternalStore } from 'react';

import type { Sale } from '@/store/types';
import { startOfDay } from './format';

export const saleTotal = (s: Sale) => s.unitPrice * s.quantity;

/** Total encaissé, nombre d'articles vendus et nombre de ventes */
export function summarize(sales: Sale[]) {
  let total = 0;
  let items = 0;
  for (const s of sales) {
    total += saleTotal(s);
    items += s.quantity;
  }
  return { total, items, count: sales.length };
}

const subscribeToday = (cb: () => void) => {
  const sub = AppState.addEventListener('change', cb);
  const timer = setInterval(cb, 60_000);
  return () => {
    sub.remove();
    clearInterval(timer);
  };
};
const getToday = () => startOfDay(Date.now());

/** Début de la journée en cours ; se met à jour au passage de minuit, même si l'app reste ouverte. */
export function useToday(): number {
  return useSyncExternalStore(subscribeToday, getToday, getToday);
}
