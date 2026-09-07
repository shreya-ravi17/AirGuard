
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Wait until Firebase checks authentication
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7faf8",
          fontFamily: "Arial, sans-serif",
          color: "#247a3b",
        }}
      >
        <h2>Loading AirGuard...</h2>
      </div>
    );
  }

  // User is not logged in
  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // User is logged in
  return children;
}

export default ProtectedRoute;