"use client";

import axios from "axios";
import { Copy, Eye, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { OrderColumn } from "./columns";

interface CellActionProps {
  data: OrderColumn;
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
}) => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Order ID copied to clipboard.');
  };

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
        orderStatus: status
      });
      toast.success(`Order status updated to ${status}`);
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
        paymentStatus: "Paid"
      });
      toast.success('Order marked as Paid');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onCopy(data.id)}
        >
          <Copy className="mr-2 h-4 w-4" /> Copy Order ID
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/${params.storeId}/orders/${data.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        
        {data.paymentStatus !== "Paid" && (
          <DropdownMenuItem
            onClick={markAsPaid}
          >
            <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" /> Mark as Paid
          </DropdownMenuItem>
        )}

        {data.orderStatus !== "Delivered" && data.orderStatus !== "Cancelled" && (
          <>
            <DropdownMenuItem
              onClick={() => updateStatus("Delivered")}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-teal-600" /> Mark Delivered
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateStatus("Cancelled")}
            >
              <XCircle className="mr-2 h-4 w-4 text-rose-600" /> Cancel Order
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
