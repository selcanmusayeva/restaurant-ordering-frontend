import api from "./api";
import { Order, OrderStatus } from "../types";

export interface OrderItemRequest {
  menuItemId: number;
  quantity: number;
  specialInstructions: string;
}

export interface CreateOrderRequest {
  customerName: string;
  restaurantTableId: number;
  items: {
    menuItemId: number;
    quantity: number;
    specialInstructions?: string;
  }[];
}

export interface OrderStatusResponse {
  orderId: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  tableId: number;
  estimatedPreparationTime: string;
}

const orderService = {
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>("/orders", orderData);
    return response.data;
  },

  getTableOrders: async (
    tableId: number,
    sessionId: string
  ): Promise<Order[]> => {
    const response = await api.get<Order[]>(
      `/customer/table/${tableId}/orders?sessionId=${sessionId}`
    );
    return response.data;
  },

  getOrderStatus: async (orderId: number): Promise<string> => {
    const response = await api.get<OrderStatus>(`/orders/${orderId}/status`);
    return response.data;
  },

  getOrderById: async (orderId: number, userRole?: string): Promise<Order> => {
    console.log(`Getting order ${orderId} for user role: ${userRole}`);

    let endpoint = `/orders/${orderId}`;

    try {
      const response = await api.get<Order>(endpoint);
      console.log(
        `Successfully fetched order from ${endpoint}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching order from ${endpoint}:`, error);
      throw error;
    }
  },

  getOrdersReadyForDelivery: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>("/waiter/orders/ready");
    return response.data;
  },

  markOrderAsDelivered: async (id: number): Promise<Order> => {
    const response = await api.put<Order>(`/waiter/orders/${id}/delivered`);
    return response.data;
  },

  getIncomingOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>("/kitchen/orders");
    return response.data;
  },

  getAllOrders: async (): Promise<Order[]> => {
    console.log("Fetching all orders from working endpoints");
    try {
      const kitchenOrders = await api.get<Order[]>("/kitchen/orders");
      console.log(
        `Received ${kitchenOrders.data.length} orders from kitchen endpoint`
      );

      return kitchenOrders.data;
    } catch (error) {
      console.error("Error fetching all orders:", error);

      return [];
    }
  },

  getPendingOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>("/kitchen/orders/pending");
    return response.data;
  },

  getInProgressOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>("/kitchen/orders/in-progress");
    return response.data;
  },

  markOrderInPreparation: async (id: number): Promise<Order> => {
    console.log(`Marking order ${id} as in preparation`);
    try {
      const response = await api.put<Order>(
        `/kitchen/orders/${id}/preparation`
      );
      console.log(
        "Successfully marked order as in preparation:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Error marking order as in preparation:", error);
      throw error;
    }
  },

  markOrderReady: async (id: number): Promise<Order> => {
    console.log(`Marking order ${id} as ready`);
    try {
      const response = await api.put<Order>(`/kitchen/orders/${id}/ready`);
      console.log("Successfully marked order as ready:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error marking order as ready:", error);
      throw error;
    }
  },

  updateOrderStatus: async (
    orderId: number,
    status: string
  ): Promise<Order> => {
    const response = await api.put<Order>(
      `/orders/${orderId}/status?status=${status}`
    );
    return response.data;
  },

  getOrdersByTable: async (tableId: number): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/tables/${tableId}`);
    return response.data;
  },

  getOrdersByStatus: async (status: string): Promise<Order[]> => {
    console.log(`Fetching orders with status: ${status}`);

    let apiStatus = status;

    if (status === OrderStatus.IN_PROGRESS) {
      apiStatus = "IN_PROGRESS";
    }

    const response = await api.get<Order[]>(`/orders/status/${apiStatus}`);
    console.log(`Got ${response.data.length} orders with status ${status}`);
    return response.data;
  },

  getActiveOrders: async (): Promise<Order[]> => {
    return orderService
      .getOrdersByStatus("PENDING")
      .then(async (pendingOrders) => {
        const inProgressOrders = await orderService.getOrdersByStatus(
          "IN_PROGRESS"
        );
        const readyOrders = await orderService.getOrdersByStatus("READY");
        return [...pendingOrders, ...inProgressOrders, ...readyOrders];
      });
  },

  // Find an order by ID using the most appropriate endpoint
  findOrderById: async (
    orderId: number,
    userRole?: string
  ): Promise<Order | null> => {
    console.log(
      `Finding order with ID ${orderId} from all available endpoints, userRole: ${userRole}`
    );

    // Determine the best order of endpoints based on user role
    let endpoints = [
      `/kitchen/orders/${orderId}`, // Try kitchen first for chefs
      `/orders/${orderId}`, // Then general orders
      `/waiter/orders/${orderId}`, // Then waiter endpoint
    ];

    // If user is a chef, move kitchen endpoint to the front (should already be there)
    if (userRole === "CHEF") {
      console.log("User is a chef, prioritizing kitchen endpoints");
      // Already prioritized for chefs
    } else if (userRole === "WAITER") {
      // If user is a waiter, move waiter endpoint to the front
      console.log("User is a waiter, prioritizing waiter endpoints");
      endpoints = [
        `/waiter/orders/${orderId}`,
        `/kitchen/orders/${orderId}`,
        `/orders/${orderId}`,
      ];
    }

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await api.get<Order>(endpoint);
        console.log(`Success with endpoint: ${endpoint}`, response.data);
        return response.data;
      } catch (error) {
        console.error(`Failed with endpoint: ${endpoint}`, error);
        // Continue to next endpoint
      }
    }

    // If all endpoints fail, try to find the order in the existing orders
    try {
      console.log("Trying to get all orders and find the order by ID");
      // Use appropriate method based on role
      let allOrders: Order[] = [];

      if (userRole === "CHEF") {
        // Use chef-specific method for better targeting
        allOrders = await orderService.getChefOrders();
      } else {
        allOrders = await orderService.getAllOrders();
      }

      const foundOrder = allOrders.find((order) => order.id === orderId);

      if (foundOrder) {
        console.log("Found order in all orders", foundOrder);
        return foundOrder;
      }
    } catch (error) {
      console.error("Failed to get all orders", error);
    }

    console.error(`Order with ID ${orderId} not found in any endpoint`);
    return null;
  },

  // Get orders that a chef can see (pending and in-progress)
  getChefOrders: async (): Promise<Order[]> => {
    console.log("Fetching chef-specific orders (pending and in-progress)");
    try {
      const [pendingOrders, inProgressOrders] = await Promise.all([
        orderService.getPendingOrders(),
        orderService.getInProgressOrders(),
      ]);

      const combinedOrders = [...pendingOrders, ...inProgressOrders];
      console.log(`Found ${combinedOrders.length} chef-relevant orders`);
      return combinedOrders;
    } catch (error) {
      console.error("Error fetching chef orders:", error);
      return [];
    }
  },
};

export default orderService;
