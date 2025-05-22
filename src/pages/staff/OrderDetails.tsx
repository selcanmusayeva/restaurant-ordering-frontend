import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { updateOrderStatus } from "../../store/slices/orderSlice";
import StaffRoute from "../../components/routes/StaffRoute";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import { OrderStatus, UserRole, Order, OrderItem } from "../../types";
import orderService from "../../services/order";

const getStatusVariant = (status: string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "warning";
    case OrderStatus.IN_PROGRESS:
      return "info";
    case OrderStatus.READY:
      return "success";
    case OrderStatus.COMPLETED:
      return "success";
    case OrderStatus.DELIVERED:
      return "success";
    case OrderStatus.CANCELLED:
      return "danger";
    default:
      return "secondary";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "Pending";
    case OrderStatus.IN_PROGRESS:
      return "In Progress";
    case OrderStatus.READY:
      return "Ready";
    case OrderStatus.COMPLETED:
      return "Completed";
    case OrderStatus.DELIVERED:
      return "Delivered";
    case OrderStatus.CANCELLED:
      return "Cancelled";
    default:
      return status;
  }
};

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        setError("Order ID is missing");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(
          `Fetching order with ID: ${orderId}, Role: ${user?.role || "undefined"}`
        );

        const orderData = await orderService.getOrderById(
          parseInt(orderId),
          user?.role || UserRole.WAITER
        );
        setOrder(orderData);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      setUpdatingStatus(true);
      setError(null);

      await dispatch(
        updateOrderStatus({
          orderId: order.id,
          status: newStatus,
        })
      ).unwrap();

      const updatedOrder = await orderService.getOrderById(
        order.id,
        user?.role || UserRole.WAITER
      );
      setOrder(updatedOrder);

      setUpdatingStatus(false);
    } catch (error: any) {
      setUpdatingStatus(false);
      setError(error.message || "Failed to update order status");
      console.error("Failed to update order status:", error);
    }
  };

  if (loading) {
    return (
      <StaffRoute roles={[UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF]}>
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" />
        </div>
      </StaffRoute>
    );
  }

  if (error) {
    return (
      <StaffRoute roles={[UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF]}>
        <div className="px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-4"
              >
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">
                Order Details
              </h1>
            </div>
          </div>
          <Card>
            <div className="p-6 text-center">
              <div className="text-red-600 text-lg mb-4">
                Error Loading Order
              </div>
              <p className="mb-4">{error}</p>
              <Button
                variant="primary"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  orderService
                    .getOrderById(
                      parseInt(orderId || "0"),
                      user?.role || UserRole.WAITER
                    )
                    .then(setOrder)
                    .catch((err) =>
                      setError(err.message || "Failed to load order details")
                    )
                    .finally(() => setLoading(false));
                }}
              >
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </StaffRoute>
    );
  }

  if (!order) {
    return (
      <StaffRoute roles={[UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF]}>
        <div className="px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-4"
              >
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">
                Order Details
              </h1>
            </div>
          </div>
          <Card>
            <div className="p-6 text-center">
              <div className="text-gray-600 text-lg mb-4">Order Not Found</div>
              <p className="mb-4">The requested order could not be found.</p>
              <Button variant="primary" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </StaffRoute>
    );
  }

  const calculateTotal = (order: Order) => {
    return order.items.reduce((total: number, item: OrderItem) => {
      return total + item.priceAtTimeOfOrder * item.quantity;
    }, 0);
  };

  const renderStatusActions = () => {
    const { status } = order;

    if (updatingStatus) {
      return <Spinner size="sm" />;
    }

    if (user?.role === UserRole.CHEF) {
      if (status === OrderStatus.PENDING) {
        return (
          <Button
            variant="primary"
            onClick={() => handleStatusUpdate(OrderStatus.IN_PROGRESS)}
          >
            Start Preparation
          </Button>
        );
      } else if (status === OrderStatus.IN_PROGRESS) {
        return (
          <Button
            variant="success"
            onClick={() => handleStatusUpdate(OrderStatus.READY)}
          >
            Mark as Ready
          </Button>
        );
      }
    }

    if (user?.role === UserRole.WAITER) {
      if (status === OrderStatus.READY) {
        return (
          <Button
            variant="success"
            onClick={() => handleStatusUpdate(OrderStatus.DELIVERED)}
          >
            Mark as Delivered
          </Button>
        );
      } else if (
        status === OrderStatus.PENDING ||
        status === OrderStatus.IN_PROGRESS
      ) {
        return (
          <Button
            variant="danger"
            onClick={() => handleStatusUpdate(OrderStatus.CANCELLED)}
          >
            Cancel Order
          </Button>
        );
      }
    }

    if (user?.role === UserRole.MANAGER) {
      return (
        <div className="space-x-2">
          {status !== OrderStatus.PENDING && (
            <Button
              variant="warning"
              onClick={() => handleStatusUpdate(OrderStatus.PENDING)}
            >
              Mark as Pending
            </Button>
          )}

          {status !== OrderStatus.IN_PROGRESS && (
            <Button
              variant="info"
              onClick={() => handleStatusUpdate(OrderStatus.IN_PROGRESS)}
            >
              Mark as In Progress
            </Button>
          )}

          {status !== OrderStatus.READY && (
            <Button
              variant="success"
              onClick={() => handleStatusUpdate(OrderStatus.READY)}
            >
              Mark as Ready
            </Button>
          )}

          {status !== OrderStatus.DELIVERED && (
            <Button
              variant="success"
              onClick={() => handleStatusUpdate(OrderStatus.DELIVERED)}
            >
              Mark as Delivered
            </Button>
          )}

          {status !== OrderStatus.CANCELLED && (
            <Button
              variant="danger"
              onClick={() => handleStatusUpdate(OrderStatus.CANCELLED)}
            >
              Cancel Order
            </Button>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <StaffRoute roles={[UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF]}>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={getStatusVariant(order.status)}>
              {getStatusText(order.status)}
            </Badge>
            {renderStatusActions()}
          </div>
        </div>

        <Card>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">
                  Order Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-medium">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Table Number</p>
                    <p className="font-medium">{order.restaurantTableId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item) => {
                    const totalPrice = item.priceAtTimeOfOrder * item.quantity;
                    return (
                      <div
                        key={item.id}
                        className="border-b border-gray-200 pb-4 last:border-0"
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{item.menuItem.name}</p>
                            {item.specialInstructions && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">
                                  Special Instructions:
                                </span>{" "}
                                {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ${totalPrice.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-lg font-semibold text-right">
                    Total: ${calculateTotal(order).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </StaffRoute>
  );
};

export default OrderDetails;
