import { useState } from "react";
import { useAuth } from "../context/AppContext";
import { apiLogin, apiRegister } from "../data/api";

export function LoginPage({ setPage }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError("Please enter a valid email"); return; }
    setLoading(true);
    try {
      const data = await apiLogin({ email: form.email, password: form.password });
      if (data.token) {
        login({ name: data.user.name, email: data.user.email, token: data.token });
        setPage("home");
      } else {
        const users = JSON.parse(localStorage.getItem("fd_users") || "[]");
        const found = users.find(u => u.email === form.email && u.password === form.password);
        if (found) { login({ name: found.name, email: found.email, token: "local" }); setPage("home"); }
        else setError(data.message || "Invalid email or password");
      }
    } catch {
      const users = JSON.parse(localStorage.getItem("fd_users") || "[]");
      const found = users.find(u => u.email === form.email && u.password === form.password);
      if (found) { login({ name: found.name, email: found.email, token: "local" }); setPage("home"); }
      else setError("Invalid email or password");
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome Back 👋" subtitle="Login to your QuickBite account">
      <Input label="Email" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="you@email.com" />
      <Input label="Password" type="password" value={form.password} onChange={v => setForm(p => ({ ...p, password: v }))} placeholder="••••••••" onEnter={handleLogin} />
      {error && <ErrorMsg text={error} />}
      <LoadingButton loading={loading} onClick={handleLogin} label="Login" />
      <p style={{ textAlign: "center", fontSize: 14, color: "#888", marginTop: 16 }}>
        New here? <span onClick={() => setPage("signup")} style={{ color: "#ff6b35", fontWeight: 700, cursor: "pointer" }}>Create account</span>
      </p>
    </AuthLayout>
  );
}

export function SignupPage({ setPage }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return "Please enter your full name";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return "Please enter a valid email";
    if (!form.phone || form.phone.length < 10) return "Please enter a valid 10-digit phone number";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirm) return "Passwords do not match";
    return null;
  };

  const handleSignup = async () => {
    setError("");
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const data = await apiRegister({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      if (data.token) {
        login({ name: data.user.name, email: data.user.email, token: data.token });
        setPage("home");
      } else {
        if (data.message?.toLowerCase().includes("already")) { setError("Email already registered"); return; }
        const users = JSON.parse(localStorage.getItem("fd_users") || "[]");
        const newUser = { name: form.name, email: form.email, phone: form.phone, password: form.password };
        localStorage.setItem("fd_users", JSON.stringify([...users, newUser]));
        login({ name: newUser.name, email: newUser.email, token: "local" });
        setPage("home");
      }
    } catch {
      const users = JSON.parse(localStorage.getItem("fd_users") || "[]");
      if (users.find(u => u.email === form.email)) { setError("Email already registered"); return; }
      const newUser = { name: form.name, email: form.email, phone: form.phone, password: form.password };
      localStorage.setItem("fd_users", JSON.stringify([...users, newUser]));
      login({ name: newUser.name, email: newUser.email, token: "local" });
      setPage("home");
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Join QuickBite 🍔" subtitle="Create your free account and start ordering">
      <Input label="Full Name" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Your full name" />
      <Input label="Email" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="you@email.com" />
      <Input label="Phone Number" type="tel" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v.replace(/\D/g, "").slice(0, 10) }))} placeholder="10-digit mobile number" />
      <Input label="Password" type="password" value={form.password} onChange={v => setForm(p => ({ ...p, password: v }))} placeholder="Min 6 characters" />
      <PasswordStrength password={form.password} />
      <Input label="Confirm Password" type="password" value={form.confirm} onChange={v => setForm(p => ({ ...p, confirm: v }))} placeholder="Re-enter password" onEnter={handleSignup} />
      {error && <ErrorMsg text={error} />}
      <LoadingButton loading={loading} onClick={handleSignup} label="Create Account" />
      <p style={{ textAlign: "center", fontSize: 14, color: "#888", marginTop: 16 }}>
        Already have an account? <span onClick={() => setPage("login")} style={{ color: "#ff6b35", fontWeight: 700, cursor: "pointer" }}>Login</span>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #fff5f2 0%, #fff 100%)", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(255,107,53,0.12)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
          <h2 style={{ margin: "0 0 6px", fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#222" }}>{title}</h2>
          <p style={{ margin: 0, color: "#888", fontSize: 14 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, onEnter }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onEnter?.()}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", transition: "border 0.2s" }}
        onFocus={e => e.target.style.border = "1.5px solid #ff6b35"}
        onBlur={e => e.target.style.border = "1.5px solid #e0e0e0"} />
    </div>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const strength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? "Strong" : password.length >= 6 ? "Medium" : "Weak";
  const color = { Strong: "#4caf50", Medium: "#ff9800", Weak: "#e53935" }[strength];
  const width = { Strong: "100%", Medium: "60%", Weak: "30%" }[strength];
  return (
    <div style={{ marginTop: -10, marginBottom: 14 }}>
      <div style={{ height: 4, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width, background: color, borderRadius: 4, transition: "width 0.3s" }} />
      </div>
      <p style={{ margin: "4px 0 0", fontSize: 11, color, fontWeight: 600 }}>{strength} password</p>
    </div>
  );
}

function ErrorMsg({ text }) {
  return (
    <div style={{ background: "#fff5f5", border: "1px solid #ffcdd2", borderRadius: 8, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
      <span>⚠️</span>
      <span style={{ color: "#e53935", fontSize: 13, fontWeight: 500 }}>{text}</span>
    </div>
  );
}

function LoadingButton({ loading, onClick, label }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "#ffb89a" : "linear-gradient(135deg, #ff6b35, #f7931e)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      {loading && <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {loading ? "Please wait..." : label}
    </button>
  );
}
