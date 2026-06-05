import { useState, useEffect } from "react";
import { useCart, useAuth } from "../context/AppContext";
import { restaurants } from "../data/data";
import { apiPlaceOrder } from "../data/api";

export function CheckoutPage({ setPage, setOrderId }) {
  const { items, total, dispatch, restaurantId } = useCart();
  const { user } = useAuth();
  const restaurant = restaurants.find(r => r.id === restaurantId);
  const deliveryFee = restaurant?.deliveryFee || 0;
  const taxes = Math.round(total * 0.05);
  const grandTotal = total + deliveryFee + taxes;

  const [address, setAddress] = useState({ street: "", city: "Hyderabad", pincode: "" });
  const [payment, setPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const placeOrder = async () => {
    setError("");
    if (!address.street.trim()) { setError("Please enter your street address"); return; }
    if (!address.pincode || address.pincode.length < 6) { setError("Please enter a valid 6-digit pincode"); return; }

    setPlacing(true);
    try {
      // Try real backend first
      const orderData = {
        items, restaurant: restaurant?.name, restaurantId,
        address, payment, itemTotal: total,
        deliveryFee, taxes, total: grandTotal
      };

      let orderId;
      if (user?.token && user.token !== "local") {
        const data = await apiPlaceOrder(orderData);
        orderId = data.orderId || data._id;
      }

      // Also save to localStorage as backup
      if (!orderId) orderId = "QB" + Date.now().toString().slice(-6);
      const order = {
        id: orderId, items, total: grandTotal,
        restaurant: restaurant?.name, address, payment,
        status: "confirmed", placedAt: new Date().toISOString(),
        user: user.email
      };
      const orders = JSON.parse(localStorage.getItem("fd_orders") || "[]");
      localStorage.setItem("fd_orders", JSON.stringify([order, ...orders]));

      dispatch({ type: "CLEAR" });
      setOrderId(orderId);
      setPage("tracking");
    } catch (err) {
      // Fallback to localStorage only
      const orderId = "QB" + Date.now().toString().slice(-6);
      const order = {
        id: orderId, items, total: grandTotal,
        restaurant: restaurant?.name, address, payment,
        status: "confirmed", placedAt: new Date().toISOString(),
        user: user.email
      };
      const orders = JSON.parse(localStorage.getItem("fd_orders") || "[]");
      localStorage.setItem("fd_orders", JSON.stringify([order, ...orders]));
      dispatch({ type: "CLEAR" });
      setOrderId(orderId);
      setPage("tracking");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'DM Sans', sans-serif", padding: "24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => setPage("cart")} style={backBtn}>← Back to Cart</button>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#222", marginBottom: 24 }}>Checkout</h2>

        {/* Progress steps */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          {["Cart", "Address", "Payment", "Order"].map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: i <= 1 ? "#ff6b35" : "#e0e0e0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{i < 1 ? "✓" : i + 1}</div>
                <span style={{ fontSize: 11, color: i <= 1 ? "#ff6b35" : "#aaa", marginTop: 4, fontWeight: 600 }}>{step}</span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: 2, background: i < 1 ? "#ff6b35" : "#e0e0e0", margin: "0 8px 16px" }} />}
            </div>
          ))}
        </div>

        {/* Delivery Address */}
        <Section title="📍 Delivery Address">
          <CheckoutInput value={address.street} onChange={v => setAddress(p => ({ ...p, street: v }))} placeholder="House/Flat No, Street, Area, Landmark" label="Street Address *" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <CheckoutInput value={address.city} onChange={v => setAddress(p => ({ ...p, city: v }))} placeholder="City" label="City" />
            <CheckoutInput value={address.pincode} onChange={v => setAddress(p => ({ ...p, pincode: v.replace(/\D/g, "").slice(0, 6) }))} placeholder="6-digit Pincode" label="Pincode *" />
          </div>
        </Section>

        {/* Payment */}
        <Section title="💳 Payment Method">
          {[
            { value: "upi", label: "UPI / GPay / PhonePe", icon: "📱", desc: "Pay instantly using UPI" },
            { value: "card", label: "Credit / Debit Card", icon: "💳", desc: "All major cards accepted" },
            { value: "cod", label: "Cash on Delivery", icon: "💵", desc: "Pay when food arrives" },
          ].map(opt => (
            <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: payment === opt.value ? "2px solid #ff6b35" : "2px solid #f0f0f0", borderRadius: 12, marginBottom: 10, cursor: "pointer", background: payment === opt.value ? "#fff5f2" : "#fff", transition: "all 0.2s" }}>
              <input type="radio" value={opt.value} checked={payment === opt.value} onChange={() => setPayment(opt.value)} style={{ accentColor: "#ff6b35" }} />
              <span style={{ fontSize: 22 }}>{opt.icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "#222", fontSize: 14 }}>{opt.label}</p>
                <p style={{ margin: 0, color: "#aaa", fontSize: 12 }}>{opt.desc}</p>
              </div>
            </label>
          ))}
        </Section>

        {/* Order Summary */}
        <Section title="🧾 Order Summary">
          {items.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: "#555" }}>{item.name} × {item.qty}</span>
              <span style={{ fontWeight: 600 }}>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div style={{ borderTop: "2px dashed #f0f0f0", paddingTop: 12, marginTop: 8 }}>
            {[{ l: "Item Total", v: `₹${total}` }, { l: "Delivery", v: deliveryFee === 0 ? "FREE 🎉" : `₹${deliveryFee}` }, { l: "GST & Taxes (5%)", v: `₹${taxes}` }].map(({ l, v }) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#777", marginBottom: 6 }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 17, color: "#222", marginTop: 8 }}>
              <span>Grand Total</span><span style={{ color: "#ff6b35" }}>₹{grandTotal}</span>
            </div>
          </div>
        </Section>

        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #ffcdd2", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <span>⚠️</span><span style={{ color: "#e53935", fontSize: 14 }}>{error}</span>
          </div>
        )}

        <button onClick={placeOrder} disabled={placing} style={{ width: "100%", padding: "18px", background: placing ? "#ccc" : "linear-gradient(135deg, #ff6b35, #f7931e)", color: "#fff", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 17, cursor: placing ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          {placing ? (
            <><span style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Placing your order...</>
          ) : `🚀 Place Order • ₹${grandTotal}`}
        </button>
      </div>
    </div>
  );
}

export function OrderTrackingPage({ orderId, setPage }) {
  const statuses = [
    { key: "confirmed", label: "Order Confirmed", icon: "✅", desc: "Restaurant received your order", time: "Just now" },
    { key: "preparing", label: "Preparing Your Food", icon: "👨‍🍳", desc: "Chef is carefully preparing your meal", time: "~5 mins" },
    { key: "out", label: "Out for Delivery", icon: "🛵", desc: "Delivery partner is on the way to you", time: "~20 mins" },
    { key: "delivered", label: "Delivered!", icon: "🎉", desc: "Your food has arrived. Enjoy your meal!", time: "Done" },
  ];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStep(1), 3000),
      setTimeout(() => setCurrentStep(2), 7000),
      setTimeout(() => setCurrentStep(3), 12000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const orders = JSON.parse(localStorage.getItem("fd_orders") || "[]");
  const order = orders.find(o => o.id === orderId);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'DM Sans', sans-serif", padding: "24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #ff6b35, #f7931e)", borderRadius: 20, padding: "32px 28px", color: "#fff", textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>
            {currentStep === 3 ? "🎉" : currentStep === 2 ? "🛵" : currentStep === 1 ? "👨‍🍳" : "✅"}
          </div>
          <h2 style={{ margin: "0 0 6px", fontFamily: "'Playfair Display', serif", fontSize: 26 }}>
            {currentStep === 3 ? "Delivered!" : "Order Placed!"}
          </h2>
          <p style={{ margin: "0 0 14px", opacity: 0.9, fontSize: 14 }}>Order ID: <strong>{orderId}</strong></p>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "8px 20px", display: "inline-block", fontSize: 14 }}>
            {currentStep === 3 ? "🎊 Enjoy your meal!" : "⏱ Estimated Delivery: 30–40 minutes"}
          </div>
        </div>

        {/* Live Tracking */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.07)", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 24px", color: "#333", fontSize: 16 }}>📍 Live Order Tracking</h3>
          {statuses.map((s, i) => (
            <div key={s.key} style={{ display: "flex", gap: 16, marginBottom: i < statuses.length - 1 ? 4 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "all 0.6s", background: i <= currentStep ? "linear-gradient(135deg, #ff6b35, #f7931e)" : "#f5f5f5", boxShadow: i <= currentStep ? "0 4px 14px rgba(255,107,53,0.45)" : "none" }}>
                  {i < currentStep ? "✓" : s.icon}
                </div>
                {i < statuses.length - 1 && <div style={{ width: 2, height: 32, background: i < currentStep ? "#ff6b35" : "#e0e0e0", transition: "background 0.6s", margin: "4px 0" }} />}
              </div>
              <div style={{ paddingTop: 10, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ margin: "0 0 3px", fontWeight: 700, color: i <= currentStep ? "#ff6b35" : "#aaa", fontSize: 15, transition: "color 0.6s" }}>{s.label}</p>
                  {i <= currentStep && <span style={{ fontSize: 11, color: "#aaa", background: "#f5f5f5", padding: "2px 8px", borderRadius: 10 }}>{s.time}</span>}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#bbb" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery address */}
        {order && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", marginBottom: 20 }}>
            <h4 style={{ margin: "0 0 10px", color: "#333", fontSize: 15 }}>📍 Delivering To</h4>
            <p style={{ margin: "0 0 4px", color: "#555", fontSize: 14, fontWeight: 600 }}>{order.address?.street}</p>
            <p style={{ margin: 0, color: "#888", fontSize: 13 }}>{order.address?.city} — {order.address?.pincode}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setPage("orders")} style={{ flex: 1, padding: "14px", background: "#fff", border: "2px solid #ff6b35", color: "#ff6b35", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>
            My Orders
          </button>
          <button onClick={() => setPage("home")} style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg, #ff6b35, #f7931e)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>
            Order More 🍔
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", marginBottom: 20 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#333", fontWeight: 700 }}>{title}</h3>
      {children}
    </div>
  );
}

function CheckoutInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}
        onFocus={e => e.target.style.border = "1.5px solid #ff6b35"}
        onBlur={e => e.target.style.border = "1.5px solid #e0e0e0"} />
    </div>
  );
}

const backBtn = { background: "none", border: "none", color: "#ff6b35", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "0 0 16px", fontFamily: "'DM Sans', sans-serif" };
