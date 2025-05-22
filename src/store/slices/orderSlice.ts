import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Order, OrderStatus } from "../../types";
import orderService, {
  CreateOrderRequest,
  OrderStatusResponse,
} from "../../services/order";
import { RootState } from "../../store";

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  specialInstructions: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  cart: CartItem[];
  orderStatus: OrderStatusResponse | null;
  tableSession: {
    tableId: number;
    sessionId: string;
    tableUuid?: string;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  cart: [],
  orderStatus: null,
  tableSession: null,
  loading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (
    {
      tableId,
      sessionId,
      orderData,
    }: { tableId: number; sessionId: string; orderData: CreateOrderRequest },
    { rejectWithValue }
  ) => {
    try {
      const order = await orderService.createOrder(orderData);
      return order;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);

export const getTableOrders = createAsyncThunk(
  "order/getTableOrders",
  async (
    { tableId, sessionId }: { tableId: number; sessionId: string },
    { rejectWithValue }
  ) => {
    try {
      const orders = await orderService.getTableOrders(tableId, sessionId);
      return orders;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch table orders"
      );
    }
  }
);

export const getOrderStatus = createAsyncThunk(
  "order/getOrderStatus",
  async (
    { orderId, sessionId }: { orderId: number; sessionId: string },
    { rejectWithValue }
  ) => {
    try {
      const status = await orderService.getOrderStatus(orderId);
      return status;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order status"
      );
    }
  }
);

export const getOrdersReadyForDelivery = createAsyncThunk(
  "order/getOrdersReadyForDelivery",
  async (_, { rejectWithValue }) => {
    try {
      const orders = await orderService.getOrdersReadyForDelivery();
      return orders;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch orders ready for delivery"
      );
    }
  }
);

export const markOrderAsDelivered = createAsyncThunk(
  "order/markOrderAsDelivered",
  async (id: number, { rejectWithValue }) => {
    try {
      const order = await orderService.markOrderAsDelivered(id);
      return order;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark order as delivered"
      );
    }
  }
);

export const getIncomingOrders = createAsyncThunk(
  "order/getIncomingOrders",
  async (_, { rejectWithValue }) => {
    try {
      const orders = await orderService.getIncomingOrders();
      return orders;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch incoming orders"
      );
    }
  }
);

export const getPendingOrders = createAsyncThunk(
  "order/getPendingOrders",
  async (_, { rejectWithValue }) => {
    try {
      const orders = await orderService.getPendingOrders();
      return orders;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending orders"
      );
    }
  }
);

export const getInProgressOrders = createAsyncThunk(
  "order/getInProgressOrders",
  async (_, { rejectWithValue }) => {
    try {
      const orders = await orderService.getInProgressOrders();
      return orders;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch in-progress orders"
      );
    }
  }
);

export const markOrderInPreparation = createAsyncThunk(
  "order/markOrderInPreparation",
  async (id: number, { rejectWithValue }) => {
    try {
      const order = await orderService.markOrderInPreparation(id);
      return order;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark order in preparation"
      );
    }
  }
);

export const markOrderReady = createAsyncThunk(
  "order/markOrderReady",
  async (id: number, { rejectWithValue }) => {
    try {
      const order = await orderService.markOrderReady(id);
      return order;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark order as ready"
      );
    }
  }
);

export const fetchCustomerOrders = createAsyncThunk(
  "order/fetchCustomerOrders",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { activeSession } = state.session;

      if (!activeSession) {
        throw new Error("No active table session");
      }

      const response = await orderService.getTableOrders(
        activeSession.tableId,
        activeSession.sessionId
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "order/fetchOrderById",
  async (orderId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userRole = state.auth.user?.role;
      const order = await orderService.getOrderById(orderId, userRole);
      return order;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order"
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async (
    { orderId, status }: { orderId: number; status: OrderStatus },
    { rejectWithValue, getState }
  ) => {
    try {
      let response;
      
      // Get user role
      const state = getState() as RootState;
      const userRole = state.auth.user?.role;
      
      console.log(`Attempting to update order ${orderId} to status: ${status} by ${userRole}`);

      // If user is a chef, use chef-specific endpoints
      if (userRole === 'CHEF') {
        console.log('Using chef-specific endpoints for status update');
        
        switch (status) {
          case OrderStatus.IN_PROGRESS:
            response = await orderService.markOrderInPreparation(orderId);
            break;
          case OrderStatus.READY:
            response = await orderService.markOrderReady(orderId);
            break;
          default:
            throw new Error(`Chef users can only change orders to IN_PROGRESS or READY status`);
        }
      } else {
        // For non-chef users
        switch (status) {
          case OrderStatus.IN_PROGRESS:
            response = await orderService.markOrderInPreparation(orderId);
            break;
          case OrderStatus.READY:
            response = await orderService.markOrderReady(orderId);
            break;
          case OrderStatus.DELIVERED:
            response = await orderService.markOrderAsDelivered(orderId);
            break;
          case OrderStatus.CANCELLED:
          case OrderStatus.PENDING:
          case OrderStatus.COMPLETED:
            response = await orderService.updateOrderStatus(orderId, status);
            break;
          default:
            throw new Error(`Unsupported order status update: ${status}`);
        }
      }

      console.log("Status update response:", response);
      return response;
    } catch (error: any) {
      console.error("Failed to update order status:", error);
      return rejectWithValue(
        error.message ||
          `Failed to update order status to ${status}`
      );
    }
  }
);

export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (filterType: string | undefined = "all", { rejectWithValue, getState }) => {
    try {
      console.log(`Fetching orders with filter: ${filterType || "all"}`);
      
      // Get user role for role-specific optimizations
      const state = getState() as RootState;
      const userRole = state.auth.user?.role;
      console.log('User role for fetchOrders:', userRole);
      
      // Special handling for chefs - they only need pending/in-progress orders
      if (userRole === 'CHEF' && (filterType === 'all' || !filterType)) {
        console.log('Chef user detected, using chef-specific endpoints');
        const orders = await orderService.getChefOrders();
        return { orders, filterType };
      }
      
      let orders: Order[] = [];

      if (!filterType || filterType === "all") {
        orders = await orderService.getAllOrders();
      } else {
        switch (filterType) {
          case "pending":
            orders = await orderService.getPendingOrders();
            break;
          case "inProgress":
            orders = await orderService.getInProgressOrders();
            break;
          case "ready":
            orders = await orderService.getOrdersByStatus(OrderStatus.READY);
            break;
          case "delivered":
            orders = await orderService.getOrdersByStatus(
              OrderStatus.DELIVERED
            );
            break;
          case "cancelled":
            orders = await orderService.getOrdersByStatus(
              OrderStatus.CANCELLED
            );
            break;
          default:
            orders = await orderService.getAllOrders();
        }
      }

      console.log(
        `Fetched ${orders.length} orders with filter ${filterType || "all"}`
      );
      return { orders, filterType };
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setTableSession: (
      state,
      action: PayloadAction<{
        tableId: number;
        sessionId: string;
        tableUuid?: string;
      }>
    ) => {
      state.tableSession = action.payload;
    },
    clearTableSession: (state) => {
      state.tableSession = null;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItemIndex = state.cart.findIndex(
        (item) => item.menuItemId === action.payload.menuItemId
      );

      if (existingItemIndex !== -1) {
        state.cart[existingItemIndex].quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    updateCartItem: (
      state,
      action: PayloadAction<{
        menuItemId: number;
        quantity: number;
        specialInstructions: string;
      }>
    ) => {
      const { menuItemId, quantity, specialInstructions } = action.payload;
      const itemIndex = state.cart.findIndex(
        (item) => item.menuItemId === menuItemId
      );

      if (itemIndex !== -1) {
        if (quantity <= 0) {
          state.cart = state.cart.filter(
            (item) => item.menuItemId !== menuItemId
          );
        } else {
          state.cart[itemIndex].quantity = quantity;
          state.cart[itemIndex].specialInstructions = specialInstructions;
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cart = state.cart.filter(
        (item) => item.menuItemId !== action.payload
      );
    },
    clearCart: (state) => {
      state.cart = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders.push(action.payload);
        state.cart = [];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getTableOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTableOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getTableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderStatus.fulfilled, (state, action) => {
        state.loading = false;

        state.orderStatus = action.payload as unknown as OrderStatusResponse;
      })
      .addCase(getOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getOrdersReadyForDelivery.fulfilled, (state, action) => {
        state.orders = action.payload;
      })

      .addCase(markOrderAsDelivered.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })

      .addCase(getIncomingOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })

      .addCase(getPendingOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })

      .addCase(getInProgressOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })

      .addCase(markOrderInPreparation.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })

      .addCase(markOrderReady.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })

      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentOrder = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentOrder = null;
      })

      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.orders = [];
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setTableSession,
  clearTableSession,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  clearError,
} = orderSlice.actions;

export default orderSlice.reducer;
