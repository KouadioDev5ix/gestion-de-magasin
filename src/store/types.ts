export type Role = 'admin' | 'vendeur';

export interface User {
  id: string;
  name: string;
  /** Identifiant de connexion (numéro de téléphone ou pseudo), en minuscules */
  username: string;
  passwordHash: string;
  salt: string;
  role: Role;
  createdAt: number;
}

export type PublicUser = Omit<User, 'passwordHash' | 'salt'>;

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
}

export interface Article {
  id: string;
  name: string;
  categoryId: string | null;
  price: number;
  photoUri: string | null;
  createdAt: number;
  updatedAt: number;
  /** Nombre de consultations de la fiche par les vendeurs */
  views: number;
  lastViewedAt: number | null;
}

/** Ligne du cahier de ventes. Nom, prix et vendeur sont figés au moment de la vente. */
export interface Sale {
  id: string;
  articleId: string;
  articleName: string;
  unitPrice: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
  createdAt: number;
}

export type SortKey = 'recent' | 'name' | 'price-asc' | 'price-desc';
