// User related types
export enum UserRole {
  MANAGER = 'MANAGER',
  WAITER = 'WAITER',
  CHEF = 'CHEF',
  CUSTOMER = 'CUSTOMER'
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  enabled: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Menu related types
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  available: boolean;
  imageUrl: string;
}

export interface Category {
  id: number;
  name: string;
  displayOrder: number;
  description: string;
  active: boolean;
}

// Order related types
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED', 
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  quantity: number;
  specialInstructions: string;
  priceAtTimeOfOrder: number;
  status: string;
}

export interface Order {
  id: number;
  restaurantTableId: number;
  tableNumber?: string;
  customer?: {
    id: number;
    name: string;
    email: string;
  };
  status: OrderStatus;
  items: OrderItem[];
  specialInstructions: string;
  createdAt: string;
  updatedAt: string;
  statusUpdates?: {
    id: number;
    status: OrderStatus;
    timestamp: string;
    updatedBy?: {
      id: number;
      name: string;
    };
  }[];
}

// Table related types
export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE'
}

export interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  qrCode: string;
  status: TableStatus;
}

export interface TableSession {
  sessionId: string;
  tableId: number;
  tableNumber: string;
  createdAt: string;
  expiresAt: string;
}

// Notification related types
export interface Notification {
  id: number;
  message: string;
  type: string;
  referenceId: number;
  referenceType: string;
  read: boolean;
  createdAt: string;
  targetUsername: string;
}

// Statistics and reports
export interface KitchenStatistics {
  totalOrdersToday: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  averagePreparationTime: string;
  ordersByMenuItem: Record<string, number>;
}

export interface SystemStatistics {
  totalActiveUsers: number;
  totalTablesOccupied: number;
  totalOrdersToday: number;
  totalOrdersInProgress: number;
  totalMenuItems: number;
  totalSalesToday: number;
  totalSalesWeek: number;
  totalSalesMonth: number;
  lastOrderTime: string;
  popularItems: Record<string, number>;
  salesByCategory: Record<string, number>;
  salesByHour: Record<string, number>;
} 