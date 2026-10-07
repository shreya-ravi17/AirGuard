import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  Bell,
  MapPin,
  X,
  Leaf,
  Database,
  Download,
  BrainCircuit,
  Clock3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "./Dashboard.css";

/* =========================================================
   API CONFIGURATION
   ========================================================= */

import { API_BASE_URL, fetchPMSData, fetchSQLData } from "../services/api";

/* =========================================================
   HISTORY CONFIGURATION
   ========================================================= */

const HISTORY_LIMIT = 5;

/* =========================================================
   DEFAULT ENVIRONMENTAL READINGS
   ========================================================= */

const defaultSensorData = [
  {
    name: "Carbon Monoxide (CO)",
    value: "0.00",
    unit: "ppm",
    status: "Good",
    type: "green",
    icon: "CO",
  },

  {
    name: "Ammonia (NH₃)",
    value: "0.00",
    unit: "ppm",
    status: "Good",
    type: "green",
    icon: "NH₃",
  },

  {
    name: "Nitrogen Dioxide (NO₂)",
    value: "0.00",
    unit: "ppm",
    status: "Good",
    type: "green",
    icon: "NO₂",
  },

  {
    name: "Nitrogen Oxides (NOx)",
    value: "0.00",
    unit: "ppm",
    status: "Good",
    type: "green",
    icon: "NOx",
  },

  {
    name: "Temperature",
    value: "0.0",
    unit: "°C",
    status: "Comfortable",
    type: "blue",
    icon: "°",
  },

  {
    name: "Humidity",
    value: "0",
    unit: "%",
    status: "Comfortable",
    type: "blue",
    icon: "%",
  },
];

/* =========================================================
   DEFAULT HISTORY DATA
   Used only if backend is temporarily unavailable.
   ========================================================= */

const fallbackHistoryRecords = [
  {
    date: "Oct 4, 2026",
    time: "07:45 PM",
    source: "PMS Sensor",
    aqi: "142",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "07:30 PM",
    source: "XAMPP / MySQL",
    aqi: "138",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "07:15 PM",
    source: "PMS Sensor",
    aqi: "135",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "07:00 PM",
    source: "XAMPP / MySQL",
    aqi: "130",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "06:45 PM",
    source: "PMS Sensor",
    aqi: "128",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "06:30 PM",
    source: "XAMPP / MySQL",
    aqi: "125",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "06:15 PM",
    source: "PMS Sensor",
    aqi: "121",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "06:00 PM",
    source: "XAMPP / MySQL",
    aqi: "118",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "05:45 PM",
    source: "PMS Sensor",
    aqi: "115",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "05:30 PM",
    source: "XAMPP / MySQL",
    aqi: "112",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "05:15 PM",
    source: "PMS Sensor",
    aqi: "108",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "05:00 PM",
    source: "XAMPP / MySQL",
    aqi: "105",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "04:45 PM",
    source: "PMS Sensor",
    aqi: "102",
    status: "Moderate",
  },

  {
    date: "Oct 4, 2026",
    time: "04:30 PM",
    source: "XAMPP / MySQL",
    aqi: "98",
    status: "Good",
  },

  {
    date: "Oct 4, 2026",
    time: "04:15 PM",
    source: "PMS Sensor",
    aqi: "95",
    status: "Good",
  },

  {
    date: "Oct 4, 2026",
    time: "04:00 PM",
    source: "XAMPP / MySQL",
    aqi: "92",
    status: "Good",
  },

  {
    date: "Oct 4, 2026",
    time: "03:45 PM",
    source: "PMS Sensor",
    aqi: "89",
    status: "Good",
  },

  {
    date: "Oct 4, 2026",
    time: "03:30 PM",
    source: "XAMPP / MySQL",
    aqi: "86",
    status: "Good",
  },

  {
    date: "Oct 4, 2026",
    time: "03:15 PM",
    source: "PMS Sensor",
    aqi: "84",
    status: "Good",
  },

  {
    date: "Oct 4, 2026",
    time: "03:00 PM",
    source: "XAMPP / MySQL",
    aqi: "82",
    status: "Good",
  },
];

/* =========================================================
   CURRENT AIR QUALITY
   ========================================================= */

/* =========================================================
   COMPONENT
   ========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  /* =======================================================
     NOTIFICATION STATE
     ======================================================= */

  const [showAirAlert, setShowAirAlert] = useState(false);

  /* =======================================================
     ENVIRONMENTAL DATA
     ======================================================= */

  const [sensorData, setSensorData] = useState(defaultSensorData);

  /* =======================================================
     LIVE CURRENT DATA  (GET /api/current, refreshed every 10s)
     ======================================================= */

  const [currentAQI, setCurrentAQI] = useState("--");
  const [currentAQIStatus, setCurrentAQIStatus] = useState("No data");
  const [locationName, setLocationName] = useState("Location unavailable");
  const [latitude, setLatitude] = useState("--");
  const [longitude, setLongitude] = useState("--");

  const formatCoord = (value, positive, negative) => {
    const n = Number(value);
    if (value === null || value === undefined || Number.isNaN(n)) return "--";
    return `${Math.abs(n).toFixed(4)}° ${n >= 0 ? positive : negative}`;
  };

  useEffect(() => {
    let cancelled = false;

    const loadCurrent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/current`);

        if (!response.ok) {
          throw new Error(`Current API returned ${response.status}`);
        }

        const data = await response.json();

        // Backend returns { message: "No readings yet" } on an empty DB
        if (cancelled || data?.aqi_value === undefined) return;

        setCurrentAQI(Math.round(Number(data.aqi_value)));
        setCurrentAQIStatus(data.aqi_category || "Unknown");

        if (data.city) setLocationName(data.city);
        setLatitude(formatCoord(data.latitude, "N", "S"));
        setLongitude(formatCoord(data.longitude, "E", "W"));

        const liveValues = {
          "CO": [data.co, 2],
          "NH₃": [data.nh3, 2],
          "NO₂": [data.no2, 2],
          "NOx": [data.nox, 2],
          "°": [data.temperature, 1],
          "%": [data.humidity, 0],
        };

        setSensorData((previous) =>
          previous.map((item) => {
            const entry = liveValues[item.icon];
            if (!entry || entry[0] === null || entry[0] === undefined) {
              return item;
            }
            return { ...item, value: Number(entry[0]).toFixed(entry[1]) };
          })
        );
      } catch (error) {
        console.error("Current data fetch error:", error);
      }
    };

    loadCurrent();
    const timer = setInterval(loadCurrent, 10000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  /* =======================================================
     DATA SOURCES  (FETCH PMS DATA / FETCH FROM SQL)
     ======================================================= */

  const [pmsData, setPmsData] = useState(null);
  const [pmsStatus, setPmsStatus] = useState("Ready");
  const [pmsError, setPmsError] = useState("");
  const [pmsFetchedAt, setPmsFetchedAt] = useState("--");

  const [sqlData, setSqlData] = useState(null);
  const [sqlStatus, setSqlStatus] = useState("Ready");
  const [sqlError, setSqlError] = useState("");
  const [sqlFetchedAt, setSqlFetchedAt] = useState("--");

  const nowLabel = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleFetchPMS = async () => {
    setPmsStatus("Fetching...");
    setPmsError("");
    try {
      setPmsData(await fetchPMSData());
      setPmsStatus("Fetched");
      setPmsFetchedAt(nowLabel());
    } catch (error) {
      setPmsData(null);
      setPmsStatus("Error");
      setPmsError(error.message);
    }
  };

  const handleFetchSQL = async () => {
    setSqlStatus("Fetching...");
    setSqlError("");
    try {
      setSqlData(await fetchSQLData());
      setSqlStatus("Connected");
      setSqlFetchedAt(nowLabel());
    } catch (error) {
      setSqlData(null);
      setSqlStatus("Error");
      setSqlError(error.message);
    }
  };

  const resultBoxStyle = {
    margin: "10px 0 0",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(127,127,127,0.25)",
    fontSize: "12px",
    lineHeight: 1.6,
  };

  /* =======================================================
     HISTORY STATE
     ======================================================= */

  const [historyRecords, setHistoryRecords] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalRecords, setTotalRecords] = useState(0);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [historyError, setHistoryError] =
    useState("");

  /* =======================================================
     FETCH HISTORY FROM BACKEND
     
     Backend:
     GET /api/history?page=1&limit=1
     ======================================================= */

  const fetchHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      setHistoryError("");

      const response = await fetch(
        `${API_BASE_URL}/api/history?page=${page}&limit=${HISTORY_LIMIT}`
      );

      if (!response.ok) {
        throw new Error(
          `History API returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Dashboard History Response:", data);

      /*
       * Backend may return:
       *
       * {
       *   records: [],
       *   total_records: 100,
       *   total_pages: 10
       * }
       *
       * OR:
       *
       * {
       *   history: []
       * }
       *
       * OR:
       *
       * {
       *   data: []
       * }
       */

      let records = [];

      if (Array.isArray(data)) {
        records = data;
      }

      else if (
        Array.isArray(data?.records)
      ) {
        records = data.records;
      }

      else if (
        Array.isArray(data?.history)
      ) {
        records = data.history;
      }

      else if (
        Array.isArray(data?.data)
      ) {
        records = data.data;
      }

      else if (
        Array.isArray(data?.items)
      ) {
        records = data.items;
      }

      /* ===================================================
         NORMALIZE BACKEND RECORDS
         =================================================== */

      const normalizedRecords = records.map(
        (record) => {
          const rawDate =
            record?.date ??
            record?.created_at ??
            record?.timestamp ??
            "";

          const rawTime =
            record?.time ??
            "";

          let formattedDate =
            rawDate;

          let formattedTime =
            rawTime;

          /*
           * If backend gives one timestamp,
           * split it into date + time.
           */

          if (
            rawDate &&
            !rawTime
          ) {
            const dateObject =
              new Date(rawDate);

            if (
              !Number.isNaN(
                dateObject.getTime()
              )
            ) {
              formattedDate =
                dateObject.toLocaleDateString(
                  "en-IN",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                );

              formattedTime =
                dateObject.toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );
            }
          }

          const aqi =
            record?.aqi ??
            record?.aqi_value ??
            record?.average_aqi ??
            record?.avg_aqi ??
            0;

          let status =
            record?.status ??
            record?.aqi_category ??
            record?.category ??
            "";

          /*
           * If backend does not provide status,
           * calculate it from AQI.
           */

          if (!status) {
            const numericAQI =
              Number(aqi) || 0;

            if (numericAQI <= 100) {
              status = "Good";
            }

            else if (
              numericAQI <= 200
            ) {
              status = "Moderate";
            }

            else if (
              numericAQI <= 300
            ) {
              status = "Poor";
            }

            else if (
              numericAQI <= 400
            ) {
              status = "Very Poor";
            }

            else {
              status = "Severe";
            }
          }

          return {
            date:
              formattedDate ||
              "Unknown Date",

            time:
              formattedTime ||
              "--",

            source:
              record?.source ??
              record?.data_source ??
              record?.device ??
              "AirGuard",

            aqi: String(aqi),

            status,
          };
        }
      );

      setHistoryRecords(
        normalizedRecords
      );

      /* ===================================================
         TOTAL RECORDS
         =================================================== */

      const backendTotalRecords =
        Number(
          data?.total_records ??
          data?.totalRecords ??
          data?.count ??
          data?.total ??
          0
        );

      /*
       * If backend gives total_records,
       * use it.
       *
       * Otherwise use the current page length.
       */

      if (
        backendTotalRecords > 0
      ) {
        setTotalRecords(
          backendTotalRecords
        );
      }

      else {
        setTotalRecords(
          normalizedRecords.length
        );
      }

      /* ===================================================
         TOTAL PAGES
         =================================================== */

      const backendTotalPages =
        Number(
          data?.total_pages ??
          data?.totalPages ??
          0
        );

      if (
        backendTotalPages > 0
      ) {
        setTotalPages(
          backendTotalPages
        );
      }

      else if (
        backendTotalRecords > 0
      ) {
        setTotalPages(
          Math.ceil(
            backendTotalRecords /
              HISTORY_LIMIT
          )
        );
      }

      else {
        /*
         * If backend doesn't provide total pages,
         * allow the pagination to continue while
         * the current page is full.
         */

        const possibleNextPage =
          normalizedRecords.length ===
          HISTORY_LIMIT
            ? page + 1
            : page;

        setTotalPages(
          possibleNextPage
        );
      }
    }

    catch (error) {
      console.error(
        "History fetch error:",
        error
      );

      /*
       * Use fallback data so the dashboard
       * still displays properly if backend
       * is temporarily unavailable.
       */

      setHistoryError(
        "Unable to fetch latest history from backend."
      );

      if (page >= 1) {
        const fallbackStart = (page - 1) * HISTORY_LIMIT;
        const fallbackEnd = fallbackStart + HISTORY_LIMIT;
        const fallbackPage = fallbackHistoryRecords.slice(
          fallbackStart,
          fallbackEnd
        );

        setHistoryRecords(fallbackPage);
        setTotalRecords(fallbackHistoryRecords.length);
        setTotalPages(
          Math.ceil(
            fallbackHistoryRecords.length /
              HISTORY_LIMIT
          )
        );
      }
    }

    finally {
      setHistoryLoading(false);
    }
  };

  /* =======================================================
     LOAD FIRST HISTORY PAGE
     ======================================================= */

  useEffect(() => {
    fetchHistory(1);
  }, []);

  /* =======================================================
     CHANGE HISTORY PAGE
     ======================================================= */

  const changePage = async (
    page
  ) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    await fetchHistory(page);

    /*
     * Scroll to Recent History section.
     */

    const historySection =
      document.getElementById(
        "recent-history"
      );

    if (historySection) {
      historySection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =======================================================
     PAGINATION BUTTONS
     ======================================================= */

  const getPaginationPages = () => {
    const pages = [];

    /*
     * Small number of pages.
     */

    if (
      totalPages <= 7
    ) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    /*
     * Always show page 1.
     */

    pages.push(1);

    /*
     * Left ellipsis.
     */

    if (
      currentPage > 4
    ) {
      pages.push("...");
    }

    /*
     * Middle pages.
     */

    const start =
      Math.max(
        2,
        currentPage - 1
      );

    const end =
      Math.min(
        totalPages - 1,
        currentPage + 1
      );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    /*
     * Right ellipsis.
     */

    if (
      currentPage <
      totalPages - 3
    ) {
      pages.push("...");
    }

    /*
     * Always show last page.
     */

    pages.push(
      totalPages
    );

    return pages;
  };

  /* =======================================================
     EXPORT HISTORY AS CSV
     ======================================================= */

  const exportHistoryCSV = () => {
    if (
      historyRecords.length === 0
    ) {
      alert(
        "No history records available to export."
      );

      return;
    }

    const headers = [
      "Date",
      "Time",
      "Source",
      "AQI",
      "Status",
    ];

    const csvRows = [];

    /*
     * HEADER
     */

    csvRows.push(
      headers.join(",")
    );

    /*
     * RECORDS
     */

    historyRecords.forEach(
      (record) => {
        const row = [
          record.date,
          record.time,
          record.source,
          record.aqi,
          record.status,
        ].map(
          (value) => {
            const text =
              String(
                value ?? ""
              );

            return `"${text.replace(
              /"/g,
              '""'
            )}"`;
          }
        );

        csvRows.push(
          row.join(",")
        );
      }
    );

    /*
     * CREATE CSV
     */

    const csvContent =
      csvRows.join("\n");

    const blob =
      new Blob(
        [csvContent],
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
      "AirGuard_History.csv";

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

  /* =======================================================
     GO TO AI PREDICTION PAGE
     ======================================================= */

  const goToPrediction = () => {
    navigate("/prediction");
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="dashboard-page">

      {/* ===================================================
          BACKGROUND DECORATION
          =================================================== */}

      <div className="dashboard-bg-circle circle-one"></div>

      <div className="dashboard-bg-circle circle-two"></div>

      <div className="dashboard-leaf leaf-one">
        <Leaf size={20} />
      </div>

      <div className="dashboard-leaf leaf-two">
        <Leaf size={17} />
      </div>


      {/* ===================================================
          HEADER
          =================================================== */}

      <header className="dashboard-header">

        {/* AIRGUARD BRAND */}

        <div className="airguard-brand">

          <div className="airguard-logo">

            <ShieldCheck
              size={25}
              strokeWidth={2.4}
            />

          </div>

          <div className="airguard-brand-text">

            <h2>
              AirGuard
            </h2>

            <span>
              Breathe Clean, Live Healthy
            </span>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="dashboard-header-right">

          {/* LOCATION */}

          <div className="dashboard-location">

            <MapPin
              size={18}
              strokeWidth={2}
            />

            <div className="location-details">

              <strong>
                {locationName}
              </strong>

              <span>
                {longitude} / {latitude}
              </span>

            </div>

          </div>


          {/* =================================================
              NOTIFICATION
              ================================================= */}

          <div className="air-alert-wrapper">

            <button
              type="button"
              className={`air-alert-button ${
                showAirAlert
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setShowAirAlert(
                  (previous) =>
                    !previous
                )
              }
              aria-label="Air quality notification"
            >

              <Bell
                size={21}
                strokeWidth={2}
              />

              <span className="air-alert-badge">
                1
              </span>

            </button>


            {/* =================================================
                ALERT POPUP
                Hidden initially
                ================================================= */}

            {showAirAlert && (

              <div className="air-alert-panel">

                <div className="air-alert-panel-header">

                  <div className="air-alert-title">

                    <div className="air-alert-small-icon">

                      <Bell
                        size={16}
                        strokeWidth={2.2}
                      />

                    </div>

                    <div>

                      <h3>
                        Air Quality Alert
                      </h3>

                      <span>
                        Current air quality status
                      </span>

                    </div>

                  </div>


                  <button
                    type="button"
                    className="air-alert-close"
                    onClick={() =>
                      setShowAirAlert(
                        false
                      )
                    }
                    aria-label="Close alert"
                  >

                    <X size={16} />

                  </button>

                </div>


                <div className="air-alert-panel-content">

                  <div className="alert-aqi-number">
                    {currentAQI}
                  </div>

                  <div className="alert-aqi-details">

                    <strong>
                      {currentAQI} —{" "}
                      {currentAQIStatus}
                    </strong>

                    <p>
                      Current air quality
                      requires continued
                      monitoring.
                    </p>

                  </div>

                </div>


                <div className="air-alert-panel-footer">

                  <span className="alert-status-dot"></span>

                  Current Air Quality

                  <span className="alert-time">
                    Just now
                  </span>

                </div>

              </div>

            )}

          </div>

        </div>

      </header>


      {/* ===================================================
          HERO + AQI
          =================================================== */}

      <section className="dashboard-intro">

        {/* HERO */}

        <div className="intro-content">

          <div className="small-heading">

            CLEANER AIR

            <span>
              •
            </span>

            HEALTHIER TOMORROW

          </div>


          <h1>

            Monitor Air Quality.

            <br />

            <span>
              Protect Your Health.
            </span>

          </h1>


          <p>
            Real-time air quality monitoring
            and intelligent insights
            <br />
            designed to help you breathe safer.
          </p>

        </div>


        {/* =================================================
            LIVE AQI CARD
            ================================================= */}

        <div className="aqi-card">

          <div className="card-heading">

            <span className="heading-icon">

              <MapPin size={17} />

            </span>

            <div>

              <h2>
                Live Air Quality Index
              </h2>

              <p>
                Bengaluru, India
              </p>

            </div>

          </div>


          <div className="aqi-content">

            {/* AQI CIRCLE */}

            <div className="aqi-circle">

              <div className="aqi-inner">

                <span className="aqi-label">
                  AQI
                </span>

                <strong>
                  {currentAQI}
                </strong>

                <span className="aqi-status">
                  {currentAQIStatus}
                </span>

              </div>

            </div>


            <div className="aqi-divider"></div>


            {/* AQI MESSAGE */}

            <div className="aqi-message">

              <div className="message-icon">

                <Leaf size={20} />

              </div>

              <div>

                <span>
                  Air Quality
                </span>

                <strong>
                  is {currentAQIStatus}
                </strong>

                <p>
                  Keep monitoring
                  <br />
                  for better health.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================
          MAIN GRID
          =================================================== */}

      <section className="dashboard-grid">


        {/* =================================================
            ENVIRONMENTAL READINGS
            ================================================= */}

        <div className="dashboard-card environment-card">

          <div className="section-header">

            <div className="section-title">

              <div className="section-icon green-icon">

                <Leaf size={20} />

              </div>

              <div>

                <h2>
                  Environmental Readings
                </h2>

                <p>
                  Current air quality parameters
                  from your environment.
                </p>

              </div>

            </div>


            <div className="live-data">

              <span></span>

              Live Data

            </div>

          </div>


          <div className="sensor-grid">

            {sensorData.map(
              (
                sensor,
                index
              ) => (

                <div
                  className="sensor-box"
                  key={index}
                >

                  <div
                    className={`sensor-icon ${sensor.type}`}
                  >
                    {sensor.icon}
                  </div>


                  <div className="sensor-info">

                    <h3>
                      {sensor.name}
                    </h3>


                    <div className="sensor-value">

                      <strong>
                        {sensor.value}
                      </strong>

                      <span>
                        {sensor.unit}
                      </span>

                    </div>


                    <div
                      className={`sensor-status ${sensor.type}`}
                    >

                      <span></span>

                      {sensor.status}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>


        {/* =================================================
            DATA SOURCES
            ================================================= */}

        <div className="dashboard-card sources-card">

          <div className="section-header">

            <div className="section-title">

              <div className="section-icon green-icon">

                <Database size={20} />

              </div>

              <div>

                <h2>
                  Data Sources
                </h2>

                <p>
                  Fetch data from external sources
                  and local database
                </p>

              </div>

            </div>

          </div>


          <div className="source-list">


            {/* =================================================
                PMS SENSOR
                ================================================= */}

            <div className="source-box">

              <div className="source-left">

                <div className="source-icon">

                  <Leaf size={21} />

                </div>

                <div>

                  <h3>
                    PMS Sensor
                  </h3>

                  <p>
                    External PMS5003 dataset
                    for air quality data.
                  </p>

                </div>

              </div>


              <button
                className="fetch-button"
                type="button"
                onClick={handleFetchPMS}
                disabled={pmsStatus === "Fetching..."}
              >

                <Download size={15} />

                FETCH PMS DATA

              </button>

              {pmsError && (
                <p style={{ ...resultBoxStyle, color: "#dc2626" }}>{pmsError}</p>
              )}

              {pmsData && (
                <div style={resultBoxStyle}>
                  <strong>External data - not measured by the AirGuard mask</strong>
                  <div>City: {pmsData.city}</div>
                  <div>Date: {pmsData.date}</div>
                  <div>PM2.5: {pmsData.pm2_5} {pmsData.unit}</div>
                  <div>PM10: {pmsData.pm10} {pmsData.unit}</div>
                </div>
              )}


              <div className="source-bottom">

                <span className="connected-status">

                  <span></span>

                  Status: {pmsStatus}

                </span>


                <span className="last-fetched">

                  <Clock3 size={12} />

                  Last fetched: {pmsFetchedAt}

                </span>

              </div>

            </div>


            {/* =================================================
                XAMPP / MYSQL
                ================================================= */}

            <div className="source-box">

              <div className="source-left">

                <div className="source-icon">

                  <Database size={21} />

                </div>

                <div>

                  <h3>
                    XAMPP / MySQL
                  </h3>

                  <p>
                    Local MySQL database
                    for sensor data.
                  </p>

                </div>

              </div>


              <button
                className="fetch-button"
                type="button"
                onClick={handleFetchSQL}
                disabled={sqlStatus === "Fetching..."}
              >

                <Database size={15} />

                FETCH FROM SQL

              </button>

              {sqlError && (
                <p style={{ ...resultBoxStyle, color: "#dc2626" }}>{sqlError}</p>
              )}

              {sqlData && (
                <div style={resultBoxStyle}>
                  <strong>Real hardware reading (ESP32 via XAMPP/MySQL)</strong>

                  {Object.entries(sqlData.reading || {}).map(([key, value]) => {
                    const labels = {
                      id: "Record ID",
                      mq2: "MQ-2 (raw)",
                      mq7: "MQ-7 (raw)",
                      mq135: "MQ-135 (raw)",
                      temperature: "Temperature (°C)",
                      humidity: "Humidity (%)",
                      created_at: "Recorded at",
                    };

                    const display =
                      key === "created_at"
                        ? new Date(value).toLocaleString()
                        : String(value);

                    return (
                      <div key={key}>
                        {labels[key] || key}: {display}
                      </div>
                    );
                  })}
                </div>
              )}


              <div className="source-bottom">

                <span className="connected-status">

                  <span></span>

                  Status: {sqlStatus}

                </span>


                <span className="last-fetched">

                  <Clock3 size={12} />

                  Last fetched: {sqlFetchedAt}

                </span>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            AI PREDICTION
            ================================================= */}

        <div className="dashboard-card ai-card">

          <div className="ai-content">

            <div className="ai-icon">

              <BrainCircuit
                size={28}
              />

            </div>


            <div className="ai-text">

              <h2>
                AI Prediction
              </h2>

              <p>
                Use sensor and environmental
                data
                <br />
                for accurate AQI prediction.
              </p>


              {/* =================================================
                  GO TO AI PREDICTION PAGE
                  ================================================= */}

              <button
                className="prediction-button"
                type="button"
                onClick={goToPrediction}
              >

                Go to AI Prediction

                <span>
                  →
                </span>

              </button>

            </div>

          </div>


          {/* DECORATIVE CHART */}

          <div className="ai-chart">

            <div className="chart-line"></div>

            <div className="chart-bars">

              <span></span>
              <span></span>
              <span></span>
              <span></span>

            </div>

          </div>

        </div>


        {/* =================================================
            RECENT HISTORY
            ================================================= */}

        <div
          className="dashboard-card history-card"
          id="recent-history"
        >

          {/* HISTORY HEADER */}

          <div className="history-header">

            <div className="section-title">

              <div className="section-icon history-icon">

                <Clock3 size={20} />

              </div>

              <div>

                <h2>
                  Recent History
                </h2>

                <p>
                  Latest fetched records from your
                  system.
                </p>

              </div>

            </div>


            {/* EXPORT CSV */}

            <button
              type="button"
              className="export-csv-button"
              onClick={
                exportHistoryCSV
              }
              title="Export history records as CSV"
            >

              <Download size={15} />

              <span>
                Export CSV
              </span>

            </button>

          </div>


          {/* =================================================
              ERROR MESSAGE
              ================================================= */}

          {historyError && (

            <div
              className="history-error"
              style={{
                marginBottom:
                  "12px",
                padding:
                  "10px 14px",
                borderRadius:
                  "8px",
                background:
                  "#fff7ed",
                color:
                  "#b45309",
                fontSize:
                  "13px",
              }}
            >

              {historyError}

            </div>

          )}


          {/* =================================================
              TABLE
              ================================================= */}

          <div className="history-table-wrapper">

            <div className="history-table-head">

              <span>
                Date & Time
              </span>

              <span>
                Source
              </span>

              <span>
                AQI
              </span>

              <span>
                Status
              </span>

            </div>


            {/* =================================================
                LOADING
                ================================================= */}

            {historyLoading ? (

              <div
                className="history-loading"
                style={{
                  padding:
                    "35px",
                  textAlign:
                    "center",
                  color:
                    "#6d7478",
                }}
              >

                Loading history...

              </div>

            ) : historyRecords.length === 0 ? (

              <div
                className="history-loading"
                style={{
                  padding:
                    "35px",
                  textAlign:
                    "center",
                  color:
                    "#6d7478",
                }}
              >

                No history records available.

              </div>

            ) : (

              <div className="history-records">

                {historyRecords.map(
                  (
                    record,
                    index
                  ) => (

                    <div
                      className="history-row"
                      key={`${record.date}-${record.time}-${record.source}-${index}`}
                    >

                      {/* DATE + TIME */}

                      <div className="record-date">

                        <strong>
                          {record.date}
                        </strong>

                        <span>
                          {record.time}
                        </span>

                      </div>


                      {/* SOURCE */}

                      <div className="record-source">

                        {record.source}

                      </div>


                      {/* AQI */}

                      <div className="record-aqi">

                        {record.aqi}

                      </div>


                      {/* STATUS */}

                      <div
                        className={`record-status ${
                          record.status
                            ?.toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )
                        }`}
                      >

                        <span></span>

                        {record.status}

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* =================================================
              PAGINATION
              ================================================= */}

          <div className="pagination-container">

            {/* RECORD COUNT */}

            <div className="record-count">

              {totalRecords > 0 ? (

                <>
                  Showing{" "}

                  <strong>
                    {(
                      (currentPage - 1) *
                        HISTORY_LIMIT
                    ) + 1}

                    -

                    {Math.min(
                      currentPage *
                        HISTORY_LIMIT,
                      totalRecords
                    )}
                  </strong>

                  {" "}of{" "}

                  <strong>
                    {totalRecords}
                  </strong>

                  {" "}records
                </>

              ) : (

                <>
                  Page{" "}

                  <strong>
                    {currentPage}
                  </strong>

                </>

              )}

            </div>


            {/* PAGINATION */}

            <div className="pagination">


              {/* PREVIOUS */}

              <button
                type="button"
                className="page-arrow"
                disabled={
                  currentPage === 1 ||
                  historyLoading
                }
                onClick={() =>
                  changePage(
                    currentPage - 1
                  )
                }
                aria-label="Previous page"
              >

                <ChevronLeft
                  size={15}
                />

              </button>


              {/* PAGE NUMBERS */}

              {getPaginationPages().map(
                (
                  page,
                  index
                ) => {

                  /*
                   * ELLIPSIS
                   */

                  if (
                    page === "..."
                  ) {

                    return (

                      <span
                        className="page-dots"
                        key={`dots-${index}`}
                      >
                        ...
                      </span>

                    );
                  }


                  /*
                   * PAGE NUMBER
                   */

                  return (

                    <button
                      type="button"
                      key={page}
                      className={`page-number ${
                        currentPage === page
                          ? "active"
                          : ""
                      }`}
                      disabled={
                        historyLoading
                      }
                      onClick={() =>
                        changePage(
                          page
                        )
                      }
                    >

                      {page}

                    </button>

                  );

                }
              )}


              {/* NEXT */}

              <button
                type="button"
                className="page-arrow"
                disabled={
                  currentPage >=
                    totalPages ||
                  historyLoading
                }
                onClick={() =>
                  changePage(
                    currentPage + 1
                  )
                }
                aria-label="Next page"
              >

                <ChevronRight
                  size={15}
                />

              </button>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;