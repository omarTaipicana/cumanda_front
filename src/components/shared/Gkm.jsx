import React, { useState } from "react";
import "./styles/Gkm.css";

const Gkm = () => {
  const [showImage, setShowImage] = useState(false);

  if (!showImage) return null;

  return (
    <div className="gkm_overlay">
      <div className="gkm_container">
        <button className="gkm_close" onClick={() => setShowImage(false)}>
          ✖
        </button>
        <a
          href="https://gkmcorporacion.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="gkm_img"
            src="../../../images/img_car.png"
            alt="GKM"
          />
        </a>
      </div>
    </div>
  );
};

export default Gkm;
