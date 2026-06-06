# 🍔 QuickBite — Food Delivery App

A full-stack food delivery web application built with React, Node.js, Express, and MongoDB.

**Built for UCT & upSkill Campus Internship — Full Stack Domain**

---

## 🚀 Features

- 🏠 Browse restaurants with search & category filters
- 🍽️ View restaurant menus with veg/non-veg indicators
- 🛒 Add to cart with quantity controls
- 🔐 User authentication (Sign up / Login)
- 📍 Checkout with delivery address and payment method
- 🛵 Live order tracking with status steps
- 📦 Order history page

---

## 🗂️ Project Structure

```
food-delivery-app/
├── client/          ← React frontend (Vite)
│   ├── src/
│   │   ├── pages/         (HomePage, RestaurantPage, CartPage, AuthPages, CheckoutTracking, OrdersPage)
│   │   ├── components/    (Navbar)
│   │   ├── context/       (AppContext - Cart & Auth)
│   │   ├── data/          (data.js - restaurant & menu data)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/          ← Node.js + Express backend
│   ├── models/      (User.js, Order.js)
│   ├── routes/      (auth.js, restaurants.js, orders.js)
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas - free) |
| Auth | JWT (jsonwebtoken) |
| Password | bcryptjs |
| State | React Context API |

---

## 🔧 Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Git
- MongoDB Atlas free account (cloud.mongodb.com)

### 2. Clone the project
```bash
git clone https://github.com/YOUR_USERNAME/food-delivery-app.git
cd food-delivery-app
```

### 3. Setup Backend
```bash
cd server
npm install
# Edit .env.example with your MongoDB URI
npm run dev
```

### 4. Setup Frontend
```bash
cd ../client
npm install
npm run dev
```

### 5. Open in browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/restaurants | Get all restaurants |
| GET | /api/restaurants/:id | Get single restaurant |
| POST | /api/orders | Place new order (auth required) |
| GET | /api/orders/my | Get user's orders (auth required) |
| GET | /api/orders/:id | Get order by ID (auth required) |
| PATCH | /api/orders/:id/status | Update order status |

---

## 👩‍💻 Developer

**Yelakanti Jyothi**  
Full Stack Internship — UCT & upSkill Campus  
Domain: Full Stack Development  
Project: Food Delivery Application
