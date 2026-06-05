import { useState, useEffect } from "react";
import { apiUpdateOrderStatus } from "../data/api";

const STATUS_FLOW = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"];
const STATUS_CONFIG = {
  placed:           { label: "New Order", icon: "🔔", color: "#1565c0", bg: "#e3f2fd", next: "confirmed",        nextLabel: "Accept Order" },
  confirmed:        { label: "Confirmed", icon: "✅", color: "#2e7d32", bg: "#e8f5e9", next: "preparing",         nextLabel: "Start Preparing" },
  preparing:        { label: "Preparing", icon: "👨‍🍳", color: "#e65100", bg: "#fff3e0", next: "out_for_delivery", nextLabel: "Mark Out for Delivery" },
  out_for_delivery: { label: "On the Way", icon: "🛵", color: "#6a1b9a", bg: "#f3e5f5", next: "delivered",        nextLabel: "Mark Delivered" },
  delivered:        { label: "Delivered",  icon: "🎉", color: "#1b5e20", bg: "#f1f8e9", next: null,              nextLabel: null },
  cancelled:        { label: "Cancelled",  icon: "❌", color: "#c62828", bg: "#ffebee", next: null,              nextLabel: null },
};

export default function RestaurantDashboard({ setPage }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState({});
  const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0 });

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    const all = JSON.parse(localStorage.getItem("fd_orders") || "[]");
    setOrders(all.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)));
    setStats({
      total: all.length,
      revenue: all.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0),
      pending: all.filter(o => !["delivered", "cancelled"].includes(o.status)).length,
    });
    setLoading(false);
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(p => ({ ...p, [orderId]: true }));
    try {
      await apiUpdateOrderStatus(orderId, newStatus);
    } catch {}
    // Always update localStorage
    const all = JSON.parse(localStorage.getItem("fd_orders") || "[]");
    const updated = all.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    localStorage.setItem("fd_orders", JSON.stringify(updated));
    setOrders(updated.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)));
    setStats({
      total: updated.length,
      revenue: updated.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0),
      pending: updated.filter(o => !["delivered", "cancelled"].includes(o.status)).length,
    });
    setUpdating(p => ({ ...p, [orderId]: false }));
  };

  const cancelOrder = (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    updateStatus(orderId, "cancelled");
  };

  const filteredOrders = filter === "all" ? orders
    : filter === "active" ? orders.filter(o => !["delivered", "cancelled"].includes(o.status))
    : orders.filter(o => o.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 28 }}>🍽️</span>
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: 18, fontFamily: "'Playfair Display', serif" }}>Restaurant Dashboard</h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>QuickBite Admin Panel</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadOrders} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>🔄 Refresh</button>
          <button onClick={() => setPage("home")} style={{ background: "#ff6b35", border: "none", color: "#fff", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>← Back to App</button>
        </div>
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Orders", value: stats.total, icon: "📦", color: "#1565c0", bg: "#e3f2fd" },
            { label: "Active Orders", value: stats.pending, icon: "⏳", color: "#e65100", bg: "#fff3e0" },
            { label: "Revenue Earned", value: `₹${stats.revenue}`, icon: "💰", color: "#2e7d32", bg: "#e8f5e9" },
            { label: "Delivered Today", value: orders.filter(o => o.status === "delivered").length, icon: "✅", color: "#6a1b9a", bg: "#f3e5f5" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ margin: "0 0 2px", color: "#aaa", fontSize: 12, fontWeight: 600 }}>{s.label}</p>
                <p style={{ margin: 0, color: s.color, fontSize: 22, fontWeight: 800 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All Orders" },
            { key: "active", label: "🔥 Active" },
            { key: "placed", label: "🔔 New" },
            { key: "preparing", label: "👨‍🍳 Preparing" },
            { key: "out_for_delivery", label: "🛵 On the Way" },
            { key: "delivered", label: "✅ Delivered" },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: filter === f.key ? "#1a1a2e" : "#fff", color: filter === f.key ? "#fff" : "#555", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontFamily: "'DM Sans', sans-serif" }}>{f.label}</button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
            <div style={{ width: 40, height: 40, border: "4px solid #f0f0f0", borderTop: "4px solid #ff6b35", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa", background: "#fff", borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No orders found</p>
            <p style={{ fontSize: 14 }}>Orders will appear here once customers start ordering</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredOrders.map(order => {
              const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.delivered;
              const isUpdating = updating[order.id];
              return (
                <div key={order.id} style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    {/* Order info */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: "#222", fontSize: 16 }}>#{order.id}</span>
                        <span style={{ background: s.bg, color: s.color, padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{s.icon} {s.label}</span>
                        {order.status === "placed" && <span style={{ background: "#ff6b35", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, animation: "pulse 1s infinite" }}>NEW</span>}
                      </div>
                      <p style={{ margin: "0 0 2px", color: "#666", fontSize: 13 }}>
                        👤 {order.user} &nbsp;•&nbsp; 🕐 {new Date(order.placedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        &nbsp;•&nbsp; {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                      {order.address && <p style={{ margin: 0, color: "#aaa", fontSize: 12 }}>📍 {order.address.street}, {order.address.city} — {order.address.pincode}</p>}
                    </div>
                    {/* Amount */}
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0 0 4px", fontWeight: 800, color: "#ff6b35", fontSize: 20 }}>₹{order.total}</p>
                      <p style={{ margin: 0, color: "#aaa", fontSize: 12 }}>💳 {order.payment === "cod" ? "Cash on Delivery" : order.payment === "upi" ? "UPI" : "Card"}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ background: "#fafafa", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: i < order.items.length - 1 ? 6 : 0 }}>
                        <span style={{ color: "#444" }}>{item.emoji || "🍽️"} {item.name} <span style={{ color: "#aaa" }}>× {item.qty}</span></span>
                        <span style={{ fontWeight: 600 }}>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  {s.next && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => updateStatus(order.id, s.next)} disabled={isUpdating} style={{ flex: 1, padding: "12px", background: isUpdating ? "#ccc" : "linear-gradient(135deg, #ff6b35, #f7931e)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: isUpdating ? "not-allowed" : "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                        {isUpdating ? "Updating..." : `${STATUS_CONFIG[s.next]?.icon || "→"} ${s.nextLabel}`}
                      </button>
                      {order.status === "placed" && (
                        <button onClick={() => cancelOrder(order.id)} style={{ padding: "12px 20px", background: "#fff", border: "2px solid #ffcdd2", color: "#e53935", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                          ✕ Cancel
                        </button>
                      )}
                    </div>
                  )}
                  {!s.next && order.status === "delivered" && (
                    <div style={{ background: "#e8f5e9", borderRadius: 10, padding: "10px 14px", textAlign: "center", color: "#2e7d32", fontWeight: 600, fontSize: 14 }}>
                      🎉 Order successfully delivered!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
    </div>
  );
}
