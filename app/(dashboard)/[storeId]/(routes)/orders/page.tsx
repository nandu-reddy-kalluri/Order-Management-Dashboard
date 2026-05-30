import { format } from "date-fns";
import db from "@/lib/prismadb";
import { OrderColumn } from "./components/columns";
import { OrderClient } from "./components/client";
import { formatter } from "@/lib/utils";

const OrdersPage = async ({
  params,
  searchParams
}: {
  params: { storeId: string },
  searchParams: { 
    search?: string;
    status?: string;
    date?: string;
  }
}) => {
  const { search, status, date } = searchParams;

  // Build filter conditions
  const where: any = {
    storeId: params.storeId,
  };

  if (status && status !== 'all') {
    where.orderStatus = status;
  }

  // Handle date filters
  if (date && date !== 'all') {
    const now = new Date();
    if (date === 'today') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      where.createdAt = { gte: startOfToday };
    } else if (date === 'week') {
      const startOfWeek = new Date();
      // start of current week (7 days ago to today)
      startOfWeek.setDate(now.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);
      where.createdAt = { gte: startOfWeek };
    } else if (date === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      where.createdAt = { gte: startOfMonth };
    }
  }

  // Query database
  let orders = await db.order.findMany({
    where,
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Filter by search term in-memory to support ID, Customer Name, and Phone Number searches easily
  if (search) {
    const searchLower = search.toLowerCase();
    orders = orders.filter(item => 
      item.id.toLowerCase().includes(searchLower) ||
      (item.customerName && item.customerName.toLowerCase().includes(searchLower)) ||
      (item.customerPhone && item.customerPhone.toLowerCase().includes(searchLower))
    );
  }

  const formattedOrders: OrderColumn[] = orders.map((item) => ({
    id: item.id,
    customerName: item.customerName || "Anonymous",
    phone: item.customerPhone || "N/A",
    address: item.address || "N/A",
    customerEmail: item.customerEmail || "N/A",
    totalPrice: formatter.format(item.totalAmount),
    totalRaw: item.totalAmount,
    products: item.orderItems.map((orderItem) => `${orderItem.product.name} (x${orderItem.quantity})`).join(', '),
    paymentStatus: item.paymentStatus,
    orderStatus: item.orderStatus,
    createdAt: format(item.createdAt, 'MMMM do, yyyy')
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;