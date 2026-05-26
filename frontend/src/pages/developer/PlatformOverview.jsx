// frontend/src/pages/developer/PlatformOverview.jsx
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
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
import api from "../../utils/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { useTheme } from "../../context/ThemeContext.jsx";

// Register Chart.js modules
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const PlatformOverview = () => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalVendors: 0,
    totalProducts: 0,
  });
  const [trends, setTrends] = useState({
    revenueTrend: [],
    storesTrend: [],
    productsTrend: [],
  });
  const [activeMetric, setActiveMetric] = useState("revenue"); // "revenue" | "stores" | "products"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGlobalMetrics = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/developer/metrics");
      if (res.data) {
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
        if (res.data.trends) {
          setTrends(res.data.trends);
        }
      }
    } catch (err) {
      console.error("Fetch developer metrics error:", err);
      if (showLoading) {
        setError("Failed to load platform metrics.");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalMetrics(true);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchGlobalMetrics(false);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const isDark = theme === "dark";

  // Determine active trend data to map to chart
  const activeTrendData =
    activeMetric === "revenue"
      ? trends.revenueTrend
      : activeMetric === "stores"
      ? trends.storesTrend
      : trends.productsTrend;

  const chartData = {
    labels: (activeTrendData || []).map((t) => t.date),
    datasets: [
      {
        label: activeMetric.toUpperCase(),
        data: (activeTrendData || []).map((t) => t.value),
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
        border: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: isDark ? "#737373" : "#6b7280",
          font: { size: 9, family: "Montserrat, sans-serif" },
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="space-y-12 animate-fadeIn text-left">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
            Global Overview
          </h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-550 dark:text-neutral-450 mt-0.5">
            Platform-wide aggregated metrics and store performance
          </p>
        </div>
        <button
          onClick={() => fetchGlobalMetrics(true)}
          className="border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-black p-4 text-[10px] uppercase tracking-widest rounded-none">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-550 dark:text-neutral-400 text-xs uppercase tracking-widest">
          <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white mb-2" />
          <span>Loading platform stats...</span>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Interactive Metric Cards */}
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            {/* Total Revenue */}
            <div
              onClick={() => setActiveMetric("revenue")}
              className={`cursor-pointer border p-8 rounded-none flex flex-col justify-between min-h-[220px] transition-all duration-300 ${
                activeMetric === "revenue"
                  ? "border-black dark:border-white bg-neutral-50 dark:bg-[#111111]"
                  : "border-gray-250 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                  Total Platform Revenue
                </span>
                {activeMetric === "revenue" && (
                  <span className="h-1.5 w-1.5 bg-black dark:bg-white" />
                )}
              </div>
              <div className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-black dark:text-white my-6 tracking-wide truncate whitespace-nowrap overflow-hidden w-full">
                {formatCurrency(metrics.totalRevenue || 0)}
              </div>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                All transactions across all stores
              </span>
            </div>

            {/* Active Stores */}
            <div
              onClick={() => setActiveMetric("stores")}
              className={`cursor-pointer border p-8 rounded-none flex flex-col justify-between min-h-[220px] transition-all duration-300 ${
                activeMetric === "stores"
                  ? "border-black dark:border-white bg-neutral-50 dark:bg-[#111111]"
                  : "border-gray-250 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                  Active Vendor Stores
                </span>
                {activeMetric === "stores" && (
                  <span className="h-1.5 w-1.5 bg-black dark:bg-white" />
                )}
              </div>
              <div className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-black dark:text-white my-6 tracking-wide truncate whitespace-nowrap overflow-hidden w-full">
                {metrics.totalVendors || 0}
              </div>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Approved merchants hosting products
              </span>
            </div>

            {/* Total Products (Catalog) */}
            <div
              onClick={() => setActiveMetric("products")}
              className={`cursor-pointer border p-8 rounded-none flex flex-col justify-between min-h-[220px] transition-all duration-300 ${
                activeMetric === "products"
                  ? "border-black dark:border-white bg-neutral-50 dark:bg-[#111111]"
                  : "border-gray-250 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                  Total Platform Catalog
                </span>
                {activeMetric === "products" && (
                  <span className="h-1.5 w-1.5 bg-black dark:bg-white" />
                )}
              </div>
              <div className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-black dark:text-white my-6 tracking-wide truncate whitespace-nowrap overflow-hidden w-full">
                {metrics.totalProducts || 0}
              </div>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Items currently live for purchase
              </span>
            </div>
          </div>

          {/* Sleek Line Chart */}
          <div className="border border-gray-250 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-8 rounded-none">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-4 mb-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black dark:text-white">
                {activeMetric === "revenue"
                  ? "Revenue Trend"
                  : activeMetric === "stores"
                  ? "Active Stores Growth"
                  : "Product Catalog Trend"}
              </h3>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Last 7 Days (Time Series)
              </span>
            </div>
            <div className="h-80">
              {activeTrendData && activeTrendData.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  No trend data available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformOverview;
