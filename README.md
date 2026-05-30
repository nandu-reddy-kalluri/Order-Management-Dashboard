# BiteSize - Food & Snacks Order Management Dashboard

BiteSize is a high-performance **Order Management Dashboard** specifically designed for a Homemade Food & Snacks business. Built on top of Next.js 13 App Router, React, Tailwind CSS, Prisma ORM, and Supabase PostgreSQL.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 13 App Router](https://nextjs.org/)
- **Frontend Logic**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Database**: [Supabase PostgreSQL](https://supabase.com/)
- **Authentication**: [Clerk Authentication](https://clerk.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Key Modules & Features

1. **Dashboard Overview**:
   - Clean 5-column metric dashboard showing: **Revenue**, **Total Orders**, **Pending Orders**, **Delivered Orders**, and **Cancelled Orders**.
   - Interactive SVG charts showing orders and revenue patterns over the past 7 days.
2. **Orders Management**:
   - Order tracking and state transitions across: `Pending`, `Confirmed`, `Packed`, `Shipped`, `Delivered`, and `Cancelled`.
   - Advanced order searches by **Order ID**, **Customer Name**, and **Phone Number**.
   - Filtering filters for order status and date ranges (Today, Past 7 Days, This Month).
   - One-click **CSV Export** to download order summaries.
3. **Products Catalog**:
   - Food and snacks catalog organized across 5 core categories: **Pickles**, **Snacks**, **Sweets**, **Podi**, and **Ghee**.
4. **Customers Module**:
   - Automated profiling page listing customer spend frequency and lifetime revenue aggregated dynamically from order histories.
5. **Reports Module**:
   - Deep sales analysis charts and summaries for business insights.
6. **Settings Page**:
   - Store configurations, Clerk profiles, and API credential management.

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or newer)
- A [Supabase](https://supabase.com/) PostgreSQL instance
- A [Clerk](https://clerk.com/) authentication account

### Installation

1. Clone the project files:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment configuration:
   Create a `.env` file in the project root folder:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

4. Push the schema to your Supabase instance:
   ```bash
   npx prisma db push
   ```

5. Seed the database with demo products and orders:
   ```bash
   npm run seed
   ```

6. Run the local development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.
# Order-Management-Dashboard
