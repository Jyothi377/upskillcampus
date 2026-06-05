import { useState } from "react";
import { CartProvider, AuthProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import RestaurantPage from "./pages/RestaurantPage";
import CartPage from "./pages/CartPage";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import { CheckoutPage, OrderTrackingPage } from "./pages/CheckoutTracking";
import OrdersPage from "./pages/OrdersPage";
import RestaurantDashboard from "./pages/RestaurantDashboard";

function App() {
  const [page, setPage] = useState("home");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const renderPage = () => {
    switch (page) {
      case "home":       return <HomePage setPage={setPage} setSelectedRestaurant={setSelectedRestaurant} />;
      case "restaurant": return selectedRestaurant ? <RestaurantPage restaurant={selectedRestaurant} setPage={setPage} /> : null;
      case "cart":       return <CartPage setPage={setPage} />;
      case "login":      return <LoginPage setPage={setPage} />;
      case "signup":     return <SignupPage setPage={setPage} />;
      case "checkout":   return <CheckoutPage setPage={setPage} setOrderId={setOrderId} />;
      case "tracking":   return <OrderTrackingPage orderId={orderId} setPage={setPage} />;
      case "orders":     return <OrdersPage setPage={setPage} />;
      case "dashboard":  return <RestaurantDashboard setPage={setPage} />;
      default:           return <HomePage setPage={setPage} setSelectedRestaurant={setSelectedRestaurant} />;
    }
  };

  const hideNav = ["login", "signup", "dashboard"].includes(page);

  return (
    <div style={{ minHeight: "100vh" }}>
      {!hideNav && <Navbar page={page} setPage={setPage} />}
      {renderPage()}
    </div>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  );
}
