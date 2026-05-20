import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { hideAlert } from "../../store/states/alert.slice";
import "./styles/Alert.css";

const Alert = () => {
  const dispatch = useDispatch();
  const { show, message, alertType } = useSelector((state) => state.alert);
  const getAlertColor = () => {
    switch (alertType) {
      case 1:
        return "var(--alert1-color)";
      case 2:
        return "var(--alert2-color)";
      case 3:
        return "var(--alert3-color)";
      default:
        return "var(--alert4-color)";
    }
  };

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        dispatch(hideAlert());
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    show && (
      <div
        className="alert-message"
        style={{ backgroundColor: getAlertColor() }}
      >
        {message}
      </div>
    )
  );
};

export default Alert;
