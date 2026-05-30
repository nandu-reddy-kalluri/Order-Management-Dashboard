import React from "react";
import { redirect } from "next/navigation";

import db from "@/lib/prismadb";
import { OrderDetailsClient } from "./components/order-details-client";

interface OrderPageProps {
  params: {
    storeId: string;
    orderId: string;
  };
}

const OrderDetailPage: React.FC<OrderPageProps> = async ({
  params
}) => {
  const order = await db.order.findUnique({
    where: {
      id: params.orderId
    },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      }
    }
  });

  if (!order || order.storeId !== params.storeId) {
    redirect(`/${params.storeId}/orders`);
  }

  // Format order date
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderDetailsClient order={order} />
      </div>
    </div>
  );
};

export default OrderDetailPage;
