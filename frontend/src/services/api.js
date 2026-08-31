const API_BASE_URL = "http://127.0.0.1:8000";

// ==========================================
// CURRENT AQI / LIVE MONITORING
// ==========================================

export async function getCurrent() {
  const response = await fetch(`${API_BASE_URL}/api/current`);

  if (!response.ok) {
    throw new Error(`Failed to fetch current data: ${response.status}`);
  }

  return response.json();
}


// ==========================================
// SUBMIT SENSOR READING
// ==========================================

export async function getCurrentAQI(sensorData = {}) {
  const response = await fetch(`${API_BASE_URL}/api/current-aqi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sensorData),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch AQI: ${response.status}`);
  }

  return response.json();
}


// ==========================================
// HISTORY
// ==========================================

export async function getHistory() {
  const response = await fetch(`${API_BASE_URL}/api/history`);

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.status}`);
  }

  return response.json();
}


// ==========================================
// TREND
// ==========================================

export async function getTrend() {
  const response = await fetch(`${API_BASE_URL}/api/trend`);

  if (!response.ok) {
    throw new Error(`Failed to fetch trend: ${response.status}`);
  }

  return response.json();
}


// ==========================================
// STATISTICS
// ==========================================

export async function getStats() {
  const response = await fetch(`${API_BASE_URL}/api/stats`);

  if (!response.ok) {
    throw new Error(`Failed to fetch statistics: ${response.status}`);
  }

  return response.json();
}


// ==========================================
// AI FORECAST / PREDICTION
// ==========================================

export async function getForecast() {
  const response = await fetch(`${API_BASE_URL}/api/forecast`);

  if (!response.ok) {
    throw new Error(`Failed to fetch forecast: ${response.status}`);
  }

  return response.json();
}


// ==========================================
// ALERTS
// ==========================================

export async function getAlerts() {
  const response = await fetch(`${API_BASE_URL}/api/alerts`);

  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.status}`);
  }

  return response.json();
}


// ==========================================
// EXPORT HISTORY
// ==========================================

export async function exportHistory() {
  const response = await fetch(
    `${API_BASE_URL}/api/history/export`
  );

  if (!response.ok) {
    throw new Error(`Failed to export history: ${response.status}`);
  }

  return response.blob();
}