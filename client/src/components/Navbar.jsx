import { useState } from "react";
import { useCart, useAuth } from "../context/AppContext";

export default function Navbar({ page, setPage }) {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = user ? [
    { label: "Home", key: "home" },
    { label: "My Orders", key: "orders" },
    { label: "🏪 Dashboard", key: "dashboard" },
  ] : [
    { label: "Home", key: "home" },
  ];

  return (
    <>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        .nav-hamburger { display: none !important; }
        @media (max-width: 600px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        .nav-mobile-menu { display: none; }
      `}</style>

      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
        boxShadow: "0 4px 20px rgba(255,107,53,0.4)",
        padding: "0 20px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div onClick={() => { setPage("home"); setMenuOpen(false); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 26 }}>🍽️</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>QuickBite</span>
        </div>

        {/* Desktop */}
        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {navLinks.map(l => (
            <NavBtn key={l.key} label={l.label} onClick={() => setPage(l.key)} active={page === l.key} />
          ))}
          {user ? (
            <button onClick={logout} style={ghostBtn}>Hi, {user.name.split(" ")[0]} ↩</button>
          ) : (
            <>
              <NavBtn label="Login" onClick={() => setPage("login")} active={page === "login"} />
              <button onClick={() => setPage("signup")} style={{ background: "#fff", color: "#ff6b35", border: "none", borderRadius: 20, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Sign Up</button>
            </>
          )}
          <CartBtn count={count} onClick={() => setPage("cart")} />
        </div>

        {/* Mobile */}
        <div className="nav-hamburger" style={{ alignItems: "center", gap: 10 }}>
          <CartBtn count={count} onClick={() => { setPage("cart"); setMenuOpen(false); }} />
          <button onClick={() => setMenuOpen(o => !o)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 20, color: "#fff" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ position: "sticky", top: 64, zIndex: 99, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", animation: "slideDown 0.2s ease", padding: "12px 16px" }}>
          {navLinks.map(l => (
            <button key={l.key} onClick={() => { setPage(l.key); setMenuOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", border: "none", background: page === l.key ? "#fff5f2" : "transparent", color: page === l.key ? "#ff6b35" : "#333", fontWeight: 600, fontSize: 15, cursor: "pointer", borderRadius: 10, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {l.label}
            </button>
          ))}
          {user ? (
            <button onClick={() => { logout(); setMenuOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", border: "none", background: "transparent", color: "#888", fontWeight: 600, fontSize: 15, cursor: "pointer", borderRadius: 10, fontFamily: "'DM Sans', sans-serif" }}>
              Logout ({user.name.split(" ")[0]})
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10, padding: "8px 0" }}>
              <button onClick={() => { setPage("login"); setMenuOpen(false); }} style={{ flex: 1, padding: "12px", background: "transparent", border: "2px solid #ff6b35", color: "#ff6b35", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Login</button>
              <button onClick={() => { setPage("signup"); setMenuOpen(false); }} style={{ flex: 1, padding: "12px", background: "#ff6b35", border: "none", color: "#fff", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Sign Up</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function NavBtn({ label, onClick, active }) {
  return (
    <button onClick={onClick} style={{ background: active ? "rgba(255,255,255,0.25)" : "transparent", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 20, cursor: "pointer", fontWeight: active ? 700 : 500, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
      {label}
    </button>
  );
}

function CartBtn({ count, onClick }) {
  return (
    <button onClick={onClick} style={{ position: "relative", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", borderRadius: 20, padding: "7px 14px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
      🛒 Cart
      {count > 0 && (
        <span style={{ position: "absolute", top: -8, right: -8, background: "#fff", color: "#ff6b35", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{count}</span>
      )}
    </button>
  );
}

const ghostBtn = { background: "transparent", border: "1.5px solid rgba(255,255,255,0.6)", color: "#fff", padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" };
