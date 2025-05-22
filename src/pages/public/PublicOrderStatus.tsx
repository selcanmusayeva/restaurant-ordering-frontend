import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import PublicLayout from "../../components/layout/PublicLayout";
import orderService from "../../services/order";
import {
  Order,
  OrderItem,
  OrderStatus as OrderStatusEnum,
} from "../../types";

// Define extended interfaces to match the actual API response
interface ExtendedOrderItem extends OrderItem {
  priceAtTimeOfOrder: number;
  status: string;
}

interface ExtendedOrder extends Order {
  items: ExtendedOrderItem[];
}

const PublicOrderStatus: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(parseInt(orderId));
        setOrder(orderData as ExtendedOrder);
      } catch (err: any) {
        setError(err.message || "Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();

    // Poll for updates every 30 seconds
    const intervalId = setInterval(fetchOrderDetails, 30000);

    return () => clearInterval(intervalId);
  }, [orderId]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatusEnum.DELIVERED:
        return "bg-green-100 text-green-800";
      case OrderStatusEnum.READY:
        return "bg-blue-100 text-blue-800";
      case OrderStatusEnum.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";
      case OrderStatusEnum.PENDING:
        return "bg-gray-100 text-gray-800";
      case OrderStatusEnum.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate total price
  const calculateTotal = (items: ExtendedOrderItem[]) => {
    return items.reduce(
      (sum, item) => sum + item.priceAtTimeOfOrder * item.quantity,
      0
    );
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-burgundy-600 bg-burgundy-50 rounded-lg p-6 max-w-md text-center">
            <svg
              className="w-12 h-12 mx-auto text-burgundy-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="font-display text-lg font-medium mb-2">
              Error Loading Order
            </h3>
            <p className="text-burgundy-700">{error}</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!order) {
    return (
      <PublicLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the order you're looking for
          </p>
          <Link
            to="/public/scan"
            className="inline-flex items-center justify-center font-medium rounded-md px-4 py-2 bg-burgundy-600 hover:bg-burgundy-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy-500 transition-all duration-200"
          >
            Back to Menu
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-burgundy-800 mb-2">
                Order #{order.id}
              </h1>
              <p className="text-gray-600">
                Placed on{" "}
                {order.createdAt ? formatDate(order.createdAt) : "N/A"}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full font-medium mt-4 md:mt-0 ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.replace("_", " ")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-2">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-800 mr-2">
                              {item.menuItem.name}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </div>
                          {item.specialInstructions && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Instructions:</span>{" "}
                              {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span className="text-gray-600">
                              ${(item.priceAtTimeOfOrder * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="h-min">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Table</span>
                    <span className="font-medium">
                      #{order.restaurantTableId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer</span>
                    <span className="font-medium">
                      {order.customerName || order.customer?.name || "Guest"}
                    </span>
                  </div>
                  {order.specialInstructions && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-gray-600 font-medium mb-1">
                        Special Instructions:
                      </p>
                      <p className="text-gray-800">
                        {order.specialInstructions}
                      </p>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Items Total</span>
                      <span className="font-medium">
                        ${calculateTotal(order.items).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">
                        ${calculateTotal(order.items).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-cream-50 border border-cream-200 rounded-lg p-4 text-center">
            <p className="text-gray-600">
              Order updates will appear automatically on this page. This page
              will refresh periodically to show the latest status.
            </p>
          </div>

          <div className="flex justify-center mt-8">
            <Link
              to="/public/scan"
              className="inline-flex items-center justify-center font-medium rounded-md px-4 py-2 bg-burgundy-600 hover:bg-burgundy-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy-500 transition-all duration-200 mr-4"
            >
              Place New Order
            </Link>
            <Button variant="outline" onClick={() => window.print()}>
              Print Receipt
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PublicOrderStatus;
