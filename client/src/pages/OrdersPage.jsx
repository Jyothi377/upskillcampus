import { useState, useEffect } from "react";
import { useAuth } from "../context/AppContext";
import { apiGetMyOrders } from "../data/api";

export default function OrdersPage({ setPage }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchOrders = async () => {
      try {
        if (user.token && user.token !== "local") {
          const data = await apiGetMyOrders();
          if (Array.isArray(data) && data.length > 0) {
            setOrders(data.map(o => ({
              id: o.orderId || o._id, items: o.items,
              total: o.total, restaurant: o.restaurant,
              placedAt: o.createdAt, status: o.status, address: o.address
            })));
            setLoading(false); return;
          }
        }
      } catch {}
      // Fallback to localStorage
      const local = JSON.parse(localStorage.getItem("fd_orders") || "[]");
      setOrders(local.filter(o => o.user === user.email));
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (!user) return (
    <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 64 }}>🔐</div>
      <h2 style={{ color: "#333", margin: "12px 0 8px" }}>Login to view orders</h2>
      <p style={{ color: "#888", marginBottom: 20 }}>Your order history will appear here</p>
      <button onClick={() => setPage("login")} style={orangeBtn}>Login</button>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "4px solid #f0f0f0", borderTop: "4px solid #ff6b35", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: "#888" }}>Loading your orders...</p>
      </div>
    </div>
  );

  if (orders.length === 0) return (
    <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 64 }}>📦</div>
      <h2 style={{ color: "#333", margin: "12px 0 8px" }}>No orders yet</h2>
      <p style={{ color: "#888", marginBottom: 20 }}>Your past orders will appear here</p>
      <button onClick={() => setPage("home")} style={orangeBtn}>Start Ordering</button>
    </div>
  );

  const statusConfig = {
    confirmed: { label: "Confirmed", color: "#1565c0", bg: "#e3f2fd" },
    preparing: { label: "Preparing", color: "#e65100", bg: "#fff3e0" },
    out_for_delivery: { label: "Out for Delivery", color: "#6a1b9a", bg: "#f3e5f5" },
    delivered: { label: "Delivered ✅", color: "#2e7d32", bg: "#e8f5e9" },
    cancelled: { label: "Cancelled", color: "#c62828", bg: "#ffebee" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'DM Sans', sans-serif", padding: "24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#222", marginBottom: 8 }}>My Orders</h2>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>{orders.length} order{orders.length !== 1 ? "s" : ""} found</p>

        {orders.map(order => {
          const s = statusConfig[order.status] || statusConfig.delivered;
          return (
            <div key={order.id} style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 800, color: "#222", fontSize: 17 }}>{order.restaurant}</p>
                  <p style={{ margin: 0, color: "#aaa", fontSize: 12 }}>
                    Order #{order.id} • {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at {new Date(order.placedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span style={{ background: s.bg, color: s.color, padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{s.label}</span>
              </div>

              {/* Items */}
              <div style={{ borderTop: "1px solid #f5f5f5", borderBottom: "1px solid #f5f5f5", padding: "12px 0", marginBottom: 12 }}>
                {order.items?.map(item => (
                  <div key={item.id || item.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
                    <span style={{ color: "#555" }}>{item.name} × {item.qty}</span>
                    <span style={{ fontWeight: 600, color: "#333" }}>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontWeight: 800, color: "#ff6b35", fontSize: 17 }}>₹{order.total}</span>
                  {order.address && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#aaa" }}>📍 {order.address.street}, {order.address.city}</p>}
                </div>
                <button onClick={() => setPage("home")} style={{ background: "linear-gradient(135deg, #ff6b35, #f7931e)", color: "#fff", border: "none", borderRadius: 20, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                  🔁 Reorder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const orangeBtn = { background: "linear-gradient(135deg, #ff6b35, #f7931e)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px", fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "'DM Sans', sans-serif" };
