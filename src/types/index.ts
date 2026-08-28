export type Category = 'ESPETINHOS' | 'BEBIDAS' | 'CACHACAS' | 'CALDOS' | 'ADICIONAIS';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  tableNumber: string;
  responsibleName: string;
  waiterName: string;
  items: OrderItem[];
  status: 'OPEN' | 'CLOSED';
  total: number;
  createdAt: Date;
}

export interface CashTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  date: Date;
}

export interface DailyProduction {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  date: Date;
}
