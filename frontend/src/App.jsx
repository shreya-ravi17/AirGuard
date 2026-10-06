
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./airguard-dashboard/Dashboard";
import Analytics from "./airguard-dashboard/prediction/Prediction";
import History from "./airguard-dashboard/history/History";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* AI Prediction / Analytics */}
        <Route
          path="/analytics"
          element={<Analytics />}
        />

        {/* Existing History page */}
        <Route
          path="/history"
          element={<History />}
        />

        {/* Alerts */}
        <Route
          path="/alerts"
          element={
            <div style={{ padding: "40px" }}>
              <h1>Alerts</h1>
            </div>
          }
        />

        {/* Systems */}
        <Route
          path="/systems"
          element={
            <div style={{ padding: "40px" }}>
              <h1>Systems</h1>
            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
