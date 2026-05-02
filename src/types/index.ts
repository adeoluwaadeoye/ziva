export type Gender = "women" | "men" | "unisex";
export type Category =
  | "ankara" | "aso-oke" | "kaftan" | "gown" | "cord"
  | "adire" | "agbada" | "senator" | "dashiki" | "native-shirt" | "linen";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  gender: Gender;
  category: Category;
  description: string;
  sizes: string[];
  colors: string[];
  fabrics?: string[];
  isNew?: boolean;
  isSale?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  tag?: string;
}

export interface Measurements {
  chest: string;
  waist: string;
  hips: string;
  height: string;
  sleeve: string;
  notes: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  selectedFabric?: string;
  measurements?: Measurements;
  isCustomTailored?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}
