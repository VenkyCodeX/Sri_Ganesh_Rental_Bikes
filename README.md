# Sri Ganesh Bike Rentals 🏍️

A fully responsive, dark-themed bike rental website for **Sri Ganesh Bike Rentals**, Hyderabad.  
Built with pure HTML, CSS, and vanilla JavaScript on the frontend, and **Node.js + Express + MongoDB** on the backend.

---

## 🌐 Live Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with hero, features, safety, testimonials, location & contact |
| Bikes | `bikes.html` | Browse, filter, search & book bikes |
| Admin | `admin.html` | JWT-protected admin dashboard |
| Terms | `terms.html` | Rental terms, deposit, documents, cancellation policy |
| 404 | `404.html` | Custom error page |

---

## 📁 Project Structure

```
SGB/
├── index.html              # Home / landing page
├── bikes.html              # Bikes listing & booking page
├── admin.html              # Admin dashboard
├── terms.html              # Terms & Conditions page
├── 404.html                # Custom 404 error page
│
├── styles.css              # Shared global styles (navbar, hero, footer, FABs)
├── bikes.css               # Bikes page styles (cards, filter bar, modal, reviews)
├── admin.css               # Admin dashboard styles (sidebar, tables, forms, toast)
│
├── script.js               # Shared JS (hamburger, scroll reveal, count-up, navbar)
├── bikes.js                # Bikes page JS (render, filter, modal, booking, reviews)
├── admin.js                # Admin JS (auth, CRUD bikes, bookings, payments)
│
├── assets/
│   ├── uploads/            # Uploaded bike images (via admin)
│   ├── logo.webp
│   ├── bg.webp
│   ├── bg_Mobile.webp
│   ├── Royal-Enfield.webp
│   ├── Activa.webp
│   ├── Activa1.webp
│   ├── Honda-Activa.webp
│   ├── Honda-Activa2.webp
│   ├── Honda-Shine.webp
│   ├── Avengers.webp
│   ├── activa-scooter.webp
│   └── placeholder.svg
│
└── backend/
    ├── server.js           # Express app entry point
    ├── seed.js             # Seeds 8 default bikes into MongoDB
    ├── package.json
    ├── .env                # Environment variables (not committed)
    ├── .env.example        # Template for .env
    │
    ├── config/
    │   └── db.js           # MongoDB connection
    │
    ├── models/
    │   ├── Bike.js
    │   ├── Booking.js
    │   ├── Review.js
    │   └── User.js
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── bikeController.js
    │   ├── bookingController.js
    │   └── reviewController.js
    │
    ├── routes/
    │   ├── auth.js
    │   ├── bikes.js
    │   ├── bookings.js
    │   ├── reviews.js
    │   └── upload.js
    │
    └── middleware/
        └── auth.js         # JWT protect + adminOnly middleware
```

---

## ✅ Features

### Home Page (`index.html`)
- Sticky navbar with hamburger menu (mobile)
- Hero section with animated count-up stats (500+ riders, 20+ models, ₹299/day, 24/7 support)
- "Why Choose Us" section with 6 feature cards and scroll-reveal animations
- **Safety & Trust** section — Helmet Included, Serviced bikes, Insured, 24/7 Roadside Support
- **Testimonials** section with 4 customer reviews
- Location section with embedded Google Map + contact details
- Footer with social links, quick links, and contact info
- Floating call & WhatsApp FABs with pulse animation

### Bikes Page (`bikes.html` + `bikes.js`)
- Animated page loader (SVG motorcycle)
- Bikes fetched live from the backend API
- Filter by category: All, Cruiser, Sport, Scooter, Adventure, Commuter
- Sort by: Price Low→High, Price High→Low, Top Rated
- Live search with debounce
- Bike cards with image, badge, availability status, price, star rating
- **Booking Modal** (3-step flow):
  - Step 1 — Customer details + date picker + **pickup time** + live cost summary (rent + ₹5,000 deposit)
  - Step 1 — **Terms & Conditions checkbox** (must agree before proceeding)
  - Step 2 — Payment (UPI / Card / QR Code tabs)
  - Step 3 — Success screen with generated Booking ID
- WhatsApp booking option (pre-filled message)
- Reviews tab — view & submit star-rated reviews per bike

### Admin Dashboard (`admin.html` + `admin.js`)
- JWT-based login (email + password) with session persistence via `sessionStorage`
- Sidebar navigation (collapsible on mobile)
- **Dashboard** — stats cards (total bikes, bookings, revenue, confirmed) + recent bookings table
- **Add Bike** — form with image URL preview or file upload (saved to `assets/uploads/`)
- **Manage Bikes** — searchable table with edit & delete actions
- **Bookings** — full bookings table with **confirm / cancel action buttons** per booking
- **Payments** — revenue stats + payment history table
- Toast notifications for all actions
- Edit bike modal

### Terms & Conditions (`terms.html`)
- Security deposit policy (₹5,000 refundable)
- Required documents (DL with MCWG, Aadhaar/PAN)
- Helmet policy, fuel policy, usage rules
- Damage charges, late return policy (₹100/hr after 2hr grace)
- Cancellation policy (full / 50% / no refund tiers)
- Linked from navbar, footer, and booking modal T&C checkbox

### Shared
- CSS custom properties (design tokens) for consistent theming
- Gold (`#c9a84c`) + dark navy color scheme
- Inter + Rajdhani Google Fonts
- Font Awesome 6.5 icons
- Fully responsive (mobile-first breakpoints at 480px, 768px, 900px)
- Scroll-reveal animations via IntersectionObserver

---

## 🔌 Backend API

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login, returns JWT token |

### Bikes
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/bikes` | Public | Get all bikes (supports `?category=`, `?sort=`, `?search=`) |
| POST | `/bikes` | Admin | Add a new bike |
| PUT | `/bikes/:id` | Admin | Update a bike |
| DELETE | `/bikes/:id` | Admin | Delete a bike |

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/bookings` | Public | Create a booking |
| GET | `/bookings` | Admin | Get all bookings |
| GET | `/bookings/stats` | Admin | Get revenue & booking stats |
| PATCH | `/bookings/:id/status` | Admin | Update booking status (confirmed / pending / cancelled) |

### Reviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/reviews/:bikeId` | Public | Get reviews for a bike |
| POST | `/reviews/:bikeId` | Public | Submit a review for a bike |

### Upload
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/upload` | Admin | Upload a bike image (multipart/form-data) |

---

## 🗄️ Database Models

### Bike
| Field | Type | Notes |
|-------|------|-------|
| name | String | Required |
| category | String | cruiser / sport / scooter / adventure / commuter |
| price | Number | Per day in ₹ |
| location | String | |
| status | String | available / rented / maintenance |
| img | String | URL or file path |
| badge | String | Popular / Hot / New / Available / Premium |
| rating | Number | 0–5, auto-updated on review |
| reviews | Number | Count, auto-updated on review |
| engine | String | e.g. 350cc |
| desc | String | Short description |

### Booking
| Field | Type | Notes |
|-------|------|-------|
| bookingId | String | Auto-generated (SG + timestamp) |
| customer | String | Customer name |
| phone | String | |
| bike | String | Bike name |
| bikeId | ObjectId | Ref to Bike |
| from | String | Start date |
| to | String | End date |
| amount | Number | Total in ₹ |
| status | String | confirmed / pending / cancelled |
| payMethod | String | upi / card / qr |
| pickupTime | String | Preferred pickup time (HH:MM) |

### Review
| Field | Type | Notes |
|-------|------|-------|
| bikeId | ObjectId | Ref to Bike |
| name | String | Reviewer name |
| rating | Number | 1–5 |
| text | String | Review content |

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | |
| email | String | Unique |
| password | String | Bcrypt hashed |
| role | String | user / admin |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### 1. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
ADMIN_EMAIL=admin@sriganeshbikerentals.in
ADMIN_PASSWORD=bikerz2025
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Seed the Database

```bash
npm run seed
```

This inserts 8 default bikes into MongoDB.

### 4. Start the Server

```bash
npm run dev       # development (nodemon)
npm start         # production
```

Server runs on `http://localhost:5000`  
Frontend is served automatically from the root folder.

### 5. Open in Browser

```
http://localhost:5000
```

Or open `index.html` directly for frontend-only preview (API features won't work without the server).

---

## 🔐 Admin Login

| Field | Value |
|-------|-------|
| URL | `http://localhost:5000/admin.html` |
| Email | `admin@sriganeshbikerentals.in` |
| Password | `bikerz2025` |

---

## 📞 Business Info

- **Address:** 6/4, ShivBagh, Balkampet, Hyderabad, Telangana – 500016
- **Phone / WhatsApp:** +91 91004 38272
- **Email:** hello@sriganeshbikerentals.in
- **Hours:** Mon – Sun: 7:00 AM – 10:00 PM

---

## 👨‍💻 Developer

Developed by **Venky**
