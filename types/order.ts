export type OrderReceiptItem = {
  productSlug: string;
  productName: string;
  brand: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
};

export type OrderReceipt = {
  id: string;
  createdAt: string;
  items: OrderReceiptItem[];
  total: number;
  customerName: string;
  customerPhone: string;
};
