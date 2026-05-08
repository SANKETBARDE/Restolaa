import { Link } from "react-router-dom";
import { ArrowRight, Utensils, Users, Clock, Award } from "lucide-react";
import { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import FoodCard from "../components/FoodCard";

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    try {
      const response = await API.get("menu-items/?featured=true");
      setFeaturedItems(response.data.results || response.data.slice(0, 4));
    } catch (error) {
      console.error("Error fetching featured items:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920"
            alt="Restaurant interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Experience Culinary
              <span className="text-[#D4A017]"> Excellence</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Discover a world of exquisite flavors, where every dish tells a story 
              and every meal becomes an unforgettable memory.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/menu" className="btn-primary inline-flex items-center space-x-2">
                <span>Order Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/reserve-table" className="btn-outline inline-flex items-center space-x-2">
                <span>Reserve Table</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Utensils, title: "Fresh Ingredients", desc: "Quality ingredients sourced daily" },
              { icon: Users, title: "Expert Chefs", desc: "World-class culinary masters" },
              { icon: Clock, title: "Fast Service", desc: "Quick preparation & delivery" },
              { icon: Award, title: "Award Winning", desc: "Recognized for excellence" },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#D4A017]/10 rounded-full flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-[#D4A017]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Featured <span className="text-[#D4A017]">Dishes</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our chef's specially curated selection of signature dishes
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/menu" className="btn-primary inline-flex items-center space-x-2">
              <span>View Full Menu</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reservation & Event CTA */}
      <section className="py-16 bg-[#1E1E1E] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#2a2a2a] p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4 text-[#D4A017]">Reserve a Table</h3>
              <p className="text-gray-400 mb-6">
                Book your table in advance and enjoy a seamless dining experience 
                with family and friends.
              </p>
              <Link to="/reserve-table" className="btn-primary inline-flex items-center space-x-2">
                <span>Reserve Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="bg-[#2a2a2a] p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4 text-[#D4A017]">Book an Event</h3>
              <p className="text-gray-400 mb-6">
                Planning a special celebration? Let us make your event 
                unforgettable with our exceptional catering services.
              </p>
              <Link to="/book-event" className="btn-primary inline-flex items-center space-x-2">
                <span>Book Event</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800"
                alt="Restaurant ambiance"
                className="rounded-xl shadow-xl"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Welcome to <span className="text-[#D4A017]">Restola</span>
              </h2>
              <p className="text-gray-600 mb-4">
                Founded with a passion for exceptional dining, Restola has been 
                serving the community with love and dedication for over a decade.
              </p>
              <p className="text-gray-600 mb-6">
                Our team of experienced chefs combines traditional techniques with 
                modern innovation to create dishes that delight the senses and 
                warm the heart.
              </p>
              <Link to="/about" className="btn-outline inline-flex items-center space-x-2">
                <span>Learn More</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
