import React from 'react';
import { format } from "date-fns";
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Package, 
  Truck, 
  XCircle,
  TrendingUp
} from "lucide-react";

import db from "@/lib/prismadb";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatter } from "@/lib/utils";

interface DashboardPageProps {
  params: {
    storeId: string;
  };
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ 
  params
}) => {
  // Fetch store orders
  const orders = await db.order.findMany({
    where: {
      storeId: params.storeId
    }
  });

  // Calculate metrics
  const totalRevenue = orders
    .filter(order => order.paymentStatus === "Paid")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.orderStatus === "Pending").length;
  const packedOrders = orders.filter(order => order.orderStatus === "Packed").length;
  const deliveredOrders = orders.filter(order => order.orderStatus === "Delivered").length;
  const cancelledOrders = orders.filter(order => order.orderStatus === "Cancelled").length;

  // Calculate daily chart data for past 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentOrders = await db.order.findMany({
    where: {
      storeId: params.storeId,
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  });

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const label = format(date, 'E'); // 'Mon', 'Tue', etc.
    const dateString = format(date, 'yyyy-MM-dd');

    const dayOrders = recentOrders.filter(order => {
      const orderDateString = format(order.createdAt, 'yyyy-MM-dd');
      return orderDateString === dateString;
    });

    const orderCount = dayOrders.length;
    const revenue = dayOrders
      .filter(order => order.paymentStatus === 'Paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      label,
      orderCount,
      revenue
    };
  });

  // SVG Chart Helper calculations
  const maxOrders = Math.max(...chartData.map(d => d.orderCount), 5); // min ceiling of 5
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100); // min ceiling of 100

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Overview of your Homemade Food & Snacks store" />
        <Separator />
        
        {/* Metric Cards Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <Card className="border-emerald-200/50 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatter.format(totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200/50 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Total Orders
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {totalOrders}
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200/50 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {pendingOrders}
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200/50 dark:border-teal-900/50 bg-teal-50/20 dark:bg-teal-950/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Delivered Orders
              </CardTitle>
              <Truck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                {deliveredOrders}
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-200/50 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Cancelled Orders
              </CardTitle>
              <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                {cancelledOrders}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* Orders by Day Chart */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground">Orders by Day</h3>
              <p className="text-xs text-muted-foreground">Order volume for the past 7 days</p>
            </div>
            <div className="relative h-64 w-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.3"/>
                  </linearGradient>
                </defs>
                {/* Gridlines */}
                {[0, 1, 2, 3, 4].map((grid, index) => {
                  const yVal = 20 + index * 40;
                  return (
                    <line 
                      key={index} 
                      x1="40" 
                      y1={yVal} 
                      x2="480" 
                      y2={yVal} 
                      stroke="#e2e8f0" 
                      strokeDasharray="4 4" 
                      className="dark:stroke-neutral-800"
                    />
                  );
                })}
                {/* Bars & Labels */}
                {chartData.map((d, index) => {
                  const barWidth = 36;
                  const xPos = 60 + index * 60;
                  const barHeight = (d.orderCount / maxOrders) * 150;
                  const yPos = 180 - barHeight;

                  return (
                    <g key={index} className="group cursor-pointer">
                      {/* Bar hover highlight */}
                      <rect 
                        x={xPos - 8} 
                        y="10" 
                        width={barWidth + 16} 
                        height="180" 
                        fill="transparent" 
                        className="hover:fill-neutral-50/50 dark:hover:fill-neutral-900/30 transition-colors"
                      />
                      {/* Actual Bar */}
                      <rect 
                        x={xPos} 
                        y={yPos} 
                        width={barWidth} 
                        height={barHeight} 
                        fill="url(#barGradient)" 
                        rx="4" 
                        className="transition-all duration-500 hover:fill-indigo-600"
                      />
                      {/* Tooltip text on top of bar */}
                      <text 
                        x={xPos + barWidth / 2} 
                        y={yPos - 8} 
                        textAnchor="middle" 
                        className="text-xs font-semibold fill-indigo-600 dark:fill-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {d.orderCount}
                      </text>
                      {/* X Axis Label */}
                      <text 
                        x={xPos + barWidth / 2} 
                        y="205" 
                        textAnchor="middle" 
                        className="text-xs fill-muted-foreground font-medium"
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}
                {/* Axis line */}
                <line x1="40" y1="180" x2="480" y2="180" stroke="#cbd5e1" className="dark:stroke-neutral-700" />
              </svg>
            </div>
          </Card>

          {/* Revenue by Day Chart */}
          <Card className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Revenue by Day</h3>
                  <p className="text-xs text-muted-foreground">Earnings for the past 7 days</p>
                </div>
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  <span>Paid Orders Only</span>
                </div>
              </div>
            </div>
            <div className="relative h-64 w-full">
              <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669"/>
                    <stop offset="100%" stopColor="#34d399"/>
                  </linearGradient>
                </defs>
                {/* Gridlines */}
                {[0, 1, 2, 3, 4].map((grid, index) => {
                  const yVal = 20 + index * 40;
                  return (
                    <line 
                      key={index} 
                      x1="40" 
                      y1={yVal} 
                      x2="480" 
                      y2={yVal} 
                      stroke="#e2e8f0" 
                      strokeDasharray="4 4" 
                      className="dark:stroke-neutral-800"
                    />
                  );
                })}
                
                {/* Generate line & area path */}
                {(() => {
                  const points = chartData.map((d, index) => {
                    const x = 50 + index * 70;
                    const y = 180 - (d.revenue / maxRevenue) * 150;
                    return { x, y, val: d.revenue };
                  });

                  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = points.length > 0 
                    ? `${linePath} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z` 
                    : '';

                  return (
                    <>
                      {/* Area Fill */}
                      {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}
                      {/* Stroke Line */}
                      {linePath && <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />}
                      
                      {/* Interactive Dots & Tooltips */}
                      {points.map((p, index) => (
                        <g key={index} className="group cursor-pointer">
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="5" 
                            className="fill-emerald-600 stroke-white dark:stroke-neutral-900 stroke-2 hover:r-7 transition-all"
                          />
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="15" 
                            fill="transparent" 
                          />
                          {/* Tooltip */}
                          <text 
                            x={p.x} 
                            y={p.y - 12} 
                            textAnchor="middle" 
                            className="text-xs font-semibold fill-emerald-600 dark:fill-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ${p.val.toFixed(2)}
                          </text>
                          {/* X Axis Label */}
                          <text 
                            x={p.x} 
                            y="205" 
                            textAnchor="middle" 
                            className="text-xs fill-muted-foreground font-medium"
                          >
                            {chartData[index].label}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
                {/* Axis line */}
                <line x1="40" y1="180" x2="480" y2="180" stroke="#cbd5e1" className="dark:stroke-neutral-700" />
              </svg>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;