# 🛍️ AI Shopping Mall

An AI-Powered Virtual Shopping Mall built with React, Node.js/Express, PostgreSQL, and Google Gemini AI.

## ✨ Features

- **AI Concierge** — Floating chat widget powered by Gemini 2.5 Flash that understands natural language queries and returns structured product recommendations
- **Virtual Storefront Directory** — 4 themed stores: CyberMart (Electronics), Thread & Co. (Fashion), CozySpaces (Home), PlaySphere (Toys)
- **Rich Product UI** — AI returns clickable product cards inside the chat with images and "Add to Cart" buttons
- **Unified Cart** — Cross-store cart with persistent localStorage, quantity controls
- **Checkout System** — Full form validation (Zod), database transaction, order history
- **Order History** — Lookup by email with expandable order details
- **Secure Backend** — Parameterized queries, rate limiting (10 req/min on chat), JWT auth, Zod validation

## 🗂️ Project Structure

```
/
├── client/               # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/   # Navbar, ProductCard, StoreCard, AIChatWidget, CartModal, AIProductCarousel
│   │   ├── context/      # CartContext, AuthContext
│   │   ├── pages/        # MallDirectory, StorePage, ProductPage, CartPage, OrdersPage
│   │   └── utils/        # api.js (Axios client)
│   ├── .env              # VITE_API_URL
│   └── .env.example
├── server/               # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/  # storeController, productController, chatController, orderController, authController
│   │   ├── db/           # PostgreSQL pool, schema.sql (schema + seed data)
│   │   ├── middleware/    # auth.js (JWT), validation.js (Zod)
│   │   ├── routes/       # stores, products, chat, orders, auth
│   │   ├── services/     # gemini.js (Gemini AI integration)
│   │   └── index.js      # Express app entry
│   ├── .env              # DATABASE_URL, GEMINI_API_KEY, JWT_SECRET
│   └── .env.example
├── package.json          # Root workspace with concurrently
└── README.md
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)
- Google Gemini API key

### 2. Configure Environment

**Server** — Edit `server/.env`:
```env
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/shopping_mall
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secret_key_here
```

**Client** — Edit `client/.env`:
```env
VITE_API_URL=http://localhost:3001
```

### 3. Install & Run

```bash
# Install all dependencies
npm install

# Start both frontend + backend concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### 4. Database

The database schema and seed data are **automatically applied** on server startup via `server/src/db/schema.sql`. No manual migration needed.

To run manually:
```sql
-- Connect to your PostgreSQL DB and run:
\i server/src/db/schema.sql
```

## 📡 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/stores` | List all stores |
| GET | `/api/stores/:id` | Get store by ID |
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/by-ids?ids=...` | Bulk fetch products |
| POST | `/api/chat` | AI Concierge chat (rate limited: 10/min) |
| GET | `/api/chat/history` | Get chat history |
| POST | `/api/orders/checkout` | Process checkout |
| GET | `/api/orders` | Get orders by email |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

## 🤖 AI System Architecture

```
User Message → /api/chat
   ↓
Fetch ALL products from DB (context for AI)
   ↓
Build prompt: system instruction + inventory JSON + chat history
   ↓
Gemini 2.5 Flash (structured output with responseSchema)
   ↓
Returns: { concierge_message, recommended_product_ids }
   ↓
Validate IDs against actual inventory
   ↓
Fetch full product details for recommended IDs
   ↓
Return: { message, recommendedProducts[] }
   ↓
Frontend renders AIProductCarousel inside chat
```

## 🔐 Security

- ✅ Parameterized SQL queries (no injection risk)
- ✅ Zod validation on all request bodies
- ✅ Rate limiting: 10 chat requests/minute/IP
- ✅ JWT authentication for protected routes
- ✅ Gemini API key server-side only (never exposed to frontend)
- ✅ CORS restricted to client origin

## 🗃️ Database Schema

- `users` — Email + password hash
- `stores` — Name, category, description, image
- `products` — Name, price, stock, store FK
- `orders` — User FK, total, status, shipping address
- `order_items` — Order FK, product FK, quantity, price snapshot
- `chat_sessions` — User FK, message, is_ai flag

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Tailwind CSS 3 |
| Build | Vite 5 |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL (pg driver) |
| AI | Google Gemini 2.5 Flash (@google/genai) |
| Validation | Zod |
| Auth | JWT (jsonwebtoken) |
| Icons | Lucide React |

