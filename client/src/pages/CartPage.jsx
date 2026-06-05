import { useCart, useAuth } from "../context/AppContext";
import { restaurants } from "../data/data";

export default function CartPage({ setPage }) {
  const { items, total, dispatch, restaurantId } = useCart();
  const { user } = useAuth();
  const restaurant = restaurants.find(r => r.id === restaurantId);
  const deliveryFee = restaurant?.deliveryFee || 0;
  const taxes = Math.round(total * 0.05);
  const grandTotal = total + deliveryFee + taxes;

  if (items.length === 0) return (
    <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🛒</div>
      <h2 style={{ color: "#333", margin: "0 0 8px" }}>Your cart is empty</h2>
      <p style={{ color: "#888", marginBottom: 24 }}>Add items from a restaurant to get started</p>
      <button onClick={() => setPage("home")} style={orangeBtn}>Browse Restaurants</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'DM Sans', sans-serif", padding: "24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#222", marginBottom: 4 }}>Your Cart</h2>
        {restaurant && <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>from <strong>{restaurant.name}</strong></p>}

        {/* Items */}
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.07)", marginBottom: 20 }}>
          {items.map((item, idx) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: idx < items.length - 1 ? "1px solid #f5f5f5" : "none" }}>
              <div style={{ width: 60, height: 50, borderRadius: 10, overflow: "hidden", background: "#fff5f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                <span style={{ display: "none", fontSize: 24 }}>{item.emoji}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 600, color: "#222", fontSize: 14 }}>{item.name}</p>
                <p style={{ margin: 0, color: "#ff6b35", fontWeight: 700, fontSize: 13 }}>₹{item.price} each</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#ff6b35", borderRadius: 20, padding: "6px 14px" }}>
                <button onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty - 1 })} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", fontWeight: 700, lineHeight: 1 }}>−</button>
                <span style={{ color: "#fff", fontWeight: 700, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty + 1 })} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", fontWeight: 700, lineHeight: 1 }}>+</button>
              </div>
              <span style={{ fontWeight: 700, color: "#333", minWidth: 60, textAlign: "right" }}>₹{item.price * item.qty}</span>
              <button onClick={() => dispatch({ type: "REMOVE_ITEM", id: item.id })} style={{ background: "#fff0f0", border: "none", color: "#e53935", fontSize: 16, cursor: "pointer", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#333" }}>Bill Summary</h3>
          {[
            { label: "Item Total", value: `₹${total}` },
            { label: "Delivery Fee", value: deliveryFee === 0 ? "FREE 🎉" : `₹${deliveryFee}` },
            { label: "GST & Taxes (5%)", value: `₹${taxes}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "#666" }}>
              <span>{label}</span><span>{value}</span>
            </div>
          ))}
          <div style={{ borderTop: "2px dashed #f0f0f0", paddingTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 17, color: "#222" }}>
            <span>Grand Total</span><span>₹{grandTotal}</span>
          </div>
        </div>

        {/* Savings banner */}
        {deliveryFee === 0 && (
          <div style={{ background: "linear-gradient(135deg, #e8f5e9, #f1f8e9)", border: "1px solid #a5d6a7", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <span style={{ color: "#2e7d32", fontWeight: 600, fontSize: 14 }}>You saved on delivery! Free delivery from {restaurant?.name}</span>
          </div>
        )}

        {/* Checkout / Auth */}
        {user ? (
          <button onClick={() => setPage("checkout")} style={{ ...orangeBtn, width: "100%", fontSize: 16, padding: "16px", borderRadius: 14 }}>
            Proceed to Checkout • ₹{grandTotal} →
          </button>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#333", marginBottom: 6 }}>Login to place your order</p>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Your cart will be saved after you log in</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setPage("login")} style={orangeBtn}>Login</button>
              <button onClick={() => setPage("signup")} style={outlineBtn}>Sign Up</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const orangeBtn = { background: "linear-gradient(135deg, #ff6b35, #f7931e)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px", fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "'DM Sans', sans-serif" };
const outlineBtn = { background: "#fff", color: "#ff6b35", border: "2px solid #ff6b35", borderRadius: 12, padding: "12px 28px", fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "'DM Sans', sans-serif" };
