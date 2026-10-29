# 🛍️ AI Shopping Mall

An AI-Powered Virtual Shopping Mall built with React, Node.js/Express, Supabase (PostgreSQL), and Groq AI (Llama 3.3 70B).

## ✨ Features

- **AI Concierge** — Floating chat widget powered by Groq AI (`llama-3.3-70b-versatile`) that understands natural language shopping requests and returns structured product recommendations
- **Virtual Storefront Directory** — 4 simulated stores: CyberMart (Electronics), Thread & Co. (Fashion), CozySpaces (Home & Living), PlaySphere (Toys & Games)
- **Rich Product UI** — The AI returns structured product cards inside the chat with images, pricing, and 1-click "Add to Cart" buttons
- **Unified Cart** — Cross-store cart with persistent localStorage, quantity controls, and slide-out modal
- **Simulated Checkout System** — Full form validation with Zod, database transaction, and stock updates
- **Order History** — Lookup by email with expandable order summaries and item breakdowns
- **Robust Backend** — Parameterized SQL queries, rate limiting (10 req/min on chat), JWT auth, and Zod request validation

## 🗂️ Project Structure

```
/
├── client/               # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/   # Navbar, ProductCard, StoreCard, AIChatWidget, CartModal, AIProductCarousel
│   │   ├── context/      # CartContext, AuthContext
│   │   ├── pages/        # MallDirectory, StorePage, ProductPage, CartPage, OrdersPage
│   │   └── utils/        # api.js (Axios client), supabase.js (Client SDK)
│   ├── .env.example
│   └── package.json
├── server/               # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/  # storeController, productController, chatController, orderController, authController
│   │   ├── db/           # PostgreSQL pool (pg), supabase.js, schema.sql
│   │   ├── middleware/   # auth.js (JWT), validation.js (Zod)
│   │   ├── routes/       # stores, products, chat, orders, auth
│   │   ├── services/     # groq.js (Groq SDK Llama 3.3 70B integration)
│   │   └── index.js      # Express server entry
│   ├── .env.example
│   └── package.json
├── package.json          # Root workspace with concurrently
└── README.md
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Supabase account (PostgreSQL)
- Groq API key ([console.groq.com/keys](https://console.groq.com/keys))

### 2. Configure Environment Variables

**Server** — Copy `server/.env.example` to `server/.env`:
```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres.[project-ref]:[db-password]@aws-0-[region].pooler.supabase.com:5432/postgres
GROQ_API_KEY=gsk_your_groq_api_key
JWT_SECRET=your_jwt_signing_secret
```

**Client** — Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start both backend and frontend concurrently
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### 4. Database Setup

Database schema and seed data are automatically initialized on startup via `server/src/db/schema.sql`. You can also paste `server/src/db/schema.sql` directly into your Supabase SQL Editor.

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/stores` | Fetch all mall stores |
| GET | `/api/stores/:id` | Fetch specific store details |
| GET | `/api/products` | Search/filter products across stores |
| GET | `/api/products/:id` | Product detail view |
| GET | `/api/products/by-ids` | Bulk product lookup for AI widget |
| POST | `/api/chat` | AI Concierge chat (Groq Llama 3.3 70B) |
| POST | `/api/orders/checkout` | Process simulated checkout |
| GET | `/api/orders` | Fetch user order history |

## 🛡️ Security

- Parameterized SQL queries (zero SQL injection risk)
- Zod schema validation on incoming request bodies
- Rate limiting: max 10 chat requests/min per IP
- AI and Database credentials kept strictly server-side
- Sensitive `.env` files are ignored by Git

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Tailwind CSS 3, Vite |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL with Session Pooler) |
| AI Model | Groq (`llama-3.3-70b-versatile`) |
| Data Validation | Zod |
| Icons | Lucide React |
