import { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import AdminSidebar from "../components/AdminSidebar";
import { 
  ShoppingBag, 
  Calendar, 
  PartyPopper, 
  UtensilsCrossed, 
  DollarSign,
  TrendingUp,
  Users
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalReservations: 0,
    pendingReservations: 0,
    totalEvents: 0,
    menuItems: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, reservationsRes, eventsRes, menuRes] = await Promise.all([
        API.get("orders/"),
        API.get("table-reservations/"),
        API.get("event-bookings/"),
        API.get("menu-items/"),
      ]);

      const orders = ordersRes.data.results || ordersRes.data;
      const reservations = reservationsRes.data.results || reservationsRes.data;
      const events = eventsRes.data.results || eventsRes.data;
      const menuItems = menuRes.data.results || menuRes.data;

      const pendingOrders = orders.filter(o => o.status === "pending").length;
      const pendingReservations = reservations.filter(r => r.status === "pending").length;
      const totalRevenue = orders
        .filter(o => o.payment_status === "paid")
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        totalReservations: reservations.length,
        pendingReservations,
        totalEvents: events.length,
        menuItems: menuItems.length,
        totalRevenue,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <a href={link} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color.replace("text-", "bg-").replace("[#D4A017]", "[#D4A017]/10").replace("[#B22222]", "[#B22222]/10")}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </a>
  );

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
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingBag}
            color="text-[#D4A017]"
            link="/admin/orders"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={TrendingUp}
            color="text-[#B22222]"
            link="/admin/orders"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            color="text-green-600"
            link="/admin/payments"
          />
          <StatCard
            title="Menu Items"
            value={stats.menuItems}
            icon={UtensilsCrossed}
            color="text-[#D4A017]"
            link="/admin/menu"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Reservations"
            value={stats.totalReservations}
            icon={Calendar}
            color="text-blue-600"
            link="/admin/reservations"
          />
          <StatCard
            title="Pending Reservations"
            value={stats.pendingReservations}
            icon={Users}
            color="text-orange-600"
            link="/admin/reservations"
          />
          <StatCard
            title="Event Bookings"
            value={stats.totalEvents}
            icon={PartyPopper}
            color="text-purple-600"
            link="/admin/events"
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">#{order.id}</td>
                    <td className="px-6 py-4">{order.customer_name}</td>
                    <td className="px-6 py-4 font-semibold">${order.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                        order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {order.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.created_at || order.order_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
