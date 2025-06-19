import React, { useEffect, useState } from "react";
import Side_nav from "../Side_nav";
import "../../style/requests.css";
import Pending_card from "../Pending_card";
import { Token } from "../Token";
import BASE_URL from "../url";

function Requests() {
  const { decode, token } = Token();
  const [pendingList, setPendingList] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((item) => item + 1);
  };

  useEffect(() => {
    if (!token || !decode?.id) return;

    fetch(`${BASE_URL}/users-with-request/${decode.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (result) => {
        if (!result.ok) {
          if (result.status === 401) {
            console.error("Unauthorized – invalid or expired token");
            return;
          }
        }
        return result.json();
      })
      .then((data) => {
        if (data) setPendingList(data);
      })
      .catch((error) => console.log("Fetch error:", error.message));
  }, [decode?.id, token, refreshKey]);

  return (
    <div className="width requests-container">
      <Side_nav />
      <div className="grid">
  {pendingList && pendingList.length > 0 ? (
    <Pending_card data={pendingList} refreshKey={handleRefresh} />
  ) : (
    <p className="indication">No request found!</p>
  )}
</div>

    </div>
  );
}

export default Requests;
