import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import { Calendar, Clock, Users, PartyPopper } from "lucide-react";
import { toast } from "react-toastify";

const BookEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    email: "",
    event_type: "birthday",
    event_date: "",
    event_time: "",
    number_of_guests: 20,
    food_package: "standard",
    decoration_required: false,
    special_request: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("event-bookings/", {
        ...formData,
        status: "pending",
        estimated_price: null,
        advance_amount: null,
      });
      toast.success("Event booking request submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error submitting event booking:", error);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    { value: "birthday", label: "Birthday Party" },
    { value: "wedding", label: "Wedding Reception" },
    { value: "corporate", label: "Corporate Event" },
    { value: "anniversary", label: "Anniversary" },
    { value: "other", label: "Other" },
  ];

  const foodPackages = [
    { value: "basic", label: "Basic Package ($25/person)" },
    { value: "standard", label: "Standard Package ($40/person)" },
    { value: "premium", label: "Premium Package ($65/person)" },
    { value: "custom", label: "Custom Package" },
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Book an <span className="text-[#D4A017]">Event</span>
          </h1>
          <p className="text-gray-600">
            Make your special occasions unforgettable with our catering services
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
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

          {/* Event Details */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <PartyPopper className="w-4 h-4 inline mr-1" />
              Event Type
            </label>
            <select
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              className="w-full"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Event Date
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Event Time
              </label>
              <input
                type="time"
                name="event_time"
                value={formData.event_time}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Number of Guests
              </label>
              <input
                type="number"
                name="number_of_guests"
                value={formData.number_of_guests}
                onChange={handleChange}
                min="10"
                max="500"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Food Package</label>
              <select
                name="food_package"
                value={formData.food_package}
                onChange={handleChange}
                className="w-full"
              >
                {foodPackages.map((pkg) => (
                  <option key={pkg.value} value={pkg.value}>{pkg.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="decoration_required"
              name="decoration_required"
              checked={formData.decoration_required}
              onChange={handleChange}
              className="w-4 h-4 text-[#D4A017] rounded"
            />
            <label htmlFor="decoration_required" className="text-sm">
              Include decoration services
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Special Request / Additional Details
            </label>
            <textarea
              name="special_request"
              value={formData.special_request}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us more about your event, theme preferences, dietary restrictions, etc..."
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
              <span>Submit Event Request</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookEvent;
