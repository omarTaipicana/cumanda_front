import React from 'react'
import "./styles/IsLoading.css";


const isLoadingUpload = ({ text = "Espere un momento, no cierre esta ventana hasta que culmine de cagar los certificados firmados..." }) => {
   return (
    <div className="isLoadingOverlay" role="status" aria-live="polite">
      <div className="isLoadingCard">
        <div className="edukaSpinner" aria-hidden="true" />
        <p className="isLoadingText">{text}</p>
      </div>
    </div>
  );
};

export default isLoadingUpload

