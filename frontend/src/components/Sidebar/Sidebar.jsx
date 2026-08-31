import {
  LayoutDashboard,
  Activity,
  BarChart3,
  History,
  BrainCircuit,
  Bell,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import "./Sidebar.css";

function Sidebar({ isOpen, setIsOpen }) {

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Live Monitoring",
      icon: Activity,
      path: "/live-monitoring",
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    {
      name: "History",
      icon: History,
      path: "/history",
    },
    {
      name: "AI Prediction",
      icon: BrainCircuit,
      path: "/prediction",
    },
    {
      name: "Alerts",
      icon: Bell,
      path: "/alerts",
    },
  ];


  return (
    <>

      {/* ================= OVERLAY ================= */}

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}


      {/* ================= SIDEBAR ================= */}

      <aside
        className={`airguard-sidebar ${
          isOpen ? "open" : ""
        }`}
      >


        {/* ================= HEADER ================= */}

        <div className="sidebar-header">

          <div className="airguard-logo">

            <div className="logo-symbol">
              A
            </div>

            <span>
              AirGuard
            </span>

          </div>


          <button
            className="close-sidebar"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

        </div>


        {/* ================= LABEL ================= */}

        <div className="sidebar-label">
          MAIN MENU
        </div>


        {/* ================= MENU ================= */}

        <nav className="sidebar-menu">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() => setIsOpen(false)}
              >

                <Icon
                  size={19}
                  strokeWidth={1.8}
                />

                <span>
                  {item.name}
                </span>

              </NavLink>
            );

          })}

        </nav>


        {/* ================= DEVICE ================= */}

        <div className="sidebar-bottom">

          <div className="device-mini-card">

            <div className="device-status-dot"></div>

            <div>

              <strong>
                AirGuard Device
              </strong>

              <span>
                Connected
              </span>

            </div>

          </div>

        </div>

      </aside>

    </>
  );
}

export default Sidebar;