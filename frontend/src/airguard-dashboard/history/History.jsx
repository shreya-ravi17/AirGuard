import React, { useEffect, useMemo, useState } from "react";

import {
  Download,
  RefreshCw,
  CalendarDays,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock3,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "./History.css";

import { getHistory } from "../../services/api";

function History() {
  // ==========================================
  // STATE
  // ==========================================

  const [historyData, setHistoryData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");

  const [currentPage, setCurrentPage] = useState(1);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const rowsPerPage = 8;


  // ==========================================
  // LOAD HISTORY FROM BACKEND
  // ==========================================

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getHistory();

      console.log("History API response:", data);

      // ------------------------------------------
      // Backend may return:
      //
      // [
      //   {
      //     id,
      //     timestamp,
      //     aqi_value,
      //     aqi_category,
      //     co,
      //     temperature,
      //     humidity
      //   }
      // ]
      // ------------------------------------------

      const readings = Array.isArray(data)
        ? data
        : data?.data || data?.readings || [];

      const formattedData = readings.map((item, index) => {
        const timestamp = item.timestamp || item.created_at;

        return {
          id: item.id ?? index,

          timestamp: timestamp
            ? new Date(timestamp).toLocaleString()
            : "Unknown",

          date: timestamp
            ? new Date(timestamp).toISOString().split("T")[0]
            : "",

          aqi: Number(
            item.aqi_value ??
            item.aqi ??
            item.AQI ??
            0
          ),

          status:
            item.aqi_category ??
            item.status ??
            "Unknown",

          co: Number(item.co ?? 0).toFixed(2),

          temp: Number(
            item.temperature ??
            item.temp ??
            0
          ).toFixed(1),

          humidity: Number(
            item.humidity ?? 0
          ).toFixed(0),
        };
      });

      setHistoryData(formattedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("History API error:", err);

      setError(
        err.message ||
        "Unable to load history data."
      );

      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // LOAD DATA WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    loadHistory();
  }, []);


  // ==========================================
  // FILTER DATA
  // ==========================================

  const filteredData = useMemo(() => {
    let result = [...historyData];

    // ------------------------------------------
    // SEARCH
    // ------------------------------------------

    if (search.trim()) {
      const value = search.toLowerCase();

      result = result.filter((item) =>
        [
          item.timestamp,
          item.date,
          item.aqi,
          item.status,
          item.co,
          item.temp,
          item.humidity,
        ].some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        )
      );
    }


    // ------------------------------------------
    // STATUS FILTER
    // ------------------------------------------

    if (statusFilter !== "All") {
      result = result.filter(
        (item) =>
          item.status === statusFilter
      );
    }


    // ------------------------------------------
    // DATE FILTER
    // ------------------------------------------

    if (dateFilter === "Today") {
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      result = result.filter(
        (item) =>
          item.date === today
      );
    }


    if (dateFilter === "Last 2 Days") {
      const today = new Date();

      const yesterday =
        new Date();

      yesterday.setDate(
        today.getDate() - 1
      );

      const todayString =
        today.toISOString()
          .split("T")[0];

      const yesterdayString =
        yesterday.toISOString()
          .split("T")[0];

      result = result.filter(
        (item) =>
          item.date === todayString ||
          item.date === yesterdayString
      );
    }

    return result;
  }, [
    historyData,
    search,
    statusFilter,
    dateFilter,
  ]);


  // ==========================================
  // SUMMARY
  // ==========================================

  const summary = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        total: 0,
        average: 0,
        max: 0,
        min: 0,
      };
    }

    const values =
      filteredData.map(
        (item) => Number(item.aqi) || 0
      );

    const total =
      values.length;

    const average =
      Math.round(
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / total
      );

    const max =
      Math.max(...values);

    const min =
      Math.min(...values);

    return {
      total,
      average,
      max,
      min,
    };
  }, [filteredData]);


  // ==========================================
  // AQI CATEGORY HELPER
  // ==========================================

  const getAQICategory = (aqi) => {
    if (aqi <= 100) {
      return "Good";
    }

    if (aqi <= 200) {
      return "Moderate";
    }

    if (aqi <= 300) {
      return "Poor";
    }

    if (aqi <= 400) {
      return "Very Poor";
    }

    return "Severe";
  };


  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredData.length /
          rowsPerPage
      )
    );

  const safePage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    (safePage - 1) *
    rowsPerPage;

  const displayedData =
    filteredData.slice(
      startIndex,
      startIndex +
        rowsPerPage
    );


  // ==========================================
  // SEARCH / FILTER HANDLERS
  // ==========================================

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };


  const handleStatusChange = (e) => {
    setStatusFilter(
      e.target.value
    );

    setCurrentPage(1);
  };


  const handleDateChange = (e) => {
    setDateFilter(
      e.target.value
    );

    setCurrentPage(1);
  };


  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setSearch("");
    setStatusFilter("All");
    setDateFilter("All Time");
    setCurrentPage(1);

    await loadHistory();
  };


  // ==========================================
  // EXPORT CSV
  // ==========================================

  const exportCSV = () => {
    if (filteredData.length === 0) {
      return;
    }

    const headers = [
      "Timestamp",
      "AQI",
      "Status",
      "CO (ppm)",
      "Temperature (°C)",
      "Humidity (%)",
    ];

    const rows =
      filteredData.map(
        (item) => [
          `"${item.timestamp}"`,
          item.aqi,
          item.status,
          item.co,
          item.temp,
          item.humidity,
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
      "airguard-history.csv";

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


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="history-page">

      <section className="history-content">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="history-heading">

          <div>

            <span className="history-eyebrow">
              AIR QUALITY DATA
            </span>

            <h1>
              History
            </h1>

            <p>
              Browse and analyze your past air
              quality readings.
            </p>

          </div>


          <div className="heading-actions">

            <button
              className="refresh-button"
              onClick={handleRefresh}
              disabled={loading}
            >

              <RefreshCw
                size={17}
                className={
                  loading
                    ? "refresh-spinning"
                    : ""
                }
              />

              {loading
                ? "Refreshing..."
                : "Refresh"}

            </button>


            <button
              className="export-button"
              onClick={exportCSV}
              disabled={
                filteredData.length === 0
              }
            >

              <Download
                size={17}
              />

              Export CSV

            </button>

          </div>

        </div>


        {/* ==========================================
            LAST UPDATED
        ========================================== */}

        <div className="last-updated">

          Last updated{" "}

          {lastUpdated.toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}

        </div>


        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (

          <div
            className="history-error"
          >

            <strong>
              Unable to load history
            </strong>

            <span>
              {error}
            </span>

          </div>

        )}


        {/* ==========================================
            FILTERS
        ========================================== */}

        <div className="history-filters">

          <div className="filter-box date-filter">

            <CalendarDays
              size={17}
            />

            <select
              value={dateFilter}
              onChange={
                handleDateChange
              }
            >

              <option value="All Time">
                All Time
              </option>

              <option value="Today">
                Today
              </option>

              <option value="Last 2 Days">
                Last 2 Days
              </option>

            </select>

          </div>


          <div className="filter-box">

            <BarChart3
              size={17}
            />

            <select
              value={statusFilter}
              onChange={
                handleStatusChange
              }
            >

              <option value="All">
                All Status
              </option>

              <option value="Good">
                Good
              </option>

              <option value="Moderate">
                Moderate
              </option>

              <option value="Poor">
                Poor
              </option>

              <option value="Very Poor">
                Very Poor
              </option>

              <option value="Severe">
                Severe
              </option>

            </select>

          </div>


          <div className="search-box">

            <Search
              size={18}
            />

            <input
              type="text"
              placeholder="Search AQI, status, date..."
              value={search}
              onChange={
                handleSearch
              }
            />

          </div>

        </div>


        {/* ==========================================
            SUMMARY
        ========================================== */}

        <div className="summary-grid">

          <div className="summary-card">

            <div className="summary-icon">

              <CalendarDays
                size={21}
              />

            </div>

            <div>

              <span>
                Total Readings
              </span>

              <h2>
                {summary.total}
              </h2>

              <p>
                This period
              </p>

            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon">

              <BarChart3
                size={21}
              />

            </div>

            <div>

              <span>
                Average AQI
              </span>

              <h2>
                {summary.average}
              </h2>

              <p className="good-text">

                {getAQICategory(
                  summary.average
                )}

              </p>

            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon">

              <TrendingUp
                size={21}
              />

            </div>

            <div>

              <span>
                Max AQI
              </span>

              <h2>
                {summary.max}
              </h2>

              <p>
                Highest recorded
              </p>

            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon">

              <TrendingDown
                size={21}
              />

            </div>

            <div>

              <span>
                Min AQI
              </span>

              <h2>
                {summary.min}
              </h2>

              <p>
                Lowest recorded
              </p>

            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon">

              <Clock3
                size={21}
              />

            </div>

            <div>

              <span>
                Data Availability
              </span>

              <h2>
                {historyData.length > 0
                  ? "100%"
                  : "0%"}
              </h2>

              <p className="good-text">

                {historyData.length > 0
                  ? "Available"
                  : "No data"}

              </p>

            </div>

          </div>

        </div>


        {/* ==========================================
            TABLE
        ========================================== */}

        <div className="history-table-container">

          <div className="table-header">

            <div>

              <h2>
                Air Quality Readings
              </h2>

              <p>
                Historical sensor measurements
              </p>

            </div>


            <span className="reading-count">

              {filteredData.length}
              {" "}
              readings

            </span>

          </div>


          <div className="table-scroll">

            <table>

              <thead>

                <tr>

                  <th>
                    Timestamp
                  </th>

                  <th>
                    AQI
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    CO (ppm)
                  </th>

                  <th>
                    Temp (°C)
                  </th>

                  <th>
                    Humidity (%)
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="no-results"
                    >

                      Loading history...

                    </td>

                  </tr>

                ) : displayedData.length > 0 ? (

                  displayedData.map(
                    (item) => {

                      const isModerate =
                        item.status ===
                        "Moderate";

                      const isPoor =
                        item.status ===
                        "Poor";

                      const isVeryPoor =
                        item.status ===
                        "Very Poor";

                      const isSevere =
                        item.status ===
                        "Severe";


                      return (

                        <tr
                          key={item.id}
                        >

                          <td className="timestamp">

                            {item.timestamp}

                          </td>


                          <td>

                            <strong
                              className={`aqi-value ${
                                isModerate ||
                                isPoor ||
                                isVeryPoor ||
                                isSevere
                                  ? "moderate-aqi"
                                  : ""
                              }`}
                            >

                              {item.aqi}

                            </strong>

                          </td>


                          <td>

                            <span
                              className={`status ${
                                item.status ===
                                "Good"
                                  ? "good"
                                  : "moderate"
                              }`}
                            >

                              <span className="status-small-dot"></span>

                              {item.status}

                            </span>

                          </td>


                          <td>
                            {item.co}
                          </td>


                          <td>
                            {item.temp}
                          </td>


                          <td>
                            {item.humidity}
                          </td>

                        </tr>

                      );

                    }
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="no-results"
                    >

                      {error
                        ? "Unable to load readings."
                        : "No readings found in the database."}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          {/* ==========================================
              FOOTER
          ========================================== */}

          <div className="table-footer">

            <p>

              Showing{" "}

              {filteredData.length === 0
                ? 0
                : startIndex + 1}

              {" "}to{" "}

              {Math.min(
                startIndex +
                  rowsPerPage,
                filteredData.length
              )}

              {" "}of{" "}

              {filteredData.length}

              {" "}readings

            </p>


            <div className="pagination">

              <button
                className="page-arrow"
                disabled={
                  safePage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    Math.max(
                      1,
                      safePage - 1
                    )
                  )
                }
              >

                <ChevronLeft
                  size={17}
                />

              </button>


              {Array.from(
                {
                  length:
                    totalPages,
                },
                (_, index) =>
                  index + 1
              ).map((page) => (

                <button
                  key={page}
                  className={`page-number ${
                    safePage === page
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setCurrentPage(
                      page
                    )
                  }
                >

                  {page}

                </button>

              ))}


              <button
                className="page-arrow"
                disabled={
                  safePage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      totalPages,
                      safePage + 1
                    )
                  )
                }
              >

                <ChevronRight
                  size={17}
                />

              </button>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default History;
