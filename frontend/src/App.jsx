import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";

import Dashboard from "./airguard-dashboard/Dashboard";
import LiveMonitoring from "./airguard-dashboard/live-monitoring/LiveMonitoring";
import History from "./airguard-dashboard/history/History";
import Alert from "./airguard-dashboard/alerts/Alert";
import Analytics from "./airguard-dashboard/analytics/Analytics";
import Prediction from "./airguard-dashboard/prediction/Prediction";

import Topbar from "./components/Topbar/Topbar";
import Sidebar from "./components/Sidebar/Sidebar";

import "./index.css";

/* =====================================================
   PROTECTED LAYOUT
===================================================== */

function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="app-layout">

      {/* TOPBAR */}
      <Topbar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* SIDEBAR */}
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* PAGE */}
      <main className="page-content">
        {children}
      </main>

    </div>
  );
}


/* =====================================================
   PROTECTED PAGE WRAPPER
===================================================== */

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  );
}


/* =====================================================
   APP
===================================================== */

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          {/* ================= LOGIN ================= */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* ================= DASHBOARD ================= */}

          <Route
            path="/dashboard"
            element={
              <ProtectedPage>
                <Dashboard />
              </ProtectedPage>
            }
          />


          {/* ================= LIVE MONITORING ================= */}

          <Route
            path="/live-monitoring"
            element={
              <ProtectedPage>
                <LiveMonitoring />
              </ProtectedPage>
            }
          />


          {/* ================= HISTORY ================= */}

          <Route
            path="/history"
            element={
              <ProtectedPage>
                <History />
              </ProtectedPage>
            }
          />


          {/* ================= ALERTS ================= */}

          <Route
            path="/alerts"
            element={
              <ProtectedPage>
                <Alert />
              </ProtectedPage>
            }
          />


          {/* ================= ANALYTICS ================= */}

          <Route
            path="/analytics"
            element={
              <ProtectedPage>
                <Analytics />
              </ProtectedPage>
            }
          />


          {/* ================= AI PREDICTION ================= */}

          <Route
            path="/prediction"
            element={
              <ProtectedPage>
                <Prediction />
              </ProtectedPage>
            }
          />


          {/* ================= DEFAULT ================= */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />


          {/* ================= UNKNOWN URL ================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}


export default App;