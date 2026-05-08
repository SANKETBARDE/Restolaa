import { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import AdminSidebar from "../components/AdminSidebar";
import { Calendar, Users, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await API.get("table-reservations/");
      setReservations(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const data = { status: newStatus };
      if (adminNote.trim()) {
        data.admin_note = adminNote;
      }
      await API.patch(`table-reservations/${id}/`, data);
      toast.success(`Reservation ${newStatus}`);
      setAdminNote("");
      fetchReservations();
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Failed to update reservation");
    }
  };

  const filteredReservations = statusFilter === "all"
    ? reservations
    : reservations.filter(r => r.status === statusFilter);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
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
          <h1 className="text-3xl font-bold">Manage Reservations</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Reservations</option>
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {reservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No reservations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === reservation.id ? null : reservation.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-lg">{reservation.customer_name}</p>
                      <p className="text-gray-500 text-sm">{reservation.email}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {reservation.reservation_date} at {reservation.reservation_time}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {reservation.number_of_guests} guests
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                      {expandedId === reservation.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === reservation.id && (
                  <div className="border-t px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{reservation.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium">
                          {new Date(reservation.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {reservation.special_request && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Special Request</p>
                        <p className="bg-white p-3 rounded-lg mt-1">{reservation.special_request}</p>
                      </div>
                    )}

                    {reservation.admin_note && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Admin Note</p>
                        <p className="bg-blue-50 p-3 rounded-lg mt-1">{reservation.admin_note}</p>
                      </div>
                    )}

                    {reservation.status === "pending" && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Add a note (optional)..."
                            className="flex-1"
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => updateStatus(reservation.id, "accepted")}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(reservation.id, "rejected")}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {reservation.status === "accepted" && (
                      <button
                        onClick={() => updateStatus(reservation.id, "completed")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Mark Completed
                      </button>
                    )}
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

export default ManageReservations;
