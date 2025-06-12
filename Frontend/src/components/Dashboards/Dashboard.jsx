import "rsuite/dist/rsuite.min.css";
import { CustomProvider } from "rsuite";
import Dashboard_leave_details from "../Dashboard_leave_details";
import Request_form from "../Request_form";
import Latest_request from "../Latest_requests";
import "../../style/dashboard.css";
import Side_nav from "../Side_nav";
import { useState } from "react";
import "../../index.css";
import { Token } from "../Token";
function Dashboard() {
  const { decode } = Token();
  const [refresh, setRefresh] = useState(0);

  
  const handleRefresh = async () => {
    setRefresh((item) => item + 1);
  };
  return (
    <CustomProvider theme="light">
      <div className="container width">
        <Side_nav></Side_nav>
        <div className="grid">
          <div className="greeting">
            <span className="welcome">Hey,</span>
            <span className="name">{decode.name}</span>
            <span className="designation">{decode.role.toUpperCase()}</span>
          </div>
          <div className="main">
            <div className="column">
              <Dashboard_leave_details id={decode.id} refreshKey={refresh} />
              <Request_form id={decode.id} onSuccess={handleRefresh} />
            </div>
            <div className="column">
              <Latest_request id={decode.id} refreshKey={refresh} />
            </div>
          </div>
        </div>
      </div>
    </CustomProvider>
  );
}

export default Dashboard;
