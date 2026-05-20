export interface ProductPrices {
  full: number | null;
  retail: number | null;
  500: number | null;
  250: number | null;
  100: number | null;
  50: number | null;
}

export interface Stock {
  bottles: number;
  openMl: number;
  totalMl: number;
}

export interface Product {
  segment: string;
  brand: string;
  name: string;
  volume: number;
  prices: ProductPrices;
  stock: Stock | null;
}
