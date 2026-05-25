// frontend/src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import api from "../utils/api.js";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [dailySales, setDailySales] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/vendor/dashboard");
        setMetrics(res.data.metrics || { totalProducts: 0, totalOrders: 0, totalRevenue: 0, lowStockCount: 0 });
        setDailySales(res.data.dailySales || []);
        setRecentSales(res.data.recentSales || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (showLoading) {
          setError(
            err?.response?.data?.message ||
              "Failed to load dashboard data. Check if backend is running."
          );
        }
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    fetchDashboard(true);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchDashboard(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const isDark = theme === "dark";

  const chartData = {
    labels: dailySales.map((d) => d.date.slice(5)), // MM-DD
    datasets: [
      {
        label: "Revenue",
        data: dailySales.map((d) => d.revenue),
        borderColor: isDark ? "#ffffff" : "#000000",
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
        tension: 0.1,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 1.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? "#000000" : "#ffffff",
        borderColor: isDark ? "#333333" : "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        titleColor: isDark ? "#ffffff" : "#000000",
        bodyColor: isDark ? "#ffffff" : "#000000",
        titleFont: { size: 10, family: "Montserrat, sans-serif" },
        bodyFont: { size: 10, family: "Montserrat, sans-serif" },
        cornerRadius: 0,
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? "#737373" : "#6b7280",
          font: { size: 9, family: "Montserrat, sans-serif" },
          maxRotation: 0,
          autoSkip: true,
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: isDark ? "#737373" : "#6b7280",
          font: { size: 9, family: "Montserrat, sans-serif" },
        },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          drawTicks: false,
        },
        border: {
          dash: [2, 4],
        },
      },
    },
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
            Performance Overview
          </h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
            Key ecommerce metrics in real time
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-black dark:text-white">
          <span className="h-1.5 w-1.5 bg-black dark:bg-white animate-pulse" />
          Live sync
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Total Revenue
            </span>
            <span className="text-[10px] uppercase tracking-wider text-black dark:text-white">
              +12.4%
            </span>
          </div>
          <div className="mt-4 font-serif text-3xl font-light text-black dark:text-white">
            {formatCurrency(metrics.totalRevenue || 0)}
          </div>
          <div className="mt-2 text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            vs. last week
          </div>
        </div>

        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Orders Completed
            </span>
            <span className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Steady
            </span>
          </div>
          <div className="mt-4 font-serif text-3xl font-light text-black dark:text-white">
            {(metrics.totalOrders || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            YoY performance
          </div>
        </div>

        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Active Inventory
            </span>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              -3.1%
            </span>
          </div>
          <div className="mt-4 font-serif text-3xl font-light text-black dark:text-white">
            {(metrics.totalProducts || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {metrics.lowStockCount || 0} low-stock alerts
          </div>
        </div>
      </div>

      {/* Main chart & recent activity */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-4 mb-4">
            <h3 className="text-[9px] font-semibold uppercase tracking-widest text-neutral-655 dark:text-neutral-400">
              Revenue Trend
            </h3>
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Last 7 days</span>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Loading trend...
              </div>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-4 mb-4">
            <h3 className="text-[9px] font-semibold uppercase tracking-widest text-neutral-655 dark:text-neutral-400">
              Recent Sales
            </h3>
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Last {recentSales.length} orders
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[240px]">
            {loading && (
              <div className="flex h-full items-center justify-center text-neutral-500 dark:text-neutral-400 py-10 text-[10px] uppercase tracking-widest">
                Loading sales...
              </div>
            )}
            {!loading && recentSales.length === 0 && (
              <div className="border border-dashed border-gray-200 dark:border-neutral-900 bg-transparent px-3 py-12 text-center text-neutral-500 dark:text-neutral-400 text-[10px] uppercase tracking-widest">
                No sales recorded
              </div>
            )}
            {!loading &&
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900/60 pb-2.5"
                >
                  <div className="text-left">
                    <div className="text-xs font-semibold text-black dark:text-white tracking-wide">
                      {sale.productName}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {sale.channel?.toUpperCase()} •{" "}
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-black dark:text-white">
                      {formatCurrency(sale.amount)}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mt-0.5">
                      Paid
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black p-4 text-[10px] uppercase tracking-widest text-rose-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
