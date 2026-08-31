import React, { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Download,
  ChevronDown,
  Wind,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock3,
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
  BarChart,
  Bar,
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

  const [dateRange, setDateRange] = useState(
    "Last 7 Days"
  );

  const [timeFilter, setTimeFilter] =
    useState("AQI");

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

      console.log("Analytics Stats:", statsData);
      console.log("Analytics Trend:", trendData);

      setStats(statsData);

      // Backend may return array directly
      if (Array.isArray(trendData)) {

        setTrend(trendData);

      }

      // Backend may return {trend: [...]}
      else if (
        Array.isArray(trendData?.trend)
      ) {

        setTrend(trendData.trend);

      }

      // Backend may return {data: [...]}
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

        if (Number.isNaN(date.getTime())) {
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
            (days + firstDay.getDay() + 1) /
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

        weeks[key].total += item.aqi;
        weeks[key].count += 1;

      });

      return Object.values(weeks).map(
        (item) => ({
          day: item.day,
          aqi: Math.round(
            item.total / item.count
          ),
        })
      );

    }


    // MONTHLY
    if (period === "Monthly") {

      const months = {};

      normalizedTrend.forEach((item) => {

        const date = new Date(
          item.timestamp
        );

        if (Number.isNaN(date.getTime())) {
          return;
        }

        const key =
          `${date.getFullYear()}-${date.getMonth()}`;

        if (!months[key]) {

          months[key] = {
            day: date.toLocaleDateString(
              "en-IN",
              { month: "short" }
            ),
            total: 0,
            count: 0,
          };

        }

        months[key].total += item.aqi;
        months[key].count += 1;

      });

      return Object.values(months).map(
        (item) => ({
          day: item.day,
          aqi: Math.round(
            item.total / item.count
          ),
        })
      );

    }

    return normalizedTrend;

  }, [normalizedTrend, period]);


  // ========================================
  // GET STAT VALUE
  // ========================================

  const averageAQI =
    Number(
      stats?.average_aqi ??
      stats?.avg_aqi ??
      stats?.average ??
      stats?.mean_aqi ??
      0
    );

  const maxAQI =
    Number(
      stats?.max_aqi ??
      stats?.maximum_aqi ??
      stats?.max ??
      0
    );

  const minAQI =
    Number(
      stats?.min_aqi ??
      stats?.minimum_aqi ??
      stats?.min ??
      0
    );

  const totalReadings =
    Number(
      stats?.total_readings ??
      stats?.readings ??
      stats?.count ??
      trend.length ??
      0
    );


  // ========================================
  // DATA AVAILABILITY
  // ========================================

  const availability =
    Number(
      stats?.data_availability ??
      stats?.availability ??
      99
    );


  // ========================================
  // DISTRIBUTION
  // ========================================

  const distributionData = useMemo(() => {

    if (
      stats?.distribution &&
      Array.isArray(stats.distribution)
    ) {

      return stats.distribution.map(
        (item) => ({
          name:
            item.name ||
            item.category ||
            "Unknown",

          value:
            Number(
              item.value ??
              item.percentage ??
              0
            ),
        })
      );

    }


    const total =
      normalizedTrend.length;

    if (total === 0) {

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


    let good = 0;
    let moderate = 0;
    let poor = 0;
    let veryPoor = 0;
    let severe = 0;


    normalizedTrend.forEach(
      (item) => {

        const value = item.aqi;

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
        name: "Moderate (101-200)",
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
        name: "Very Poor (301-400)",
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

  }, [stats, normalizedTrend]);


  // ========================================
  // TODAY HOURLY DATA
  // ========================================

  const timeData = useMemo(() => {

    return normalizedTrend.map(
      (item) => ({
        time:
          item.time ||
          formatTime(item.timestamp),

        aqi: item.aqi,
      })
    );

  }, [normalizedTrend]);


  // ========================================
  // INSIGHTS
  // ========================================

  const highestReading =
    normalizedTrend.length > 0
      ? normalizedTrend.reduce(
          (max, item) =>
            item.aqi > max.aqi
              ? item
              : max,
          normalizedTrend[0]
        )
      : null;


  const lowestReading =
    normalizedTrend.length > 0
      ? normalizedTrend.reduce(
          (min, item) =>
            item.aqi < min.aqi
              ? item
              : min,
          normalizedTrend[0]
        )
      : null;


  const firstReading =
    normalizedTrend.length > 0
      ? normalizedTrend[0].aqi
      : 0;

  const lastReading =
    normalizedTrend.length > 0
      ? normalizedTrend[
          normalizedTrend.length - 1
        ].aqi
      : 0;


  let trendDirection = "stable";

  let trendPercentage = 0;


  if (
    firstReading > 0 &&
    normalizedTrend.length >= 2
  ) {

    trendPercentage = Math.round(
      Math.abs(
        ((lastReading - firstReading) /
          firstReading) *
          100
      )
    );

    if (lastReading > firstReading) {
      trendDirection = "up";
    }
    else if (lastReading < firstReading) {
      trendDirection = "down";
    }

  }


  // ========================================
  // EXPORT REPORT
  // ========================================

  const exportReport = () => {

    if (trendData.length === 0) {

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


    const rows = trendData.map(
      (item) => [
        `"${item.day || item.time || ""}"`,
        item.aqi,
        getAQIStatus(item.aqi),
      ]
    );


    const csv = [
      headers.join(","),
      ...rows.map(
        (row) => row.join(",")
      ),
    ].join("\n");


    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;

    link.download =
      "AirGuard-Analytics-Report.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

  };


  // ========================================
  // RENDER
  // ========================================

  return (

    <div className="analytics-page">


      {/* HEADER */}

      <div className="analytics-header">

        <div>

          <h1>Analytics</h1>

          <p>
            Explore air quality trends and
            insights over time
          </p>

        </div>


        <div className="analytics-actions">

          <div className="analytics-select">

            <CalendarDays size={18} />

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

            <ChevronDown size={16} />

          </div>


          <button
            className="export-report-btn"
            onClick={exportReport}
          >

            <Download size={18} />

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
                loading ? "spin" : ""
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
            marginBottom: "20px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "#fff1f1",
            color: "#c62828",
          }}
        >

          {error}

        </div>

      )}


      {/* SUMMARY CARDS */}

      <div className="analytics-summary">


        {/* AVERAGE */}

        <div className="analytics-card">

          <div className="card-top">

            <div className="analytics-icon">
              <Wind size={24} />
            </div>

            <span>
              Average AQI
            </span>

          </div>


          <h2>
            {loading
              ? "..."
              : Math.round(averageAQI)}
          </h2>


          <p className="aqi-good">
            {loading
              ? "Loading..."
              : getAQIStatus(
                  averageAQI
                )}
          </p>


          <div
            className={`comparison ${
              trendDirection === "down"
                ? "down"
                : trendDirection === "up"
                ? "up"
                : ""
            }`}
          >

            {trendDirection === "down"
              ? `↓ ${trendPercentage}%`
              : trendDirection === "up"
              ? `↑ ${trendPercentage}%`
              : "— Stable"}

            {" "}vs recent data

          </div>

        </div>


        {/* MAX */}

        <div className="analytics-card">

          <div className="card-top">

            <div className="analytics-icon">
              <TrendingUp size={24} />
            </div>

            <span>
              Max AQI
            </span>

          </div>


          <h2 className="aqi-moderate">

            {loading
              ? "..."
              : Math.round(maxAQI)}

          </h2>


          <p>
            {loading
              ? "Loading..."
              : getAQIStatus(maxAQI)}
          </p>


          <div className="comparison">
            Highest recorded
          </div>

        </div>


        {/* MIN */}

        <div className="analytics-card">

          <div className="card-top">

            <div className="analytics-icon">
              <TrendingDown size={24} />
            </div>

            <span>
              Min AQI
            </span>

          </div>


          <h2>

            {loading
              ? "..."
              : Math.round(minAQI)}

          </h2>


          <p className="aqi-good">
            {loading
              ? "Loading..."
              : getAQIStatus(minAQI)}
          </p>


          <div className="comparison">
            Lowest recorded
          </div>

        </div>


        {/* TOTAL */}

        <div className="analytics-card">

          <div className="card-top">

            <div className="analytics-icon">
              <CalendarDays size={24} />
            </div>

            <span>
              Total Readings
            </span>

          </div>


          <h2 className="dark-number">

            {loading
              ? "..."
              : totalReadings.toLocaleString()}

          </h2>


          <p>
            Recorded readings
          </p>


          <div className="comparison">
            From backend
          </div>

        </div>


        {/* AVAILABILITY */}

        <div className="analytics-card">

          <div className="card-top">

            <div className="analytics-icon">
              <Clock3 size={24} />
            </div>

            <span>
              Data Availability
            </span>

          </div>


          <h2>

            {loading
              ? "..."
              : `${availability}%`}

          </h2>


          <p className="aqi-good">
            Excellent
          </p>


          <div className="comparison">
            Monitoring status
          </div>

        </div>

      </div>


      {/* CHART ROW 1 */}

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

              <ChevronDown size={15} />

            </div>

          </div>


          <div className="chart-container">

            {loading ? (

              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
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
                  alignItems: "center",
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


        {/* DISTRIBUTION */}

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
                      (entry, index) => (

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
                  {normalizedTrend.length}
                </strong>

                <span>
                  Readings
                </span>

              </div>

            </div>


            <div className="legend">

              {distributionData.map(
                (item, index) => (

                  <div
                    className="legend-item"
                    key={item.name}
                  >

                    <div className="legend-name">

                      <span
                        className="legend-dot"
                        style={{
                          background:
                            COLORS[index],
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


      {/* CHART ROW 2 */}

      <div className="analytics-row">


        {/* TIME OF DAY */}

        <div className="chart-card time-card">

          <div className="chart-header">

            <div>

              <h3>
                AQI by Time of Day
              </h3>

              <p>
                Readings received by backend
              </p>

            </div>


            <div className="small-select">

              <select
                value={timeFilter}
                onChange={(e) =>
                  setTimeFilter(
                    e.target.value
                  )
                }
              >

                <option>
                  AQI
                </option>

                <option>
                  Status
                </option>

              </select>

              <ChevronDown size={15} />

            </div>

          </div>


          <div className="chart-container">

            {timeData.length === 0 ? (

              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                }}
              >
                No hourly data available.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={timeData}
                >

                  <CartesianGrid
                    stroke="#eeeeee"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="time"
                    interval={2}
                    tick={{
                      fontSize: 10,
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


                  <Bar
                    dataKey="aqi"
                    radius={[
                      4,
                      4,
                      0,
                      0,
                    ]}
                  >

                    {timeData.map(
                      (item, index) => {

                        let color =
                          "#4db653";

                        if (
                          item.aqi > 100
                        ) {
                          color =
                            "#f4c62d";
                        }

                        if (
                          item.aqi > 200
                        ) {
                          color =
                            "#ef7c20";
                        }

                        if (
                          item.aqi > 300
                        ) {
                          color =
                            "#df3943";
                        }

                        return (

                          <Cell
                            key={`bar-${index}`}
                            fill={color}
                          />

                        );

                      }
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>


        {/* INSIGHTS */}

        <div className="chart-card insights-card">

          <div className="chart-header">

            <div>

              <h3>
                AQI Insights
              </h3>

              <p>
                Air quality summary
              </p>

            </div>

          </div>


          <div className="insight-list">


            <div className="insight-item">

              <div className="insight-icon green">

                <TrendingDown size={19} />

              </div>


              <div>

                <strong>

                  {trendDirection ===
                  "down"
                    ? `AQI improved by ${trendPercentage}%`
                    : trendDirection ===
                      "up"
                    ? `AQI increased by ${trendPercentage}%`
                    : "AQI trend is stable"}

                </strong>


                <p>
                  Based on available
                  backend trend data.
                </p>

              </div>

            </div>


            <div className="insight-item">

              <div className="insight-icon orange">

                <TrendingUp size={19} />

              </div>


              <div>

                <strong>

                  Highest AQI:{" "}

                  {loading
                    ? "..."
                    : Math.round(
                        highestReading?.aqi ||
                        maxAQI
                      )}

                </strong>


                <p>

                  {highestReading?.timestamp
                    ? `Recorded at ${formatTime(
                        highestReading.timestamp
                      )}.`
                    : "Highest recorded reading."}

                </p>

              </div>

            </div>


            <div className="insight-item">

              <div className="insight-icon blue">

                <Clock3 size={19} />

              </div>


              <div>

                <strong>

                  Lowest AQI:{" "}

                  {loading
                    ? "..."
                    : Math.round(
                        lowestReading?.aqi ||
                        minAQI
                      )}

                </strong>


                <p>

                  {lowestReading?.timestamp
                    ? `Recorded at ${formatTime(
                        lowestReading.timestamp
                      )}.`
                    : "Lowest recorded reading."}

                </p>

              </div>

            </div>


            <div className="insight-item">

              <div className="insight-icon green">

                <BarChart3 size={19} />

              </div>


              <div>

                <strong>

                  Average AQI:{" "}

                  {loading
                    ? "..."
                    : Math.round(
                        averageAQI
                      )}

                </strong>


                <p>

                  Overall status:{" "}

                  {loading
                    ? "Loading..."
                    : getAQIStatus(
                        averageAQI
                      )}

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* LAST UPDATED */}

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