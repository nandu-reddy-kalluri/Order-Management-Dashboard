"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Mail, 
  MapPin, 
  Phone, 
  User, 
  ShoppingBag,
  BadgeAlert,
  BadgeCheck
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatter } from "@/lib/utils";

interface OrderDetailsClientProps {
  order: any; // Order typed from database
}

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
  Packed: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
  Shipped: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30",
  Delivered: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  Cancelled: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
};

const paymentColors: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  Unpaid: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
};

export const OrderDetailsClient: React.FC<OrderDetailsClientProps> = ({
  order
}) => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);

  const onStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${order.id}`, {
        orderStatus: newStatus
      });
      toast.success("Order status updated.");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update order status.");
    } finally {
      setLoading(false);
    }
  };

  const onPaymentChange = async (newPaymentStatus: string) => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${order.id}`, {
        paymentStatus: newPaymentStatus
      });
      toast.success("Payment status updated.");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update payment status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => router.push(`/${params.storeId}/orders`)} 
            variant="outline" 
            size="icon"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold">Order Details</h2>
              <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-muted-foreground">
                #{order.id}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
            </p>
          </div>
        </div>

        {/* Update status panel */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
              Order Status
            </span>
            <Select
              disabled={loading}
              onValueChange={onStatusChange}
              defaultValue={order.orderStatus}
            >
              <SelectTrigger className={`w-[140px] h-9 text-xs font-semibold ${statusColors[order.orderStatus] || "bg-neutral-100"}`}>
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
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
              Payment Status
            </span>
            <Select
              disabled={loading}
              onValueChange={onPaymentChange}
              defaultValue={order.paymentStatus}
            >
              <SelectTrigger className={`w-[130px] h-9 text-xs font-semibold ${paymentColors[order.paymentStatus] || "bg-neutral-100"}`}>
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                {["Unpaid", "Paid"].map((status) => (
                  <SelectItem key={status} value={status} className="text-xs font-medium">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Separator />

      {/* Grid containing customer info and order items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/10">
              <CardTitle className="text-md font-bold flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Ordered Items ({order.orderItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {order.orderItems.map((item: any) => {
                const subtotal = item.quantity * item.price;
                const imageSrc = item.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=200";

                return (
                  <div key={item.id} className="flex items-center justify-between p-6 hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-16 rounded-lg border overflow-hidden bg-neutral-100">
                        <Image 
                          src={imageSrc} 
                          alt={item.product.name} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatter.format(item.price)} &times; {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-foreground">
                        {formatter.format(subtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Pricing Calculation Summary */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatter.format(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping Fee</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free Delivery</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold text-foreground">
                <span>Total Amount</span>
                <span>{formatter.format(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 column: Customer Details & Info */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <Card>
            <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/10">
              <CardTitle className="text-md font-bold flex items-center">
                <User className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Customer Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <User className="h-4.5 w-4.5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</p>
                  <p className="text-sm font-semibold mt-0.5">{order.customerName || "Anonymous"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-4.5 w-4.5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</p>
                  <p className="text-sm font-semibold mt-0.5">{order.customerPhone || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="h-4.5 w-4.5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</p>
                  <p className="text-sm font-semibold mt-0.5">{order.customerEmail || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address Card */}
          <Card>
            <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/10">
              <CardTitle className="text-md font-bold flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4.5 w-4.5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm leading-relaxed text-foreground font-medium">
                    {order.address || "No address provided."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
