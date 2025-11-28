

export enum OrderStatus {
  PENDING = 'In Attesa',
  PAID = 'Pagato',
  COMPLETED = 'Completato',
  SHIPPED = 'Spedito'
}

// Relation Interfaces
export interface CategoryData {
  id: number;
  attributes: {
    nome: string;
    slug?: string;
  }
}

export interface AnimalData {
  id: number;
  attributes: {
    nome: string;
    slug?: string;
  }
}

// Product Variant Interface
export interface ProductVariant {
  id: number;
  attributes: {
    nome_variante: string;
    prezzo_aggiuntivo: number;
    peso_kg?: number;
    prezzo_scontato?: number;
    opzioni?: Record<string, any>;
    stock?: number;
    barcode?: string;
  }
}

// Product Interface
export interface Product {
  id: number;
  attributes: {
    nome: string;
    prezzo: number;
    prezzo_scontato?: number;
    descrizione: string;
    // Changed from Enum to String (mapped from relation) for easier frontend display
    categoria: string;
    animale: string;
    is_service: boolean;
    is_featured?: boolean;
    immagine: string;
    galleria?: string[];
    variants?: ProductVariant[];
    stock?: number;
    barcode?: string;
  }
}

// Cart Item Interface
export interface CartItem extends Product {
  quantity: number;
  serviceDate?: string;
  serviceNotes?: string;
  selectedVariant?: ProductVariant;
}

// User Interface
export interface User {
  id: number;
  username: string;
  email: string;
  nome_completo?: string;
  indirizzo?: string;
  note_indirizzo?: string;
  citta?: string;
  cap?: string;
  telefono?: string;
  info_extra?: string;
  created_at?: string;
}

// Wishlist Interface
export interface Wishlist {
  id: number;
  user_id: number;
  product_ids: number[];
  is_active: boolean;
}

// Order Interface
export interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  variant_name?: string;
  image_url?: string;
}

export interface Order {
  id: number;
  date: string;
  total: number;
  status: OrderStatus;
  stripe_id?: string;
  items: OrderItem[];
  shipping_address?: string;
}