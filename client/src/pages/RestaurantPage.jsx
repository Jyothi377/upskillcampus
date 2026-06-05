import { useState } from "react";
import { menus } from "../data/data";
import { useCart, useAuth } from "../context/AppContext";

export default function RestaurantPage({ restaurant, setPage }) {
  const menu = menus[restaurant.id] || [];
  const categories = [...new Set(menu.map(i => i.category))];
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [addedIds, setAddedIds] = useState({});
  const { items, dispatch, restaurantId } = useCart();
  const { user } = useAuth();

  const filteredMenu = activeCategory ? menu.filter(i => i.category === activeCategory) : menu;

  const getQty = (id) => items.find(i => i.id === id)?.qty || 0;

  const handleAdd = (item) => {
    if (!user) { setPage("login"); return; }
    if (restaurantId && restaurantId !== restaurant.id) {
      if (!window.confirm("Your cart has items from another restaurant. Clear cart and add this item?")) return;
      dispatch({ type: "CLEAR" });
    }
    dispatch({ type: "ADD_ITEM", item, restaurantId: restaurant.id });
    setAddedIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [item.id]: false })), 800);
  };

  const handleQty = (item, qty) => {
    dispatch({ type: "UPDATE_QTY", id: item.id, qty });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Hero Banner */}
      <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
        <img src={restaurant.image} alt={restaurant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />
        <button onClick={() => setPage("home")} style={{
          position: "absolute", top: 20, left: 20,
          background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 50,
          width: 40, height: 40, fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700
        }}>←</button>
        <div style={{ position: "absolute", bottom: 24, left: 24, color: "#fff" }}>
          <h1 style={{ margin: 0, fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 800 }}>{restaurant.name}</h1>
          <p style={{ margin: "4px 0 0", opacity: 0.9, fontSize: 14 }}>{restaurant.cuisine} • ⭐ {restaurant.rating}</p>
        </div>
      </div>

      {/* Info Strip */}
      <div style={{ background: "#fff", padding: "14px 24px", display: "flex", gap: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", flexWrap: "wrap" }}>
        {[
          { icon: "🕐", label: restaurant.deliveryTime },
          { icon: "🛵", label: restaurant.deliveryFee === 0 ? "Free Delivery" : `₹${restaurant.deliveryFee} delivery` },
          { icon: "💰", label: `Min order ₹${restaurant.minOrder}` },
          { icon: restaurant.isOpen ? "🟢" : "🔴", label: restaurant.isOpen ? "Open Now" : "Closed" },
        ].map(({ icon, label }) => (
          <span key={label} style={{ fontSize: 13, color: "#555", display: "flex", alignItems: "center", gap: 6 }}>
            {icon} {label}
          </span>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        {/* Category Tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: "8px 20px", borderRadius: 50, border: "none", cursor: "pointer",
              whiteSpace: "nowrap", fontWeight: 600, fontSize: 13,
              background: activeCategory === cat ? "#ff6b35" : "#fff",
              color: activeCategory === cat ? "#fff" : "#555",
              boxShadow: activeCategory === cat ? "0 4px 12px rgba(255,107,53,0.35)" : "0 2px 8px rgba(0,0,0,0.08)"
            }}>{cat}</button>
          ))}
        </div>

        {/* Menu Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredMenu.map(item => {
            const qty = getQty(item.id);
            return (
              <div key={item.id} style={{
                background: "#fff", borderRadius: 16, padding: 16,
                display: "flex", gap: 16, alignItems: "center",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
              }}>
                <div style={{ width: 100, height: 80, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#fff5f2", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.style.display = "none"; e.target.parentNode.querySelector("span").style.display = "flex"; }} />
                  <span style={{ display: "none", fontSize: 36, position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>{item.emoji}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12 }}>{item.veg ? "🟢" : "🔴"}</span>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#222" }}>{item.name}</h3>
                  </div>
                  <p style={{ margin: "0 0 8px", color: "#888", fontSize: 13 }}>{item.description}</p>
                  <span style={{ fontWeight: 800, fontSize: 16, color: "#ff6b35" }}>₹{item.price}</span>
                </div>
                {/* Add/Qty Controls */}
                <div style={{ flexShrink: 0 }}>
                  {qty === 0 ? (
                    <button onClick={() => handleAdd(item)} disabled={!restaurant.isOpen} style={{
                      background: restaurant.isOpen ? (addedIds[item.id] ? "#4caf50" : "#ff6b35") : "#ccc",
                      color: "#fff", border: "none", borderRadius: 20,
                      padding: "10px 20px", fontWeight: 700, cursor: restaurant.isOpen ? "pointer" : "not-allowed",
                      fontSize: 14, transition: "background 0.3s", minWidth: 80
                    }}>
                      {addedIds[item.id] ? "✓ Added" : "+ Add"}
                    </button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#ff6b35", borderRadius: 20, padding: "6px 14px" }}>
                      <button onClick={() => handleQty(item, qty - 1)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", fontWeight: 700, lineHeight: 1 }}>−</button>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, minWidth: 16, textAlign: "center" }}>{qty}</span>
                      <button onClick={() => handleQty(item, qty + 1)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", fontWeight: 700, lineHeight: 1 }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
