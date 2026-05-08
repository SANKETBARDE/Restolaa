import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import { Calendar, Clock, Users } from "lucide-react";
import { toast } from "react-toastify";

const ReserveTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    email: "",
    reservation_date: "",
    reservation_time: "",
    number_of_guests: 2,
    special_request: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("table-reservations/", {
        ...formData,
        status: "pending",
      });
      toast.success("Table reservation request submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error submitting reservation:", error);
      toast.error("Failed to submit reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Reserve a <span className="text-[#D4A017]">Table</span>
          </h1>
          <p className="text-gray-600">
            Book your table for an unforgettable dining experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                name="reservation_date"
                value={formData.reservation_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <select
                name="reservation_time"
                value={formData.reservation_time}
                onChange={handleChange}
                required
                className="w-full"
              >
                <option value="">Select time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Number of Guests</label>
            <select
              name="number_of_guests"
              value={formData.number_of_guests}
              onChange={handleChange}
              className="w-full"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Special Request (Optional)
            </label>
            <textarea
              name="special_request"
              value={formData.special_request}
              onChange={handleChange}
              rows="3"
              placeholder="Any special seating preferences, dietary requirements, or occasions..."
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <span>Request Reservation</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReserveTable;
