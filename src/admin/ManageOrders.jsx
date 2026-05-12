import { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import AdminSidebar from "../components/AdminSidebar";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { toast } from "react-toastify";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await API.get("orders/");
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`orders/${orderId}/`, { status: newStatus });
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    }
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`orders/${orderId}/`, { payment_status: newStatus });
      toast.success("Payment status updated");
      fetchOrders();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment status");
    }
  };

  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const orderStatuses = [
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "preparing", label: "Preparing" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentStatuses = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center lg:pl-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <AdminSidebar />
      <main className="lg:ml-64 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Manage Orders</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Orders</option>
            {orderStatuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => fetchOrderItems(order.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold">Order #{order.id}</p>
                      <p className="text-gray-500">{order.customer_name}</p>
                      <p className="text-sm text-gray-400">{order.phone}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-[#D4A017]">${order.total_amount}</span>
                      <div className="flex flex-col space-y-2">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, e.target.value);
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(order.status)}`}
                        >
                          {orderStatuses.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <select
                          value={order.payment_status}
                          onChange={(e) => {
                            e.stopPropagation();
                            updatePaymentStatus(order.id, e.target.value);
                          }}
                          className={`px-3 py-1 rounded-full text-xs ${
                            order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {paymentStatuses.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
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
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <table className="w-full mb-4">
                      <thead>
                        <tr className="text-left text-sm text-gray-500">
                          <th className="pb-2">Item</th>
                          <th className="pb-2">Qty</th>
                          <th className="pb-2">Price</th>
                          <th className="pb-2">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems[order.id].map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="py-2">{item.food_name || `Menu Item #${item.menu_item}`}</td>
                            <td className="py-2">{item.quantity}</td>
                            <td className="py-2">${item.price}</td>
                            <td className="py-2 font-semibold">
                              ${(item.quantity * item.price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="border-t pt-3 text-sm">
                      <p><strong>Address:</strong> {order.address}</p>
                      <p><strong>Payment Method:</strong> {order.payment_method}</p>
                      {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                      <p className="text-gray-400 mt-2">
                        Ordered on {new Date(order.created_at || order.order_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageOrders;
