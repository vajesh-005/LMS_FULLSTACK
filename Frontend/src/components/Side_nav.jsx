import React from "react";
import Lumel_logo from "../assets/Lumel_logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faChartLine,
  faFolderOpen,
  faList,
  faSignOutAlt,
  // faTools,
  faUserAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../style/side_nav.css";
import { NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Side_nav() {
  const token = localStorage.getItem("token");
  const decode = token ? jwtDecode(token) : null;

  const handleLogout = async () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const renderOptions = () => {
    switch (decode.role) {
      case  "INTERN":
        return (
          <>
            <NavItem
              to="/dashboard"
              icon={faChartLine}
              label="Dashboard"
            ></NavItem>
            <NavItem to="/leavelist" icon={faList} label="Leavelist"></NavItem>
            <NavItem
              to="/calendar"
              icon={faCalendarAlt}
              label="Calendar"
            ></NavItem>
          </>
        );
      case "TRAINEE":
        return (
          <>
            <NavItem
              to="/dashboard"
              icon={faChartLine}
              label="Dashboard"
            ></NavItem>
            <NavItem to="/leavelist" icon={faList} label="Leavelist"></NavItem>
            <NavItem
              to="/calendar"
              icon={faCalendarAlt}
              label="Calendar"
            ></NavItem>
          </>
        );
      case "EMPLOYEE":
        return (
          <>
            <NavItem
              to={"/dashboard"}
              label="Dashboard"
              icon={faChartLine}
            ></NavItem>
            <NavItem
              to={"/leavelist"}
              label="Leavelist"
              icon={faList}
            ></NavItem>
            <NavItem
              to={"/calendar"}
              label="Calendar"
              icon={faCalendarAlt}
            ></NavItem>
            <NavItem
              to={"/requests"}
              label="Requests"
              icon={faFolderOpen}
            ></NavItem>
            <NavItem
              to={"/employees"}
              label="Employees"
              icon={faUserAlt}
            ></NavItem>
          </>
        );
      case "MANAGER":
        return (
          <>
            <NavItem
              to={"/dashboard"}
              label="Dashboard"
              icon={faChartLine}
            ></NavItem>
            <NavItem
              to={"/leavelist"}
              label="Leavelist"
              icon={faList}
            ></NavItem>
            <NavItem
              to={"/calendar"}
              label="Calendar"
              icon={faCalendarAlt}
            ></NavItem>
            <NavItem
              to={"/requests"}
              label="Requests"
              icon={faFolderOpen}
            ></NavItem>
            <NavItem
              to={"/employees"}
              label="Employees"
              icon={faUserAlt}
            ></NavItem>
          </>
        );
      case "HR":
        return (
          <>
            <NavItem
              to={"/dashboard"}
              label="Dashboard"
              icon={faChartLine}
            ></NavItem>
            <NavItem
              to={"/leavelist"}
              label="Leavelist"
              icon={faList}
            ></NavItem>
            <NavItem
              to={"/calendar"}
              label="Calendar"
              icon={faCalendarAlt}
            ></NavItem>
            <NavItem
              to={"/requests"}
              label="Requests"
              icon={faFolderOpen}
            ></NavItem>
            <NavItem
              to={"/employees"}
              label="Employees"
              icon={faUserAlt}
            ></NavItem>
            {/* <NavItem
              to={"/admin_tools"}
              label="Admin tools"
              icon={faTools}
            ></NavItem> */}
          </>
        );
      case "DIRECTOR":
        return (
          <>
            <NavItem
              to={"/dashboard"}
              label="Dashboard"
              icon={faChartLine}
            ></NavItem>
            <NavItem
              to={"/leavelist"}
              label="Leavelist"
              icon={faList}
            ></NavItem>
            <NavItem
              to={"/calendar"}
              label="Calendar"
              icon={faCalendarAlt}
            ></NavItem>
            <NavItem
              to={"/requests"}
              label="Requests"
              icon={faFolderOpen}
            ></NavItem>
            <NavItem
              to={"/employees"}
              label="Employees"
              icon={faUserAlt}
            ></NavItem>
          </>
        );
        case "ADMIN":
          return (
            <>
              <NavItem
                to={"/admin_dashboard"}
                label="Dashboard"
                icon={faChartLine}
              ></NavItem>
              <NavItem
                to={"/leavelist"}
                label="Leavelist"
                icon={faList}
              ></NavItem>
              <NavItem
                to={"/calendar"}
                label="Calendar"
                icon={faCalendarAlt}
              ></NavItem>
              <NavItem
                to={"/requests"}
                label="Requests"
                icon={faFolderOpen}
              ></NavItem>
              <NavItem
                to={"/employees"}
                label="Employees"
                icon={faUserAlt}
              ></NavItem>
            </>
          );
    }
  };

  const NavItem = ({ to, icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `item ${isActive ? "active" : ""}`}
    >
      <FontAwesomeIcon icon={icon} className={`${label}-icon`} />
      {label}
    </NavLink>
  );
  return (
    <div className="sidebar">
      <div className="logo">
        <img src={Lumel_logo} className="lumel-logo" />
      </div>
      <div className="options">{renderOptions()};</div>

      <div className="logout" onClick={handleLogout}>
        <button className="logout-btn">Logout</button>
        <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />
      </div>
    </div>
  );
}

export default Side_nav;
