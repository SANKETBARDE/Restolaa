import { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import AdminSidebar from "../components/AdminSidebar";
import { PartyPopper, Users, Calendar, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { toast } from "react-toastify";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceData, setPriceData] = useState({ estimated_price: "", advance_amount: "" });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await API.get("event-bookings/");
      setEvents(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load event bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus, priceInfo = null) => {
    try {
      const data = { status: newStatus };
      if (priceInfo) {
        data.estimated_price = priceInfo.estimated_price;
        data.advance_amount = priceInfo.advance_amount;
      }
      await API.patch(`event-bookings/${id}/`, data);
      toast.success(`Event ${newStatus.replace("_", " ")}`);
      setPriceData({ estimated_price: "", advance_amount: "" });
      fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };

  const filteredEvents = statusFilter === "all"
    ? events
    : events.filter(e => e.status === statusFilter);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      advance_paid: "bg-purple-100 text-purple-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getEventTypeLabel = (type) => {
    const types = {
      birthday: "Birthday Party",
      wedding: "Wedding Reception",
      corporate: "Corporate Event",
      anniversary: "Anniversary",
      other: "Other",
    };
    return types[type] || type;
  };

  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "advance_paid", label: "Advance Paid" },
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
          <h1 className="text-3xl font-bold">Manage Event Bookings</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Events</option>
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <PartyPopper className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No event bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-lg">{event.customer_name}</p>
                      <p className="text-[#D4A017] font-medium">{getEventTypeLabel(event.event_type)}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {event.event_date} at {event.event_time}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event.number_of_guests} guests
                        </span>
                        {event.estimated_price && (
                          <span className="flex items-center font-semibold text-green-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${event.estimated_price}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(event.status)}`}>
                        {event.status?.replace("_", " ")}
                      </span>
                      {expandedId === event.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === event.id && (
                  <div className="border-t px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <p className="font-medium">{event.phone}</p>
                        <p className="text-sm">{event.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Food Package</p>
                        <p className="font-medium capitalize">{event.food_package.replace("_", " ")}</p>
                        <p className="text-sm">
                          Decoration: {event.decoration_required ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>

                    {event.estimated_price && (
                      <div className="grid grid-cols-2 gap-4 mb-4 bg-white p-3 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-500">Estimated Price</p>
                          <p className="font-bold text-lg text-green-600">${event.estimated_price}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Advance Amount</p>
                          <p className="font-bold text-lg">${event.advance_amount || "0"}</p>
                        </div>
                      </div>
                    )}
                    
                    {event.special_request && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Special Request</p>
                        <p className="bg-white p-3 rounded-lg mt-1">{event.special_request}</p>
                      </div>
                    )}

                    {event.status === "pending" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500">Estimated Price ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={priceData.estimated_price}
                              onChange={(e) => setPriceData({...priceData, estimated_price: e.target.value})}
                              className="w-full"
                              placeholder="Total estimated cost"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Advance Amount ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={priceData.advance_amount}
                              onChange={(e) => setPriceData({...priceData, advance_amount: e.target.value})}
                              className="w-full"
                              placeholder="Required advance"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => updateStatus(event.id, "accepted", priceData)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Accept & Send Quote
                          </button>
                          <button
                            onClick={() => updateStatus(event.id, "rejected")}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {event.status === "accepted" && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => updateStatus(event.id, "advance_paid")}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          Mark Advance Paid
                        </button>
                      </div>
                    )}

                    {(event.status === "advance_paid" || event.status === "accepted") && (
                      <button
                        onClick={() => updateStatus(event.id, "completed")}
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

export default ManageEvents;
