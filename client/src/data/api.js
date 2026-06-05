// Central API service — all backend calls go through here
const BASE = "http://localhost:5000/api";

function getToken() {
  const user = localStorage.getItem("fd_user");
  return user ? JSON.parse(user).token : null;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// ── AUTH ──
export async function apiRegister(data) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiLogin(data) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ── ORDERS ──
export async function apiPlaceOrder(orderData) {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(orderData),
  });
  return res.json();
}

export async function apiGetMyOrders() {
  const res = await fetch(`${BASE}/orders/my`, { headers: authHeaders() });
  return res.json();
}

export async function apiUpdateOrderStatus(orderId, status) {
  const res = await fetch(`${BASE}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function apiGetRestaurantOrders() {
  const res = await fetch(`${BASE}/orders/restaurant`, { headers: authHeaders() });
  return res.json();
}
