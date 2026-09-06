
# AirGuard Frontend

This folder contains the frontend application for the AirGuard IoT-Based Wearable E-Nose Mask project.

## Technologies Used

* React.js
* Vite
* JavaScript
* React Router
* Recharts
* Firebase Authentication
* CSS

## Frontend Features

* User Login using Firebase Authentication
* Protected dashboard routes
* Real-time AQI monitoring
* Air-quality history
* Analytics and charts
* AI-based AQI prediction display
* Air-quality alerts
* Browser location detection
* Responsive dashboard interface

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── airguard-dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── live-monitoring/
│   │   ├── history/
│   │   ├── analytics/
│   │   ├── alerts/
│   │   └── prediction/
│   ├── components/
│   │   ├── Sidebar/
│   │   ├── Topbar/
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── firebase/
│   │   └── firebase.js
│   ├── pages/
│   │   └── auth/
│   │       └── Login.jsx
│   │   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md
```

## Backend API Integration

The frontend communicates with the FastAPI backend through API functions defined in:

`src/services/api.js`

The frontend currently uses APIs for:

* Current AQI
* Sensor data submission
* AQI history
* AQI trends
* Analytics statistics
* AQI forecast
* Alerts
* History export
* Settings

## Authentication

Firebase Authentication is used to manage user login.

Protected routes prevent unauthenticated users from accessing the main AirGuard dashboard.

## Running the Frontend

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## Build

To create a production build:

```bash
npm run build
```

