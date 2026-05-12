import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axiosConfig";
import { User, Mail, Phone, MapPin, Edit2, Save, X } from "lucide-react";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    console.log("Profile component mounted, user:", user);
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      console.log("Fetching profile for email:", user.email);
      const response = await API.get(`profiles/?email=${user.email}`);
      console.log("Profile response:", response.data);
      
      if (response.data.results && response.data.results.length > 0) {
        const profile = response.data.results[0];
        console.log("Found profile:", profile);
        
        // Split full_name if first_name and last_name are not available
        let firstName = profile.first_name;
        let lastName = profile.last_name;
        
        if (!firstName && !lastName && profile.full_name) {
          const nameParts = profile.full_name.trim().split(' ');
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(' ') || "";
        }
        
        setProfileData({
          first_name: firstName || user.first_name || "",
          last_name: lastName || user.last_name || "",
          full_name: profile.full_name || user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          email: profile.email || user.email,
          phone: profile.phone || user.phone || "",
          address: profile.address || user.address || "",
        });
      } else {
        // Use user data from auth context if no profile found
        console.log("No profile found, using user data:", user);
        
        // Split full_name if first_name and last_name are not available
        let firstName = user.first_name;
        let lastName = user.last_name;
        
        if (!firstName && !lastName && user.full_name) {
          const nameParts = user.full_name.trim().split(' ');
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(' ') || "";
        }
        
        const userData = {
          first_name: firstName || "",
          last_name: lastName || "",
          full_name: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          email: user.email || "",
          phone: user.phone || "",
        };
        console.log("Setting profile data from user:", userData);
        setProfileData(userData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to user data from auth context
      console.log("Using fallback user data:", user);
      
      // Split full_name if first_name and last_name are not available
      let firstName = user.first_name;
      let lastName = user.last_name;
      
      if (!firstName && !lastName && user.full_name) {
        const nameParts = user.full_name.trim().split(' ');
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(' ') || "";
      }
      
      const fallbackData = {
        first_name: firstName || "",
        last_name: lastName || "",
        full_name: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      };
      console.log("Setting fallback profile data:", fallbackData);
      setProfileData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reset to original data
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        full_name: `${profileData.first_name} ${profileData.last_name}`.trim(),
        email: profileData.email,
        phone: profileData.phone,
      };

      // Try to find and update existing profile
      const profileResponse = await API.get(`profiles/?email=${user.email}`);
      if (profileResponse.data.results && profileResponse.data.results.length > 0) {
        const profileId = profileResponse.data.results[0].id;
        await API.patch(`profiles/${profileId}/`, updateData);
      } else {
        // Create new profile if it doesn't exist
        await API.post("profiles/", updateData);
      }

      // Update user context with new data
      login(localStorage.getItem("token"), {
        ...user,
        ...updateData,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-[#D4A017] text-white rounded-lg hover:bg-[#B8860B] transition-all"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full !pl-11 !pr-3 disabled:bg-gray-100"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full !pl-11 !pr-3 disabled:bg-gray-100"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="w-full !pl-11 !pr-3 disabled:bg-gray-100"
                  placeholder="your@email.com"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full !pl-11 !pr-3 disabled:bg-gray-100"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            
            {isEditing && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-2 bg-[#D4A017] text-white rounded-lg hover:bg-[#B8860B] transition-all"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
