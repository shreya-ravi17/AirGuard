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
} from "lucide-react";

import "./LiveMonitoring.css";

import { getCurrent } from "../../services/api";


function LiveMonitoring() {

  // ==========================================
  // STATE
  // ==========================================

  const [aqi, setAqi] = useState(0);

  const [temperature, setTemperature] = useState(0);

  const [humidity, setHumidity] = useState(0);

  const [co, setCo] = useState(0);

  const [nh3, setNh3] = useState(0);

  const [no2, setNo2] = useState(0);

  const [nox, setNox] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] =
    useState("");


  // ==========================================
  // AQI STATUS
  // ==========================================

  const getAQIStatus = (value) => {

    const currentAQI = Number(value) || 0;

    if (currentAQI <= 50) {
      return {
        text: "Good",
        className: "good",
      };
    }

    if (currentAQI <= 100) {
      return {
        text: "Moderate",
        className: "moderate",
      };
    }

    if (currentAQI <= 200) {
      return {
        text: "Unhealthy",
        className: "danger",
      };
    }

    return {
      text: "Very Unhealthy",
      className: "danger",
    };
  };


  // ==========================================
  // LOAD CURRENT DATA FROM BACKEND
  // ==========================================

  const loadCurrentData = async () => {

    try {

      setError("");

      const data = await getCurrent();

      console.log(
        "LIVE MONITORING - BACKEND DATA:",
        data
      );


      // ========================================
      // AQI
      // ========================================

      const currentAQI =
        data?.aqi ??
        data?.AQI ??
        data?.aqi_value ??
        data?.current_aqi ??
        data?.predicted_aqi ??
        0;

      setAqi(
        Number(currentAQI) || 0
      );


      // ========================================
      // TEMPERATURE
      // ========================================

      const currentTemperature =
        data?.temperature ??
        data?.temp ??
        data?.Temperature ??
        0;

      setTemperature(
        Number(currentTemperature) || 0
      );


      // ========================================
      // HUMIDITY
      // ========================================

      const currentHumidity =
        data?.humidity ??
        data?.Humidity ??
        0;

      setHumidity(
        Number(currentHumidity) || 0
      );


      // ========================================
      // CO (Carbon Monoxide)
      // ========================================

      const currentCO =
        data?.co ??
        data?.CO ??
        0;

      setCo(
        Number(currentCO) || 0
      );


      // ========================================
      // NH3 (Ammonia)
      // ========================================

      const currentNH3 =
        data?.nh3 ??
        data?.NH3 ??
        0;

      setNh3(
        Number(currentNH3) || 0
      );


      // ========================================
      // NO2 (Nitrogen Dioxide)
      // ========================================

      const currentNO2 =
        data?.no2 ??
        data?.NO2 ??
        0;

      setNo2(
        Number(currentNO2) || 0
      );


      // ========================================
      // NOx (Nitrogen Oxides)
      // ========================================

      const currentNOx =
        data?.nox ??
        data?.NOx ??
        data?.NOX ??
        0;

      setNox(
        Number(currentNOx) || 0
      );


      // ========================================
      // LAST UPDATED
      // ========================================

      setLastUpdated(
        new Date().toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }
        )
      );

    } catch (err) {

      console.error(
        "Live monitoring API error:",
        err
      );

      setError(
        err.message ||
        "Unable to fetch live sensor data."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD DATA WHEN PAGE OPENS
  // REFRESH EVERY 5 SECONDS
  // ==========================================

  useEffect(() => {

    loadCurrentData();

    const interval = setInterval(
      loadCurrentData,
      5000
    );

    return () => {
      clearInterval(interval);
    };

  }, []);


  // ==========================================
  // AQI STATUS
  // ==========================================

  const status =
    getAQIStatus(aqi);


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="live-page">


      {/* ======================================
          PAGE HEADER
      ====================================== */}

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
              Real-time environmental data from
              your AirGuard device.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (

        <div
          className="prediction-error"
          style={{
            marginBottom: "20px",
          }}
        >

          <AlertTriangle size={18} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ======================================
          TOP CARDS
      ====================================== */}

      <section className="monitor-grid">


        {/* ====================================
            AQI CARD
        ==================================== */}

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


            {/* AQI VALUE */}

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
                  ? "Fetching live air quality data..."
                  : aqi <= 50
                  ? "Air quality is currently within a comfortable range."
                  : aqi <= 100
                  ? "Air quality is acceptable, but sensitive people should take care."
                  : "Air quality is currently above the recommended range."}

              </p>

            </div>


            {/* ==================================
                GAUGE
            ================================== */}

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

            {loading
              ? "Connecting..."
              : `Last updated ${lastUpdated}`}

          </div>

        </div>


        {/* ====================================
            DEVICE CARD
        ==================================== */}

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
                ESP32 Air Quality Device
              </p>

            </div>

          </div>


          <div className="device-stats">

            <div>

              <span>
                Connection
              </span>

              <strong>
                API Connected
              </strong>

            </div>

            <div>

              <span>
                Refresh Rate
              </span>

              <strong>
                5 seconds
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          SENSOR SECTION
      ====================================== */}

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

            {loading
              ? "Connecting..."
              : "Receiving data"}

          </div>

        </div>


        <div className="sensor-grid">


          {/* ==================================
              CO
          ================================== */}

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
              GAS
            </p>

            <h3>
              Carbon Monoxide
            </h3>


            <div className="sensor-value">

              {loading
                ? "..."
                : Number(co).toFixed(2)}

              <small>
                {" "}ppm
              </small>

            </div>


            <div className="sensor-status good">

              ● Safe

            </div>


            <div className="mini-wave"></div>

          </div>


          {/* ==================================
              NH3
          ================================== */}

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
              GAS
            </p>

            <h3>
              Ammonia (NH₃)
            </h3>


            <div className="sensor-value">

              {loading
                ? "..."
                : Number(nh3).toFixed(2)}

              <small>
                {" "}ppm
              </small>

            </div>


            <div className="sensor-status good">

              ● Good

            </div>


            <div className="mini-wave"></div>

          </div>


          {/* ==================================
              NO2
          ================================== */}

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
              GAS
            </p>

            <h3>
              Nitrogen Dioxide (NO₂)
            </h3>


            <div className="sensor-value">

              {loading
                ? "..."
                : Number(no2).toFixed(2)}

              <small>
                {" "}ppm
              </small>

            </div>


            <div className="sensor-status good">

              ● Good

            </div>


            <div className="mini-wave"></div>

          </div>


          {/* ==================================
              NOx
          ================================== */}

          <div className="sensor-card sensor-teal">

            <div className="sensor-top">

              <div className="sensor-icon">

                <Gauge size={21} />

              </div>

              <span className="sensor-live">
                LIVE
              </span>

            </div>


            <p>
              GAS
            </p>

            <h3>
              Nitrogen Oxides (NOx)
            </h3>


            <div className="sensor-value">

              {loading
                ? "..."
                : Number(nox).toFixed(2)}

              <small>
                {" "}ppm
              </small>

            </div>


            <div className="sensor-status good">

              ● Good

            </div>


            <div className="mini-wave"></div>

          </div>


          {/* ==================================
              TEMPERATURE
          ================================== */}

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
                : Number(temperature).toFixed(1)}

              <small>
                {" "}°C
              </small>

            </div>


            <div className="sensor-status comfortable">

              ● Comfortable

            </div>


            <div className="mini-wave"></div>

          </div>


          {/* ==================================
              HUMIDITY
          ================================== */}

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
                : Number(humidity).toFixed(0)}

              <small>
                {" "}%
              </small>

            </div>


            <div className="sensor-status comfortable">

              ● Comfortable

            </div>


            <div className="mini-wave"></div>

          </div>


        </div>

      </section>


      {/* ======================================
          BOTTOM INSIGHTS
      ====================================== */}

      <section className="bottom-grid">


        {/* STATUS CARD */}

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
                ? "Waiting for live sensor data."
                : aqi <= 50
                ? "Your surrounding air is currently within safe limits."
                : aqi <= 100
                ? "Some sensitive individuals may need to take precautions."
                : "Consider reducing exposure to the current air conditions."}

            </p>

          </div>


          <div className="status-pill">

            {loading
              ? "CHECKING"
              : aqi <= 50
              ? "LOW RISK"
              : aqi <= 100
              ? "MODERATE RISK"
              : "HIGH RISK"}

          </div>

        </div>


        {/* INSIGHT CARD */}

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
                ? "Reading environment..."
                : aqi <= 50
                ? "Comfortable conditions 🌿"
                : aqi <= 100
                ? "Moderate conditions"
                : "Take precautions"}

            </h2>


            <p>

              {loading
                ? "AirGuard is receiving your sensor readings."
                : `Current AQI is ${Math.round(
                    aqi
                  )}. Temperature is ${Number(
                    temperature
                  ).toFixed(1)}°C and humidity is ${Number(
                    humidity
                  ).toFixed(0)}%.`}

            </p>

          </div>

        </div>

      </section>

    </div>

  );

}


export default LiveMonitoring;