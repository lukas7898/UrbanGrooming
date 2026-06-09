export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  stockStatus: string;
  stockQuantity: number;
  imageUrl: string;
  shortDescription: string;
  description: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
};
