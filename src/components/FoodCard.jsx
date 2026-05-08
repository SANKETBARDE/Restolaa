import { useCart } from "../context/CartContext";
import { Plus, Check } from "lucide-react";
import { useState } from "react";

const FoodCard = ({ item }) => {
  const { addToCart, cart } = useCart();
  const [added, setAdded] = useState(false);

  const isInCart = cart.find((i) => i.id === item.id);

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      image_url: item.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image_url || "https://via.placeholder.com/400x300?text=Food"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.is_featured && (
          <span className="absolute top-3 left-3 bg-[#D4A017] text-white text-xs font-semibold px-3 py-1 rounded-full">
            Featured
          </span>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold">Currently Unavailable</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
          {item.category_name && (
            <span className="text-xs text-[#D4A017] bg-[#D4A017]/10 px-2 py-1 rounded-full">
              {item.category_name}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-[#D4A017]">${item.price}</span>
          
          {item.is_available ? (
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-[#1E1E1E] text-white hover:bg-[#333333]"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
