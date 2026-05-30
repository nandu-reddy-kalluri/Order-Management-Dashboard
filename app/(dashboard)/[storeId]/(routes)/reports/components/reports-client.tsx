"use client";

import { useState, useMemo } from "react";
import { 
  Download, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format, parseISO, subDays, isAfter, startOfDay } from "date-fns";

import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { formatter } from "@/lib/utils";

interface OrderData {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string; // ISO String
  products: string;
}

interface ReportsClientProps {
  orders: OrderData[];
}

export const ReportsClient: React.FC<ReportsClientProps> = ({
  orders
}) => {
  const [period, setPeriod] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dynamic filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Period filter
      if (period !== "all") {
        const orderDate = parseISO(order.createdAt);
        const now = new Date();
        let compareDate = new Date(0); // far past
        
        if (period === "today") {
          compareDate = startOfDay(now);
        } else if (period === "week") {
          compareDate = subDays(now, 7);
        } else if (period === "month") {
          compareDate = subDays(now, 30);
        }

        if (!isAfter(orderDate, compareDate)) {
          return false;
        }
      }

      // 2. Payment filter
      if (paymentFilter !== "all" && order.paymentStatus !== paymentFilter) {
        return false;
      }

      // 3. Status filter
      if (statusFilter !== "all" && order.orderStatus !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [orders, period, paymentFilter, statusFilter]);

  // Calculations based on filtered list
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders
      .filter(o => o.paymentStatus === "Paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const ordersCount = filteredOrders.length;
    const deliveredCount = filteredOrders.filter(o => o.orderStatus === "Delivered").length;
    const cancelledCount = filteredOrders.filter(o => o.orderStatus === "Cancelled").length;

    return {
      totalRevenue,
      ordersCount,
      deliveredCount,
      cancelledCount
    };
  }, [filteredOrders]);

  // Aggregate stats for chart: last 7 entries (grouped by day)
  const chartData = useMemo(() => {
    const days = period === "today" ? 1 : period === "week" ? 7 : 30;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const label = days <= 7 ? format(date, "EEE") : format(date, "MMM dd");
      const dateKey = format(date, "yyyy-MM-dd");

      const dayOrders = filteredOrders.filter(o => {
        const orderDay = format(parseISO(o.createdAt), "yyyy-MM-dd");
        return orderDay === dateKey;
      });

      const revenue = dayOrders
        .filter(o => o.paymentStatus === "Paid")
        .reduce((sum, o) => sum + o.totalAmount, 0);

      result.push({
        label,
        count: dayOrders.length,
        revenue
      });
    }

    return result;
  }, [filteredOrders, period]);

  const maxRevenue = useMemo(() => {
    return Math.max(...chartData.map(d => d.revenue), 100);
  }, [chartData]);

  const maxCount = useMemo(() => {
    return Math.max(...chartData.map(d => d.count), 5);
  }, [chartData]);

  // Reset all filters
  const resetFilters = () => {
    setPeriod("all");
    setPaymentFilter("all");
    setStatusFilter("all");
    toast.success("Filters reset.");
  };

  // CSV Export Trigger
  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const headers = ["Order ID", "Customer Name", "Phone", "Email", "Date", "Total Amount", "Payment Status", "Order Status", "Address", "Products Ordered"];
    const rows = filteredOrders.map(o => [
      `"${o.id}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.customerEmail}"`,
      `"${format(parseISO(o.createdAt), 'yyyy-MM-dd HH:mm')}"`,
      o.totalAmount,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${o.address.replace(/"/g, '""')}"`,
      `"${o.products.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reports_export_${period}_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <Heading 
          title="Sales & Operations Reports" 
          description="Analyze revenue growth, operational status metrics, and export data logs" 
        />
        <Button 
          onClick={exportCSV}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Download className="h-4 w-4" />
          <span>Export filtered CSV</span>
        </Button>
      </div>
      <Separator />

      {/* Interactive Filters Grid */}
      <div className="bg-neutral-50 dark:bg-neutral-900/40 p-5 rounded-xl border grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Time Range
          </span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="bg-white dark:bg-neutral-950">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Past 7 Days</SelectItem>
              <SelectItem value="month">Past 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Payment Status
          </span>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="bg-white dark:bg-neutral-950">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Order Status
          </span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white dark:bg-neutral-950">
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

        <div className="flex items-center space-x-2">
          <Button 
            onClick={resetFilters} 
            variant="outline" 
            className="w-full flex items-center justify-center space-x-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card className="border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/10 dark:bg-emerald-950/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {formatter.format(metrics.totalRevenue)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">From paid orders in selected range</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 dark:border-indigo-950/20 bg-indigo-50/10 dark:bg-indigo-950/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Orders Count
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
              {metrics.ordersCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Total placed matching filter criteria</p>
          </CardContent>
        </Card>

        <Card className="border-teal-100 dark:border-teal-950/20 bg-teal-50/10 dark:bg-teal-950/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Delivered Orders
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-300">
              {metrics.deliveredCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Delivered successfully to customer</p>
          </CardContent>
        </Card>

        <Card className="border-rose-100 dark:border-rose-950/20 bg-rose-50/10 dark:bg-rose-950/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Cancelled Orders
            </CardTitle>
            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300">
              {metrics.cancelledCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Orders voided / returned</p>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Graph Visualizations (Shown only if multi-day period selected) */}
      {period !== "today" && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-md font-bold">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Earnings pattern over the last {chartData.length} active periods</p>
            </div>
            <div className="h-56 w-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="repAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                {/* Horizontal gridlines */}
                {[0, 1, 2, 3].map((g) => (
                  <line 
                    key={g} 
                    x1="20" 
                    y1={20 + g * 40} 
                    x2="480" 
                    y2={20 + g * 40} 
                    stroke="#e2e8f0" 
                    strokeDasharray="4" 
                    className="dark:stroke-neutral-800"
                  />
                ))}
                {(() => {
                  const points = chartData.map((d, index) => {
                    const x = 30 + (index / (chartData.length - 1)) * 440;
                    const y = 160 - (d.revenue / maxRevenue) * 130;
                    return { x, y, value: d.revenue };
                  });

                  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = points.length > 0 
                    ? `${linePath} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z` 
                    : '';

                  return (
                    <>
                      {areaPath && <path d={areaPath} fill="url(#repAreaGrad)" />}
                      {linePath && <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" />}
                      {points.map((p, idx) => (
                        <g key={idx} className="group cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="4" className="fill-emerald-600 stroke-white dark:stroke-neutral-900 stroke-1.5 hover:r-6 transition-all" />
                          <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[10px] font-bold fill-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            ${p.value.toFixed(0)}
                          </text>
                          <text x={p.x} y="185" textAnchor="middle" className="text-[8px] fill-muted-foreground font-semibold">
                            {chartData[idx].label}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
                <line x1="20" y1="160" x2="480" y2="160" stroke="#cbd5e1" className="dark:stroke-neutral-700" />
              </svg>
            </div>
          </Card>

          {/* Volume Chart */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-md font-bold">Order Count Trend</h3>
              <p className="text-xs text-muted-foreground">Order volume pattern over the last {chartData.length} active periods</p>
            </div>
            <div className="h-56 w-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="repAreaGradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                {/* Horizontal gridlines */}
                {[0, 1, 2, 3].map((g) => (
                  <line 
                    key={g} 
                    x1="20" 
                    y1={20 + g * 40} 
                    x2="480" 
                    y2={20 + g * 40} 
                    stroke="#e2e8f0" 
                    strokeDasharray="4" 
                    className="dark:stroke-neutral-800"
                  />
                ))}
                {(() => {
                  const points = chartData.map((d, index) => {
                    const x = 30 + (index / (chartData.length - 1)) * 440;
                    const y = 160 - (d.count / maxCount) * 130;
                    return { x, y, value: d.count };
                  });

                  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = points.length > 0 
                    ? `${linePath} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z` 
                    : '';

                  return (
                    <>
                      {areaPath && <path d={areaPath} fill="url(#repAreaGradBlue)" />}
                      {linePath && <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" />}
                      {points.map((p, idx) => (
                        <g key={idx} className="group cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="4" className="fill-indigo-600 stroke-white dark:stroke-neutral-900 stroke-1.5 hover:r-6 transition-all" />
                          <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[10px] font-bold fill-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            {p.value}
                          </text>
                          <text x={p.x} y="185" textAnchor="middle" className="text-[8px] fill-muted-foreground font-semibold">
                            {chartData[idx].label}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
                <line x1="20" y1="160" x2="480" y2="160" stroke="#cbd5e1" className="dark:stroke-neutral-700" />
              </svg>
            </div>
          </Card>
        </div>
      )}

      {/* Detailed Log List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Transaction Logs ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[300px] overflow-y-auto divide-y">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((o) => (
              <div key={o.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors px-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-foreground">{o.customerName}</span>
                    <span className="text-muted-foreground font-mono text-[10px]">#{o.id.substring(0, 8)}...</span>
                  </div>
                  <p className="text-muted-foreground text-[10px] max-w-[320px] truncate">{o.products}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="font-bold text-foreground">{formatter.format(o.totalAmount)}</span>
                  <div className="flex items-center space-x-1 justify-end text-[10px] font-semibold">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'}`}>
                      {o.paymentStatus}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${o.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20' : o.orderStatus === 'Cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/20' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/20'}`}>
                      {o.orderStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-muted-foreground text-xs">
              No transactions matching filter criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
