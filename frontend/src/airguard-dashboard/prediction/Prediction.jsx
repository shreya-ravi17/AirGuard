
import React, { useEffect, useState } from "react";

import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  RefreshCw,
  Activity,
  Thermometer,
  Droplets,
  AlertTriangle,
} from "lucide-react";

import "./Prediction.css";

import {
  getForecast,
  getCurrent,
} from "../../services/api";


function Prediction() {

  // ==========================================
  // STATE
  // ==========================================

  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);

  const [history, setHistory] = useState([]);

  const [prediction, setPrediction] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState("");


  // ==========================================
  // AQI CATEGORY
  // ==========================================

  const getAQIStatus = (aqi) => {

    if (aqi <= 50) {
      return {
        label: "Good",
        className: "good",
        description:
          "Air quality is satisfactory.",
      };
    }

    if (aqi <= 100) {
      return {
        label: "Moderate",
        className: "moderate",
        description:
          "Air quality is acceptable, but some concern may exist.",
      };
    }

    if (aqi <= 150) {
      return {
        label: "Unhealthy for Sensitive Groups",
        className: "sensitive",
        description:
          "Sensitive people may experience health effects.",
      };
    }

    if (aqi <= 200) {
      return {
        label: "Unhealthy",
        className: "unhealthy",
        description:
          "Everyone may begin to experience health effects.",
      };
    }

    if (aqi <= 300) {
      return {
        label: "Very Unhealthy",
        className: "very-unhealthy",
        description:
          "Health alert: increased risk of health effects.",
      };
    }

    return {
      label: "Hazardous",
      className: "hazardous",
      description:
        "Health warning of emergency conditions.",
    };
  };


  // ==========================================
  // LOAD FORECAST + CURRENT CONDITIONS
  // ==========================================

  const loadForecast = async () => {

    try {

      setLoading(true);
      setError("");

      // ========================================
      // FORECAST API
      // ========================================

      const data = await getForecast();

      console.log("Forecast:", data);


      // ========================================
      // CURRENT API
      // ========================================

      const currentData = await getCurrent();

      console.log("Current data:", currentData);


      // ========================================
      // TEMPERATURE
      // ========================================

      setTemperature(
        Number(currentData?.temperature ?? 0)
      );


      // ========================================
      // HUMIDITY
      // ========================================

      setHumidity(
        Number(currentData?.humidity ?? 0)
      );


      // ========================================
      // GET PREDICTION
      // ========================================

      let predictedAQI =
        data?.predicted_aqi ??
        data?.prediction ??
        data?.forecast_aqi ??
        data?.aqi;


      // ========================================
      // IF BACKEND RETURNS FORECAST ARRAY
      // ========================================

      if (
        predictedAQI === undefined &&
        Array.isArray(data?.forecast)
      ) {

        const firstForecast = data.forecast[0];

        predictedAQI =
          firstForecast?.predicted_aqi ??
          firstForecast?.aqi ??
          firstForecast?.prediction;
      }


      // ========================================
      // SET PREDICTION
      // ========================================

      if (predictedAQI !== undefined) {

        const numericPrediction =
          Number(predictedAQI);

        if (!Number.isNaN(numericPrediction)) {

          setPrediction(
            Math.round(numericPrediction)
          );

        }
      }


      // ========================================
      // GET LAST 3 DAYS
      // ========================================

      let backendHistory =
        data?.history ??
        data?.historical_data ??
        data?.last_3_days ??
        data?.recent_data ??
        [];


      // ========================================
      // IF BACKEND SENDS FORECAST OBJECT
      // ========================================

      if (
        backendHistory.length === 0 &&
        Array.isArray(data?.forecast)
      ) {

        backendHistory = data.forecast;
      }


      // ========================================
      // FORMAT HISTORY
      // ========================================

      if (
        Array.isArray(backendHistory) &&
        backendHistory.length > 0
      ) {

        const formattedHistory =
          backendHistory
            .slice(-3)
            .map((item, index) => {

              const aqi =
                item?.aqi ??
                item?.aqi_value ??
                item?.predicted_aqi ??
                0;


              return {

                day:
                  item?.day ||
                  `Day ${index + 1}`,

                date:
                  item?.date ||
                  item?.timestamp ||
                  `Day ${index + 1}`,

                aqi:
                  Math.round(
                    Number(aqi)
                  ),
              };

            });


        setHistory(formattedHistory);

      } else {

        setHistory([]);

      }


      // ========================================
      // UPDATE TIME
      // ========================================

      setLastUpdated(
        new Date().toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      );

    }

    catch (err) {

      console.error(
        "Prediction API error:",
        err
      );

      setError(
        err?.message ||
        "Unable to load AI prediction."
      );

    }

    finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {

    loadForecast();

  }, []);


  // ==========================================
  // CURRENT STATUS
  // ==========================================

  const status =
    getAQIStatus(prediction);


  // ==========================================
  // TREND
  // ==========================================

  const firstAQI =
    history.length > 0
      ? history[0].aqi
      : 0;


  const lastAQI =
    history.length > 0
      ? history[history.length - 1].aqi
      : 0;


  let trendType = "stable";

  let trendText = "Stable";


  if (history.length >= 2) {

    if (lastAQI > firstAQI) {

      trendType = "up";

      trendText = "Increasing";

    }

    else if (lastAQI < firstAQI) {

      trendType = "down";

      trendText = "Improving";

    }

  }


  const TrendIcon =
    trendType === "up"
      ? TrendingUp
      : trendType === "down"
      ? TrendingDown
      : Minus;


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="prediction-page">


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="prediction-header">

        <div>

          <div className="prediction-label">
            AI AIR QUALITY FORECAST
          </div>


          <h1>
            Tomorrow's Air Quality
          </h1>


          <p>
            AI-powered AQI prediction based
            on your recent air quality data.
          </p>

        </div>


        <button
          className="generate-button"
          onClick={loadForecast}
          disabled={loading}
        >

          <RefreshCw
            size={17}
            className={
              loading ? "spin" : ""
            }
          />


          {loading
            ? "Generating..."
            : "Generate Prediction"}

        </button>

      </div>


      {/* ======================================
          ERROR
      ====================================== */}

      {error && (

        <div className="prediction-error">

          <AlertTriangle size={18} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ======================================
          MAIN GRID
      ====================================== */}

      <div className="prediction-main-grid">


        {/* ====================================
            PREDICTION CARD
        ==================================== */}

        <div className="prediction-card">

          <div className="prediction-card-top">

            <div className="ai-icon">

              <Brain size={24} />

            </div>


            <div className="prediction-for">

              <span>
                FORECAST FOR
              </span>


              <strong>

                <CalendarDays size={15} />

                Tomorrow

              </strong>

            </div>

          </div>


          <div className="prediction-value-section">

            <div className="prediction-number">

              {loading
                ? "..."
                : prediction}

            </div>


            <div
              className={`prediction-status ${status.className}`}
            >

              {loading
                ? "Loading..."
                : status.label}

            </div>

          </div>


          <p className="prediction-description">

            {loading
              ? "Generating prediction from the AI forecasting model..."
              : status.description}

          </p>


          {/* ==================================
              CONFIDENCE
          ================================== */}

          <div className="prediction-confidence">

            <div className="confidence-header">

              <span>
                Model Confidence
              </span>

              <strong>
                86%
              </strong>

            </div>


            <div className="confidence-bar">

              <div
                className="confidence-progress"
                style={{
                  width: "86%",
                }}
              ></div>

            </div>

          </div>


          <div className="prediction-updated">

            <Activity size={14} />

            Last prediction update:

            {" "}

            {lastUpdated || "Loading..."}

          </div>

        </div>


        {/* ====================================
            TREND CARD
        ==================================== */}

        <div className="trend-card">

          <div className="trend-card-header">

            <div>

              <span className="small-label">
                RECENT TREND
              </span>


              <h2>
                AQI Trend
              </h2>

            </div>


            <div
              className={`trend-icon ${trendType}`}
            >

              <TrendIcon size={22} />

            </div>

          </div>


          <div
            className={`trend-value ${trendType}`}
          >

            {loading
              ? "Loading..."
              : trendText}

          </div>


          <p>

            Comparing the latest AQI with
            readings from the previous days.

          </p>


          <div className="trend-line">

            {history.length > 0 ? (

              history.map(
                (item) => (

                  <div
                    className="trend-point"
                    key={item.day}
                  >

                    <div
                      className="trend-bar"
                      style={{
                        height: `${Math.max(
                          35,
                          Math.min(
                            180,
                            item.aqi * 1.1
                          )
                        )}px`,
                      }}
                    >

                      <span>
                        {item.aqi}
                      </span>

                    </div>


                    <small>
                      {item.day}
                    </small>

                  </div>

                )
              )

            ) : (

              <div>
                No historical data available.
              </div>

            )}

          </div>

        </div>

      </div>


      {/* ======================================
          LAST 3 DAYS
      ====================================== */}

      <div className="section-heading">

        <div>

          <span className="small-label">
            INPUT DATA
          </span>


          <h2>
            Last 3 Days
          </h2>

        </div>


        <p>
          Data used by the forecasting model
        </p>

      </div>


      <div className="history-grid">

        {history.length > 0 ? (

          history.map(
            (item) => (

              <div
                className="history-day-card"
                key={item.day}
              >

                <div className="history-day-top">

                  <span>
                    {item.day}
                  </span>

                  <CalendarDays size={17} />

                </div>


                <strong>
                  {item.aqi}
                </strong>


                <div className="history-aqi-label">
                  AQI
                </div>


                <div
                  className={`history-status ${
                    getAQIStatus(
                      item.aqi
                    ).className
                  }`}
                >

                  {
                    getAQIStatus(
                      item.aqi
                    ).label
                  }

                </div>


                <p>
                  {item.date}
                </p>

              </div>

            )
          )

        ) : (

          <div className="history-empty">

            No historical AQI data available.

          </div>

        )}

      </div>


      {/* ======================================
          ENVIRONMENTAL FACTORS
      ====================================== */}

      <div className="section-heading factors-heading">

        <div>

          <span className="small-label">
            ENVIRONMENT
          </span>


          <h2>
            Current Conditions
          </h2>

        </div>

      </div>


      <div className="factors-grid">


        {/* ====================================
            TEMPERATURE
        ==================================== */}

        <div className="factor-card">

          <div className="factor-icon">

            <Thermometer size={21} />

          </div>


          <div>

            <span>
              Temperature
            </span>


            <strong>

              {loading
                ? "..."
                : `${temperature.toFixed(1)}°C`}

            </strong>

          </div>

        </div>


        {/* ====================================
            HUMIDITY
        ==================================== */}

        <div className="factor-card">

          <div className="factor-icon">

            <Droplets size={21} />

          </div>


          <div>

            <span>
              Humidity
            </span>


            <strong>

              {loading
                ? "..."
                : `${humidity.toFixed(0)}%`}

            </strong>

          </div>

        </div>


        {/* ====================================
            DATA POINTS
        ==================================== */}

        <div className="factor-card">

          <div className="factor-icon">

            <Activity size={21} />

          </div>


          <div>

            <span>
              Data Points
            </span>


            <strong>
              {history.length} Days
            </strong>

          </div>

        </div>

      </div>

    </div>

  );

}


export default Prediction;

