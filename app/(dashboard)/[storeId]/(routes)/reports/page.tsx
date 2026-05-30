import React from "react";
import db from "@/lib/prismadb";
import { ReportsClient } from "./components/reports-client";

interface ReportsPageProps {
  params: {
    storeId: string;
  };
}

const ReportsPage: React.FC<ReportsPageProps> = async ({
  params
}) => {
  // Fetch all orders for report analysis
  const orders = await db.order.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Format to plain objects for client-side processing
  const plainOrders = orders.map((o) => ({
    id: o.id,
    customerName: o.customerName || "Anonymous",
    customerPhone: o.customerPhone || "N/A",
    customerEmail: o.customerEmail || "N/A",
    address: o.address || "N/A",
    totalAmount: o.totalAmount,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    createdAt: o.createdAt.toISOString(),
    products: o.orderItems.map((item) => `${item.product.name} (x${item.quantity})`).join(", ")
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ReportsClient orders={plainOrders} />
      </div>
    </div>
  );
};

export default ReportsPage;
