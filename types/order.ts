export type OrderReceipt = {
  id: string;
  createdAt: string;
  productSlug: string;
  productName: string;
  brand: string;
  category: string;
  quantity: number;
  total: number;
  customerName: string;
  customerPhone: string;
};
