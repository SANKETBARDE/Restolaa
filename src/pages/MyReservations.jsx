import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axiosConfig";
import { Calendar, Users, CheckCircle, XCircle } from "lucide-react";

const MyReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchReservations = async () => {
      try {
        const params = user.role === "admin" ? {} : { email: user.email };
        const response = await API.get("table-reservations/", { params });
        const data = response.data.results || response.data;
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    return status === "accepted" ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : status === "pending" ? (
      <Calendar className="w-5 h-5 text-[#D4A017]" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017]"></div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            My <span className="text-[#D4A017]">Reservations</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Check the current status of your reservation requests.
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center">
            <Users className="w-24 h-24 mx-auto text-gray-300 mb-5" />
            <h2 className="text-2xl font-bold mb-2">No reservations found</h2>
            <p className="text-gray-600">You haven't made any reservations yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Reservation #{reservation.id}</p>
                      <p className="text-lg font-semibold">{formatDate(reservation.reservation_date)}</p>
                      <p className="text-sm text-gray-500">{reservation.reservation_time}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(reservation.status)}`}>
                        {reservation.status?.replace("_", " ")}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {reservation.number_of_guests} Guests
                      </span>
                      {getStatusIcon(reservation.status)}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <p><strong>Name:</strong> {reservation.customer_name}</p>
                      <p><strong>Email:</strong> {reservation.email}</p>
                      <p><strong>Phone:</strong> {reservation.phone}</p>
                    </div>
                    <div>
                      {reservation.special_request && (
                        <p><strong>Request:</strong> {reservation.special_request}</p>
                      )}
                      {reservation.created_at && (
                        <p><strong>Requested:</strong> {formatDate(reservation.created_at)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
