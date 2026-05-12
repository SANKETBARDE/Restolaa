import { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import AdminSidebar from "../components/AdminSidebar";
import { Save, Image, MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "react-toastify";

const RestaurantSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    name: "Restola",
    description: "Experience the finest culinary delights",
    address: "123 Restaurant Street, Culinary District, Food City, FC 12345",
    phone: "+1 (555) 123-4567",
    email: "info@restola.com",
    opening_time: "11:00",
    closing_time: "23:00",
    logo_url: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await API.get("restaurant-details/");
      const data = response.data.results?.[0] || response.data[0];
      if (data) {
        setSettings({
          name: data.name || "Restola",
          description: data.description || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          opening_time: data.opening_time || "11:00",
          closing_time: data.closing_time || "23:00",
          logo_url: data.logo_url || "",
        });
        setLogoPreview(data.logo_url || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Try to get existing ID first
      const checkRes = await API.get("restaurant-details/");
      const existing = checkRes.data.results?.[0] || checkRes.data[0];

      const submitData = logoFile ? new FormData() : { ...settings };
      if (logoFile) {
        submitData.append("logo", logoFile);
        submitData.append("name", settings.name);
        submitData.append("description", settings.description);
        submitData.append("address", settings.address);
        submitData.append("phone", settings.phone);
        submitData.append("email", settings.email);
        submitData.append("opening_time", settings.opening_time);
        submitData.append("closing_time", settings.closing_time);
        if (settings.logo_url) {
          submitData.append("logo_url", settings.logo_url);
        }
      }

      if (existing?.id) {
        if (logoFile) {
          await API.put(`restaurant-details/${existing.id}/`, submitData);
        } else {
          await API.put(`restaurant-details/${existing.id}/`, submitData);
        }
      } else {
        if (logoFile) {
          await API.post("restaurant-details/", submitData);
        } else {
          await API.post("restaurant-details/", submitData);
        }
      }
      toast.success("Settings saved successfully");
      window.dispatchEvent(new Event("restaurantLogoUpdated"));
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

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
        <h1 className="text-3xl font-bold mb-8">Restaurant Settings</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 max-w-3xl">
          {/* Logo */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              Upload Logo
            </label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full"
            />
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="mt-4 w-32 h-32 object-contain border rounded-lg"
              />
            )}
          </div>

          {/* Restaurant Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Restaurant Name</label>
            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">About / Description</label>
            <textarea
              name="description"
              value={settings.description}
              onChange={handleChange}
              rows="3"
              className="w-full"
              placeholder="Tell customers about your restaurant..."
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          {/* Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Address
            </label>
            <textarea
              name="address"
              value={settings.address}
              onChange={handleChange}
              rows="2"
              className="w-full"
            />
          </div>

          {/* Opening Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Opening Time
              </label>
              <input
                type="time"
                name="opening_time"
                value={settings.opening_time}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Closing Time
              </label>
              <input
                type="time"
                name="closing_time"
                value={settings.closing_time}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default RestaurantSettings;
