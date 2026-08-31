
import React, { useEffect, useState } from "react";

import {
  Bell,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import "./Alert.css";

import { getAlerts } from "../../services/api";


function Alert() {

  // ==========================================
  // STATE
  // ==========================================

  const [alerts, setAlerts] = useState([]);

  const [showAllAlerts, setShowAllAlerts] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================
  // LOAD ALERTS FROM BACKEND
  // ==========================================

  const loadAlerts = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getAlerts();

      console.log(
        "Alerts API response:",
        data
      );


      // Backend may return:
      //
      // [
      //   {
      //      title,
      //      description,
      //      level,
      //      type,
      //      timestamp
      //   }
      // ]
      //
      // OR:
      //
      // {
      //    alerts: [...]
      // }

      const backendAlerts =
        Array.isArray(data)
          ? data
          : data?.alerts ||
            data?.data ||
            [];


      // ==========================================
      // FORMAT BACKEND ALERTS
      // ==========================================

      const formattedAlerts =
        backendAlerts.map(
          (item, index) => {

            const timestamp =
              item.timestamp ||
              item.created_at ||
              item.time;


            // ------------------------------
            // Determine alert type
            // ------------------------------

            let type =
              item.type ||
              item.level?.toLowerCase() ||
              "moderate";


            if (
              type === "critical" ||
              type === "severe"
            ) {
              type = "critical";
            }
            else if (
              type === "high" ||
              type === "poor"
            ) {
              type = "high";
            }
            else if (
              type === "moderate"
            ) {
              type = "moderate";
            }
            else if (
              type === "low"
            ) {
              type = "low";
            }
            else if (
              type === "success" ||
              type === "info" ||
              type === "good"
            ) {
              type = "success";
            }
            else {
              type = "moderate";
            }


            // ------------------------------
            // Icon
            // ------------------------------

            let icon;

            if (type === "critical") {

              icon = (
                <AlertCircle />
              );

            }
            else if (
              type === "high" ||
              type === "moderate"
            ) {

              icon = (
                <AlertTriangle />
              );

            }
            else if (
              type === "success"
            ) {

              icon = (
                <CheckCircle />
              );

            }
            else {

              icon = (
                <Info />
              );

            }


            // ------------------------------
            // Time
            // ------------------------------

            let time = "Unknown";

            let date = "";


            if (timestamp) {

              const parsedDate =
                new Date(timestamp);


              if (
                !Number.isNaN(
                  parsedDate.getTime()
                )
              ) {

                time =
                  parsedDate.toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );


                const today =
                  new Date();


                const isToday =
                  parsedDate.toDateString() ===
                  today.toDateString();


                if (isToday) {

                  date = "Today";

                }
                else {

                  date =
                    parsedDate.toLocaleDateString(
                      [],
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    );

                }

              }

            }


            return {

              id:
                item.id ??
                index,

              title:
                item.title ||
                item.message ||
                item.alert_title ||
                "Air Quality Alert",

              description:
                item.description ||
                item.message ||
                item.details ||
                "Air quality alert detected.",

              level:
                item.level ||
                (
                  type === "critical"
                    ? "Critical"
                    : type === "high"
                    ? "High"
                    : type === "moderate"
                    ? "Moderate"
                    : type === "low"
                    ? "Low"
                    : "Info"
                ),

              type,

              time,

              date,

              icon,

            };

          }
        );


      setAlerts(
        formattedAlerts
      );


    }
    catch (err) {

      console.error(
        "Alerts API error:",
        err
      );

      setError(
        err.message ||
        "Unable to load alerts."
      );

      setAlerts([]);

    }
    finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {

    loadAlerts();

  }, []);


  // ==========================================
  // DISPLAY ALERTS
  // ==========================================

  const displayedAlerts =
    showAllAlerts
      ? alerts
      : alerts.slice(0, 5);


  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const criticalCount =
    alerts.filter(
      (item) =>
        item.type === "critical"
    ).length;


  const highCount =
    alerts.filter(
      (item) =>
        item.type === "high" ||
        item.type === "moderate"
    ).length;


  const activeCount =
    alerts.length;


  // ==========================================
  // ALERT DETAILS
  // ==========================================

  const showAlertDetails = (item) => {

    window.alert(
      `${item.title}\n\n${item.description}`
    );

  };


  // ==========================================
  // RETURN
  // ==========================================

  return (

    <div className="alert-page">


      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="alert-page-header">

        <div>

          <h1>
            Alerts
          </h1>

          <p>
            Stay informed about air quality
            changes and important notifications.
          </p>

        </div>

      </div>


      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (

        <div className="alert-error">

          <strong>
            Unable to load alerts
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="alert-summary-grid">


        {/* Critical */}

        <div className="summary-card critical-card">

          <div className="summary-icon critical-icon">

            <Bell size={23} />

          </div>


          <div className="summary-content">

            <span className="summary-label">
              Critical Alerts
            </span>

            <strong>
              {criticalCount}
            </strong>

            <p>
              Requires immediate attention
            </p>

          </div>

        </div>


        {/* Moderate */}

        <div className="summary-card high-card">

          <div className="summary-icon high-icon">

            <Bell size={23} />

          </div>


          <div className="summary-content">

            <span className="summary-label">
              Moderate Alerts
            </span>

            <strong>
              {highCount}
            </strong>

            <p>
              Take caution
            </p>

          </div>

        </div>


        {/* Active */}

        <div className="summary-card active-card">

          <div className="summary-icon active-icon">

            <Bell size={23} />

          </div>


          <div className="summary-content">

            <span className="summary-label">
              Active Alerts
            </span>

            <strong>
              {activeCount}
            </strong>

            <p>
              Currently active
            </p>

          </div>

        </div>


        {/* Resolved */}

        <div className="summary-card resolved-card">

          <div className="summary-icon resolved-icon">

            <CheckCircle size={23} />

          </div>


          <div className="summary-content">

            <span className="summary-label">
              Resolved Today
            </span>

            <strong>
              0
            </strong>

            <p>
              Since midnight
            </p>

          </div>

        </div>

      </div>


      {/* ==========================================
          ALERT LIST
      ========================================== */}

      <div className="active-alerts-card">


        <div className="active-alerts-header">

          <div>

            <h2>

              {showAllAlerts
                ? "All Alerts"
                : "Active Alerts"}

            </h2>


            <p>

              {loading
                ? "Loading notifications..."
                : showAllAlerts
                ? `${alerts.length} notifications`
                : "Recent air quality notifications"}

            </p>

          </div>


          {/* Refresh */}

          <button
            className="refresh-button"
            onClick={loadAlerts}
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

            Refresh

          </button>

        </div>


        {/* ==========================================
            ALERTS
        ========================================== */}

        <div className="alerts-list">


          {loading ? (

            <div className="no-alerts">

              Loading alerts...

            </div>

          ) : displayedAlerts.length > 0 ? (

            displayedAlerts.map(
              (item) => (

                <div
                  className={`alert-row ${item.type}`}
                  key={item.id}
                >


                  {/* Icon */}

                  <div
                    className={`alert-row-icon ${item.type}`}
                  >

                    {item.icon}

                  </div>


                  {/* Information */}

                  <div className="alert-row-content">

                    <div className="alert-title-line">

                      <h3>
                        {item.title}
                      </h3>


                      <span
                        className={`alert-badge ${item.type}`}
                      >

                        {item.level}

                      </span>

                    </div>


                    <p>
                      {item.description}
                    </p>

                  </div>


                  {/* Time */}

                  <div className="alert-row-time">

                    <span>
                      {item.time}
                    </span>

                    <span>
                      {item.date}
                    </span>

                  </div>


                  {/* Arrow */}

                  <button
                    className="alert-row-arrow"
                    onClick={() =>
                      showAlertDetails(item)
                    }
                  >

                    <ArrowRight
                      size={18}
                    />

                  </button>

                </div>

              )
            )

          ) : (

            <div className="no-alerts">

              <CheckCircle
                size={32}
              />

              <h3>
                No active alerts
              </h3>

              <p>
                Your air quality is currently
                being monitored.
              </p>

            </div>

          )}

        </div>


        {/* ==========================================
            VIEW ALL
        ========================================== */}

        {alerts.length > 5 && (

          <button
            className="view-all-alerts-btn"
            onClick={() =>
              setShowAllAlerts(
                !showAllAlerts
              )
            }
          >

            {showAllAlerts
              ? "Show Active Alerts"
              : "View All Alerts"}

            <ArrowRight
              size={16}
            />

          </button>

        )}

      </div>

    </div>

  );

}


export default Alert;

