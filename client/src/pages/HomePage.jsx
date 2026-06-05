import { useState } from "react";
import { restaurants } from "../data/data";

const categories = ["All", "Indian", "American", "Italian", "Chinese", "South Indian", "Mexican"];

export default function HomePage({ setPage, setSelectedRestaurant }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = restaurants.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "All" || r.cuisine === category;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 60%, #ffd166 100%)",
        padding: "48px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 48px)", color: "#fff", margin: "0 0 12px", fontWeight: 800 }}>
          Hungry? We've Got You 🍕
        </h1>
        <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, marginBottom: 28 }}>
          Order from the best restaurants near you
        </p>
        {/* Search */}
        <div style={{ maxWidth: 520, margin: "0 auto", position: "relative" }}>
          <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search restaurants, cuisines, dishes..."
            style={{
              width: "100%", padding: "16px 20px 16px 48px", borderRadius: 50,
              border: "none", fontSize: 15, boxSizing: "border-box",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)", outline: "none"
            }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ padding: "24px 24px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: "8px 20px", borderRadius: 50, border: "none", cursor: "pointer",
              whiteSpace: "nowrap", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
              background: category === cat ? "#ff6b35" : "#fff",
              color: category === cat ? "#fff" : "#555",
              boxShadow: category === cat ? "0 4px 12px rgba(255,107,53,0.35)" : "0 2px 8px rgba(0,0,0,0.08)"
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Restaurant Grid */}
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>
          {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} found
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 24
        }}>
          {filtered.map(r => (
            <RestaurantCard key={r.id} restaurant={r} onClick={() => {
              setSelectedRestaurant(r);
              setPage("restaurant");
            }} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
            <div style={{ fontSize: 48 }}>😕</div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>No restaurants found</p>
            <p>Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant: r, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 16, overflow: "hidden",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)", cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      opacity: r.isOpen ? 1 : 0.7,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {!r.isOpen && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, background: "rgba(0,0,0,0.6)", padding: "6px 16px", borderRadius: 20 }}>
              Currently Closed
            </span>
          </div>
        )}
        {r.deliveryFee === 0 && r.isOpen && (
          <span style={{
            position: "absolute", top: 12, left: 12,
            background: "#ff6b35", color: "#fff",
            padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700
          }}>FREE DELIVERY</span>
        )}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "#fff", borderRadius: 8, padding: "4px 8px",
          display: "flex", alignItems: "center", gap: 4,
          fontWeight: 700, fontSize: 13, color: "#333"
        }}>
          ⭐ {r.rating}
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: "14px 16px" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "#222" }}>{r.name}</h3>
        <p style={{ margin: "0 0 10px", color: "#888", fontSize: 13 }}>{r.cuisine}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {r.tags.map(t => (
            <span key={t} style={{ background: "#fff5f2", color: "#ff6b35", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#666", fontSize: 13, borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
          <span>🕐 {r.deliveryTime}</span>
          <span>{r.deliveryFee === 0 ? "🎉 Free delivery" : `🛵 ₹${r.deliveryFee} delivery`}</span>
        </div>
      </div>
    </div>
  );
}
