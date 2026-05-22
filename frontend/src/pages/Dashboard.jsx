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
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/dashboard");
        setMetrics(res.data.metrics || { totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
        setDailySales(res.data.dailySales || []);
        setRecentSales(res.data.recentSales || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(
          err?.response?.data?.message ||
            "Failed to load dashboard data. Check if backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const chartData = {
    labels: dailySales.map((d) => d.date.slice(5)), // MM-DD
    datasets: [
      {
        label: "Revenue (last 7 days)",
        data: dailySales.map((d) => d.revenue),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e5e7eb",
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "#020617",
        borderColor: "#6366f1",
        borderWidth: 1,
        padding: 10,
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#9ca3af",
          maxRotation: 0,
          autoSkip: true,
        },
        grid: {
          color: "rgba(55, 65, 81, 0.4)",
        },
      },
      y: {
        ticks: {
          color: "#9ca3af",
        },
        grid: {
          color: "rgba(55, 65, 81, 0.4)",
        },
      },
    },
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Realtime Overview
          </h2>
          <p className="text-xs text-slate-400">
            Key ecommerce metrics powered by SmartStore AI.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1 text-[11px] text-emerald-400">
          <Activity className="h-3 w-3 animate-pulse" />
          Live sync
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel-soft p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total Revenue
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold">
              +12.4%
            </span>
          </div>
          <div className="mt-2 text-xl font-bold">
            ${(metrics.totalRevenue || 0).toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            vs. last week
          </div>
        </div>

        <div className="glass-panel-soft p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Orders
            </span>
            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-400 font-semibold">
              Steady
            </span>
          </div>
          <div className="mt-2 text-xl font-bold">
            {(metrics.totalOrders || 0).toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-sky-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            YoY performance
          </div>
        </div>

        <div className="glass-panel-soft p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Active Products
            </span>
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-400 font-semibold">
              -3.1%
            </span>
          </div>
          <div className="mt-2 text-xl font-bold">
            {(metrics.totalProducts || 0).toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
            <ArrowDownRight className="h-3.5 w-3.5" />
            Low-stock alerts
          </div>
        </div>
      </div>

      {/* Main chart & recent activity */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
        <div className="glass-panel-soft p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Revenue trend
            </h3>
            <span className="text-[11px] text-slate-500">Last 7 days</span>
          </div>
          <div className="mt-3 h-64">
            {loading ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="glass-panel-soft flex flex-col p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Recent activity
            </h3>
            <span className="text-[11px] text-slate-500">
              Last {recentSales.length} orders
            </span>
          </div>
          <div className="mt-3 flex-1 space-y-2 overflow-y-auto text-xs max-h-[256px]">
            {loading && (
              <div className="flex h-full items-center justify-center text-slate-400 py-10">
                Loading recent sales...
              </div>
            )}
            {!loading && recentSales.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-700/70 bg-slate-950/40 px-3 py-10 text-center text-slate-500">
                No sales recorded yet. Your first AI-optimized product will show
                up here.
              </div>
            )}
            {!loading &&
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2"
                >
                  <div>
                    <div className="text-[11px] font-medium">
                      {sale.productName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {sale.channel?.toUpperCase()} •{" "}
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold">
                      ${sale.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      Paid
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-panel-soft border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
