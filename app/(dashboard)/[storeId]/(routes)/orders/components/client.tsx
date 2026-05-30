"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Download, Search, X } from "lucide-react";
import { toast } from "react-hot-toast";

import { DataTable } from "@/components/ui/data-table";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { columns, OrderColumn } from "./columns";

interface OrderClientProps {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Local filter states synchronized with URL
  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");
  const [statusVal, setStatusVal] = useState(searchParams.get("status") || "all");
  const [dateVal, setDateVal] = useState(searchParams.get("date") || "all");

  // Debounced search trigger or manual search
  const handleFilterChange = (newSearch: string, newStatus: string, newDate: string) => {
    const queryParams = new URLSearchParams();
    
    if (newSearch) queryParams.set("search", newSearch);
    if (newStatus && newStatus !== "all") queryParams.set("status", newStatus);
    if (newDate && newDate !== "all") queryParams.set("date", newDate);

    router.push(`/${params.storeId}/orders?${queryParams.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange(searchVal, statusVal, dateVal);
  };

  const clearFilters = () => {
    setSearchVal("");
    setStatusVal("all");
    setDateVal("all");
    router.push(`/${params.storeId}/orders`);
  };

  // Export to CSV helper
  const exportToCSV = () => {
    try {
      if (data.length === 0) {
        toast.error("No data to export.");
        return;
      }

      const headers = ["Order ID", "Customer Name", "Phone", "Email", "Date", "Total Price", "Raw Price", "Payment Status", "Order Status", "Products", "Address"];
      const rows = data.map(order => [
        `"${order.id}"`,
        `"${order.customerName.replace(/"/g, '""')}"`,
        `"${order.phone}"`,
        `"${order.customerEmail}"`,
        `"${order.createdAt}"`,
        `"${order.totalPrice}"`,
        order.totalRaw,
        `"${order.paymentStatus}"`,
        `"${order.orderStatus}"`,
        `"${order.products.replace(/"/g, '""')}"`,
        `"${order.address.replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `orders_export_${formatDate(new Date())}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV export downloaded successfully!");
    } catch (error) {
      toast.error("Something went wrong during export");
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading 
          title={`Orders (${data.length})`} 
          description="Track and manage homemade food & snacks customer orders" 
        />
        <Button 
          onClick={exportToCSV}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>
      <Separator />

      {/* Filter Toolbar */}
      <div className="bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:max-w-sm">
          <div className="relative w-full">
            <Input
              placeholder="Search by ID, Name or Phone..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-9 pr-4 w-full bg-white dark:bg-neutral-950"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex flex-col space-y-1 w-[140px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground pl-1">
              Order Status
            </span>
            <Select
              value={statusVal}
              onValueChange={(val: string) => {
                setStatusVal(val);
                handleFilterChange(searchVal, val, dateVal);
              }}
            >
              <SelectTrigger className="h-9 bg-white dark:bg-neutral-950">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Packed">Packed</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col space-y-1 w-[140px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground pl-1">
              Date Period
            </span>
            <Select
              value={dateVal}
              onValueChange={(val: string) => {
                setDateVal(val);
                handleFilterChange(searchVal, statusVal, val);
              }}
            >
              <SelectTrigger className="h-9 bg-white dark:bg-neutral-950">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past 7 Days</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchVal || statusVal !== "all" || dateVal !== "all") && (
            <Button 
              onClick={clearFilters} 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 mt-5"
              title="Reset Filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Since we do sorting/filtering server side, searchKey can be anything, but we pass columns & data */}
      {/* We use id searchKey just to satisfy the custom DataTable interface, though server filters it */}
      <DataTable searchKey="customerName" columns={columns} data={data} />
    </>
  );
};
