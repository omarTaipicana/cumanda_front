import React from "react";
import "./styles/IsLoading.css";

const IsLoading = ({ text = "Cargando..." }) => {
  return (
    <div className="isLoadingOverlay" role="status" aria-live="polite">
      <div className="isLoadingCard">
        <div className="edukaSpinner" aria-hidden="true" />
        <p className="isLoadingText">{text}</p>
      </div>
    </div>
  );
};

export default IsLoading;
