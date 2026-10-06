import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./airguard-dashboard/Dashboard";
import Prediction from "./airguard-dashboard/prediction/Prediction";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

      

        {/* AI Prediction / Forecasting */}
        <Route
          path="/prediction"
          element={<Prediction />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;