import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingPage from "./components/LoadingPage";

// Customer Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ReserveTable from "./pages/ReserveTable";
import BookEvent from "./pages/BookEvent";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import MyReservations from "./pages/MyReservations";
import MyEvents from "./pages/MyEvents";

// Admin Pages
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import ManageMenu from "./admin/ManageMenu";
import ManageOrders from "./admin/ManageOrders";
import ManageReservations from "./admin/ManageReservations";
import ManageEvents from "./admin/ManageEvents";
import ManagePayments from "./admin/ManagePayments";
import RestaurantSettings from "./admin/RestaurantSettings";

// Layout component for customer pages
const CustomerLayout = () => (
  <div className="min-h-screen flex flex-col bg-[#FFF8E7]">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Layout component for admin pages (no navbar/footer)
const AdminLayout = () => (
  <ProtectedRoute requireAdmin={true}>
    <Outlet />
  </ProtectedRoute>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Customer Routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/reserve-table" element={<ReserveTable />} />
              <Route path="/book-event" element={<BookEvent />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-reservations"
                element={
                  <ProtectedRoute>
                    <MyReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <MyEvents />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/menu" element={<ManageMenu />} />
              <Route path="/admin/orders" element={<ManageOrders />} />
              <Route path="/admin/reservations" element={<ManageReservations />} />
              <Route path="/admin/events" element={<ManageEvents />} />
              <Route path="/admin/payments" element={<ManagePayments />} />
              <Route path="/admin/settings" element={<RestaurantSettings />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
