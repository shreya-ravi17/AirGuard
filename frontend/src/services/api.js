const API_BASE_URL = "http://localhost:8000";


// ======================================================
// LIVE / CURRENT SENSOR DATA
// GET /api/current
// ======================================================

export const getCurrent = async () => {
  const response = await fetch(`${API_BASE_URL}/api/current`);

  if (!response.ok) {
    throw new Error(`Failed to fetch current sensor data: ${response.status}`);
  }

  return response.json();
};


// ======================================================
// SEND SENSOR DATA
// POST /api/current-aqi
// ======================================================

export const sendSensorData = async (sensorData) => {
  const response = await fetch(`${API_BASE_URL}/api/current-aqi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sensorData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to send sensor data: ${response.status} ${errorText}`
    );
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
    throw new Error(`Failed to fetch history: ${response.status}`);
  }

  return response.json();
};


// ======================================================
// HISTORY EXPORT
// GET /api/history/export
// ======================================================

export const exportHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/api/history/export`);

  if (!response.ok) {
    throw new Error(`Failed to export history: ${response.status}`);
  }

  return response.blob();
};


// ======================================================
// ANALYTICS - TREND
// GET /api/trend
// ======================================================

export const getTrend = async () => {
  const response = await fetch(`${API_BASE_URL}/api/trend`);

  if (!response.ok) {
    throw new Error(`Failed to fetch AQI trend: ${response.status}`);
  }

  return response.json();
};


// ======================================================
// ANALYTICS - STATISTICS
// GET /api/stats
// ======================================================

export const getStats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/stats`);

  if (!response.ok) {
    throw new Error(`Failed to fetch statistics: ${response.status}`);
  }

  return response.json();
};


// ======================================================
// AI PREDICTION / FORECAST
// GET /api/forecast
// ======================================================

export const getForecast = async () => {
  const response = await fetch(`${API_BASE_URL}/api/forecast`);

  if (!response.ok) {
    throw new Error(`Failed to fetch forecast: ${response.status}`);
  }

  return response.json();
};


// ======================================================
// ALERTS
// GET /api/alerts
// ======================================================

export const getAlerts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/alerts`);

  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.status}`);
  }

  return response.json();
};


// ======================================================
// SETTINGS
// GET /api/settings
// ======================================================

export const getSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/api/settings`);

  if (!response.ok) {
    throw new Error(`Failed to fetch settings: ${response.status}`);
  }

  return response.json();
};


// ======================================================
// UPDATE SETTINGS
// PUT /api/settings
// ======================================================

export const updateSettings = async (settings) => {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

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
  getCurrent,
  sendSensorData,
  getHistory,
  exportHistory,
  getTrend,
  getStats,
  getForecast,
  getAlerts,
  getSettings,
  updateSettings,
};

export default api;