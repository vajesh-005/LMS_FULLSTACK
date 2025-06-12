// App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./components/Pages/Login";
import Dashboard from "./components/Dashboards/Dashboard";
import LeaveList from "./components/Pages/LeaveList";
import Admin_dashboard from "./components/Dashboards/Admin_dashboard";
import Requests from "./components/Pages/Requests";
import Employees from "./components/Pages/Employees";
import CalendarView from "./components/Pages/CalendarView";
import Readonly_leavelist from './components/Pages/Readonly_leavelist'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/leavelist" element={<LeaveList />} />
      <Route path="/readonly_leavelist" element={<Readonly_leavelist />} />
      <Route path="/admin_dashboard" element={<Admin_dashboard />} />
      <Route path="/calendar" element={<CalendarView />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/employees" element={<Employees />} />
    </Routes>
  );
}

export default App;
