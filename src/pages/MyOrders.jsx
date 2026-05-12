import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axiosConfig";
import { Package, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await API.get("orders/");
      // Filter orders for current user if user is not admin
      const allOrders = response.data.results || response.data;
      const userOrders = user?.role === "admin" 
        ? allOrders 
        : allOrders.filter(order => order.customer === user?.id);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId]) {
      setExpandedOrder(expandedOrder === orderId ? null : orderId);
      return;
    }
    try {
      const response = await API.get(`order-items/?order=${orderId}`);
      setOrderItems({ ...orderItems, [orderId]: response.data.results || response.data });
      setExpandedOrder(orderId);
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-[#D4A017]" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017]"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <Package className="w-24 h-24 mx-auto text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
        <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
        <a href="/menu" className="btn-primary">Browse Menu</a>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">
          My <span className="text-[#D4A017]">Orders</span>
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div
                className="p-6 cursor-pointer"
                onClick={() => fetchOrderItems(order.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order #{order.id}</p>
                    <p className="font-semibold">{formatDate(order.created_at || order.order_date)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status?.replace("_", " ")}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {order.payment_status}
                    </span>
                    <span className="font-bold text-lg">${order.total_amount}</span>
                    {expandedOrder === order.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedOrder === order.id && orderItems[order.id] && (
                <div className="border-t px-6 py-4 bg-gray-50">
                  <h4 className="font-semibold mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {orderItems[order.id].map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-medium">{item.food_name || `Menu Item #${item.menu_item}`}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                        </div>
                        <span className="font-semibold">
                          ${(item.quantity * item.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-[#D4A017]">${order.total_amount}</span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p><strong>Delivery Address:</strong> {order.address}</p>
                    <p><strong>Phone:</strong> {order.phone}</p>
                    {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
