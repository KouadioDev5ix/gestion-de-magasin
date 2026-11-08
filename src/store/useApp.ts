import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { deletePhoto } from '@/lib/photos';
import { hashSecret, newId, newSalt } from '@/lib/security';
import type { Article, Category, PublicUser, Role, Sale, User } from './types';

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  { name: 'Téléphones', color: '#4F46E5', icon: 'smartphone' },
  { name: 'Coques & protections', color: '#0EA5E9', icon: 'shield' },
  { name: 'Chargeurs & câbles', color: '#F59E0B', icon: 'cable' },
  { name: 'Écouteurs & audio', color: '#D946EF', icon: 'headphones' },
  { name: 'Montres connectées', color: '#0F9D74', icon: 'watch' },
  { name: 'Accessoires divers', color: '#64748B', icon: 'package' },
];

export class AuthError extends Error {}

interface AppState {
  shopName: string;
  users: User[];
  sessionUserId: string | null;
  categories: Category[];
  articles: Article[];
  sales: Sale[];

  // --- Authentification ---
  registerOwner: (input: { shopName: string; name: string; username: string; password: string }) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (current: string, next: string) => Promise<void>;

  // --- Équipe ---
  addMember: (input: { name: string; username: string; password: string; role: Role }) => Promise<void>;
  resetMemberPassword: (userId: string, password: string) => Promise<void>;
  removeMember: (userId: string) => void;

  // --- Boutique ---
  setShopName: (name: string) => void;

  // --- Catégories ---
  addCategory: (input: { name: string; color: string; icon: string }) => Category;
  updateCategory: (id: string, patch: Partial<Pick<Category, 'name' | 'color' | 'icon'>>) => void;
  removeCategory: (id: string) => void;

  // --- Articles ---
  addArticle: (input: Pick<Article, 'id' | 'name' | 'categoryId' | 'price' | 'photoUri'>) => void;
  updateArticle: (id: string, patch: Partial<Pick<Article, 'name' | 'categoryId' | 'price' | 'photoUri'>>) => void;
  removeArticle: (id: string) => void;
  recordView: (id: string) => void;

  // --- Ventes ---
  addSale: (input: { articleId: string; quantity: number; unitPrice: number }) => void;
  /** Réservé au gérant */
  updateSale: (id: string, input: { articleId: string; quantity: number; unitPrice: number }) => void;
  /** Réservé au gérant */
  removeSale: (id: string) => void;

  /** Efface toutes les données de l'appareil (outil de développement). */
  resetAll: () => void;
}

const cleanUsername = (u: string) => u.trim().toLowerCase().replace(/\s+/g, '');

const nameTaken = (categories: Category[], name: string, exceptId?: string) =>
  categories.some((c) => c.id !== exceptId && c.name.trim().toLowerCase() === name.trim().toLowerCase());

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      shopName: '',
      users: [],
      sessionUserId: null,
      categories: [],
      articles: [],
      sales: [],

      registerOwner: async ({ shopName, name, username, password }) => {
        if (get().users.length > 0) throw new AuthError('Une boutique existe déjà sur cet appareil.');
        const salt = newSalt();
        const owner: User = {
          id: newId(),
          name: name.trim(),
          username: cleanUsername(username),
          salt,
          passwordHash: await hashSecret(password, salt),
          role: 'admin',
          createdAt: Date.now(),
        };
        const now = Date.now();
        set({
          shopName: shopName.trim(),
          users: [owner],
          sessionUserId: owner.id,
          categories: DEFAULT_CATEGORIES.map((c, i) => ({ ...c, id: newId(), createdAt: now + i })),
        });
      },

      login: async (username, password) => {
        const user = get().users.find((u) => u.username === cleanUsername(username));
        if (!user) throw new AuthError('Identifiant ou mot de passe incorrect.');
        const hash = await hashSecret(password, user.salt);
        if (hash !== user.passwordHash) throw new AuthError('Identifiant ou mot de passe incorrect.');
        set({ sessionUserId: user.id });
      },

      logout: () => set({ sessionUserId: null }),

      changePassword: async (current, next) => {
        const { users, sessionUserId } = get();
        const user = users.find((u) => u.id === sessionUserId);
        if (!user) throw new AuthError('Session expirée.');
        if ((await hashSecret(current, user.salt)) !== user.passwordHash) {
          throw new AuthError('Mot de passe actuel incorrect.');
        }
        const salt = newSalt();
        const passwordHash = await hashSecret(next, salt);
        set({ users: users.map((u) => (u.id === user.id ? { ...u, salt, passwordHash } : u)) });
      },

      addMember: async ({ name, username, password, role }) => {
        const clean = cleanUsername(username);
        if (get().users.some((u) => u.username === clean)) {
          throw new AuthError('Cet identifiant est déjà utilisé.');
        }
        const salt = newSalt();
        const member: User = {
          id: newId(),
          name: name.trim(),
          username: clean,
          salt,
          passwordHash: await hashSecret(password, salt),
          role,
          createdAt: Date.now(),
        };
        set({ users: [...get().users, member] });
      },

      resetMemberPassword: async (userId, password) => {
        const salt = newSalt();
        const passwordHash = await hashSecret(password, salt);
        set({ users: get().users.map((u) => (u.id === userId ? { ...u, salt, passwordHash } : u)) });
      },

      removeMember: (userId) => {
        const { users, sessionUserId } = get();
        const target = users.find((u) => u.id === userId);
        if (!target || userId === sessionUserId) return;
        if (target.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) return;
        set({ users: users.filter((u) => u.id !== userId) });
      },

      setShopName: (name) => set({ shopName: name.trim() }),

      addCategory: ({ name, color, icon }) => {
        if (nameTaken(get().categories, name)) throw new Error('Cette catégorie existe déjà.');
        const category: Category = { id: newId(), name: name.trim(), color, icon, createdAt: Date.now() };
        set({ categories: [...get().categories, category] });
        return category;
      },

      updateCategory: (id, patch) => {
        if (patch.name && nameTaken(get().categories, patch.name, id)) {
          throw new Error('Cette catégorie existe déjà.');
        }
        set({
          categories: get().categories.map((c) =>
            c.id === id ? { ...c, ...patch, name: patch.name?.trim() ?? c.name } : c,
          ),
        });
      },

      removeCategory: (id) =>
        set({
          categories: get().categories.filter((c) => c.id !== id),
          articles: get().articles.map((a) => (a.categoryId === id ? { ...a, categoryId: null } : a)),
        }),

      addArticle: (input) => {
        const now = Date.now();
        const article: Article = {
          ...input,
          name: input.name.trim(),
          createdAt: now,
          updatedAt: now,
          views: 0,
          lastViewedAt: null,
        };
        set({ articles: [article, ...get().articles] });
      },

      updateArticle: (id, patch) => {
        const prev = get().articles.find((a) => a.id === id);
        if (prev && patch.photoUri !== undefined && patch.photoUri !== prev.photoUri) {
          deletePhoto(prev.photoUri);
        }
        set({
          articles: get().articles.map((a) =>
            a.id === id ? { ...a, ...patch, name: patch.name?.trim() ?? a.name, updatedAt: Date.now() } : a,
          ),
        });
      },

      removeArticle: (id) => {
        const prev = get().articles.find((a) => a.id === id);
        deletePhoto(prev?.photoUri);
        set({ articles: get().articles.filter((a) => a.id !== id) });
      },

      resetAll: () => {
        get().articles.forEach((a) => deletePhoto(a.photoUri));
        set({ shopName: '', users: [], sessionUserId: null, categories: [], articles: [], sales: [] });
      },

      addSale: ({ articleId, quantity, unitPrice }) => {
        const { articles, users, sessionUserId, sales } = get();
        const article = articles.find((a) => a.id === articleId);
        const seller = users.find((u) => u.id === sessionUserId);
        if (!article) throw new Error('Cet article n’existe plus.');
        if (!seller) throw new AuthError('Session expirée.');
        const sale: Sale = {
          id: newId(),
          articleId,
          articleName: article.name,
          unitPrice,
          quantity,
          sellerId: seller.id,
          sellerName: seller.name,
          createdAt: Date.now(),
        };
        set({ sales: [sale, ...sales] });
      },

      updateSale: (id, { articleId, quantity, unitPrice }) => {
        const { articles, users, sessionUserId, sales } = get();
        if (users.find((u) => u.id === sessionUserId)?.role !== 'admin') return;
        const sale = sales.find((s) => s.id === id);
        if (!sale) return;
        // Le nom figé n'est remplacé que si l'article vendu change réellement
        let articleName = sale.articleName;
        if (articleId !== sale.articleId) {
          const article = articles.find((a) => a.id === articleId);
          if (!article) throw new Error('Cet article n’existe plus.');
          articleName = article.name;
        }
        // La date et le vendeur d'origine sont conservés
        set({ sales: sales.map((s) => (s.id === id ? { ...s, articleId, articleName, quantity, unitPrice } : s)) });
      },

      removeSale: (id) => {
        const { users, sessionUserId, sales } = get();
        if (users.find((u) => u.id === sessionUserId)?.role !== 'admin') return;
        set({ sales: sales.filter((s) => s.id !== id) });
      },

      recordView: (id) =>
        set({
          articles: get().articles.map((a) =>
            a.id === id ? { ...a, views: a.views + 1, lastViewedAt: Date.now() } : a,
          ),
        }),
    }),
    {
      name: 'gestcom-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Utilisateur connecté, sans les données sensibles */
export function useCurrentUser(): PublicUser | null {
  return useApp((s) => {
    const u = s.users.find((x) => x.id === s.sessionUserId);
    return u ?? null;
  });
}

export function useIsAdmin(): boolean {
  return useApp((s) => s.users.find((x) => x.id === s.sessionUserId)?.role === 'admin');
}

export function useHasAccount(): boolean {
  return useApp((s) => s.users.length > 0);
}

export function useCategoryMap(): Record<string, Category> {
  const categories = useApp((s) => s.categories);
  return useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
}
