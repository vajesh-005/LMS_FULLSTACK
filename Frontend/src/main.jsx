// main.jsx or index.js
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CustomProvider } from "rsuite";
import App from "./App";
import "rsuite/dist/rsuite.min.css";

createRoot(document.getElementById("root")).render(

    <BrowserRouter>
      <CustomProvider theme="light">
        <App />
      </CustomProvider>
    </BrowserRouter>
);
