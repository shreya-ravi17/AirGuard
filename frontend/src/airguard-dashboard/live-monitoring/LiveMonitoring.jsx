
import { useEffect, useState } from "react";

import {
  Activity,
  Cpu,
  Droplets,
  Gauge,
  Radio,
  ShieldCheck,
  Thermometer,
  Wind,
  Zap,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import "./LiveMonitoring.css";

import { getCurrent } from "../../services/api";


// ==========================================
// COMPONENT
// ==========================================

function LiveMonitoring() {
  // ========================================
  // STATE
  // ========================================

  const [aqi, setAqi] = useState(0);
  const [aqiCategory, setAqiCategory] = useState("");

  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);

  const [co, setCo] = useState(0);
  const [nh3, setNh3] = useState(0);
  const [no2, setNo2] = useState(0);
  const [nox, setNox] = useState(0);

  const [city, setCity] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const [autoRefresh, setAutoRefresh] = useState(true);


  // ========================================
  // AQI STATUS
  // ========================================

  const getAQIStatus = (value, backendCategory) => {
    const number = Number(value) || 0;

    // Prefer the category coming from backend
    if (backendCategory) {
      const category = backendCategory.toLowerCase();

      if (category.includes("good") || category.includes("safe")) {
        return {
          text: backendCategory,
          className: "good",
          description: "Air quality is currently good.",
        };
      }

      if (category.includes("moderate")) {
        return {
          text: backendCategory,
          className: "moderate",
          description:
            "Air quality is acceptable but may affect sensitive people.",
        };
      }

      if (
        category.includes("unhealthy") ||
        category.includes("danger") ||
        category.includes("hazard")
      ) {
        return {
          text: backendCategory,
          className: "danger",
          description:
            "Air quality needs attention. Consider reducing exposure.",
        };
      }
    }

    // Fallback based on AQI value
    if (number <= 50) {
      return {
        text: "Good",
        className: "good",
        description: "Air quality is currently good.",
      };
    }

    if (number <= 100) {
      return {
        text: "Moderate",
        className: "moderate",
        description:
          "Air quality is acceptable but may affect sensitive people.",
      };
    }

    if (number <= 150) {
      return {
        text: "Unhealthy for Sensitive Groups",
        className: "moderate",
        description:
          "Sensitive people may experience health effects.",
      };
    }

    if (number <= 200) {
      return {
        text: "Unhealthy",
        className: "danger",
        description:
          "Everyone may begin to experience health effects.",
      };
    }

    return {
      text: "Hazardous",
      className: "danger",
      description: "Air quality is at a hazardous level.",
    };
  };


  // ========================================
  // LOAD CURRENT DATA
  // GET /api/current
  // ========================================

  const loadCurrentData = async () => {
    try {
      setError("");

      const data = await getCurrent();

      console.log("AirGuard /api/current:", data);

      // ====================================
      // HANDLE POSSIBLE API WRAPPER
      // ====================================

      const current =
        data?.data ||
        data?.current ||
        data;


      // ====================================
      // ACTUAL BACKEND FIELDS
      // ====================================

      setAqi(Number(current?.aqi_value) || 0);

      setAqiCategory(current?.aqi_category || "");

      setTemperature(Number(current?.temperature) || 0);

      setHumidity(Number(current?.humidity) || 0);

      setCo(Number(current?.co) || 0);

      setNh3(Number(current?.nh3) || 0);

      setNo2(Number(current?.no2) || 0);

      setNox(Number(current?.nox) || 0);

      setCity(current?.city || "");

      setDeviceId(current?.device_id || "");


      // ====================================
      // LAST UPDATED
      // ====================================

      const timestamp = current?.timestamp;

      setLastUpdated(
        timestamp
          ? new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
      );
    } catch (err) {
      console.error("Live monitoring error:", err);

      setError(
        err.message ||
          "Failed to fetch live sensor data."
      );
    } finally {
      setLoading(false);
    }
  };


  // ========================================
  // INITIAL LOAD + AUTO REFRESH
  // ========================================

  useEffect(() => {
    loadCurrentData();

    if (!autoRefresh) {
      return;
    }

    const interval = setInterval(() => {
      loadCurrentData();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh]);


  // ========================================
  // AQI STATUS
  // ========================================

  const status = getAQIStatus(aqi, aqiCategory);


  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="live-page">

      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <section className="live-header">

        <div className="live-title">

          <div className="live-title-icon">
            <Activity size={22} />
          </div>

          <div>

            <span>
              REAL-TIME MONITORING
            </span>

            <h1>
              Live Monitoring
            </h1>

            <p>
              Real-time environmental data
              from your AirGuard device.
            </p>

          </div>

        </div>


        {/* REFRESH CONTROL */}

        <button
          onClick={loadCurrentData}
          disabled={loading}
          className="generate-button"
        >

          <RefreshCw
            size={17}
            className={
              loading ? "spin" : ""
            }
          />

          {loading
            ? "Loading..."
            : "Refresh"}

        </button>

      </section>


      {/* ====================================
          ERROR
      ==================================== */}

      {error && (

        <div className="prediction-error">

          <AlertTriangle size={18} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ====================================
          TOP CARDS
      ==================================== */}

      <section className="monitor-grid">


        {/* ==================================
            AQI CARD
        ================================== */}

        <div className="aqi-live-card">

          <div className="card-heading">

            <div>

              <span className="small-label">
                AIR QUALITY INDEX
              </span>

              <h2>
                Current AQI
              </h2>

            </div>


            <div className="live-badge">

              <span></span>

              LIVE

            </div>

          </div>


          <div className="aqi-content">


            <div className="aqi-number-section">

              <div className="aqi-number">

                {loading
                  ? "..."
                  : Math.round(aqi)}

              </div>


              <div
                className={`aqi-status ${status.className}`}
              >

                <span></span>

                {loading
                  ? "Loading..."
                  : status.text}

              </div>


              <p>

                {loading
                  ? "Fetching current air quality..."
                  : status.description}

              </p>

            </div>


            {/* GAUGE */}

            <div className="aqi-gauge">

              <div
                className="gauge-ring"
                style={{
                  "--progress": `${Math.min(
                    (aqi / 500) * 100,
                    100
                  )}%`,
                }}
              >

                <div className="gauge-inner">

                  <Gauge size={25} />

                  <span>
                    0–500
                  </span>

                </div>

              </div>

            </div>

          </div>


          <div className="updated">

            <Radio size={15} />

            Last updated:

            {" "}

            {lastUpdated ||
              "Loading..."}

          </div>

        </div>


        {/* ==================================
            DEVICE CARD
        ================================== */}

        <div className="device-live-card">

          <div className="card-heading">

            <div>

              <span className="small-label">
                DEVICE STATUS
              </span>

            </div>


            <div className="online-dot">

              <span></span>

              Online

            </div>

          </div>


          <div className="device-visual">

            <div className="device-icon">

              <Cpu size={34} />

            </div>


            <div>

              <strong>
                Connected
              </strong>

              <p>
                {deviceId ||
                  "ESP32 Air Quality Device"}
              </p>

            </div>

          </div>


          <div className="device-stats">

            <div>

              <span>
                Location
              </span>

              <strong>
                {city || "Unknown"}
              </strong>

            </div>


            <div>

              <span>
                Refresh
              </span>

              <strong>
                {autoRefresh ? "5 sec" : "Off"}
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* ====================================
          SENSOR SECTION
      ==================================== */}

      <section className="section-block">

        <div className="section-heading">

          <div>

            <span>
              YOUR AIRGUARD SENSORS
            </span>

            <h2>
              Environmental Readings
            </h2>

          </div>


          <div className="reading-status">

            <span></span>

            {error
              ? "Connection error"
              : loading
              ? "Connecting..."
              : "Receiving data"}

          </div>

        </div>


        <div className="sensor-grid">


          {/* =================================
              CO
          ================================= */}

          <div className="sensor-card sensor-green">

            <div className="sensor-top">

              <div className="sensor-icon">

                <Wind size={21} />

              </div>

              <span className="sensor-live">
                LIVE
              </span>

            </div>


            <p>
              MQ-7
            </p>

            <h3>
              Carbon Monoxide
            </h3>


            <div className="sensor-value">

              {loading
                ? "..."
                : co}

              <small>
                {" "}ppm
              </small>

            </div>


            <div className="sensor-status good">
              ● Live
            </div>


            <div className="mini-wave"></div>

          </div>


          {/* =================================
              NH3
          ================================= */}

          <div className="sensor-card sensor-blue">

            <div className="sensor-top">

              <div className="sensor-icon">

                <Zap size={21} />

              </div>

              <span className="sensor-live">
                LIVE
              </span>

            </div>


            <p>
              MQ Sensor
            </p>

            <h3>
              Ammonia (NH₃)
            </h3>


            <div className="sensor-value">

              {loading
                ? "..."
                : nh3}

              <small>
                {" "}ppm
              </small>

            </div>


            <div className="sensor-status good">
              ● Live
            </div>


            <div className="mini-wave"></div>

          </div>


          {/* =================================
              NO2
          ================================= */}

          <div className="sensor-card sensor-purple">

            <div className="sensor-top">

              <div className="sensor-icon">

                <Activity size={21} />

              </div>

              <span className="sensor-live">
                LIVE
              </span>

            </div>


            <p>
              MQ Sensor
            </p>

            <h3>
              Nitrogen Dioxide
            </h3>


            <div className="sensor-value">

              {loading
                ? "..."
                : no2}

              <small>
                {" "}ppm
              </small>

            </div>


            <div className="sensor-status good">
              ● Live
            </div>


            <div className="mini-wave"></div>

          </div>


          {/* =================================
              NOX
          ================================= */}

          <div className="sensor-card sensor-green">

            <div className="sensor-top">

              <div className="sensor-icon">

                <Wind size={21} />

              </div>

              <span className="sensor-live">
                LIVE
              </span>

            </div>


            <p>
              MQ Sensor
            </p>

            <h3>
              Nitrogen Oxides
            </h3>


            <div className="sensor-value">

              {loading
                ? "..."
                : nox}

              <small>
                {" "}ppm
              </small>

            </div>


            <div className="sensor-status good">
              ● Live
            </div>


            <div className="mini-wave"></div>

          </div>


          {/* =================================
              TEMPERATURE
          ================================= */}

          <div className="sensor-card sensor-orange">

            <div className="sensor-top">

              <div className="sensor-icon">

                <Thermometer size={21} />

              </div>

              <span className="sensor-live">
                LIVE
              </span>

            </div>


            <p>
              DHT22
            </p>

            <h3>
              Temperature
            </h3>


            <div className="sensor-value">

              {loading
                ? "..."
                : temperature.toFixed(1)}

              <small>
                {" "}°C
              </small>

            </div>


            <div className="sensor-status comfortable">
              ● Live
            </div>


            <div className="mini-wave"></div>

          </div>


          {/* =================================
              HUMIDITY
          ================================= */}

          <div className="sensor-card sensor-cyan">

            <div className="sensor-top">

              <div className="sensor-icon">

                <Droplets size={21} />

              </div>

              <span className="sensor-live">
                LIVE
              </span>

            </div>


            <p>
              DHT22
            </p>

            <h3>
              Humidity
            </h3>


            <div className="sensor-value">

              {loading
                ? "..."
                : humidity.toFixed(0)}

              <small>
                {" "}%
              </small>

            </div>


            <div className="sensor-status comfortable">
              ● Live
            </div>


            <div className="mini-wave"></div>

          </div>

        </div>

      </section>


      {/* ====================================
          BOTTOM INSIGHTS
      ==================================== */}

      <section className="bottom-grid">


        <div className="status-card">

          <div className="status-icon">

            <ShieldCheck size={25} />

          </div>


          <div>

            <span>
              AIR QUALITY STATUS
            </span>

            <h2>

              {loading
                ? "Checking air quality..."
                : aqi <= 50
                ? "Everything looks good!"
                : aqi <= 100
                ? "Air quality is moderate"
                : "Air quality needs attention"}

            </h2>


            <p>

              {loading
                ? "Fetching the latest sensor readings."
                : status.description}

            </p>

          </div>


          <div className="status-pill">

            {loading
              ? "CHECKING"
              : aqi <= 50
              ? "LOW RISK"
              : aqi <= 100
              ? "MODERATE"
              : "HIGH RISK"}

          </div>

        </div>


        <div className="health-card">

          <div className="health-icon">

            <Wind size={24} />

          </div>


          <div>

            <span>
              AIRGUARD INSIGHT
            </span>


            <h2>

              {loading
                ? "Analyzing conditions..."
                : aqi <= 50
                ? "Comfortable conditions 🌿"
                : aqi <= 100
                ? "Moderate conditions"
                : "Consider reducing exposure"}

            </h2>


            <p>

              {loading
                ? "Your device data is being analyzed."
                : `Current AQI is ${Math.round(
                    aqi
                  )}, with temperature ${temperature.toFixed(
                    1
                  )}°C and humidity ${humidity.toFixed(
                    0
                  )}%.`}

            </p>

          </div>

        </div>

      </section>

    </div>
  );
}


export default LiveMonitoring;
