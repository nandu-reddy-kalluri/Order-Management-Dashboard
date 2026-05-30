import React from "react";
import { format } from "date-fns";
import { Search, UserCheck } from "lucide-react";

import db from "@/lib/prismadb";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatter } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// A client component wrapper for filters is useful, but we can also write a clean, simple server action form
interface CustomersPageProps {
  params: {
    storeId: string;
  };
  searchParams: {
    search?: string;
  };
}

const CustomersPage: React.FC<CustomersPageProps> = async ({
  params,
  searchParams
}) => {
  const { search } = searchParams;

  // Fetch all orders for the store
  const orders = await db.order.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Group orders by customerName + customerPhone
  const customerMap = new Map<string, {
    name: string;
    phone: string;
    email: string;
    totalOrders: number;
    totalSpend: number;
    lastOrderDate: Date;
  }>();

  orders.forEach((order) => {
    // Unique identifier key
    const key = `${order.customerName.trim().toLowerCase()}_${order.customerPhone.trim()}`;
    
    if (customerMap.has(key)) {
      const existing = customerMap.get(key)!;
      existing.totalOrders += 1;
      existing.totalSpend += order.totalAmount;
      if (order.createdAt > existing.lastOrderDate) {
        existing.lastOrderDate = order.createdAt;
      }
    } else {
      customerMap.set(key, {
        name: order.customerName || "Anonymous",
        phone: order.customerPhone || "N/A",
        email: order.customerEmail || "N/A",
        totalOrders: 1,
        totalSpend: order.totalAmount,
        lastOrderDate: order.createdAt
      });
    }
  });

  // Convert map to array
  let customersList = Array.from(customerMap.values());

  // Filter based on search term
  if (search) {
    const searchLower = search.toLowerCase();
    customersList = customersList.filter(
      (c) => 
        c.name.toLowerCase().includes(searchLower) || 
        c.phone.includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower)
    );
  }

  // Sort by total spend descending
  customersList.sort((a, b) => b.totalSpend - a.totalSpend);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading 
          title={`Customers (${customersList.length})`} 
          description="View customer order frequency and total lifetime spend" 
        />
        <Separator />

        {/* Search bar */}
        <div className="bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center justify-between">
          <form method="GET" className="flex items-center space-x-2 w-full md:max-w-sm">
            <div className="relative w-full">
              <input
                name="search"
                defaultValue={search || ""}
                placeholder="Search customers by name or phone..."
                className="flex h-9 w-full rounded-md border border-input bg-white dark:bg-neutral-950 px-3 py-1 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button type="submit" size="sm" variant="secondary">
              Search
            </Button>
            {search && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  window.location.href = `/${params.storeId}/customers`;
                }}
                className="text-rose-500"
              >
                Clear
              </Button>
            )}
          </form>
          <div className="text-xs text-muted-foreground font-semibold flex items-center bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 py-1.5 px-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
            <UserCheck className="h-4 w-4 mr-1.5" />
            <span>Aggregated from {orders.length} total orders</span>
          </div>
        </div>

        {/* Customers Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Customer Name</TableHead>
                <TableHead className="font-bold">Phone Number</TableHead>
                <TableHead className="font-bold">Email Address</TableHead>
                <TableHead className="font-bold text-center">Total Orders</TableHead>
                <TableHead className="font-bold text-right">Total Spend</TableHead>
                <TableHead className="font-bold text-right">Last Ordered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersList.length > 0 ? (
                customersList.map((customer, index) => (
                  <TableRow key={index} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
                    <TableCell className="font-semibold">{customer.name}</TableCell>
                    <TableCell className="font-mono text-xs">{customer.phone}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{customer.email}</TableCell>
                    <TableCell className="text-center font-bold text-indigo-600 dark:text-indigo-400">
                      {customer.totalOrders}
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatter.format(customer.totalSpend)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {format(new Date(customer.lastOrderDate), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
