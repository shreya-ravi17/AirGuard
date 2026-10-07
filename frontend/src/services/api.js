export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


// ======================================================
// LIVE / CURRENT SENSOR DATA
// GET /api/current
// ======================================================

export const getCurrent = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/current`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch current sensor data: ${response.status}`
    );
  }

  return response.json();
};


// ======================================================
// SEND SENSOR DATA
// POST /api/current-aqi
// ======================================================

export const sendSensorData = async (sensorData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/current-aqi`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(sensorData),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to send sensor data: ${response.status} ${errorText}`
    );
  }

  return response.json();
};


// ======================================================
// PMS DATA  (FETCH PMS DATA button)
// External PM2.5 / PM10 from the project dataset.
// NOT measured by the AirGuard mask.
// ======================================================

export const fetchPMSData = async (city) => {
  const query = city ? `?city=${encodeURIComponent(city)}` : "";

  const response = await fetch(`${API_BASE_URL}/api/pms${query}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to fetch PMS data (${response.status})`);
  }

  return response.json();
};


// ======================================================
// XAMPP / MYSQL DATA  (FETCH FROM SQL button)
// Latest real ESP32 reading stored in XAMPP/MySQL.
// ======================================================

export const fetchSQLData = async () => {
  const response = await fetch(`${API_BASE_URL}/api/sql`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to fetch SQL data (${response.status})`);
  }

  return response.json();
};


// ======================================================
// HISTORY
// GET /api/history
// ======================================================

export const getHistory = async ({
  page = 1,
  page_size = 20,
  search = "",
  date = "",
} = {}) => {

  const params = new URLSearchParams();

  params.append("page", page);
  params.append("page_size", page_size);

  if (search) {
    params.append("search", search);
  }

  if (date) {
    params.append("date", date);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/history?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch history: ${response.status}`
    );
  }

  return response.json();
};


// ======================================================
// HISTORY EXPORT
// GET /api/history/export
// ======================================================

export const exportHistory = async () => {

  const response = await fetch(
    `${API_BASE_URL}/api/history/export`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to export history: ${response.status}`
    );
  }

  return response.blob();
};


// ======================================================
// ANALYTICS - TREND
// GET /api/trend
// ======================================================

export const getTrend = async (range = "1D") => {

  const response = await fetch(
    `${API_BASE_URL}/api/trend?range=${encodeURIComponent(range)}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch AQI trend: ${response.status}`
    );
  }

  return response.json();
};


// ======================================================
// ANALYTICS - STATISTICS
// GET /api/stats
// ======================================================

export const getStats = async (range = "1D") => {

  const response = await fetch(
    `${API_BASE_URL}/api/stats?range=${encodeURIComponent(range)}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch statistics: ${response.status}`
    );
  }

  return response.json();
};


// ======================================================
// AI PREDICTION
//
// Keep this separate from Forecasting in the frontend.
//
// NOTE:
// Your current backend exposes /api/forecast.
// We should inspect your backend prediction implementation
// before changing this endpoint.
// ======================================================

export const getAIPrediction = async () => {

  const response = await fetch(
    `${API_BASE_URL}/api/forecast`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch AI prediction: ${response.status}`
    );
  }

  return response.json();
};


// ======================================================
// OLD FORECAST FUNCTION
//
// Kept temporarily so existing pages do not break.
// We can remove this after checking all imports.
// ======================================================

export const getForecast = async () => {

  return getAIPrediction();
};


// ======================================================
// ALERTS
// GET /api/alerts
// ======================================================

export const getAlerts = async () => {

  const response = await fetch(
    `${API_BASE_URL}/api/alerts`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch alerts: ${response.status}`
    );
  }

  return response.json();
};


// ======================================================
// SETTINGS
// GET /api/settings
// ======================================================

export const getSettings = async () => {

  const response = await fetch(
    `${API_BASE_URL}/api/settings`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch settings: ${response.status}`
    );
  }

  return response.json();
};


// ======================================================
// UPDATE SETTINGS
// PUT /api/settings
// ======================================================

export const updateSettings = async (settings) => {

  const response = await fetch(
    `${API_BASE_URL}/api/settings`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(settings),
    }
  );

  if (!response.ok) {

    const errorText = await response.text();

    throw new Error(
      `Failed to update settings: ${response.status} ${errorText}`
    );
  }

  return response.json();
};


// ======================================================
// DEFAULT EXPORT
// ======================================================

const api = {

  // Current data
  getCurrent,

  // Sensor data
  sendSensorData,

  // History
  getHistory,
  exportHistory,

  // Analytics
  getTrend,
  getStats,

  // AI Prediction
  getAIPrediction,

  // Temporary backward compatibility
  getForecast,

  // Data sources (FETCH PMS DATA / FETCH FROM SQL)
  fetchPMSData,
  fetchSQLData,

  // Alerts
  getAlerts,

  // Settings
  getSettings,
  updateSettings,
};


export default api;