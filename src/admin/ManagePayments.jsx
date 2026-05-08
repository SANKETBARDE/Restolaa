import { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import AdminSidebar from "../components/AdminSidebar";
import { CreditCard, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "react-toastify";

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, ordersRes] = await Promise.all([
        API.get("payments/"),
        API.get("orders/"),
      ]);
      setPayments(paymentsRes.data.results || paymentsRes.data);
      setOrders(ordersRes.data.results || ordersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (id, newStatus) => {
    try {
      await API.patch(`payments/${id}/`, { status: newStatus });
      toast.success("Payment status updated");
      fetchData();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment status");
    }
  };

  const filteredPayments = statusFilter === "all"
    ? payments
    : payments.filter(p => p.status === statusFilter);

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getOrderDetails = (orderId) => {
    return orders.find(o => o.id === orderId);
  };

  const paymentMethods = {
    cod: "Cash on Delivery",
    card: "Credit/Debit Card",
    upi: "UPI",
  };

  const statuses = [
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
          <h1 className="text-3xl font-bold">Manage Payments</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Payments</option>
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: "Total Revenue", 
              value: `$${payments.filter(p => p.status === "paid").reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}`,
              icon: DollarSign,
              color: "text-green-600"
            },
            { 
              label: "Pending", 
              value: payments.filter(p => p.status === "pending").length,
              icon: Clock,
              color: "text-yellow-600"
            },
            { 
              label: "Paid", 
              value: payments.filter(p => p.status === "paid").length,
              icon: CheckCircle,
              color: "text-green-600"
            },
            { 
              label: "Failed", 
              value: payments.filter(p => p.status === "failed").length,
              icon: XCircle,
              color: "text-red-600"
            },
          ].map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayments.map((payment) => {
                  const order = getOrderDetails(payment.order);
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">#{payment.id}</td>
                      <td className="px-6 py-4">#{payment.order}</td>
                      <td className="px-6 py-4">
                        {order ? order.customer_name : "-"}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#D4A017]">
                        ${payment.amount}
                      </td>
                      <td className="px-6 py-4">
                        {paymentMethods[payment.payment_method] || payment.payment_method}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={payment.status}
                          onChange={(e) => updatePaymentStatus(payment.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(payment.status)}`}
                        >
                          {statuses.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(payment.created_at || payment.payment_date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagePayments;
