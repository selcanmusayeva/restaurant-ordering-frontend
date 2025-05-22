// Add these types for Order and OrderItem
export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItem: {
    id: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    menuId: number;
    categoryName: string;
    available: boolean;
    imageUrl: string | null;
    imageName: string | null;
    imageContentType: string | null;
    imageSize: number | null;
  };
  quantity: number;
  specialInstructions: string;
  priceAtTimeOfOrder: number;
  status: string;
}

export interface Order {
  id: number;
  restaurantTableId?: number;
  tableNumber?: number;
  customerName?: string;
  customer?: {
    id?: number;
    name?: string;
    email?: string;
  };
  status: string;
  specialInstructions?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  items: OrderItem[];
  total?: number;
  statusUpdates?: Array<{
    id: number;
    status: string;
    timestamp: string;
    updatedBy?: {
      id: number;
      name: string;
    };
  }>;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  MANAGER = 'MANAGER',
  WAITER = 'WAITER',
  CHEF = 'CHEF'
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  enabled?: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  menuId: number;
  available: boolean;
  displayOrder: number;
  categoryName?: string;
  imageUrl?: string;
  imageName?: string;
  imageContentType?: string;
  imageSize?: number;
}

export interface Category {
  id: number;
  name: string;
  displayOrder: number;
  description?: string;
  active: boolean;
}

export interface TableSession {
  tableId: number;
  sessionId: string;
  expiresAt: string;
}

export interface Table {
  id: number;
  tableNumber: number;
  seats: number;
  status: TableStatus;
  capacity?: number;
  qrCode?: string;
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  NEEDS_CLEANING = 'NEEDS_CLEANING',
  MAINTENANCE = 'MAINTENANCE'
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface KitchenStatistics {
  pendingOrders: number;
  inProgressOrders: number;
  readyOrders: number;
  completedOrders: number;
  averagePreparationTime: number;
  mostOrderedItems: Array<{name: string; count: number}>;
  ordersByMenuItem: Record<string, number>;
}

export interface SystemStatistics {
  totalOrders: number;
  totalRevenue: number;
  totalActiveUsers: number;
  totalTablesOccupied: number;
  totalOrdersToday: number;
  totalSalesToday: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByDay: Array<{date: string; revenue: number}>;
  popularItems: Record<string, number>;
  salesByCategory: Record<string, number>;
} 