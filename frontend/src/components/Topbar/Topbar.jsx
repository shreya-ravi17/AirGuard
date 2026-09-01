import {
  Menu,
  Bell,
  ChevronDown,
  MapPin,
} from "lucide-react";

import { useState } from "react";

import "./Topbar.css";

function Topbar({ setIsOpen }) {

  // =====================================================
  // LOCATION STATE
  // =====================================================

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // =====================================================
  // GET USER LOCATION
  // =====================================================

  const getUserLocation = () => {

    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation({
          latitude,
          longitude,
        });

        setLocationLoading(false);

        console.log(
          "User location:",
          latitude,
          longitude
        );
      },

      (error) => {

        console.error(
          "Location error:",
          error
        );

        setLocationError(
          "Unable to get your location."
        );

        setLocationLoading(false);
      }

    );
  };


  return (
    <header className="airguard-topbar">

      {/* =================================================
          LEFT
      ================================================= */}

      <div className="topbar-left">

        <button
          className="hamburger-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu
            size={22}
            strokeWidth={2}
          />
        </button>


        <div className="mobile-logo">

          <div className="mobile-logo-symbol">
            A
          </div>

          <span>
            AirGuard
          </span>

        </div>

      </div>


      {/* =================================================
          RIGHT
      ================================================= */}

      <div className="topbar-right">


        {/* =================================================
            LOCATION BUTTON
        ================================================= */}

        <div className="location-wrapper">

          <button
            type="button"
            className="location-button"
            onClick={getUserLocation}
            disabled={locationLoading}
            aria-label="Get current location"
          >

            <MapPin size={17} />

            <span>

              {locationLoading
                ? "Locating..."
                : location
                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : "Location"}

            </span>

          </button>


          {locationError && (

            <span className="location-error">
              {locationError}
            </span>

          )}

        </div>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <button
          className="notification-button"
          onClick={() => {
            window.location.href = "/alerts";
          }}
          aria-label="Notifications"
        >

          <Bell size={19} />

          <span className="notification-dot"></span>

        </button>


        <div className="topbar-divider"></div>


      </div>

    </header>
  );
}

export default Topbar;