import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Menu", path: "/menu" },
    { name: "Reserve Table", path: "/reserve-table" },
    { name: "Book Event", path: "/book-event" },
    ...(user ? [
      { name: "My Reservations", path: "/my-reservations" },
      { name: "My Events", path: "/my-events" },
    ] : []),
  ];

  return (
    <nav className="bg-[#1E1E1E] text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/Restolacut.png"
              alt="Restola logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-300 hover:text-[#D4A017] transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4A017] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 hover:text-[#D4A017] transition-colors">
                  <User className="w-5 h-5" />
                  <span>{user.full_name || user.first_name || user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-[#D4A017] border border-[#D4A017] rounded-lg hover:bg-[#D4A017] hover:text-white transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#D4A017] text-white rounded-lg hover:bg-[#B8860B] transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-300 hover:text-[#D4A017] py-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/cart"
                className="text-gray-300 hover:text-[#D4A017] py-2 flex items-center space-x-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({getCartCount()})</span>
              </Link>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:text-[#D4A017] py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    className="text-gray-300 hover:text-[#D4A017] py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-300 hover:text-[#D4A017] py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-[#D4A017] py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-300 hover:text-[#D4A017] py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
