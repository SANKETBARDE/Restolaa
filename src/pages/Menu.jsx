import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import API from "../api/axiosConfig";
import FoodCard from "../components/FoodCard";

const Menu = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await API.get("menu-categories/");
      const categoriesData = response.data.results || response.data;
      console.log("Categories fetched:", categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await API.get("menu-items/");
      const itemsData = response.data.results || response.data;
      console.log("Items fetched:", itemsData);
      setItems(itemsData);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "all" || String(item.category) === String(selectedCategory);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Debug logging for first few items
    if (items.indexOf(item) < 3) {
      console.log("Filtering item:", item.name, 
                  "Item category:", item.category, "Type:", typeof item.category,
                  "Selected:", selectedCategory, "Type:", typeof selectedCategory,
                  "Matches category:", matchesCategory);
    }
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="text-[#D4A017]">Menu</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our carefully crafted dishes made with the finest ingredients
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-[#D4A017] text-white"
                : "bg-white border border-gray-300 hover:border-[#D4A017]"
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                console.log("Selected category:", cat.id, "Type:", typeof cat.id);
                setSelectedCategory(cat.id);
              }}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                String(selectedCategory) === String(cat.id)
                  ? "bg-[#D4A017] text-white"
                  : "bg-white border border-gray-300 hover:border-[#D4A017]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017]"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
