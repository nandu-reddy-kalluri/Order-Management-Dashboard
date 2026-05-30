"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CellAction } from "./cell-action";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export type OrderColumn = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  customerEmail: string;
  totalPrice: string;
  totalRaw: number;
  products: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100/80 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100/80 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
  Packed: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100/80 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
  Shipped: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100/80 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30",
  Delivered: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  Cancelled: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
};

const paymentColors: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  Unpaid: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
};

// Inline status switcher component
const OrderStatusCell = ({ row }: { row: any }) => {
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const orderId = row.original.id;
  const currentStatus = row.original.orderStatus;

  const onStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${orderId}`, {
        orderStatus: newStatus
      });
      toast.success("Order status updated.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      disabled={loading}
      onValueChange={onStatusChange}
      defaultValue={currentStatus}
    >
      <SelectTrigger className={`w-[120px] h-8 text-xs font-semibold ${statusColors[currentStatus] || "bg-neutral-100 text-neutral-800"}`}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map((status) => (
          <SelectItem key={status} value={status} className="text-xs font-medium">
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }: { row: any }) => (
      <span className="font-mono text-xs text-muted-foreground truncate block max-w-[80px]">
        {row.original.id}
      </span>
    )
  },
  {
    accessorKey: "customerName",
    header: "Customer Name",
    cell: ({ row }: { row: any }) => <span className="font-semibold text-sm">{row.original.customerName}</span>
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
  },
  {
    accessorKey: "createdAt",
    header: "Order Date",
  },
  {
    accessorKey: "totalPrice",
    header: "Total Amount",
    cell: ({ row }: { row: any }) => <span className="font-bold text-foreground">{row.original.totalPrice}</span>
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }: { row: any }) => (
      <Badge variant="outline" className={`font-semibold text-xs py-0.5 px-2 ${paymentColors[row.original.paymentStatus] || "bg-neutral-100"}`}>
        {row.original.paymentStatus}
      </Badge>
    )
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
    cell: ({ row }: { row: any }) => <OrderStatusCell row={row} />
  },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => <CellAction data={row.original} />
  }
];
