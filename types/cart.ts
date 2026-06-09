export type CartItem = {
  productSlug: string;
  quantity: number;
};

export const cartStorageKey = "urban-grooming-cart";
export const ordersStorageKey = "urban-grooming-orders";
