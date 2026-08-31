import { useEffect, useState } from "react";
import {
  MapPin,
  Activity,
  BarChart3,
  History,
  BrainCircuit,
  AlertTriangle,
  ArrowUpRight,
  Droplets,
  Thermometer,
} from "lucide-react";

import { getCurrent } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  // =====================================================
  // STATE
  // =====================================================

  const [aqi, setAqi] = useState(null);
  const [aqiCategory, setAqiCategory] = useState("");

  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);

  const [city, setCity] = useState("Bengaluru");

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  // =====================================================
  // LOAD LATEST READING ON MOUNT
  // =====================================================

  useEffect(() => {
    fetchAQI();
  }, []);

  // =====================================================
  // GET USER LOCATION
  // =====================================================

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log("User latitude:", latitude);
        console.log("User longitude:", longitude);

        // Store location in frontend
        setLocation({
          latitude,
          longitude,
        });

        setLocationLoading(false);

        // Fetch latest AQI reading from backend
        await fetchAQI();
      },
      (locationError) => {
        console.error(
          "Location permission/error:",
          locationError
        );

        setLocationError(
          "Unable to get your location. Please allow location access."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // =====================================================
  // FETCH AQI FROM BACKEND
  // =====================================================

  const fetchAQI = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCurrent();

      console.log("Dashboard API data:", data);

      // AQI
      setAqi(data.aqi_value ?? null);
      setAqiCategory(data.aqi_category ?? "");

      // Environment
      setTemperature(data.temperature ?? null);
      setHumidity(data.humidity ?? null);

      // Backend city
      if (data.city) {
        setCity(data.city);
      }
    } catch (err) {
      console.error("AQI fetch failed:", err);

      setError(
        "Unable to connect to AirGuard backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FEATURES
  // =====================================================

  const features = [
    {
      icon: Activity,
      title: "Live Monitoring",
      description:
        "Monitor your AirGuard sensors and environmental conditions in real time.",
      path: "/live-monitoring",
      label: "Monitor now",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description:
        "Explore air-quality trends and understand how pollution changes over time.",
      path: "/analytics",
      label: "View analytics",
    },
    {
      icon: History,
      title: "History",
      description:
        "Review previous sensor readings and discover important pollution patterns.",
      path: "/history",
      label: "View history",
    },
    {
      icon: BrainCircuit,
      title: "AI Prediction",
      description:
        "Use intelligent prediction to understand upcoming air-quality conditions.",
      path: "/prediction",
      label: "Predict",
    },
    {
      icon: AlertTriangle,
      title: "Smart Alerts",
      description:
        "Get notified when environmental conditions reach an unsafe level.",
      path: "/alerts",
      label: "View alerts",
    },
  ];

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="airguard-dashboard">

      {/* =================================================
          BACKGROUND ANIMATION
      ================================================= */}

      <div className="dashboard-orb orb-one"></div>
      <div className="dashboard-orb orb-two"></div>

      {/* =================================================
          MOBILE MENU
      ================================================= */}

      <div
        className={`mobile-menu-panel ${
          menuOpen ? "mobile-menu-open" : ""
        }`}
      ></div>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-content">

        {/* =================================================
            WELCOME SECTION
        ================================================= */}

        <section className="dashboard-welcome">

          <div>

            <span className="welcome-label">
              AIRGUARD MONITORING PLATFORM
            </span>

            <h1>
              Monitor Air Quality.
              <br />

              <span>
                Protect Your Health.
              </span>
            </h1>

            <p>
              Intelligent environmental monitoring,
              prediction and health insights designed
              to help you breathe safer.
            </p>

          </div>

        </section>

        {/* =================================================
            HERO CARDS
        ================================================= */}

        <section className="dashboard-hero-grid">

          {/* =================================================
              INTRO CARD
          ================================================= */}

          <div className="intro-card">

            <div className="intro-glow"></div>

            <div className="intro-content">

              <span className="card-label">
                REAL-TIME AIR QUALITY MONITORING
              </span>

              <h2>
                Smarter monitoring.
                <br />

                <span>
                  Healthier decisions.
                </span>
              </h2>

              <p>
                AirGuard combines environmental sensors
                and intelligent analysis to help you
                understand the air around you.
              </p>

              <div className="intro-buttons">

                <button
                  className="primary-button"
                  onClick={() =>
                    handleNavigation("/dashboard")
                  }
                >
                  View Dashboard

                  <ArrowUpRight size={16} />
                </button>

                <button
                  className="secondary-button"
                  onClick={() =>
                    document
                      .getElementById("airguard-features")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                >
                  Explore Features
                </button>

              </div>

            </div>

            {/* Decorative environmental circles */}

            <div className="intro-decoration">

              <div className="leaf-circle circle-one"></div>

              <div className="leaf-circle circle-two"></div>

              <div className="leaf-circle circle-three"></div>

              <div className="floating-leaf">
                ✦
              </div>

            </div>

          </div>

          {/* =================================================
              AQI CARD
          ================================================= */}

          <div className="aqi-card">

            <div className="aqi-card-header">

              <div>

                <span className="card-label">
                  LIVE AIR QUALITY INDEX
                </span>

                <div className="aqi-location">

                  <MapPin size={14} />

                  {city}, India

                </div>

              </div>

              {/* LOCATION BUTTON */}

              <button
                type="button"
                className="live-status"
                onClick={getUserLocation}
                disabled={locationLoading}
                title="Get your current location"
              >

                <span></span>

                {locationLoading
                  ? "LOCATING..."
                  : "LOCATION"}

              </button>

            </div>

            {/* =================================================
                LOCATION STATUS
            ================================================= */}

            {location && (
              <div
                style={{
                  fontSize: "11px",
                  marginTop: "8px",
                  opacity: 0.7,
                }}
              >
                📍 Location detected
              </div>
            )}

            {locationError && (
              <div
                style={{
                  fontSize: "12px",
                  marginTop: "8px",
                  color: "#d9534f",
                }}
              >
                {locationError}
              </div>
            )}

            <div className="aqi-main">

              {/* AQI VALUE */}

              <div className="aqi-number-area">

                <span className="aqi-number">

                  {loading
                    ? "..."
                    : aqi !== null
                    ? aqi.toFixed(1)
                    : "--"}

                </span>

                <div className="aqi-status">

                  <span></span>

                  {aqiCategory || "--"}

                </div>

                <p>

                  {aqiCategory === "Good"
                    ? "Air quality is satisfactory and poses little or no risk."
                    : aqiCategory === "Moderate"
                    ? "Air quality is acceptable, but sensitive groups should take care."
                    : aqiCategory === "Poor"
                    ? "Air quality may affect health. Consider reducing prolonged exposure."
                    : aqiCategory === "Very Poor"
                    ? "Health effects are possible. Avoid prolonged outdoor exposure."
                    : aqiCategory === "Severe"
                    ? "Air quality is hazardous. Avoid outdoor exposure."
                    : "Waiting for air-quality data."}

                </p>

              </div>

              {/* =================================================
                  GAUGE
              ================================================= */}

              <div className="aqi-gauge">

                <svg viewBox="0 0 180 180">

                  <circle
                    cx="90"
                    cy="90"
                    r="68"
                    className="gauge-track"
                  />

                  <circle
                    cx="90"
                    cy="90"
                    r="68"
                    className="gauge-value"
                  />

                </svg>

                <div className="gauge-center">

                  <strong>
                    AQI
                  </strong>

                  <span>
                    0 — 500
                  </span>

                </div>

              </div>

            </div>

            {/* =================================================
                SENSOR SUMMARY
            ================================================= */}

            <div className="sensor-summary">

              <div className="mini-sensor">

                <span>
                  MQ-2
                </span>

                <strong>
                  --
                </strong>

                <small>
                  Gas / Smoke
                </small>

              </div>

              <div className="mini-sensor">

                <span>
                  MQ-7
                </span>

                <strong>
                  --
                </strong>

                <small>
                  CO
                </small>

              </div>

              <div className="mini-sensor">

                <span>
                  MQ-135
                </span>

                <strong>
                  --
                </strong>

                <small>
                  Air Quality
                </small>

              </div>

              <div className="mini-sensor">

                <span>
                  DHT22
                </span>

                <strong>

                  {humidity !== null
                    ? `${humidity.toFixed(1)}%`
                    : "--"}

                </strong>

                <small>
                  Humidity
                </small>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            QUICK ENVIRONMENT
        ================================================= */}

        <section className="environment-row">

          {/* TEMPERATURE */}

          <div className="environment-card">

            <div className="environment-icon">

              <Thermometer size={18} />

            </div>

            <div>

              <span>
                Temperature
              </span>

              <strong>

                {temperature !== null
                  ? `${temperature.toFixed(1)}°C`
                  : "--"}

              </strong>

            </div>

          </div>

          {/* HUMIDITY */}

          <div className="environment-card">

            <div className="environment-icon">

              <Droplets size={18} />

            </div>

            <div>

              <span>
                Humidity
              </span>

              <strong>

                {humidity !== null
                  ? `${humidity.toFixed(1)}%`
                  : "--"}

              </strong>

            </div>

          </div>

          {/* DEVICE STATUS */}

          <div className="environment-card">

            <div className="environment-icon">

              <Activity size={18} />

            </div>

            <div>

              <span>
                Device Status
              </span>

              <strong
                className={
                  error
                    ? "offline"
                    : "connected"
                }
              >

                {error
                  ? "Disconnected"
                  : loading
                  ? "Checking..."
                  : "Connected"}

              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (

          <div className="dashboard-error">

            <strong>
              Backend Connection Problem
            </strong>

            <p>
              {error}
            </p>

          </div>

        )}

        {/* =================================================
            FEATURES
        ================================================= */}

        <section
          className="features-section"
          id="airguard-features"
        >

          <div className="features-heading">

            <div>

              <span className="welcome-label">
                AIRGUARD FEATURES
              </span>

              <h2>
                Everything you need
                <br />

                <span>
                  to breathe safer.
                </span>

              </h2>

            </div>

            <p>
              Intelligent monitoring, prediction
              and insights in one place.
            </p>

          </div>

          <div className="features-grid">

            {features.map((feature, index) => {

              const Icon = feature.icon;

              return (

                <div
                  className="feature-card"
                  key={feature.title}
                  style={{
                    animationDelay:
                      `${index * 0.1}s`,
                  }}
                  onClick={() =>
                    handleNavigation(feature.path)
                  }
                >

                  <div className="feature-top">

                    <div className="feature-icon">

                      <Icon size={21} />

                    </div>

                    <ArrowUpRight
                      size={17}
                      className="feature-arrow"
                    />

                  </div>

                  <div className="feature-content">

                    <h3>
                      {feature.title}
                    </h3>

                    <p>
                      {feature.description}
                    </p>

                  </div>

                  <div className="feature-link">

                    {feature.label}

                    <ArrowUpRight size={13} />

                  </div>

                </div>

              );

            })}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;

