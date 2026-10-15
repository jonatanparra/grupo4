import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/tema.css";
import App from "./App";
import { TiendaProvider } from "./context/TiendaContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TiendaProvider>
        <App />
      </TiendaProvider>
    </BrowserRouter>
  </React.StrictMode>
);
