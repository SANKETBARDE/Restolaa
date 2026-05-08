import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Share2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#1E1E1E] text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div>
            <h3 className="text-2xl font-bold text-[#D4A017] mb-4">Restola</h3>
            <p className="text-gray-400 mb-4">
              Experience the finest culinary delights in an elegant atmosphere.
              Where every meal becomes a memorable occasion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-[#D4A017] transition-colors" title="Facebook">
                <span className="text-xs font-bold">f</span>
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-[#D4A017] transition-colors" title="Instagram">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-[#D4A017] transition-colors" title="Twitter">
                <span className="text-xs font-bold">X</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#D4A017]">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-400 hover:text-white transition-colors">
                  Our Menu
                </Link>
              </li>
              <li>
                <Link to="/reserve-table" className="text-gray-400 hover:text-white transition-colors">
                  Reserve Table
                </Link>
              </li>
              <li>
                <Link to="/book-event" className="text-gray-400 hover:text-white transition-colors">
                  Book Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#D4A017]">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#D4A017] flex-shrink-0 mt-1" />
                <span className="text-gray-400">
                  123 Restaurant Street,<br />
                  Culinary District,<br />
                  Food City, FC 12345
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#D4A017]" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#D4A017]" />
                <span className="text-gray-400">info@restola.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#D4A017]">Opening Hours</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-[#D4A017]" />
                <span className="text-gray-400">
                  Mon - Fri: 11:00 AM - 10:00 PM
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-[#D4A017]" />
                <span className="text-gray-400">
                  Sat - Sun: 10:00 AM - 11:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Restola. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
