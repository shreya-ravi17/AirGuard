import React, { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Download,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "./Analytics.css";

import {
  getStats,
  getTrend,
} from "../../services/api";

// ==========================================
// COLORS
// ==========================================

const COLORS = [
  "#42b94f",
  "#f5c62e",
  "#f57c20",
  "#df3943",
  "#8e55b7",
];

// ==========================================
// AQI STATUS
// ==========================================

function getAQIStatus(aqi) {
  const value = Number(aqi) || 0;

  if (value <= 100) {
    return "Good";
  }

  if (value <= 200) {
    return "Moderate";
  }

  if (value <= 300) {
    return "Poor";
  }

  if (value <= 400) {
    return "Very Poor";
  }

  return "Severe";
}

// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ==========================================
// COMPONENT
// ==========================================

function Analytics() {
  // ========================================
  // STATE
  // ========================================

  const [period, setPeriod] = useState("Daily");

  const [dateRange, setDateRange] =
    useState("Last 7 Days");

  const [stats, setStats] = useState(null);

  const [trend, setTrend] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  // ========================================
  // LOAD ANALYTICS DATA
  // ========================================

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsData, trendData] =
        await Promise.all([
          getStats(),
          getTrend(),
        ]);

      console.log(
        "Analytics Stats:",
        statsData
      );

      console.log(
        "Analytics Trend:",
        trendData
      );

      setStats(statsData);

      // Backend may return array directly
      if (Array.isArray(trendData)) {
        setTrend(trendData);
      }

      // Backend may return { trend: [...] }
      else if (
        Array.isArray(trendData?.trend)
      ) {
        setTrend(trendData.trend);
      }

      // Backend may return { data: [...] }
      else if (
        Array.isArray(trendData?.data)
      ) {
        setTrend(trendData.data);
      }

      else {
        setTrend([]);
      }

      setLastUpdated(new Date());
    }

    catch (err) {
      console.error(
        "Analytics API error:",
        err
      );

      setError(
        err.message ||
        "Unable to load analytics data."
      );
    }

    finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD WHEN PAGE OPENS
  // ========================================

  useEffect(() => {
    loadAnalytics();
  }, []);

  // ========================================
  // NORMALIZE TREND DATA
  // ========================================

  const normalizedTrend = useMemo(() => {
    if (!Array.isArray(trend)) {
      return [];
    }

    return trend.map((item, index) => {
      const aqi =
        item?.aqi ??
        item?.aqi_value ??
        item?.average_aqi ??
        item?.avg_aqi ??
        0;

      const timestamp =
        item?.timestamp ??
        item?.date ??
        item?.day ??
        item?.time ??
        "";

      return {
        ...item,

        aqi: Number(aqi) || 0,

        timestamp,

        day:
          item?.day ||
          formatDate(timestamp) ||
          `Day ${index + 1}`,

        time:
          item?.time ||
          formatTime(timestamp) ||
          `Hour ${index + 1}`,

        date:
          item?.date ||
          timestamp,
      };
    });
  }, [trend]);

  // ========================================
  // PERIOD DATA
  // ========================================

  const trendData = useMemo(() => {
    if (normalizedTrend.length === 0) {
      return [];
    }

    // DAILY
    if (period === "Daily") {
      return normalizedTrend.map(
        (item) => ({
          ...item,

          label:
            item.day ||
            formatDate(item.timestamp),
        })
      );
    }

    // WEEKLY
    if (period === "Weekly") {
      const weeks = {};

      normalizedTrend.forEach((item) => {
        const date = new Date(
          item.timestamp
        );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return;
        }

        const year =
          date.getFullYear();

        const firstDay =
          new Date(year, 0, 1);

        const days =
          Math.floor(
            (date - firstDay) /
              (24 * 60 * 60 * 1000)
          );

        const week =
          Math.ceil(
            (days +
              firstDay.getDay() +
              1) /
              7
          );

        const key =
          `${year}-W${week}`;

        if (!weeks[key]) {
          weeks[key] = {
            day: `Week ${week}`,
            total: 0,
            count: 0,
          };
        }

        weeks[key].total +=
          item.aqi;

        weeks[key].count += 1;
      });

      return Object.values(
        weeks
      ).map((item) => ({
        day: item.day,

        aqi: Math.round(
          item.total /
            item.count
        ),
      }));
    }

    // MONTHLY
    if (period === "Monthly") {
      const months = {};

      normalizedTrend.forEach((item) => {
        const date = new Date(
          item.timestamp
        );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return;
        }

        const key =
          `${date.getFullYear()}-${date.getMonth()}`;

        if (!months[key]) {
          months[key] = {
            day:
              date.toLocaleDateString(
                "en-IN",
                {
                  month: "short",
                }
              ),

            total: 0,

            count: 0,
          };
        }

        months[key].total +=
          item.aqi;

        months[key].count += 1;
      });

      return Object.values(
        months
      ).map((item) => ({
        day: item.day,

        aqi: Math.round(
          item.total /
            item.count
        ),
      }));
    }

    return normalizedTrend;
  }, [
    normalizedTrend,
    period,
  ]);

  // ========================================
  // DISTRIBUTION
  // ========================================

  const distributionData = useMemo(() => {
    // Use distribution returned by backend
    if (
      stats?.distribution &&
      Array.isArray(
        stats.distribution
      )
    ) {
      return stats.distribution.map(
        (item) => ({
          name:
            item.name ||
            item.category ||
            "Unknown",

          value: Number(
            item.value ??
            item.percentage ??
            0
          ),
        })
      );
    }

    // If there is no trend data
    if (
      normalizedTrend.length === 0
    ) {
      return [
        {
          name: "Good (0-100)",
          value: 0,
        },

        {
          name: "Moderate (101-200)",
          value: 0,
        },

        {
          name: "Poor (201-300)",
          value: 0,
        },

        {
          name: "Very Poor (301-400)",
          value: 0,
        },

        {
          name: "Severe (401+)",
          value: 0,
        },
      ];
    }

    const total =
      normalizedTrend.length;

    let good = 0;
    let moderate = 0;
    let poor = 0;
    let veryPoor = 0;
    let severe = 0;

    normalizedTrend.forEach(
      (item) => {
        const value =
          item.aqi;

        if (value <= 100) {
          good++;
        }

        else if (value <= 200) {
          moderate++;
        }

        else if (value <= 300) {
          poor++;
        }

        else if (value <= 400) {
          veryPoor++;
        }

        else {
          severe++;
        }
      }
    );

    return [
      {
        name: "Good (0-100)",

        value: Math.round(
          (good / total) * 100
        ),
      },

      {
        name:
          "Moderate (101-200)",

        value: Math.round(
          (moderate / total) * 100
        ),
      },

      {
        name: "Poor (201-300)",

        value: Math.round(
          (poor / total) * 100
        ),
      },

      {
        name:
          "Very Poor (301-400)",

        value: Math.round(
          (veryPoor / total) * 100
        ),
      },

      {
        name: "Severe (401+)",

        value: Math.round(
          (severe / total) * 100
        ),
      },
    ];
  }, [
    stats,
    normalizedTrend,
  ]);

  // ========================================
  // EXPORT REPORT
  // ========================================

  const exportReport = () => {
    if (
      trendData.length === 0
    ) {
      alert(
        "No analytics data available to export."
      );

      return;
    }

    const headers = [
      "Date / Period",
      "AQI",
      "Status",
    ];

    const rows =
      trendData.map(
        (item) => [
          `"${item.day || item.time || ""}"`,
          item.aqi,
          getAQIStatus(
            item.aqi
          ),
        ]
      );

    const csv = [
      headers.join(","),
      ...rows.map(
        (row) =>
          row.join(",")
      ),
    ].join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "AirGuard-Analytics-Report.csv";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="analytics-page">

      {/* HEADER */}

      <div className="analytics-header">

        <div>

          <h1>
            Analytics
          </h1>

          <p>
            Explore air quality trends
            and insights over time
          </p>

        </div>

        <div className="analytics-actions">

          <div className="analytics-select">

            <CalendarDays
              size={18}
            />

            <select
              value={dateRange}
              onChange={(e) =>
                setDateRange(
                  e.target.value
                )
              }
            >

              <option>
                Last 7 Days
              </option>

              <option>
                Last 30 Days
              </option>

              <option>
                All Time
              </option>

            </select>

            <ChevronDown
              size={16}
            />

          </div>

          <button
            className="export-report-btn"
            onClick={exportReport}
          >

            <Download
              size={18}
            />

            Export Report

          </button>

          <button
            className="export-report-btn"
            onClick={loadAnalytics}
            disabled={loading}
          >

            <RefreshCw
              size={18}
              className={
                loading
                  ? "spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            marginBottom:
              "20px",

            padding:
              "14px 18px",

            borderRadius:
              "10px",

            background:
              "#fff1f1",

            color:
              "#c62828",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================
          CHART ROW 1
      ====================================== */}

      <div className="analytics-row">

        {/* AQI TREND */}

        <div className="chart-card trend-card">

          <div className="chart-header">

            <div>

              <h3>
                AQI Trend
              </h3>

              <p>
                Real readings from backend
              </p>

            </div>

            <div className="small-select">

              <select
                value={period}
                onChange={(e) =>
                  setPeriod(
                    e.target.value
                  )
                }
              >

                <option>
                  Daily
                </option>

                <option>
                  Weekly
                </option>

                <option>
                  Monthly
                </option>

              </select>

              <ChevronDown
                size={15}
              />

            </div>

          </div>

          <div className="chart-container">

            {loading ? (

              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                Loading analytics...
              </div>

            ) : trendData.length === 0 ? (

              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                No trend data available.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={trendData}
                >

                  <defs>

                    <linearGradient
                      id="aqiGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#48b958"
                        stopOpacity={0.35}
                      />

                      <stop
                        offset="100%"
                        stopColor="#48b958"
                        stopOpacity={0.03}
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    stroke="#eeeeee"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 11,
                      fill: "#6d7478",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, "auto"]}
                    tick={{
                      fontSize: 11,
                      fill: "#6d7478",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="aqi"
                    stroke="#35a84a"
                    strokeWidth={3}
                    fill="url(#aqiGradient)"
                    dot={{
                      r: 5,
                      fill: "#35a84a",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                </AreaChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

        {/* =================================
            AQI DISTRIBUTION
        ================================== */}

        <div className="chart-card distribution-card">

          <div className="chart-header">

            <div>

              <h3>
                AQI Distribution
              </h3>

              <p>
                Overall air quality
              </p>

            </div>

          </div>

          <div className="distribution-content">

            <div className="donut-wrapper">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={
                      distributionData
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={1}
                    startAngle={90}
                    endAngle={-270}
                  >

                    {distributionData.map(
                      (
                        entry,
                        index
                      ) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS[index]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

              <div className="donut-center">

                <strong>
                  {
                    normalizedTrend.length
                  }
                </strong>

                <span>
                  Readings
                </span>

              </div>

            </div>

            <div className="legend">

              {distributionData.map(
                (
                  item,
                  index
                ) => (

                  <div
                    className="legend-item"
                    key={
                      item.name
                    }
                  >

                    <div className="legend-name">

                      <span
                        className="legend-dot"
                        style={{
                          background:
                            COLORS[
                              index
                            ],
                        }}
                      ></span>

                      <span>
                        {item.name}
                      </span>

                    </div>

                    <strong>
                      {item.value}%
                    </strong>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </div>

      {/* =====================================
          LAST UPDATED
      ====================================== */}

      {lastUpdated && (
        <div
          style={{
            marginTop: "20px",
            fontSize: "13px",
            color: "#777",
            textAlign: "right",
          }}
        >

          Last updated{" "}

          {lastUpdated.toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}

        </div>
      )}

    </div>
  );
}

export default Analytics;